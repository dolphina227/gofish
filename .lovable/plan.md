# Walk on the real boat deck

Right now, when the player is aboard but not holding the wheel, the character walks inside an invented rectangle: a flat box guessed from the hull's overall size (`boat.deck.halfX/halfZ` from the bounding box, floor height from a fixed `deckYFactor` fraction). That box ignores what each boat model actually looks like — so the character can hover above a low deck, sink into a raised one, walk through a cabin wall, or stop short of open deck space. It is the same guess for every hull, which is why every boat feels wrong in a different way.

## What will change

The character will stand on the boat's real surfaces:

- Where the character can walk is read from the boat model itself, not from a rectangle.
- The character's feet follow the actual floor height — steps up onto a raised bow or down into a cockpit work.
- Cabins, masts and rails block movement instead of being walked through.
- Walking off the edge of the deck is not possible; the step is simply refused.
- This works for every boat, including ones added later, with no per-boat tuning.

## How it works (technical)

1. **Expose the hull model.** `BoatModel` in `src/components/game/Boat.tsx` already builds the transformed wrapper group; store it (via a ref/callback on the parent `Boat`) so deck queries can raycast against the loaded meshes.

2. **New deck probe in `src/hooks/useBoat.ts`.** Add `probeDeck(localX, localZ): number | null`:
   - Convert the hull-local point to the model group's space, cast a `THREE.Raycaster` straight down from above the hull top.
   - Return the highest hit whose surface is near-horizontal (normal.y > ~0.6) and below the character's head clearance; `null` when nothing is hit (that point is off the deck).
   - Reuse a module-level raycaster/vectors so nothing is allocated per frame.

3. **Replace box clamping in `moveOnDeck`.** Instead of clamping to `deck.halfX/halfZ`:
   - Probe the candidate position. Reject the step when the probe returns `null` (off the hull) or when the height jump exceeds a step limit (~0.35 local units) — that is a wall, cabin side, or rail.
   - Accept otherwise and set `boat.offset.y` to the probed floor height (smoothly damped so small bumps don't jitter the camera).
   - Probe the four points around the character's radius, not just the center, so the body doesn't clip into structures.

4. **Seat and boarding placement.** After the model loads, probe outward from the auto-computed helm spot for the nearest valid deck point and snap `BOAT_SEAT` / `resetDeckOffset()` there, so boarding never drops the character into a cabin or the keel. Keep the existing `helmZFactor` / `helmXFactor` / `helmYOffset` overrides as nudges applied before the probe.

5. **Fallback.** If the model has not loaded yet or the probe finds nothing anywhere (unusual geometry), fall back to the current bounding-box behaviour so the player is never stuck.

6. **Cost.** A handful of short raycasts only while the player walks on deck (not while driving, not while ashore), limited to the hull subtree — negligible next to the scene render.

## Verification

Board each boat type, walk bow-to-stern and side-to-side, confirm the feet sit on the visible deck, structures block, edges stop movement, and taking the wheel still works.
