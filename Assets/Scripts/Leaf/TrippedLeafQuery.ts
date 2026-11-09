// Shared read-only accessors for the Tripped LEAF scenarios. These reach into the live
// Lens scripts by SceneObject name and call their public read-outs — never mutating the
// experience. `enterStart()` is the Lens's own start routine, reused here only to put the
// flow into a known pre-state between scenarios (scenarios share one live Lens instance).

import {findSceneObjectByName} from "Leaf.lspkg/Utils/common/Utils"

// Returns the first ScriptComponent on the named SceneObject (the Tripped scripts each own
// exactly one). Typed as any so the scenario can call the script's public methods/inputs.
export function scriptOf(objectName: string): any {
  const so = findSceneObjectByName(objectName)
  if (!so) throw new Error(`SceneObject "${objectName}" not found`)
  const sc = so.getComponent("ScriptComponent")
  if (!sc) throw new Error(`No ScriptComponent on "${objectName}"`)
  return sc as any
}

export function manager(): any {
  return scriptOf("TrippedStateManager")
}

export function stateName(): string {
  return manager().getStateName()
}

export function currentBreaker(): string {
  return manager().getCurrentBreakerName()
}

export function breakersOff(): number {
  return manager().getBreakersOffCount()
}

// The authored circuit name of a breaker (TrippedSwitch @input) — used to assert the
// current-walk breaker without hard-coding strings.
export function circuitName(breakerObjectName: string): string {
  return scriptOf(breakerObjectName).circuitName
}

export function cardVisible(cardObjectName: string): boolean {
  return scriptOf(cardObjectName).isVisible() === true
}

// Uniform scale, so .x is the whole-object scale factor. Dot/unit hide by scaling to 0.
export function localScaleX(objectName: string): number {
  const so = findSceneObjectByName(objectName)
  if (!so) throw new Error(`SceneObject "${objectName}" not found`)
  return so.getTransform().getLocalScale().x
}

export function localPositionY(objectName: string): number {
  const so = findSceneObjectByName(objectName)
  if (!so) throw new Error(`SceneObject "${objectName}" not found`)
  return so.getTransform().getLocalPosition().y
}

// Reset the flow to START between scenarios via the Lens's own start routine, so each
// scenario is resilient to whatever state the previous one left behind.
export function resetToStart(): void {
  manager().enterStart()
}

export const BREAKER_OBJECTS = [
  "Breaker_UpstairsLights",
  "Breaker_DownstairsLights",
  "Breaker_KitchenSockets",
  "Breaker_UpstairsSockets",
  "Breaker_DownstairsSockets",
  "Breaker_Cooker",
]
