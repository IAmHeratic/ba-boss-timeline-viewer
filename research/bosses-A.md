# Raid boss behaviour research A: Binah, Chesed, Shiro & Kuro, Hieronymus

Labels: DATA = SchaleDB raids.json / enemies.json (read locally), WIKI = named page or guide, TEST = measured by a player (method stated), UNKNOWN = not found.
Important limit: raids.json/enemies.json contain NO per-skill timing (no cast time, interval, first-use delay, cooldown). Skills carry only Scale, Radius, ATGCost (0 or 3) and descriptions. Every timing below therefore comes from WIKI/TEST, never DATA. Several sites refused automated fetch (Fandom 402, bluearchive.gg 403, namu.wiki 403, breezewiki Anubis block, nichegamer 403), so Fandom guide text and bluearchive.gg overviews were NOT read directly; the one bluearchive.gg claim below is from a search-engine snippet only.

## Verdicts

- Binah: Partly deterministic. Insane order is fixed per a Jan-2023 TEST post (older version); ATG interval figures conflict between sources; no seconds for normal skills on current version. Gaps: current (post-rework) sequence/timings, Torment/Lunatic order, first-skill time.
- Chesed: Unknown (boss itself has no attacks). Summon waves fixed layout per old guide (Normal/Hard), ATG fills while adds live; no spawn/ATG-rate numbers. Gap: everything numeric.
- Shiro & Kuro: Partly. Kuro's pattern order is fixed (9 patterns, loop) per gamerch; Shiro's bombs random at Insane and below, fixed layout at Torment. Gap: Kuro pattern contents (image-only), Shiro order, all seconds.
- Hieronymus: Partly. Desert Penance every 10 s (DATA), ultimate about 110 s into phase 2 (WIKI, hedged). Skill order/intervals UNKNOWN; curse target random-vs-fixed UNKNOWN (Lunatic says "nearest ally"). Gap: normal-skill schedule.

## DATA: battle duration and phase thresholds (all four bosses)

BattleDuration: Binah 180 s on every difficulty; Chesed 240 s; Shiro&Kuro 240 s; Hieronymus 240 s (DATA, raids.json). Note: Chesed max difficulty in data is Torment (7 entries); Shiro&Kuro Torment; Binah and Hieronymus up to Lunatic (8).

| Boss | Diff | Boss HP | Groggy gauge | Groggy time | PhaseChange (HPUnder) |
|---|---|---|---|---|---|
| Binah | Normal | 300,000 | 150,000 | 10 s | P1 at 180,000 (60%), P2 at 75,000 (25%) |
| Binah | Insane | 7,700,000 | 2,310,000 | 10 s | 4,620,000 (60%), 1,925,000 (25%) |
| Binah | Torment | 23,000,000 | 6,500,000 | 10 s | 13,800,000 (60%), 5,750,000 (25%) |
| Binah | Lunatic | 50,000,000 | 10,000,000 | 10 s | 30,000,000 (60%), 12,500,000 (25%) |
| Chesed | all | 80k (Normal) .. 21M (Torment) | 1,000,000,000 (never filled by damage) | 20 s | none |
| Shiro | Insane / Torment | 10M / 35M | 18M / 22M | 10 s | none (separate Kuro enemy entry) |
| Kuro | Insane / Torment | 10M / 45M | 17M / 22M | 10 s | none |
| Hieronymus | Normal..Extreme | 400k .. 6M | 99,999,999 (effectively unfillable) | 5 s | P1 at 50% |
| Hieronymus | Insane / Torment | 24M / 42M | 5M / 9M | 5 s | P1 at 50% |
| Hieronymus | Lunatic | 280M | 2,000,000,000 | 5 s | P1 at 180M (64.3%) |

(Other difficulties follow the same percentages; Binah 60%/25% on all 8, Hieronymus 50% on Normal-Torment.) The data thresholds (60%/25%) supersede the Jan-2023 TEST post thresholds (Extreme 3.5M/1M, Insane 4M/1.5M) which are HP values from an older version; the bluearchive.wiki Binah page says "~60%" and "~20%", the 25% in DATA is the authoritative figure.

---

## 1. Binah (Decagrammaton: Binah), 180 s limit

### Skills (DATA raids.json, descriptions are the JP-updated effects)
| Skill | Effect | ATGCost | Notes |
|---|---|---|---|
| Atsilut's Light (EX01) | 120% to allies in a straight line (OBB width 300, height 1800 in enemies.json). Torment: 160% + fire 50%/3 s for 15 s. Lunatic: 200% + fire 130%/3 s for 120 s. | 0 | Never crits, cannot be evaded |
| Fires of Severity (EX02) | JP: 75% to all allies + 375/150/150/75% to the 4 closest Strikers (Insane+: 150% and 750/300/300/150%). Global/CN old: 200% (Insane 400%) to 4 allies | 0 | Gets a cooldown from 2nd run onward per bluearchive.wiki (length not given) |
| Purifying Storm (EX03) | 300% to all allies, DEF -50% for 30 s | 3 (ATG skill) | Counter: groggy interrupt (WIKI) |
| Heavy Sandstorm (passive) | JP: 50% reduced damage to covered targets, cannot block while covered. Torment+ : immune to attack-speed down. Lunatic also +50% EnhancePierceRate | | |
| Hidden One's Vision (Lunatic passive) | On groggy: removes Atsilut fires, Strikers CostRegen +600 for 10 s | | |

Which skills each difficulty uses (DATA): Normal-Extreme Ex01/02/03; Insane Insane variants; Torment BinahTormentExSkill01; Lunatic BinahLunaticExSkill01. enemies.json also lists BinahNormalSkill01 (normal attack).

### Order
- Insane, fixed (TEST/WIKI-community): "3 normal attacks -> Atsilut's Light -> 3 normal -> Atsilut's Light -> 1 normal -> Fires of Severity" then repeats. Source: DC Inside post 2023-01-14 (last edit 2023-01-18), https://gall.dcinside.com/m/projectmx/4701014 . Applies throughout, no separate per-phase pattern given. Version is the pre-rework game (old Heavy Sandstorm, HP thresholds 4M/1.5M), so treat as likely-but-unverified for the current client.
- Extreme and below: random choice among Atsilut's Light / Fires of Severity / normal attack after the first 3 normals (same post). After groggy or after a boss EX skill, exactly one normal attack must follow (same post).
- A 2022-10-27 TEST/tactics post (https://gall.dcinside.com/m/projectmx/3769952, no difficulty stated) gives phase 2 laser at remaining-time 2:45 and 2:19 (26 s apart), "missile" at 2:00, 1:26, 0:58 (the missiles get skipped by Binah's relocation, groggy and phase change respectively). It also says Airi attack-speed down delays the fixed pattern (laser cast 2:05, ends 1:52). This is a player log of a specific run, not a rule. It implies skills are on a wall-clock/attack-speed-scaled schedule, but note Torment+ immune to attack-speed down in DATA.
- bluearchive.gg Insane overview, from a search snippet only (page not readable): "Laser, Laser, Missile" in phase 1; "Laser, Laser, Missile, Laser, Laser, Sandstorm" in phase 2; "Laser, Laser/Sandstorm..." in phase 3; holds only if no interruption. https://bluearchive.gg/binah-insane-overview/ . Status: WIKI (secondary/unverified). Conflicts with the DC post sequence (laser/laser/missile vs 3 normals/laser...); the two may describe different versions or different naming (the sequences share a 'two lasers then big attack' shape if the DC 3-normal gaps are not counted, but this is not confirmed).

### Timing
- Time of first skill after battle start: UNKNOWN (current version). Interval between skills: UNKNOWN except the single 26 s laser gap in one 2022 run (TEST, one video-derived log).
- Cast/telegraph length: UNKNOWN. The 2022 post implies about 13 s from laser cast start to end under Airi slow (2:05 to 1:52), not a base value.
- ATG (Purifying Storm): Phase 1 does not charge; phase 2 fires every 90 s; phase 3 every 30 s; ATG not reset by groggy, carries to the next party (DC post 4701014, TEST/old). bluearchive.wiki: used only when ATG full in phase 3; Torment/Lunatic charge in all 3 phases (trickle in P1, faster in P2, still slower than P3); resets on transition to P3. A search snippet from another wiki page says "fully filled in 75 sec" and resets on re-entry. These disagree (90/30 vs 75); UNKNOWN which is current.
- Phase change: DATA 60% and 25% HPUnder. The transition happens after the current action finishes (DC post). 1->2 involves a burrow/relocation walk that costs a lot of time and Strikers' EX cannot be used during it (game8 https://game8.jp/blue-archive/675585, WIKI), Binah relocates; skipping phases possible by burst (WIKI snippets).
- Groggy: gauge and 10 s duration are DATA; filled by penetration hits (WIKI bluearchive.wiki). Groggy cancels a casting Purifying Storm (WIKI) and Lunatic removes fires (DATA).

### Randomness
Extreme and below random skill choice; Insane fixed sequence (DC post, old). Targets: Fires of Severity hits the four closest Strikers (DATA description), so target depends on player positions. Atsilut's Light aimed at closest ally (game8/gamerch snippet). Crit dependence in the 2022 post is player-side.

Sources: https://bluearchive.wiki/wiki/Decagrammaton:_Binah ; https://bluearchive.wiki/wiki/Decagrammaton:_Binah_(Grand_Assault) ; https://gall.dcinside.com/m/projectmx/4701014 ; https://gall.dcinside.com/m/projectmx/3769952 ; https://game8.jp/blue-archive/675585

---

## 2. Chesed, 240 s limit

### Skills (DATA)
| Skill | Effect | ATGCost |
|---|---|---|
| Call of the Throne (EX01) | Summons automaton soldiers. ATG fills gradually while soldiers alive, resets when all dead. Soldiers fill groggy 25% total per wave. If not killed in 20 s soldiers self-destruct (3000% circle). Insane+ also spawns a Sweeper on defeat | 0 |
| Witness My Supreme Powers (EX02) | At ATG half full: remaining soldiers +50% attack speed and move speed for 60 s | 0 |
| Majesty's Mercy (EX03) | ATG full: 2000% to all allies | 3 |
| Exposed Throne (passive) | Immune to damage-taken increases. Groggy full: core revealed, damage taken +900% for 20 s | |

enemies.json: Chesed boss entry has only the passive (AttackPower 10); groggy gauge 1,000,000,000 means it is driven by wave-clears, not damage. Chesed has no PhaseChange entries in DATA; phases are expressed as wave stages. DATA EnemyList has 6-7 enemy IDs per difficulty (adds/waves) but no spawn times.

### Order and timing
- Wave structure (WIKI bluearchive.wiki/wiki/Chesed): 4 waves must be defeated to reveal the core; phase 1 is advancing through rooms, phase 2 protecting the core; "stagger" progress carries across teams; remaining enemies die when gauge reaches 100%; core open exactly 20 s (matches DATA).
- Old guide (dolicon, Normal/Hard era): "layout and spawn pattern will be the same everytime" for phase 1; phase 2 reinforcements "randomly warp in" among 4 types (foot soldier, drone, turret, mecha). https://dolicon-bluearchive.netlify.app/guide/chesed . Status: WIKI, old, conflicts partly with later guides.
- Spawn times, wave interval, ATG fill rate (time to full), time of Majesty's Mercy: UNKNOWN. A DC post estimates ~21 s for 10 "cost" (a cost-cycle calc) versus the 20 s groggy window; that is a player-cycle estimate, not boss timing.
- Self-destruct timer 20 s is DATA. 4-minute limit is DATA.

### Randomness
Reinforcement type random (old dolicon guide, WIKI, may be pre-rework). Whether current Insane/Torment waves are fixed: UNKNOWN. Whether wave clears advance from player speed (event-driven, not clock-driven): consistent with DATA (ATG fills while soldiers alive; resets when all die) so the boss schedule is event-driven, not fixed seconds.

Sources: https://bluearchive.wiki/wiki/Chesed ; https://dolicon-bluearchive.netlify.app/guide/chesed ; https://nichegamer.com/blue-archive-guide-chesed-february-2023 (not fetched)

---

## 3. Shiro & Kuro, 240 s limit

Structure: Shiro fight first, then Kuro, as two enemies (Shiro id 73021xx, Kuro 73021x1) with separate HP and groggy gauges (DATA). game8 describes "シロ戦(前半)" then "クロ戦(後半)".

### Skills (DATA)
| Skill | Who | Effect | Notes |
|---|---|---|---|
| Dun-Dun-Dun! (ShiroEx01) | Shiro | Places 2-4 bombs (circle) 400-700% scaling with ATG; +20% ATG. Insane: 2 bombs + 1-3 ice bombs 900-1100%, ice bombs slow 80% 40 s. Torment: normal bomb 1800-3000%, ice bomb 1000-1800% (slow 80%, ATK -40%, 40 s), sticky bomb 700% + stun 4 s | bomb number and damage scale with Shiro's ATG (DATA enemies.json groups 0/50/100% ATG) |
| Keep Rollin' (ShiroEx04/07) | Shiro | Rolling bomb 600% (Insane 1500%, Torment 5000%) line; hits obstacle 300% (200% Torment); bounces back onto Shiro if cover survives: fills groggy by a fixed amount (Insane+ 4,000,000) and +50% damage taken for 40 s; +ATG 10% | cover mechanic |
| Charge! (KuroEx01) | Kuro | Rides in a line 400-700% scaling with ATG (Insane 500-850%, Torment 500%); if Kuro is hit fills groggy 4M and +50% damage taken 40 s | |
| Lethargy (KuroEx10, Insane+) | Kuro | 100% to one ally (two at Torment), move speed -80% 40 s | |
| Horror of Slumpia (passive) | both (Insane+) | Allies' healing -80%, not removable | |

No ATG-skill (no full-ATG ultimate): ATG raises damage/bomb count instead (WIKI fandom snippet: "basic attacks and powers are ranked up").

### Order and timing
- Kuro: gamerch https://gamerch.com/bluearchive/832445 states Kuro cycles 9 patterns in fixed order: "1から9の順に使用し、その後はまた1から順に再使用" (INSANE and up); EXTREME and below: 1..9 then loop 7-9. Pattern contents are in images, not text: UNKNOWN. Status: WIKI (Japanese).
- Shiro: bomb placement random each time at Insane and below; Torment places several bombs at once in a fixed layout (gamerch/game8). Rolling bomb starts "after a fixed amount of time" (game8, no number). Order of Shiro's two skills: UNKNOWN.
- game8 also claims "enemy actions are mostly random; at TORMENT enemy actions are fixed" (https://game8.jp/blue-archive/675587). This is partly consistent with gamerch (Kuro fixed everywhere) and may be a simplification.
- ATG gain rules (DATA): +20% per Shiro Dun-Dun-Dun, +10% per Rolling bomb. ATG time-based passive gain: UNKNOWN.
- Skill interval, first-skill time, cast times: UNKNOWN. Groggy: bounce-back (Shiro) or being hit by a ride (Kuro) fills groggy by 4,000,000 on Insane+ (DATA); fully groggy 10 s (DATA). A 2022-era snippet says bounce makes the boss groggy and empties ATG (fandom guide, unverified: not directly read).

### Randomness
Bomb layout random on Insane and below, fixed on Torment (WIKI game8/gamerch). Kuro sequence fixed. Targets of Lethargy: UNKNOWN selection rule.

Sources: https://gamerch.com/bluearchive/832445 ; https://game8.jp/blue-archive/675587 ; https://game8.jp/blue-archive/653325 (listed, not read)

---

## 4. Hieronymus, 240 s limit

### Skills (DATA)
| Skill | Effect | ATGCost |
|---|---|---|
| Damasus' Call (Ex01) | 350% circle (radius 100), up to +50% more on low-HP targets | 0 |
| Vulgate's Sacred Book (Ex02) | Curse on one ally: 20%/s for 10 s, explodes 325% in circle at 10 s; healed to 100% removes it. Insane+: +3000 heal effectiveness on the target. Lunatic: curse on the NEAREST ally, 100% hit, 40%/s, explosion 3250% | 0 |
| Reaper's Execution (Ex03) | 90% circle | 0 |
| Desert Penance (Ex04) | Every 10 s deals 40% (Insane+ 30%) to all allies; ATG full: 1000% of max HP (Insane+: all allies Immortal 10 s first, +2000 heal effectiveness) | 3 |
| Holy Light (relic passive) | Green relic healed to 100%: Hieronymus damage taken +55%, stacks to 5 (Lunatic, heal-effect -80% on the relic 20 s). Red relic (Normal-Extreme): interrupts current skill, fills groggy, +2500 CostRegen to 4 students 1 s. Insane: relic takes 250% max HP damage after activation, no red relic. Lunatic red relic: appears after 9,000,000 accumulated damage, heals give 5 charges of cost regen and groggy 5 s if ATG skill in use | |
| Ominous Light (violet relic, Insane+) | Violet relic HP 0: Strikers/Specials ATK +25% (Torment+ also damage), heal -7000, Hieronymus DEF -1500 | |
| Ascetic Awakening (Torment+) | Penetration +750; Lunatic also explosion +200% and attacks ignore cover | |

Boss move speed is 0 (DATA enemies.json), so it does not move. Groggy gauge 99,999,999 on Normal-Extreme: groggy only via the red relic (WIKI bluearchive.wiki).

### Order and timing
- Skill order, normal-skill intervals, first-skill time: UNKNOWN. No source found stating the rotation of Damasus' Call / Vulgate / Reaper's Execution.
- Desert Penance chip: every 10 s (DATA). ATG: does not build in phase 1; starts in phase 2 at a fixed rate and continues during groggy; the ultimate (11th Desert Penance) at about 110 s into phase 2, hedged "about" with a "(?)" note on the interrupt duration (bluearchive.wiki Hieronymus, WIKI, https://bluearchive.wiki/wiki/Hieronymus). The 11th-penance wording is consistent with the 10 s DATA interval (ultimate lands with the 11th tick) but 110 s is not in DATA. Insane+: no red relic so the ultimate cannot be interrupted; healing at the right moment prevents lethal damage via Immortal window (game8 snippet).
- Vulgate cast frequency: one search snippet claims "about once per minute" (約1分ごと) for Ulgata; another source gives no interval. Single weak source: UNKNOWN. Curse duration 10 s is DATA and game8.
- Phase 1 at 50% HP (DATA), phase 2 begins; Normal-Extreme phase 1 has only the green relic, phase 2 adds red relic (bluearchive.wiki). Insane+ green and violet both from the start.
- Groggy time 5 s (DATA). Lunatic red relic groggy 5 s (DATA).

### Randomness
Curse target: random vs fixed UNKNOWN for Insane/Torment (Lunatic DATA says nearest ally). bluearchive.wiki "does not describe any randomness". Player action dependence: relic healing timing changes boss damage taken and (Normal-Extreme red relic) interrupts skills and gives groggy, so the boss schedule is partly player-driven; the ATG lethal timing is fixed by phase-2 clock.

Sources: https://bluearchive.wiki/wiki/Hieronymus ; https://game8.jp/blue-archive/675588 ; https://game8.jp/blue-archive/670825 ; https://game8.jp/blue-archive/803737 and 803738 (no mechanics text)

---

## What I could not obtain (recommended next steps)
- Fandom `/Guide` pages (402) and bluearchive.gg overviews (403) were not readable by automation. They likely hold the per-phase skill sequences. The user can open them in a browser; a screenshot/paste would settle Binah's phase sequences.
- Per-skill cast times, first-cast delay and per-skill cooldown: absent from SchaleDB. A real timing source would be frame-level video measurement (TEST) or a datamine (Unity/MX table dumps), none found.
- gamerch 832445's Kuro 9-pattern table is images only.
