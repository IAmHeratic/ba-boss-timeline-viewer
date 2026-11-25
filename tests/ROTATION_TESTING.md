# Testing the Rotation tab

## Why a new kind of test

Every rotation bug reported so far had the same shape: **one edit moved something it should not have** (a row jumped, rows after it changed, a new row landed
in the wrong place, a cost stepped to the wrong number). Each time the fix passed the hand-written scenario I wrote for it, and the next variant turned up in
real use. That is what hand-written cases do: they test the situations I imagined. The failures came from situations nobody imagined: two rows at the same
time, a phase transition in the way, a locked row below, a cost cap of 11, a tied row at the very end of the fight.

So the suite is **model-based**: instead of listing cases, it states the *rules* the player has asked for, generates thousands of realistic edit sequences,
and checks every rule after every single edit. A failure is shrunk to the fewest edits that still break the rule and printed with a replay command.

## What is tested, and how it is tied to the real code

* The page's edit handlers were thin wrappers around inline code. That code now lives in plain functions in `index.html` (`opSetTime`, `opNudgeTime`,
  `opClearTime`, `opToggleChain`, `opSetWho`, `opRemove`, `opLock`, `opInsert`, `opAddCast`, `opStepCost`, plus `placeByCost`). The handlers call them, and
  the tests call the same functions, loaded out of `index.html` by `tests/load.js` (not a copy).
* After every edit the planner settles (`applyChains`), exactly as the page's `render()` does.

## The rules (one per thing the player has asked for)

| Rule | Meaning |
|---|---|
| ORDER | The order of the rows is the player's. Changing a cost, student, target, price, tie or lock never reorders the table. A typed time moves that row (and rows tied to it), nothing else. Insert / add / delete put a row exactly where asked. |
| ABOVE | Rows above the edited row never move. |
| FROZEN | Only what the edit needs moves: rows tied to the edited row and, for a cost edit, rows that would otherwise end up above it (they slide just under it). Nothing else changes time. |
| LOCKED | A locked row is never touched. |
| ASKED | A typed cost is honoured whenever the team can have it anywhere after the row above (checked against a brute-force sweep of every 0.01 s moment); when it cannot, the row gets a cost the team really can have. An arrow step goes to the very next cost that can be had. A typed time is exactly that time. |
| STABLE | Settling a second time changes nothing, and saving then reloading changes nothing. |
| SANE | Times inside the fight; chained rows after their parent. |

## The layers

1. `tests/scenarios.js` – hand-written cases with known answers, including one for every bug that was reported (the regression museum).
2. `tests/invariants.js` – rules that hold for any team (random teams, every student, every boss).
3. `tests/rotation_model.js` – **the new one**: random edit sequences, every rule after every edit, shrinking, replay.
4. `--files` mode of the same runner – starts from every real saved rotation (`tests/fixtures/*.json` plus the rotations in `~/Documents/Blue Archive PC/Rotations`) instead of random teams. Real files contain the things generators do not think of.

The generator makes realistic starts: random 4+2 teams, bosses with groggy windows and phase transitions (nobody can cast during one), start cost, UE levels,
cost overrides, a locked prefix (the rows already played), rows added the way the buttons add them (chained or by cost). Edits are weighted towards the ones the
player actually does (typing a cost, arrow stepping, typing a time) and include the awkward ones (a time equal to a neighbour's, same cost retyped, lock toggles).

## Running

```
node tests/rotation_model.js [sequences=200] [seed=1] [--files]
node tests/rotation_model.js 100 4 --only=68                       # one start state, edit by edit (add PRECISE=1 for full-precision times)
node tests/rotation_model.js 100 4 --only=68 --ops='[{"k":"cost","pos":6,"a":5}]'   # replay exactly these edits (rows are named by their place in the table)
```

## Known limits (what this does not cover)

* The page's DOM wiring (does the arrow key call `opStepCost`?). The handlers are one-liners now, but nothing drives a real browser.
* The ASKED sweep is skipped when a locked row sits below the edited one (the window shrinks in ways the sweep does not model); those cases are still checked for ORDER / ABOVE / FROZEN / LOCKED / STABLE.
* Rows at exactly the same time are ordered by their place in the list; the planner does its best to avoid creating ties, and the suite flags the ones that break a rule.

## What the suite found (2026-11-24, first run) and fixed

Bugs in the shipped code, each found by a sequence the player never reported yet:

* A cost typed on a row could move it past a **locked row** below it (locked rows cannot be pushed, so they must limit the row; also when the locked row is tied to it).
* A cost typed on a row could be **blocked by the old position of its own tied rows** ("her own EX is still playing" message that was not true): tied rows move with it, so their old times must not count.
* **Rows at the same time** were pushed 0.01 s apart for no reason, and a tie decided by list position could silently reorder the table.
* Changing a **student** on a chained row could drag the rows tied under it past a locked row.
* **Add row below** a row that has another row less than 0.01 s under it put the new row below that one (the mirror of the Add row above bug).
* A row pushed under an edited row could crowd its own tied rows into the same instant (a tied row listed above its parent).

## Second round (same day): the rare cases, fixed

* Retyping a cost the row did not really see (its plan said 6, it saw 5) did nothing, so the arrow key looked stuck.
* A locked row that is *tied* to the edited row does not follow it, so it must still limit it and still count in its cost.
* A chained row squeezed into a slot narrower than 0.01 s could land above its own parent.
* A row next to the edited one at exactly the same time was pushed 0.01 s for no reason, which could throw it past a locked row.
* Pushing rows under an edited row needs room before the end of the fight (otherwise they all pile up at 0:00 and lose their order).
* Add row above/below between two rows at exactly the same time: the new row now goes right next to the row it was asked beside.

## State

20 seeds x 100 sequences (about 19,700 edits) pass every rule. `run_all` runs two seeds of 40 sequences, fourteen start states that once broke a rule, and the fixtures plus saved rotations (information only).
To go further, run `node tests/rotation_model.js 100 <new seed>`; a failure prints the shortest edit list that reproduces it.
