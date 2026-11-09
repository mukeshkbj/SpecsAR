// TrippedStateManager — the single source of truth for the coaching flow. Owns the state
// machine and coordinates the switches, dot, coaching cards, safety overlay and audio. It is
// the ONLY module that decides flow; the UI modules are passive views driven through setters.
//
// Flow:
//   START       RCD tripped (down), breakers on (up), only the pulsing dot shows. Pinch dot -> TURN_OFF.
//   TURN_OFF    Card beside RCD: switch all six breakers OFF, then tap the tick -> WALK.
//   WALK        RCD re-armed. Walk breakers one at a time (current highlighted, others dim);
//               switching the current one ON advances. Switching Kitchen sockets ON -> FAULT_FOUND.
//   FAULT_FOUND RCD drops (clunk + chime), Kitchen breaker amber, result card. "Start again" -> START.
//   EMERGENCY   Safety button at any time -> hide the unit, show the STOP overlay (terminal).
//
// LEAF hooks: getStateName(), getCurrentBreakerName(), getBreakersOffCount() + state prints.

import {TrippedSwitch} from "./TrippedSwitch"
import {TrippedDot} from "./TrippedDot"
import {TrippedCardUI} from "./TrippedCardUI"
import {TrippedSafetyUI} from "./TrippedSafetyUI"
import {TrippedAudio} from "./TrippedAudio"

type FlowState = "START" | "TURN_OFF" | "WALK" | "FAULT_FOUND" | "EMERGENCY"

const KITCHEN_INDEX = 2   // Kitchen sockets is the 3rd breaker — the hard-coded fault.

@component
export class TrippedStateManager extends BaseScriptComponent {
  // ── TrippedStateManager – coaching flow controller ──
  @ui.separator
  @ui.group_start("References")
  @input @hint("The movable unit group (body + switches + dot + cards). Hidden in EMERGENCY.")
  unitRoot!: SceneObject
  @input @hint("The RCD / main switch (left).")
  rcd!: TrippedSwitch
  @input @hint("The six breakers in physical order: Upstairs lights, Downstairs lights, Kitchen sockets, Upstairs sockets, Downstairs sockets, Cooker.")
  breakers!: TrippedSwitch[]
  @input @hint("The pulsing RCD dot.")
  dot!: TrippedDot
  @input @hint("The coaching (instruction) card.")
  coachCard!: TrippedCardUI
  @input @hint("The 'Found it' result card.")
  resultCard!: TrippedCardUI
  @input @hint("Safety button + emergency STOP overlay.")
  safety!: TrippedSafetyUI
  @input @hint("SFX helper (tick / clunk / chime).")
  audio!: TrippedAudio
  @ui.group_end
  @ui.separator
  @ui.group_start("Settings")
  @input @hint("Wireframe every collider for hit-zone debugging (takes effect on preview restart).")
  debugColliders: boolean = false
  @ui.group_end

  private state: FlowState = "START"
  private currentIndex = 0

  onAwake() {
    if (!this.unitRoot || !this.rcd || !this.breakers || this.breakers.length < 6 ||
        !this.dot || !this.coachCard || !this.resultCard || !this.safety || !this.audio) {
      print("TrippedStateManager: required @input not wired (need unitRoot, rcd, 6 breakers, dot, 2 cards, safety, audio). Check Phase B.")
      return
    }

    this.dot.onPinch.add(() => this.onDotPinch())
    for (const b of this.breakers) b.onToggle.add((sw) => this.onBreakerToggle(sw))
    this.coachCard.onAction.add(() => this.onCoachAction())
    this.resultCard.onAction.add(() => this.enterStart())
    this.safety.onEmergency.add(() => this.enterEmergency())

    this.createEvent("OnStartEvent").bind(() => {
      this.enterStart()
      if (this.debugColliders) this.setColliderDebugAll(this.unitRoot, true)
    })
  }

  // ── State entries ──
  private enterStart(): void {
    this.state = "START"
    this.currentIndex = 0
    this.setUnitVisible(true)
    this.rcd.reset(false)                       // RCD tripped / down
    for (const b of this.breakers) b.reset(true) // breakers on / up, normal
    this.dot.setVisible(true)
    this.coachCard.hide()
    this.resultCard.hide()
    this.safety.reset()
    this.log()
  }

  private enterTurnOff(): void {
    this.state = "TURN_OFF"
    this.dot.setVisible(false)
    this.coachCard.setContent(
      "Step 1 — reset",
      "Switch all six breakers OFF (down). Then tap the tick.",
      "Done")
    this.positionCardAbove(this.coachCard, this.rcd)
    this.coachCard.show()
    this.log()
  }

  private enterWalk(): void {
    this.state = "WALK"
    this.currentIndex = 0
    this.rcd.setOn(true)                         // re-arm the RCD (up)
    for (const b of this.breakers) b.setOn(false) // all breakers off to begin the walk
    this.highlightCurrent()
    this.showWalkCard()
    this.log()
  }

  private faultFound(): void {
    this.state = "FAULT_FOUND"
    this.rcd.setOn(false)                         // RCD drops
    this.audio.playClunk()
    this.audio.playChime()
    for (let i = 0; i < this.breakers.length; i++) {
      this.breakers[i].setMode(i === KITCHEN_INDEX ? "amber" : "dim")
    }
    this.coachCard.hide()
    this.resultCard.setContent(
      "Found it: Kitchen sockets",
      "Unplug everything on this circuit, then switch it back on. If it trips again, call an electrician.",
      "Start again")
    this.positionCardAbove(this.resultCard, this.breakers[KITCHEN_INDEX])
    this.resultCard.show()
    this.log()
  }

  private enterEmergency(): void {
    this.state = "EMERGENCY"
    this.setUnitVisible(false)   // hide unit + switches + dot + cards
    this.safety.showStop()
    this.log()
  }

  // ── Interaction handlers ──
  private onDotPinch(): void {
    if (this.state === "START") this.enterTurnOff()
  }

  private onBreakerToggle(sw: TrippedSwitch): void {
    if (this.state === "WALK") {
      const current = this.breakers[this.currentIndex]
      if (sw === current) {
        if (sw.isOn()) this.confirmStepOn()
      } else {
        // enforce one-at-a-time: a non-current breaker cannot be switched on
        if (sw.isOn()) sw.setOn(false)
      }
    }
    // TURN_OFF: free toggling, no action until the tick. Other states: ignore.
  }

  private onCoachAction(): void {
    if (this.state === "TURN_OFF") {
      if (this.getBreakersOffCount() === this.breakers.length) {
        this.enterWalk()
      } else {
        this.coachCard.setContent(
          "Step 1 — reset",
          "Not yet — switch ALL six breakers OFF (down) first, then tap the tick.",
          "Done")
      }
    } else if (this.state === "WALK") {
      // manual-advance fallback: only valid once the current breaker is ON
      if (this.breakers[this.currentIndex].isOn()) this.confirmStepOn()
    }
  }

  private confirmStepOn(): void {
    this.audio.playTick()
    if (this.currentIndex === KITCHEN_INDEX) {
      this.faultFound()
      return
    }
    this.currentIndex++
    if (this.currentIndex >= this.breakers.length) { this.currentIndex = this.breakers.length - 1; return }
    this.highlightCurrent()
    this.showWalkCard()
    this.log()
  }

  // ── Helpers ──
  private highlightCurrent(): void {
    for (let i = 0; i < this.breakers.length; i++) {
      this.breakers[i].setMode(i === this.currentIndex ? "active" : "dim")
    }
  }

  private showWalkCard(): void {
    const name = this.breakers[this.currentIndex].circuitName
    this.coachCard.setContent("Find the fault", "Switch " + name + " back ON.", "Next")
    this.positionCardAbove(this.coachCard, this.breakers[this.currentIndex])
    this.coachCard.show()
  }

  private positionCardAbove(card: TrippedCardUI, sw: TrippedSwitch): void {
    const p = sw.getSceneObject().getTransform().getWorldPosition()
    // Keep the ~18 cm card inside the forward view while staying near its breaker.
    const x = Math.max(-6, Math.min(8, p.x))
    card.getSceneObject().getTransform().setWorldPosition(new vec3(x, p.y + 12, p.z + 2))
  }

  private setUnitVisible(v: boolean): void {
    const s = v ? 1 : 0
    this.unitRoot.getTransform().setLocalScale(new vec3(s, s, s))
  }

  private setColliderDebugAll(obj: SceneObject, on: boolean): void {
    const c = obj.getComponent("Physics.ColliderComponent") as ColliderComponent
    if (c) c.debugDrawEnabled = on
    for (let i = 0; i < obj.getChildrenCount(); i++) this.setColliderDebugAll(obj.getChild(i), on)
  }

  // ── LEAF / debug read-outs ──
  getStateName(): string { return this.state }
  getCurrentBreakerName(): string {
    return this.state === "WALK" ? this.breakers[this.currentIndex].circuitName : ""
  }
  getBreakersOffCount(): number {
    let n = 0
    for (const b of this.breakers) if (!b.isOn()) n++
    return n
  }

  private log(): void {
    print("[Tripped] state=" + this.state +
      " offCount=" + this.getBreakersOffCount() +
      (this.state === "WALK" ? " current=" + this.getCurrentBreakerName() : ""))
  }
}
