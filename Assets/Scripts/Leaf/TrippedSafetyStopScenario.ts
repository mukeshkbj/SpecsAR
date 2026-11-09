// DC5 — safety stop.
// From a non-terminal state (TURN_OFF), pinching the safety button enters EMERGENCY: the fuse-box
// unit is hidden (scaled to 0) and the STOP overlay ("Stop — don't touch it. Call an electrician.")
// is shown. The overlay text is static authored content; this asserts the overlay root is lifted
// into view (un-parked) and the safety button itself is parked away.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {sleep} from "Leaf.lspkg/Utils/common/Utils"
import {TrippedLeafInteractor} from "./TrippedLeafInteractor"
import {resetToStart, stateName, localScaleX, localPositionY} from "./TrippedLeafQuery"

@component
export class TrippedSafetyStopScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const user = new TrippedLeafInteractor()

    resetToStart()
    await sleep(300)

    // Go to a non-terminal state.
    await user.pinch("RcdDot")
    expect(stateName()).toBe("TURN_OFF")

    // Pinch the safety button -> EMERGENCY.
    await user.pinch("SafetyButton")
    expect(stateName()).toBe("EMERGENCY")

    // Unit hidden (scaled to 0).
    expect(localScaleX("TrippedUnit") < 0.01).toBe(true)

    // STOP overlay shown (lifted out of the parked -100000 position), safety button parked away.
    expect(localPositionY("StopOverlayRoot") > -1000).toBe(true)
    expect(localPositionY("SafetyButtonRoot") < -1000).toBe(true)
  }
}
