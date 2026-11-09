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

## Done criteria — ALL 5 LEAF PASS (preview, 2026-11-09) + visually verified by me
- [x] DC1 dc1-start-dot-opens-card: PASS. START + pinch dot -> TURN_OFF + CoachCard visible.
- [x] DC2 dc2-walk-one-at-a-time: PASS. 6 off + tick -> WALK; current cyan (getMode active), others dim; advances UpstairsLights -> DownstairsLights. Capture: cyan reads clearly on additive.
- [x] DC3 dc3-kitchen-trips-fault: PASS. Kitchen ON -> FAULT_FOUND, Kitchen amber (getMode amber), ResultCard visible. Capture: amber reads clearly. SFX (clunk+chime) NOT directly asserted (no audio state/print) — proxied by the transition that plays them; WAVs confirmed loaded.
- [x] DC4 dc4-result-start-again: PASS. ResultCard -> Start again -> START, dot visible, cards hidden, breakers reset, RCD tripped.
- [x] DC5 dc5-safety-stop: PASS. Safety button -> EMERGENCY, unit hidden, STOP overlay visible. Capture: "Stop — don't touch it." / "Call an electrician." legible.

## Detail pass (2026-11-09) — done
- Card placement fixed in `positionCardAbove()`: x now tracks the breaker (clamp widened [-6,8] -> [-18,18]); y lift reduced +12 -> +8. Cards now sit beside/above their own breaker (coach card beside RCD on the left; result card above the amber Kitchen breaker) instead of clustering centre-top.
- "Found it: Kitchen sockets" title now clearly in frame (the lower lift stopped the top row clipping). Verified by capture; "Step 1 — reset" coach title also now shows.
- Per-breaker always-on labels: SKIPPED (user said only if quick). Breakers are 4.4 cm apart (local x: -8,-3.6,0.8,5.2,9.6,14); names like "Downstairs sockets" can't be legible at that pitch without overlap/clutter. Cards name the active breaker instead (DC2 covers it). Candidate future work: a single label on the active breaker only, or a vertical mini-list.
- All 5 LEAF scenarios re-run after the change: ALL PASS (placement is position-only; isVisible() is a flag, so assertions unaffected).
- Side effect handled: the AI-preview plugin re-installs `AiPreviewAgentInspect.lspkg` (built for new UIKit/InteractionKit naming) when QueryRuntimeSceneTool is called; it breaks compile. Removed it; AVOID QueryRuntimeSceneTool in this project (use VirtualScene read + CapturePanelScreenshot + LEAF instead).
- Preview left at clean START; project saved (`model.project.save()`).

## Visual verdict (my own captures) — logic proven; additive legibility good
- Colours read well on the additive display: cyan active breaker, amber culprit, light card text, demo label, safety button all legible.
- DESIGN NOTE (brief deviation): instruction/result cards float TOP-CENTRE, not beside the breaker they're about. Cause: positionCardAbove() clamps x to [-6,8] (too tight for a 40cm unit) and lifts y+12 above the unit. Brief wants cards "beside the breaker ... never floating in the middle." Fix = loosen x clamp to track the breaker + smaller y offset so the card sits just above/beside its switch. Position-only; LEAF asserts card isVisible(), not position, so tests stay valid (verify cardVisible() logic before changing).
- "Found it: Kitchen sockets" title not clearly in frame in the FAULT capture (body text + Start again show) — check title render/placement.
- Still deferred (detail): per-breaker always-on in-world labels above each switch.

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

## LEAF status (2026-11-09)
- Leaf package v4.0.0 installed (`Packages/Leaf.lspkg`). SIK 0.18.0.
- 8 scenario files authored + saved under `Assets/Scripts/Leaf/`: TrippedLeafQuery, TrippedLeafInteractor, LeafIndex, + 5 scenarios (ids dc1-start-dot-opens-card, dc2-walk-one-at-a-time, dc3-kitchen-trips-fault, dc4-result-start-again, dc5-safety-stop). Self-resetting, order-independent.
- RESOLVED the install deadlock + version mismatch (2026-11-09):
  - Restart cleared the asset-sync deadlock.
  - Root cause of compile errors: LEAF v4.0.0 imports SIK as `InteractionKit.lspkg` (new SIK naming), but project ships `SpectaclesInteractionKit.lspkg` (v2.0.0) that the whole experience uses. Fix: downgraded LEAF to **v2.0.2**, which imports `SpectaclesInteractionKit` — keeps the verified experience untouched (only test infra changed).
  - Cleaned up: removed duplicate `Leaf 2.lspkg`, re-installed v2.0.2 as canonical `Leaf.lspkg`; removed two stray `AiPreviewAgentInspect*.lspkg` (pulled in during messy sync, not used, broke compile). LEAF deps kept: Bitmoji 3D, Icons, Motion.
  - Fixed our `TrippedLeafInteractor.ts`: removed `eventTimeoutMs` (v4-only; absent in v2.0.2). All 8 Leaf files + experience now compile clean; runtime clean.
- NEXT: attach LeafIndex (root SceneObject + ScriptComponent -> LeafIndex.ts), open LEAF panel, target preview (NOT the attached emulator-5554), run 5 scenarios, report PASS/FAIL.
- Resume steps after restart: recompile (fix TS errors in Leaf files only) -> create root "LeafIndex" SceneObject + ScriptComponent -> scriptAsset = LeafIndex.ts -> recompile -> open_leaf_panel -> set_leaf_execution_target(onDevice:false) -> list_leaf_scenarios -> run each of the 5 ids.
- Known assertion gap (independent of blocker): DC3 SFX (clunk/chime) has no log print and no exposed audio state, so it is asserted only via the FAULT_FOUND transition that unconditionally plays them. Direct SFX verification would need a one-line print in TrippedAudio (experience-code edit — ask first).

## Evidence
Preview captures reviewed for START (unit+dot), TURN_OFF (coach card), WALK (cyan active + dim others), FAULT_FOUND (amber Kitchen + result card). Recompile clean; RunAndCollectLogs clean (no errors).
