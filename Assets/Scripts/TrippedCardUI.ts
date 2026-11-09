// TrippedCardUI — a coaching/result card: title + wrapping body + one action button.
// Reused by two authored instances (CoachCard, ResultCard); the state manager positions
// the host beside the relevant breaker and pushes text in via setContent().
//
// Owns: one BackPlate surface + FlexLayout column (title, body, action button). Passive view.
// Main -> UI:  setContent(title, body, buttonLabel), show(), hide()
// UI -> Main:  onAction (fires when the action button is pinched)
// Must NOT: hold domain state or decide flow. Additive display -> light text only.
//
// Visibility is controlled by HOST TRANSFORM SCALE (1 shown / 0 hidden), never by
// enabling/disabling the host — a BackPlate/Button disabled before OnStartEvent never
// initializes, so a later show() would render nothing (see specs-build-ui gotchas G3).

import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify, FlexAlignSelf} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"

// ── Typography: single source of truth for size + weight (calibrated @ z=-110) ──
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

// Card content focal distance (the unit sits ~75 cm in front of the user).
const CARD_DIST = 75
const CARD_W = 18
const PAD = 1.6

@component
export class TrippedCardUI extends BaseScriptComponent {
  // ── TrippedCardUI – coaching/result card ──
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Icon shown on the action button (e.g. check for the tick, restart for Start again).")
  actionIcon!: Texture
  @input
  @hint("Width of the card surface in cm.")
  @widget(new SliderWidget(10, 30, 0.5))
  cardWidth: number = CARD_W
  @input
  @hint("Primary text color (keep light — additive display renders black transparent).")
  @widget(new ColorWidget())
  textColor: vec4 = new vec4(1, 1, 1, 1)
  @ui.group_end

  private titleText!: Text
  private bodyText!: Text
  private actionEC!: ElementContent
  private built = false
  private shown = false
  private readonly PARK = new vec3(0, -100000, 0)

  private _onAction = new Event<void>()
  get onAction(): PublicApi<void> { return this._onAction.publicApi() }

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")

    // No BackPlate surface: on the additive display a light fill washes the view,
    // and BackPlate's InteractionPlane logs planeSize errors (depths unexposed).
    // Light text + a UIKit Button in a FlexLayout column reads cleanly instead.
    const content = global.scene.createSceneObject("Content")
    content.setParent(this.sceneObject)

    const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.width = this.cardWidth
    flex.height = -1
    flex.direction = FlexDirection.Column
    flex.alignItems = FlexAlign.Stretch
    flex.justifyContent = FlexJustify.Start
    flex.rowGap = 1.0
    flex.paddingTop = PAD; flex.paddingBottom = PAD
    flex.paddingLeft = PAD; flex.paddingRight = PAD

    this.titleText = this.addRow(content, "Callout", 1.8, HorizontalOverflow.Overflow)
    // Body uses Overflow + manual line breaks (FlexLayout collapses Wrap width to
    // ~1 cm → one char per line); setContent() word-wraps the body itself.
    this.bodyText = this.addRow(content, "Caption", 5.0, HorizontalOverflow.Overflow)

    this.addActionButton(content, 9, 3.0)

    this.built = true
    this.hide()   // start parked off-screen
  }

  private addRow(parent: SceneObject, role: TextRole, h: number, overflow: HorizontalOverflow): Text {
    const so = global.scene.createSceneObject("Row")
    so.setParent(parent)
    const t = so.createComponent("Component.Text") as Text
    t.text = ""
    t.depthTest = true
    applyTextRole(t, role, CARD_DIST)
    t.textFill.color = this.textColor
    t.horizontalAlignment = HorizontalAlignment.Center
    t.verticalAlignment = VerticalAlignment.Center
    t.horizontalOverflow = overflow
    t.verticalOverflow = VerticalOverflow.Overflow
    // Real width so wrapping text breaks at the card edge, not at 1 cm (one char/line).
    // overrideWidth fixes the FlexItem cell width — FlexLayout overwrites layoutRect
    // with the cell size during layout, so the cell (not the rect) sets the wrap width.
    const innerW = this.cardWidth - 2 * PAD
    t.layoutRect = Rect.create(-innerW / 2, innerW / 2, -h / 2, h / 2)
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Stretch
    item.overrideWidth = innerW
    item.overrideHeight = h
    return t
  }

  private addActionButton(parent: SceneObject, w: number, h: number) {
    const so = global.scene.createSceneObject("ActionButton")
    so.setParent(parent)
    so.getTransform().setLocalPosition(new vec3(0, 0, 0.08))
    const btn = so.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(w, h, 1)
    const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
    if (this.actionIcon) ec.leadingIcon = this.actionIcon
    ec.text = ""
    ec.textSize = roleSize("Button", CARD_DIST)
    ec.contentAlignment = "center"
    this.actionEC = ec
    const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
    item.alignSelf = FlexAlignSelf.Center
    item.overrideWidth = w
    item.overrideHeight = h
    btn.onTriggerUp.add(() => this._onAction.invoke())
  }

  // ── Main -> UI ──
  setContent(title: string, body: string, buttonLabel: string): void {
    if (!this.built) return
    this.titleText.text = title
    this.bodyText.text = this.wrap(body, 26)
    this.actionEC.text = buttonLabel
  }

  // Word-wrap into lines of <= maxChars, joined with explicit newlines.
  private wrap(text: string, maxChars: number): string {
    const words = text.split(" ")
    let line = ""
    let out = ""
    for (const w of words) {
      if (line.length > 0 && line.length + 1 + w.length > maxChars) {
        out += (out.length > 0 ? "\n" : "") + line
        line = w
      } else {
        line = line.length > 0 ? line + " " + w : w
      }
    }
    if (line.length > 0) out += (out.length > 0 ? "\n" : "") + line
    return out
  }

  // Caller sets the world position (positionCardAbove) BEFORE calling show().
  show(): void { this.shown = true }
  hide(): void { this.shown = false; this.sceneObject.getTransform().setLocalPosition(this.PARK) }
  isVisible(): boolean { return this.shown }
}
