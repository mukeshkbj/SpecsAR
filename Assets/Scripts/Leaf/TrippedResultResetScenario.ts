// DC4 — result + start again.
// In FAULT_FOUND the ResultCard is visible. Tapping its "Start again" button returns the flow to
// START: dot visible again, both cards hidden, breakers back to the start configuration (all ON ->
// offCount 0) and the RCD reset to its tripped (off) state.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TrippedLeafInteractor} from "./TrippedLeafInteractor"
import {
  resetToStart,
  stateName,
  cardVisible,
  breakersOff,
  localScaleX,
  scriptOf,
  BREAKER_OBJECTS,
} from "./TrippedLeafQuery"

@component
export class TrippedResultResetScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const user = new TrippedLeafInteractor()

    // Setup: drive all the way to FAULT_FOUND via real pinches.
    resetToStart()
    await sleep(300)
    await user.pinch("RcdDot")
    for (const b of BREAKER_OBJECTS) {
      await user.pinch(b)
    }
    await user.tapCardButton("CoachCard")
    await user.pinch("Breaker_UpstairsLights")
    await user.pinch("Breaker_DownstairsLights")
    await user.pinch("Breaker_KitchenSockets")
    expect(stateName()).toBe("FAULT_FOUND")
    expect(cardVisible("ResultCard")).toBe(true)

    // Tap "Start again" -> START, everything reset.
    await user.tapCardButton("ResultCard")
    expect(stateName()).toBe("START")
    expect(localScaleX("RcdDot") > 0.01).toBe(true) // dot visible again
    expect(cardVisible("CoachCard")).toBe(false)
    expect(cardVisible("ResultCard")).toBe(false)
    expect(breakersOff()).toBe(0) // breakers back ON (start config)
    expect(scriptOf("Switch_RCD").isOn()).toBe(false) // RCD tripped (reset)
  }
}
