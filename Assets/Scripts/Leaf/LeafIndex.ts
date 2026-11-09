// LEAF scenario registry for Tripped. Attached to a "LeafIndex" SceneObject so the LEAF panel can
// discover and run the five done-criterion scenarios (DC1–DC5).

import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {TrippedStartScenario} from "./TrippedStartScenario"
import {TrippedWalkScenario} from "./TrippedWalkScenario"
import {TrippedKitchenFaultScenario} from "./TrippedKitchenFaultScenario"
import {TrippedResultResetScenario} from "./TrippedResultResetScenario"
import {TrippedSafetyStopScenario} from "./TrippedSafetyStopScenario"

@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "dc1-start-dot-opens-card", typename: TrippedStartScenario.getTypeName()},
    {id: "dc2-walk-one-at-a-time", typename: TrippedWalkScenario.getTypeName()},
    {id: "dc3-kitchen-trips-fault", typename: TrippedKitchenFaultScenario.getTypeName()},
    {id: "dc4-result-start-again", typename: TrippedResultResetScenario.getTypeName()},
    {id: "dc5-safety-stop", typename: TrippedSafetyStopScenario.getTypeName()},
  ]
}
