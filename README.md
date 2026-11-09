# Tripped — a fuse box coach for SPECS

**Tripped** is an AR Lens for Snap SPECS that talks you through the moment your fuse box (consumer unit) trips and part of the house goes dark. It finds the circuit causing the trip by elimination, one breaker at a time, with each step shown right on the switch it's about, and tells you clearly when to stop and call an electrician.

Built for the Devpost **Learn AR with SPECS** hackathon. Planned with the Devpost Learn skill pack (`plan-lens`), built by a coding agent (Claude Code) through Snap's **CLAD** plugin and the **Lens Studio MCP**, and demonstrated in the Lens Studio preview.

## Who it's for
Renters, new homeowners, and anyone who has stood in a dark hallway flicking the RCD back up and watching it trip again.

## How it works
1. A small dot appears on the tripped RCD. Pinch it to start.
2. The Lens asks you to switch every breaker below it OFF, shown beside the box.
3. It then brings circuits back one at a time — "Turn Kitchen sockets back ON" — with one big pinch per step and a soft tick.
4. When the RCD trips again, that breaker turns amber: **"Found it: Kitchen sockets."**
5. A result card gives the next step (unplug everything on that circuit, then reset) and a **Start again** button.
6. A safety button is always available: *"Smell burning or box hot?"* ends the flow with **"Stop — don't touch it. Call an electrician."**

## Why glasses
- **It draws in the world:** each instruction sits on the exact switch it's about, not on a phone screen.
- **It leaves your hands free:** one hand for the torch, one for the switches.

## Preview stand-ins
The preview can't see a real fuse box, so:
- A real-size virtual consumer unit (1 RCD + 6 labelled breakers) sits on a virtual wall.
- The faulty circuit is hard-coded (Kitchen sockets) and labelled as a demo.
- The re-trip is simulated when the faulty breaker is switched back on.

## Run it
1. Open `Tripped.esproj` in Lens Studio 5.22+ (built on 5.24.1).
2. Open the **Preview** panel and choose Interactive Preview.
3. Move with WASD, look with right-drag; a click is a pinch.

## Repo contents
- `Assets/` — the Lens (scripts, prefabs, materials)
- `devpost/design-brief.md` — the plan written by the `plan-lens` skill
- LEAF tests for each done criterion in Assets/Scripts/Leaf/ (LEAF v2.0.2)
- progress.md - build log from CLAD

## Test results
All 5 done criteria from the design brief pass as LEAF scenarios in the Lens Studio preview, driven by simulated pinches:

| Done criterion | LEAF scenario | Result |
|---|---|---|
| Pulsing dot on the RCD opens the first step card | dc1-start-dot-opens-card | PASS |
| Breakers walked one at a time, current one highlighted, others dimmed | dc2-walk-one-at-a-time | PASS |
| Kitchen sockets back on trips the RCD, breaker turns amber, result card shows | dc3-kitchen-trips-fault | PASS |
| Result card shows the next step and 'Start again' resets the scene | dc4-result-start-again | PASS |
| Safety button replaces everything with 'Stop - call an electrician' | dc5-safety-stop | PASS |

Not directly tested: the clunk and chime sounds (asserted through the state change that plays them), and how it feels on real glasses.

## Built with
Lens Studio · SPECS · Spectacles Interaction Kit · CLAD (`ls-clad`) · Lens Studio MCP · Claude Code · Devpost Learn skill pack

## Pre-existing code and assets
SPECS Base Template and Spectacles Interaction Kit (Snap). Everything else was built during the submission period.

## Safety note
Tripped never asks you to open the consumer unit or touch wiring. It is a guide for resetting breakers and isolating appliances only.
