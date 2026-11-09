// DC2 — walk one-at-a-time.
// From TURN_OFF: switch all six breakers OFF, tap the coach tick -> WALK with the current breaker
// equal to the first breaker in the walk. Switching the current (non-Kitchen) breaker ON advances
// the walk to the next breaker — proving one-at-a-time progression.
//
// Note: the cyan-active / dim-others highlight is visual (TrippedSwitch mode). This scenario
// asserts the exposed getMode() where it can; the colour itself is verified separately in preview.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TrippedLeafInteractor} from "./TrippedLeafInteractor"
import {
  resetToStart,
  stateName,
  currentBreaker,
  breakersOff,
  circuitName,
  scriptOf,
  BREAKER_OBJECTS,
} from "./TrippedLeafQuery"

@component
export class TrippedWalkScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const user = new TrippedLeafInteractor()

    resetToStart()
    await sleep(300)

    // START -> TURN_OFF.
    await user.pinch("RcdDot")
    expect(stateName()).toBe("TURN_OFF")

    // Switch all six breakers OFF.
    for (const b of BREAKER_OBJECTS) {
      await user.pinch(b)
    }
    expect(breakersOff()).toBe(6)

    // Tap the tick -> WALK; current breaker is the first in the walk.
    await user.tapCardButton("CoachCard")
    expect(stateName()).toBe("WALK")
    const first = currentBreaker()
    expect(first.length > 0).toBe(true)
    expect(first).toBe(circuitName("Breaker_UpstairsLights"))
    // Exposed highlight state: first breaker active, a later one dim.
    expect(scriptOf("Breaker_UpstairsLights").getMode()).toBe("active")
    expect(scriptOf("Breaker_DownstairsLights").getMode()).toBe("dim")

    // Advance one step: switch the current (first, non-Kitchen) breaker ON.
    await user.pinch("Breaker_UpstairsLights")
    expect(stateName()).toBe("WALK")
    const second = currentBreaker()
    expect(second).not.toBe(first)
    expect(second).toBe(circuitName("Breaker_DownstairsLights"))
    expect(scriptOf("Breaker_DownstairsLights").getMode()).toBe("active")
  }
}
