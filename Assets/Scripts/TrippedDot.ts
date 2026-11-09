// TrippedDot — the pulsing attention dot on the tripped RCD. Visible only in the START state;
// pinching it opens the first coaching card. Pulses by scaling on UpdateEvent. Collider +
// Interactable created at runtime (SIK MouseInteractor drives it in preview).
//
// Main -> dot: setVisible(bool)
// dot -> Main: onPinch

import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {InteractorEvent} from "SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"

@component
export class TrippedDot extends BaseScriptComponent {
  // ── TrippedDot – pulsing RCD attention dot ──
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Base diameter of the dot in cm.")
  @widget(new SliderWidget(0.6, 4, 0.1))
  baseSize: number = 1.6
  @input
  @hint("Pulse speed (radians/sec).")
  @widget(new SliderWidget(1, 12, 0.5))
  pulseSpeed: number = 5.0
  @ui.group_end

  private interactable!: Interactable
  private visible = true
  private elapsed = 0

  private _onPinch = new Event<void>()
  get onPinch(): PublicApi<void> { return this._onPinch.publicApi() }

  onAwake() {
    const root = this.getSceneObject()
    const collider = root.createComponent("Physics.ColliderComponent") as ColliderComponent
    const shape = Shape.createSphereShape()
    shape.radius = 2.2   // generous hit zone, larger than the visible dot
    collider.shape = shape

    this.interactable = root.createComponent(Interactable.getTypeName()) as Interactable
    this.interactable.targetingMode = 3

    this.createEvent("OnStartEvent").bind(() => {
      this.interactable.onTriggerStart.add((_e: InteractorEvent) => {
        if (this.visible) this._onPinch.invoke()
      })
    })

    this.createEvent("UpdateEvent").bind(() => this.onUpdate())
  }

  private onUpdate(): void {
    const t = this.getSceneObject().getTransform()
    if (!this.visible) { t.setLocalScale(vec3.zero()); return }
    this.elapsed += getDeltaTime()
    const s = this.baseSize * (1 + 0.28 * Math.sin(this.elapsed * this.pulseSpeed))
    t.setLocalScale(new vec3(s, s, s))
  }

  setVisible(v: boolean): void {
    this.visible = v
    if (!v) this.getSceneObject().getTransform().setLocalScale(vec3.zero())
  }
}
