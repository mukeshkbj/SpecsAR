// DC3 — Kitchen trips it.
// Drive the walk until Kitchen sockets is the current step, then switch Kitchen sockets ON ->
// FAULT_FOUND: the Kitchen breaker goes amber and the ResultCard appears.
//
// SFX note: faultFound() calls audio.playClunk() + audio.playChime() on this same transition, but
// TrippedAudio exposes no playback state and prints no log line, so the clunk + two-tone chime
// cannot be asserted directly — reaching FAULT_FOUND is the closest observable proxy (the audio
// calls are unconditional on that transition).

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TrippedLeafInteractor} from "./TrippedLeafInteractor"
import {
  resetToStart,
  stateName,
  currentBreaker,
  circuitName,
  cardVisible,
  scriptOf,
  BREAKER_OBJECTS,
} from "./TrippedLeafQuery"

@component
export class TrippedKitchenFaultScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const user = new TrippedLeafInteractor()

    resetToStart()
    await sleep(300)

    // Drive START -> TURN_OFF -> WALK.
    await user.pinch("RcdDot")
    for (const b of BREAKER_OBJECTS) {
      await user.pinch(b)
    }
    await user.tapCardButton("CoachCard")
    expect(stateName()).toBe("WALK")

    // Walk forward until Kitchen sockets is the current step.
    await user.pinch("Breaker_UpstairsLights") // step 0 -> 1
    await user.pinch("Breaker_DownstairsLights") // step 1 -> 2 (Kitchen)
    expect(currentBreaker()).toBe(circuitName("Breaker_KitchenSockets"))

    // Switch Kitchen sockets ON -> fault found.
    await user.pinch("Breaker_KitchenSockets")
    expect(stateName()).toBe("FAULT_FOUND")
    expect(scriptOf("Breaker_KitchenSockets").getMode()).toBe("amber") // amber culprit
    expect(cardVisible("ResultCard")).toBe(true)
  }
}
