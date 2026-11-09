// TrippedSwitch — one physical-looking breaker/RCD toggle. Pinch flips the lever UP (on) /
// DOWN (off); hover highlights it. The lever is an authored child "Lever" (a box visual); this
// script tilts it and swaps its material between visual modes. Collider + Interactable are
// created at runtime so SIK's MouseInteractor drives it in preview and HandInteractor on device.
//
// Owns: concern-local on/off state + which visual mode it is showing. Passive otherwise.
// Main -> switch: setOn(on), setMode(mode), isOn(), reset(on)
// switch -> Main: onToggle (fires with this switch after a pinch flips it)
// Hard Rule 3 note: no Component.Text / UIKit here — this is 3D scene content.

import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorEvent} from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"

export type SwitchMode = "normal" | "active" | "dim" | "amber"

const MAT_NORMAL = requireAsset("../Materials/TrippedLeverOff.mat") as Material
const MAT_ACTIVE = requireAsset("../Materials/TrippedActive.mat") as Material
const MAT_DIM = requireAsset("../Materials/TrippedDim.mat") as Material
const MAT_AMBER = requireAsset("../Materials/TrippedAmber.mat") as Material
const MAT_HOVER = requireAsset("../Materials/TrippedHover.mat") as Material

// Lever tilt (radians) — up = ON, down = OFF.
const TILT_ON = -0.32
const TILT_OFF = 0.32

@component
export class TrippedSwitch extends BaseScriptComponent {
  // ── TrippedSwitch – one breaker/RCD toggle ──
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Circuit name shown by coaching cards (e.g. 'Kitchen sockets'). Also identifies the switch in the hierarchy.")
  circuitName: string = "Breaker"
  @input
  @hint("Show this switch's collider as a wireframe for hit-zone debugging.")
  debugCollider: boolean = false
  @ui.group_end

  private lever!: SceneObject
  private leverVisual: RenderMeshVisual | null = null
  private interactable!: Interactable
  private _isOn = true
  private mode: SwitchMode = "normal"
  private hovered = false

  private _onToggle = new Event<TrippedSwitch>()
  get onToggle(): PublicApi<TrippedSwitch> { return this._onToggle.publicApi() }

  onAwake() {
    const root = this.getSceneObject()
    if (root.getChildrenCount() > 0) {
      this.lever = root.getChild(0)
      this.leverVisual = this.lever.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    }

    // Collider + Interactable for pinch targeting (runtime plumbing, not authored visuals).
    const collider = root.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createBoxShape()
    shape.size = new vec3(4.0, 6.5, 3.5)
    collider.shape = shape
    collider.debugDrawEnabled = this.debugCollider

    this.interactable = root.createComponent(Interactable.getTypeName()) as Interactable
    this.interactable.targetingMode = 3

    this.applyVisual()
    this.applyTilt()

    this.createEvent("OnStartEvent").bind(() => {
      this.interactable.onTriggerStart.add((_e: InteractorEvent) => this.onPinch())
      this.interactable.onHoverEnter.add((_e: InteractorEvent) => { this.hovered = true; this.applyVisual() })
      this.interactable.onHoverExit.add((_e: InteractorEvent) => { this.hovered = false; this.applyVisual() })
    })
  }

  private onPinch(): void {
    this._isOn = !this._isOn
    this.applyTilt()
    this._onToggle.invoke(this)
  }

  // ── Main -> switch ──
  setOn(on: boolean): void { this._isOn = on; this.applyTilt() }
  isOn(): boolean { return this._isOn }
  reset(on: boolean): void { this._isOn = on; this.mode = "normal"; this.hovered = false; this.applyTilt(); this.applyVisual() }

  setMode(mode: SwitchMode): void { this.mode = mode; this.applyVisual() }
  getMode(): SwitchMode { return this.mode }

  private applyTilt(): void {
    if (!this.lever) return
    const angle = this._isOn ? TILT_ON : TILT_OFF
    this.lever.getTransform().setLocalRotation(quat.fromEulerAngles(angle, 0, 0))
  }

  private applyVisual(): void {
    if (!this.leverVisual) return
    let mat = MAT_NORMAL
    if (this.mode === "active") mat = MAT_ACTIVE
    else if (this.mode === "dim") mat = MAT_DIM
    else if (this.mode === "amber") mat = MAT_AMBER
    // Hover brightens anything that is not the locked amber culprit.
    if (this.hovered && this.mode !== "amber") mat = MAT_HOVER
    this.leverVisual.mainMaterial = mat
  }
}
