---
status: approved
---

# Design brief: Tripped

<!-- Filled in by plan-lens from the learner's interview. Uses the learner's words. Values they didn't choose are marked (default). -->

## The one spatial moment
You're standing at a tripped fuse box with a torch, part of the house dark. A small pulsing dot sits on the tripped RCD; looking at it and pinching opens one short instruction beside the switch it's about. You pinch through the breakers one at a time, and when the faulty circuit comes back on the RCD drops and that breaker glows amber: "Found it: Kitchen sockets." The steps live on the actual switches, so your hands stay on the torch and the breakers.

## Why it belongs on glasses
- Uses: draws in the world; leaves your body free.
- Why it's better than the phone or laptop version: the steps sit on the actual switches instead of in a separate app, and your hands stay free for the torch and the breakers. On a phone you'd be juggling the phone, a torch and a how-to video in a dark hallway.

## Product or overlay
- Type: overlay in intent (it coaches you at a fuse box), built as a self-contained virtual unit so it can be shown entirely in the preview.
- What the real version would sense: the real consumer unit — which switch is the RCD, each breaker's label, and that the RCD tripped again when the faulty circuit is switched back on.
- Stand-in for the preview: a real-size virtual consumer unit with one RCD and six labelled breakers. The fault is hard-coded to Kitchen sockets, with a small, obvious "Demo: fault on Kitchen sockets" label so nobody thinks it's reading a real box. When Kitchen sockets is switched back on, the Lens trips the RCD itself (it drops with a clunk and the breaker turns amber). Everything after that is built for real.

## Where things live
- Where the user is looking during the main task: straight ahead at the virtual consumer unit, chest height, the whole time.
- Consumer unit: on a virtual wall about 70 cm in front of the user, centre roughly 130 cm off the floor (a little below eye level), about 40 cm wide by 25 cm tall, so the whole unit fits inside the glasses' view at that distance.
- Switches: one RCD on the left, then six labelled breakers — Upstairs lights, Downstairs lights, Kitchen sockets, Upstairs sockets, Downstairs sockets, Cooker. Switches flip up and down when pinched.
- Small labels sit above each breaker.
- Instruction card: about 12 x 6 cm, just above or beside the breaker it's about — never floating in the middle of the view.
- Big tick button: about 6 cm, just under the instruction card.
- "Found it: Kitchen sockets" result card: beside the amber culprit breaker, so the user's eyes stay on the box.
- "Smell burning / box hot?" safety button: at the edge of the unit, always visible.

## Hands and input
- Flip a breaker: pinch the switch (toggles up/down).
- Confirm a step and move on: pinch the big tick (about 6 cm).
- Reset the whole scene: pinch "Start again".
- Emergency stop at any point: pinch "Smell burning / box hot?".
- Targets are big and highlight when aimed at.
- Voice (if any) and the button that does the same job: none — all input is pinch.

## When things show
- On start: only a small pulsing dot on the tripped RCD. Nothing else.
- Pinching the dot opens the first card: "Switch all six breakers below it OFF." One step card is shown at a time, beside the breaker it's about; it fades when the tick is pinched and the next appears.
- During elimination: only the current breaker is highlighted with its label shown; the others dim.
- A soft tick sound confirms each step.
- When Kitchen sockets is switched back on: a two-tone chime plays, the RCD drops with a clunk, and the culprit breaker turns amber with the "Found it" card beside it. That card stays until "Start again" is pinched.
- If something needs attention out of view: not applicable — everything stays on the box in front of the user.
- The "Smell burning / box hot?" button is always visible; pinching it replaces everything with "Stop — don't touch it. Call an electrician."

## Done criteria
Each one can be checked in Lens Studio's preview.
1. On start, the virtual consumer unit sits about 70 cm in front at chest height with the RCD tripped, and only a pulsing dot shows on the RCD. Pinching the dot opens the card "Switch all six breakers below it OFF" beside it.
2. After the six breakers are pinched off and the tick is pinched, the Lens walks through the breakers one at a time. Each step card appears next to that breaker with its label, and the other breakers dim.
3. When Kitchen sockets is switched back on, the RCD drops with a clunk, a two-tone chime plays, and Kitchen sockets turns amber with the "Found it: Kitchen sockets" card beside it.
4. The result card shows the unplug-and-reset step and the "call an electrician" line, and pinching "Start again" resets the whole scene to the first state.
5. Pinching "Smell burning / box hot?" at any point replaces everything with "Stop — don't touch it. Call an electrician."

## Out of scope
- Coaching through each appliance one at a time to find the faulty device. The result card tells the user how to do this themselves; guided appliance elimination is a future version.
- Recognizing a real fuse box or detecting a real trip. The virtual unit and the hard-coded Kitchen-sockets fault stand in for both.

## Risks and open questions
- Feel unproven (only real glasses can answer): whether pinching the switches is comfortable over a full run, and whether the amber highlight and the dimmed breakers read clearly on the additive display in a real, dim hallway. The logic and flow are all provable in the preview.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources
