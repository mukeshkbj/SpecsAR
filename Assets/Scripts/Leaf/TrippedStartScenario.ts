// DC1 — start + dot opens first card.
// At START: unit shown, pulsing RcdDot visible, CoachCard hidden. Pinch the dot -> TURN_OFF and
// the CoachCard becomes visible.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TrippedLeafInteractor} from "./TrippedLeafInteractor"
import {resetToStart, stateName, cardVisible, localScaleX} from "./TrippedLeafQuery"

@component
export class TrippedStartScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const user = new TrippedLeafInteractor()

    // Known pre-state (the Lens's own start routine; START is also the load state).
    resetToStart()
    await sleep(300)

    // At START.
    expect(stateName()).toBe("START")
    expect(localScaleX("RcdDot") > 0.01).toBe(true) // dot visible (pulsing, non-zero scale)
    expect(cardVisible("CoachCard")).toBe(false) // coach card hidden

    // Pinch the dot -> TURN_OFF, coach card appears.
    await user.pinch("RcdDot")
    expect(stateName()).toBe("TURN_OFF")
    expect(cardVisible("CoachCard")).toBe(true)
  }
}
