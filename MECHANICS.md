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
| EX cost changes: % reductions (Ui, Seia, Fuuka (New Year)) up to 50% rounded down; flat reductions (Kokona stamps, Kikyo, Shiroko (Swimsuit) -1, Umika -3, ...); Rio's copy = original cost - 1, min 0 | WIKI | Game8, Blue Rec |
| How cost modifiers stack and in what order | UNKNOWN (one source suggests they work from the base cost) | |
| Kokona: after 5 stamps, every ally's next EX (not hers) costs 1 less, stamps reset | WIKI | |
| Starting cost at battle start | UNKNOWN. In the player's mock battles cost was 0 and regen began about 1.6 s after the clock started | TEST |
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
