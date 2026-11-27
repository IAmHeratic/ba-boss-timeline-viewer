# Blue Archive mechanics used by the timeline viewer

Research notes (2026-11-19). Each line says how well it is sourced.
**DATA** = SchaleDB game data. **WIKI** = a wiki or guide site. **TEST** = measured in the player's own mock battles.
**UNKNOWN** = no source found; the viewer does not model it. Fandom, NamuWiki and most of bluearchive.wiki could not be fetched automatically, so some
items rest on search snippets and are marked as such.

## Cost
| Rule | Status | Source |
|---|---|---|
| Every student has Cost Recovery 700; regen per second = (sum of the team's values) / 10,000 (6 students = 0.420/s, 2.38 s per cost) | WIKI + TEST (4 runs within 0.5%) | Game8 JP 647046, ultimitarchive costspeed, bluerec; tests |
| Sub Skills that raise all allies' cost recovery multiply the total: Himari, Himari (Armed), Kisaki, Haruka (New Year), Shiroko (Swimsuit), Niya, Michiru (Dress), Ibuki (Swimsuit); +20.3% at Sub Lv 10 | DATA + TEST | SchaleDB ExtraPassive |
| Two such Sub Skills do not stack (same slot, same effect) | WIKI (Game8, unverified by its author) | Game8 JP |
| Max cost is 10 | WIKI (inferred) | - |
| Unique Equipment star 4 (Lv 60) on a Special adds +0.5 max cost; two Specials give 11. Strikers get a damage bonus instead | WIKI (kamigame X post, bluearchive.wiki Nagisa (Swimsuit) page) | |
| UE stars: 1 = Lv 30, 2 = Lv 40 (unlocks the + passive), 3 = Lv 50, 4 = Lv 60 | WIKI (gamerch, Game8); SchaleDB's own config still says max Lv 50 | |
| Cost Over (Nagisa Swimsuit EX, 26 s, 30.9 s with her + passive): the target ally may spend up to 5 more than it holds; the excess is negative cost; debt is repaid by regen; skill text says it needs a full team on the field | WIKI (Hatena blogs, bluearchive.wiki) | |
| Several allies can hold Cost Over at once | WIKI | |
| What happens to negative cost when Cost Over expires | UNKNOWN | |
| Several allies holding Cost Over share one pool: a Cost Over cast needs (cost - 5) held, so the team's cost cannot drop below -5 after any cast (the tool's model; per-student allowances are not ruled out) | MODEL (unverified) | |
| EX card order: the hand is 3 slots; a pressed card's slot is refilled in the same slot from the front of a queue and the pressed card goes to the back; the queue starts as the 4th and 5th starting skill, then the sixth student (Strikers and Specials share it) | TEST (Hod Yellow Torment Indoor recording: 29 presses, 25 draws, all matched) | Hod Purple and Binah recordings not checked yet |
| Rio's EX turns her own card, in place, into a copy of the target's card (cost = original base - 1; it draws nothing); using the copy draws like any card and Rio's card then goes to the back. A copy shows the target's face with a glowing frame | TEST (same recording, 4 copies; the cost 5 for Mika's copy and 3 for Neru's follow-up copy seen in the Hod and Binah recordings) | |
| Rio can only copy a Striker (she aims at an ally on the field; Specials cannot be targeted, Himari (Armed)'s wheelchair included) and holds one copy at a time | USER (stated 2026-11-26) | |
| The copy plays the copied student's animation (so it cannot be used while she is busy) and follows the copied card's state: Neru's copy is the follow-up while she is marked and changes back to "You Want to Fight?" when her 70 s end | USER (stated 2026-11-26) for both; consistent with the skill text "inherits the status of the target ally's EX Skill card" | not seen in a recording |
| "Immediately redraws the EX Skill": the card comes straight back into the same slot, the queue does not move. Neru (School): her first EX (cost 1) comes back as "This'll Hurt, Y'know" (cost 4); the follow-up and Rio's copy of it then go to the back like any card | TEST (Binah Lunatic Yellow Field recording, second team: 18 presses) | |
| Neru (School)'s mark ("You Want to Fight?", a Duel state with one enemy, 70 s): every EX card she draws inside it is the follow-up "This'll Hurt, Y'know" (cost 4); when it ends the card is her normal EX again (cost 1). Her new card appears when the cast animation ends (133 frames, 4.4 s after the cost is spent) | TEST (both Wakamo Phase 2 recordings: cost spent at clock 231.7 and 217.1, new card 4.4 s later; the card went back to normal 71.6 s after the cast in the double-Seia recording (Neru's own card) and 70.5 s after it in the Maki recording (Rio's copy of her card, which flipped from cost 2 to 0)). The 70 s is the game's own text (shown when the card is aimed); SchaleDB's data has no duration or apply frame, so the start is taken as 1.1 s (33 frames) into the cast, the middle of the two | two recordings 1.1 s apart; the follow-up's stacks (max 5) are not modelled |
| Aris (Armed): Sword of Light is redrawn at once; Awakening: Supernova goes to the back | TEST (Shiro Kuro Torment recording: 7 presses) | the gold glow on her card (energy level) is not modelled |
| Hina (Dress): the stance cast and the First and Second Note are redrawn at once (the card shows the notes left: x3, x2, x1); The Final Song goes to the back | TEST (Gregorius Torment recording, first cycle) | |
| Redraw of Toki, Hanako (Swimsuit), Hiyori (Swimsuit), Mika (Swimsuit; "shuffled to the bottom of the deck" when her stance ends), Shun (Swimsuit; same wording), Ibuki (Swimsuit): depends on a gauge, stance or timer | UNKNOWN: no recording; the cards rows mark their casts with a warning line | Hanako is in the Chesed recording (not read yet) |
| Every student whose skill text (any alternate EX skill included) says "redraw" is one of: Rio, the three above, or these six | DATA (audit_students.js fails if SchaleDB adds another) | |
| EX cost changes: % reductions (Ui, Seia, Fuuka (New Year)) up to 50% rounded down; flat reductions (Kokona stamps, Kikyo, Shiroko (Swimsuit) -1, Umika -3, ...); Rio's copy = original cost - 1, min 0 | WIKI | Game8, Blue Rec |
| How cost modifiers stack and in what order | UNKNOWN (one source suggests they work from the base cost) | |
| Kokona: after 5 stamps, every ally's next EX (not hers) costs 1 less, stamps reset | WIKI | |
| Model check against the Binah Lunatic Yellow video (2:38 to 2:26, bar fill measured by pixels, clock read by OCR, 60 fps): cost is deducted instantly when the card is pressed (Mika 9.97 -> 4.03, Kisaki 4.13 -> 1.16, Akane 2.14 -> 0.20); regen between casts matches 0.505/s; the first model (regen from 2:58.4) said 2:30.68, but the bar reached 2.00 at about 2:30.27 once the bar's segment gaps were handled (see the start-cost row); with regen from 2:58.02 they agree. Real presses were not back to back: Mika at 2:32.37, Kisaki 0.34 s later | TEST (video, measured) | |
| Binah LUNATIC only (Hidden One's Vision, BinahLunaticPassive02): when Binah becomes groggy, all Striker students get +600 Cost Recovery for 10 s. With 4 Strikers and Kisaki's +20.3%: (6 x 700 + 4 x 600) / 10000 x 1.203 = 0.794/s | DATA (SchaleDB enemy skills) |
| Check of the row above in the Binah Lunatic Yellow video: bar slope 0.79 per clock-second from about 1:51.7 to 1:41.7 (two clean stretches: 0.790 and 0.793), 0.50 before and after. No other stretch of Team 1 shows a different slope | TEST (video, measured) |
| Starting cost at battle start | Cost starts at 0 and regen begins 1.98 s after the clock starts (zero crossing of the bar at clock 178.02, 178.02 and 178.04 in three recordings; an earlier 1.6 s estimate was wrong). Regen slopes measured: 0.5048, 0.5048 and 0.4388 per clock-second | TEST (bar fill by pixels, clock by OCR, 60 fps) |
| Whether cost is deducted when the card is pressed or when the skill starts | UNKNOWN | |
| Retreated or dead Strikers lower regen (3 Strikers = 0.35/s with no Specials counted by that source) | WIKI. The viewer assumes the whole team stays alive | |

## Skills
| Rule | Status |
|---|---|
| Slots: EX Skill, Basic Skill, Enhanced Skill, Sub Skill. EX levels 1-5; the others 1-10 | DATA + WIKI |
| Skill `Duration` is in frames (30 per second); buff durations are in milliseconds; `ApplyFrame` is when an effect lands | DATA |
| Basic skill ("Every N s"): fires when off cooldown. If the student's own EX animation covers the due time it waits until the animation ends; using the EX while the basic is activating cancels the basic; using it just after the basic activated keeps the effect | WIKI (one NamuWiki snippet) + TEST (Rio, Kanna, Neru) |
| The interrupted basic still uses up its cooldown | TEST (one clip) |
| First basic activates one cooldown after the clock starts (+0.4 s) | TEST (Nagisa, Kisaki exact) |
| Strikers' basics can fire about 0.5-1.5 s late; cause unknown | TEST. Viewer has an "extra wait" box, default 0 |
| Effects of game speed (2x, 3x) on timers; whether timers pause in cutscenes | UNKNOWN |

## Buffs
| Rule | Status |
|---|---|
| Buff Retention: duration x (1 + value/10000); 1900 = +19%. Comes with the + passive at UE star 2 | WIKI (Game8 JP, ItJustWorks doc) |
| It lengthens buffs granted to self and allies (incl. Cost Over); debuffs have their own stat, Debuff Retention | DATA (SchaleDB stat text) |
| Effects stack when they come from different slots (EX, Basic, Enhanced, Sub) and do not share a channel; same slot overwrites, even with a weaker effect | WIKI (ItJustWorks, gameplay.tips) |
| What a recast of the same buff does to the duration | UNKNOWN. The viewer marks a recast while the old one runs |
| Damage formula details | Source unreadable; not modelled |

## Total Assault
| Rule | Status |
|---|---|
| Binah's in-battle limit is 3:00. Other bosses differ (several start at 4:00, Drumbarka 4:30). The viewer has a per-team "Time limit" box | WIKI + community doc |
| 4 Strikers + 2 Specials per team | WIKI / community |
| A student cannot appear in two teams of the same real run; borrowed (assist) students exist. The viewer does not enforce either, since it is for practice | WIKI |
| Whether a borrowed student keeps its own level, stars and UE; how many may be borrowed | UNKNOWN |
| No existing web tool places EX and buff timings on a raid timeline with cost and cooldowns | Searched; none found |

## Not modelled yet
- Flat cost-recovery buffs (Hoshino (Swimsuit) +684, Hifumi +1861 for 5 s, ...), cost refunds on skill use, boss debuffs on cost recovery.
- Percent and flat EX cost reductions beyond typing a number into the Spend box.
- Hit-count and crit-count basics (Mika, Kokona, Seia).
