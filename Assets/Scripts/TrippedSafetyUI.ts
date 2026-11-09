// TrippedSafetyUI — the always-visible "Smell burning / box hot?" safety button plus the
// emergency STOP overlay that replaces the scene. Passive view.
//
// Owns: a UIKit Button (warning icon + label) + a hidden BackPlate stop card.
// Main -> UI:  showStop(), reset()
// UI -> Main:  onEmergency (safety button pinched — state manager then hides the box + shows stop)
// Must NOT: hide the fuse box itself (that is the state manager's job). Light text only.
//
// Both children are built once and kept initialized; visibility is via transform scale.

import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify, FlexAlignSelf} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"

const FONT_SIZE_SCALE = 1.0
type TextRole = "Title1" | "Title2" | "HeadlineXL" | "Headline1" | "Headline2" | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Title1: {size: 105, weight: 700}, Title2: {size: 93, weight: 700}, HeadlineXL: {size: 62, weight: 700},
  Headline1: {size: 54, weight: 700}, Headline2: {size: 48, weight: 700}, Subheadline: {size: 41, weight: 700},
  Button: {size: 39, weight: 500}, Callout: {size: 39, weight: 700}, Body: {size: 39, weight: 500}, Caption: {size: 38, weight: 500},
}
function roleSize(role: TextRole, distanceCm: number = 110): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}
function applyTextRole(t: Text, role: TextRole, distanceCm: number = 110): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

const DIST = 75
const STOP_W = 28
const WARNING_ICON = requireAsset("../Icons/warning.png") as Texture

@component
export class TrippedSafetyUI extends BaseScriptComponent {
  // ── TrippedSafetyUI – safety button + emergency stop overlay ──
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Safety button label — kept always visible at the edge of the unit.")
  safetyLabel: string = "Smell burning / box hot?"
  @input
  @hint("Amber accent used for the safety button label and stop title.")
  @widget(new ColorWidget())
  accentColor: vec4 = new vec4(1, 0.72, 0.2, 1)
  @ui.group_end

  private buttonRoot!: SceneObject
  private stopRoot!: SceneObject
  private built = false

  private _onEmergency = new Event<void>()
  get onEmergency(): PublicApi<void> { return this._onEmergency.publicApi() }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")

    this.buildButton()
    this.buildStopOverlay()

    this.built = true
    this.park(this.stopRoot)                 // overlay hidden at start
    this.buttonRoot.getTransform().setLocalPosition(this.BUTTON_HOME) // button visible at start
  }

  private buildButton() {
    this.buttonRoot = global.scene.createSceneObject("SafetyButtonRoot")
    this.buttonRoot.setParent(this.sceneObject)
    const so = global.scene.createSceneObject("SafetyButton")
    so.setParent(this.buttonRoot)
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(17, 3.2, 1)
    so.getTransform().setLocalPosition(new vec3(0, 0, 0.08))
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    ec.leadingIcon = WARNING_ICON
    ec.text = this.safetyLabel
    ec.textSize = roleSize("Button", DIST)
    ec.contentAlignment = "center"
    btn.onTriggerUp.add(() => this._onEmergency.invoke())
  }

  private buildStopOverlay() {
    this.stopRoot = global.scene.createSceneObject("StopOverlayRoot")
    this.stopRoot.setParent(this.sceneObject)

    // Text-only (no BackPlate) — light/amber text reads on the additive display
    // without a washing surface, and avoids BackPlate's InteractionPlane log errors.
    const content = global.scene.createSceneObject("StopContent")
    content.setParent(this.stopRoot)

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = STOP_W
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Center
    flex.rowGap = 1.4
    flex.paddingTop = 2.2; flex.paddingBottom = 2.2
    flex.paddingLeft = 2.2; flex.paddingRight = 2.2

    const title = this.addRow(content, "Headline2", 3.8, this.accentColor)
    title.text = "Stop — don't touch it."
    const body = this.addRow(content, "Body", 2.8, new vec4(1, 1, 1, 1))
    body.text = "Call an electrician."
  }

  private addRow(parent: SceneObject, role: TextRole, h: number, color: vec4): Text {
    const so = global.scene.createSceneObject("Row")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = ""
    t.depthTest = true
    applyTextRole(t, role, DIST)
    t.textFill.color = color
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = HorizontalOverflow.Overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    const innerW = STOP_W - 4.4
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -h / 2, h / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideWidth = innerW
    item.overrideHeight = h
    return t
  }

  // ── Main -> UI ──
  showStop(): void {
    if (!this.built) return
    this.park(this.buttonRoot)
    this.stopRoot.getTransform().setLocalPosition(this.STOP_HOME)
  }

  reset(): void {
    if (!this.built) return
    this.park(this.stopRoot)
    this.buttonRoot.getTransform().setLocalPosition(this.BUTTON_HOME)
  }

  // Visibility via position-parking — scale 0 breaks UIKit BackPlate layout.
  // Button sits low at the unit edge; the stop overlay centres in view (host is
  // authored low, so +21 cm lifts the overlay toward the middle of the forward view).
  private readonly PARK = new vec3(0, -100000, 0)
  private readonly BUTTON_HOME = new vec3(0, 0, 0)
  private readonly STOP_HOME = new vec3(0, 21, 0)
  private park(obj: SceneObject): void { obj.getTransform().setLocalPosition(this.PARK) }
}
