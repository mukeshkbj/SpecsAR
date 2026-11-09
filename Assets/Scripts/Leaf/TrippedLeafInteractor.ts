// Drives the Tripped experience the way a user's pinch does: every interaction below resolves
// a live SIK Interactable and triggers it (hover -> select -> release). The state manager reacts
// to the switches' onToggle, the dot's onPinch, and the UIKit buttons' onTriggerUp exactly as in
// preview. LEAF's per-scenario timeout guards a non-converging interaction from hanging.

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractableByName, getInteractables} from "Leaf.lspkg/Interactors/InteractableUtils"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"

const SETTLE_MS = 350

export class TrippedLeafInteractor extends DefaultLeafInteractor {
  constructor() {
    super("TrippedLeafInteractor")
  }

  // Pinch a switch / the RCD dot / the safety button — all carry their Interactable on the
  // SceneObject of the given name.
  async pinch(objectName: string): Promise<void> {
    const it = findInteractableByName(objectName, undefined, true)
    if (!it) {
      throw new Error(`Interactable on "${objectName}" not found or not enabled`)
    }
    await this.trigger(it)
    await sleep(SETTLE_MS)
  }

  // Tap a card's action button. Both CoachCard and ResultCard hold an "ActionButton", so scope
  // the search to the card's subtree to pick the right one.
  async tapCardButton(cardObjectName: string): Promise<void> {
    let btns = getInteractables({
      ancestorName: cardObjectName,
      sceneObjectName: "ActionButton",
      enabledInHierarchy: true,
    })
    if (btns.length === 0) {
      btns = getInteractables({ancestorName: cardObjectName, enabledInHierarchy: true})
    }
    if (btns.length === 0) {
      throw new Error(`No enabled button interactable under card "${cardObjectName}"`)
    }
    await this.trigger(btns[0])
    await sleep(SETTLE_MS)
  }
}
