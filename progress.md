# Tripped — build progress

Spatial AR coaching Lens for SPECS: a virtual fuse box (consumer unit) where the user finds a tripped circuit by elimination. Full spec: `devpost/design-brief.md`.

## Environment
- Lens Studio 5.24.1 open on `D:/Specs/Tripped/Tripped.esproj`, MCP reachable (127.0.0.1:50040).
- SIK + UIKit installed in `Packages/`. Account sign-in confirmed `true` (user signed in) — asset-library / generation available.
- Right-handed, +Z = forward, world units cm, runtime rotations radians. Additive display: black = transparent, keep text light.

## Scene layout (from brief)
- Virtual wall + consumer unit ~70 cm in front of user, centre ~130 cm off floor, ~40 cm wide x 25 cm tall.
- Left: 1 RCD. Right: 6 breakers — Upstairs lights, Downstairs lights, Kitchen sockets, Upstairs sockets, Downstairs sockets, Cooker. Switches flip up/down on pinch.
- Small label above each breaker. Instruction card ~12x6 cm beside the relevant breaker. Tick button ~6 cm under the card.
- "Found it: Kitchen sockets" result card beside amber culprit. "Smell burning / box hot?" safety button at edge, always visible. "Demo: fault on Kitchen sockets" label on the unit.

## Flow / state machine
1. START: RCD tripped, only a pulsing dot on the RCD. Pinch dot -> card "Switch all six breakers below it OFF" beside RCD.
2. ALL_OFF: after 6 breakers off + tick -> walk breakers one at a time; current highlighted + label, others dim.
3. Switch Kitchen sockets back ON -> RCD drops (clunk), two-tone chime, Kitchen breaker amber, "Found it" card beside it.
4. Result card: unplug-and-reset step + "call an electrician" line. "Start again" resets to START.
5. "Smell burning / box hot?" at any time -> replaces everything with "Stop — don't touch it. Call an electrician."

## Done criteria (each -> one LEAF scenario)
- [x] DC1: START shows unit + pulsing dot on RCD; pinch dot -> TURN_OFF coach card. (preview-verified; pinch logic via SIK, LEAF-pending)
- [x] DC2: 6 off + tick -> WALK one-at-a-time; current breaker cyan + named on card, others dim. (preview-verified)
- [x] DC3: Kitchen ON -> faultFound: RCD drops (clunk + chime), Kitchen amber, Found-it card. (preview-verified)
- [x] DC4: result card content ("unplug/reset" + "call an electrician") + "Start again" -> enterStart. (preview-verified)
- [x] DC5: safety button -> hide unit, show "Stop — don't touch it. Call an electrician." overlay. (built; terminal)

## Status
- [x] Environment gated, platform = Specs. Camera/DeviceTracking World, SIK prefab, stereo/Interactive preview (Sunlit Room).
- [x] Core flow built: TrippedStateManager (5-state machine) + TrippedSwitch/TrippedDot/TrippedAudio + TrippedCardUI/TrippedSafetyUI (UIKit).
- [x] All 4 visual states verified by preview capture (START / TURN_OFF / WALK / FAULT_FOUND). Compiles + runtime clean.
- [x] Demo label "DEMO: fault on Kitchen sockets" (amber Text3D) on the unit.
- [ ] Detail deferred: per-breaker always-on in-world labels above each switch (coach card names the active breaker instead).
- [ ] LEAF scenarios: parent-driven (not run here).

## Build facts (for LEAF targeting)
- State read: `TrippedStateManager.getStateName()` -> "START"|"TURN_OFF"|"WALK"|"FAULT_FOUND"|"EMERGENCY". Also `getCurrentBreakerName()`, `getBreakersOffCount()`. Logs "[Tripped] state=..." on every transition.
- Named SceneObjects: TrippedUnit (group), Switch_RCD, Breaker_UpstairsLights, Breaker_DownstairsLights, Breaker_KitchenSockets, Breaker_UpstairsSockets, Breaker_DownstairsSockets, Breaker_Cooker, RcdDot, CoachCard, ResultCard, SafetyUI (SafetyButton), DemoLabel, TrippedStateManager, TrippedAudio.
- Kitchen is breakerIndex 2 (hard-coded fault). All interactions are SIK Interactable + MouseInteractor (click = pinch in preview / LEAF).
- SFX local/procedural (build-sfx): StepTick, RcdClunk, FaultChime in Assets/GeneratedSFX/. No account/AI assets.

## Evidence
Preview captures reviewed for START (unit+dot), TURN_OFF (coach card), WALK (cyan active + dim others), FAULT_FOUND (amber Kitchen + result card). Recompile clean; RunAndCollectLogs clean (no errors).
