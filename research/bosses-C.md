# Raid boss behaviour research, batch C: Gregorius, Hovercraft (Wakamo), Kurokage, Geburah

Labels: DATA = from local SchaleDB dumps (raids.json / enemies.json); WIKI = named page; TEST = player measurement; UNKNOWN = not found.
Researched 2026-11-20. No source found for any boss gives frame/second-level boss AI data (no datamine repo located). Fandom guide pages and the namu.wiki page refused automated fetch (HTTP 402 / 403) and the BreezeWiki mirror is bot-blocked, so Fandom content is only seen through search-engine snippets (flagged below).

## Verdicts

| Boss | Verdict | Main gaps |
|---|---|---|
| Gregorius | **Deterministic** (order fixed, no randomness; seconds only from one wiki table, read off countdown by eye) | Table is not per-difficulty; no groggy/disruption effect on schedule measured except "groggy shifts organ timing"; first-skill and cast lengths UNKNOWN |
| Hovercraft | **Partly**: weapon order fixed, but timing is ATG-gauge-driven and is reset by CC/groggy | Per-skill ATG seconds UNKNOWN (one unverified snippet: 6.5 s / 10 s); Hovercraft phase order UNKNOWN |
| Kurokage | **Partly**: P1 order fixed (Quake > Breath > Summons), Eye target random, Black Hole ATG-driven | No seconds anywhere; P2/P3 loop only as a list; groggy-time/ATG interplay UNKNOWN |
| Geburah | **Partly**: loop order known; gimmick timers exact, boss skill times only approximate | Per-skill times, Glacier trigger, P2 order UNKNOWN; one rough timeline from Causew |

Common to all four: in-battle time limit is 240 s on every difficulty (DATA, BattleDuration = 240 for all 8 difficulties; the SchaleDB difficulty list is Normal, Hard, VeryHard, Hardcore, Extreme, Insane, Torment, Lunatic). SchaleDB raid skills carry only name/description/ATGCost; they contain NO timing, order, interval or AI data (DATA). Raid skill `ATGCost` values here: Wakamo Ex01-03 = 3, Kurokage Ex05 = 3, everything else 0 (DATA). The Geburah Ex04 text says "when ATG gauge is full" but its ATGCost field is 0, so ATGCost is not a reliable indicator.

---

## 1. Gregorius (EN0005, Indoor)

### Skills (DATA; names/descriptions identical across difficulties unless noted)
| Skill | Effect | Notes |
|---|---|---|
| Saint's Whispers (Ex01 AttackerSide) | 500% guaranteed-crit to all allies, ATK -40% for 120 s, stacking | Lunatic: -70%, cannot be cleansed (DATA) |
| Strict Repentance (Ex01 DefenderSide) | By Gregorius' debuff count: <=4 (Lunatic/Torment <=6): remove 1 debuff from enemies' side; >=5 (7): all allies' ATK -10% for 120 s | Thresholds change by difficulty (DATA) |
| Gregorius Chant (Ex03 Center) | Pipe organ, 4-step cycle: 1st black-facing team +50% damage taken 60 s; 2nd cleanse 1 debuff of white-facing team; 3rd white-facing +50% 60 s; 4th cleanse black-facing; repeat | Lunatic adds +70% EX damage rate for 120 s on the cleansed team on steps 2/4 (DATA) |
| Relief for All (Ex04) | 999999 damage to all allies, removes Immortal | Final phase wipe |
| Servant of the Saints (Passive01) | Debuff-count colour bands change damage taken/ATK | Bands shift by difficulty (DATA) |
| Magnificent Choir (Passive02) | Side choirs sing 40 s after appearing, then ATK +100%; choir knocked down at HP <1%, adds 5% to groggy gauge | DATA |
| Holy (Passive03) | Debuffs copied to choir; choir damage mirrored 100% to Gregorius; ATK -30% for 30 s from battle start; final phase: choir AS +10% per 10 s, allies' cost regen +300 per 10 s | Lunatic adds crit effects (DATA) |
| Organ of Penance (Passive04) | Organ only hit by EX skills; rotates 180 deg at HP <1%, full heal, untargetable 30 s | DATA |

Stats (DATA): groggy gauge = 40% of boss HP on every difficulty; GroggyTime 15 s; no PhaseChange entries in enemies.json (phases are timer-driven, see below). Normal HP 1M ... Lunatic HP 1.25B.

### Order and timing
- Order: fixed, no randomness. WIKI Causew "Blue Archive General Raid Strategy Guide" (Google Doc): wave order "Yellow > Blue > Red > White" repeating, final cycle "Yellow > Blue > Red > Raid End"; "will always be played in the same order on every encounter" (this is the document's wording as summarised by the fetch tool). Mapping: Yellow = Saint's Whispers, Blue = Chant step (damage-taken debuff), Red = Strict Repentance, White = Chant cleanse step (Causew's colours; mapping is my reading, not stated in DATA).
- Phase windows (WIKI Causew, remaining-time based): centre choir 4:00-3:00, left choir 3:00-2:00, right choir 2:00-1:00, final phase 1:00-0:10, team wiped 55 s after final phase starts unless boss dies. Groggy disabled in the final phase (WIKI Causew). Gamerch agrees the second half begins at 1:00 remaining and that the wipe skill comes ~45 s after the transformation.
- Seconds (WIKI Gamerch 834893, updated 2025/04/30; single table, no difficulty label, times are countdown clock values, probably read from video, so treat as +/-1-2 s):

| Clock | Boss skill |
|---|---|
| 3:40 | Saint's Whispers |
| 3:04 | Strict Repentance |
| 2:30 | Saint's Whispers |
| 1:55 | Strict Repentance |
| 1:20 | Saint's Whispers |
| 0:45 | Strict Repentance |
| 0:10 | Relief for All (note on page: timing "varies slightly") |

| Clock | Gregorius Chant (pipe organ) |
|---|---|
| 3:20 | step 1 black +50% damage taken (60 s) |
| 2:45 | step 2 cleanse 1 debuff, white side |
| 2:12 | step 3 white +50% damage taken |
| 1:37 | step 4 cleanse, black side |
| 1:02 | step 1 again, black +50% |

  Gaps between these entries are about 33-36 s (organ and the Whispers/Repentance alternation), 70 s between same-type skills. WIKI (search snippet of Fandom "Gregorius" page, unverified, page blocked): "Gregorian Chant used every 35 sec and other skills every 70 sec" which is consistent with the Gamerch table. WIKI bluearchive.wiki "Gregorius" page: no timings (its 35 s / 50 s figures belong to student skills, not the boss).
- What disrupts: rotating the organ (kill organ with EX; it heals and is untargetable 30 s) changes which team a Chant step hits, not when it fires. Gamerch says groggy "shifts" organ timing (no number, UNKNOWN how). Whether the schedule differs on Torment/Lunatic: UNKNOWN (single table).
- First skill after battle start: Whispers at 3:40, i.e. 20 s after start (WIKI Gamerch). Cast/telegraph lengths: UNKNOWN. Fixed seconds vs event-driven: wiki treats it as clock-driven; no ATG gauge for these skills (ATGCost 0, DATA).
- Initial organ orientation: black side faces allies at start (WIKI game8.jp 675593).
- Randomness: none found. Does not vary with player actions except organ facing and groggy shifting.
- Sources: https://docs.google.com/document/u/0/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic ; https://gamerch.com/bluearchive/834893 ; https://game8.jp/blue-archive/675593 ; https://bluearchive.wiki/wiki/Gregorius ; https://bluearchive.fandom.com/wiki/Gregorius/Guide (not fetched)

---

## 2. Hovercraft (Wakamo Swimsuit, then Wakamo on Hovercraft; Outdoor)

Two consecutive fights. Wakamo (Swimsuit) first; defeating her triggers a stage transition (WIKI game8.jp 661026) to the Hovercraft.

### Skills (DATA)
Wakamo (Swimsuit):
| Skill | Effect |
|---|---|
| Celadon Flower Divination (Ex01) | When ATG full: 5 hits x150% + final 300% on one ally, each hit stuns 5 s, +2 SuddenDeath stacks per EX use (5 stacks = KO). Insane+: bounces to nearest ally (no stun/stack on 2nd) |
| Antsy Buckshot (Ex02) | ATG full: 750% to allies in a straight line |
| Discharged Explosive (Ex03) | ATG full: missile at furthest ally, 750%, blockable |
| Just For You (Passive) | CC immunity; CC fills a gauge; full gauge = full groggy (up to 3 times). CC needed: 6/7/8 s on low difficulties, Lunatic 16/18/20 s. After groggy: all SuddenDeath cleared, boss ATK +25/50/75%, damage taken +100/200/300% |
| Hecklers Begone | EX adds 2 SuddenDeath stacks |

Hovercraft:
| Skill | Effect |
|---|---|
| Twin Cannon/Blaze Rocket (Ex01) | 300% x8 alternating up to 4 allies; 450% x2 alternating up to 2 |
| At This Rate...! (Ex02) | Summons Missile Guidance System, enters Missile Frenzy toward the resort; resort destroyed = battle lost; MGS damage mirrored to hovercraft; destroying MGS = +50% groggy and ends frenzy |
| Makeshift Missiles (Ex03) | Frenzy missiles, 1 damage to resort each hit; not targetable by normal attacks |
| Amphibious Assault | Every 15 hits taken: damage taken +10% for 10 s, stacks to 30 |
| Active Defense System | Auto-shoots missiles; Lunatic version self-damages and stuns itself at HP <1% |

Stats (DATA): Wakamo groggy gauge 999999999 (filled only by the CC mechanic), GroggyTime 4 s on every difficulty; Hovercraft GroggyTime 32 s on every difficulty. No PhaseChange triggers in data (stage change is "defeat Wakamo").

### Order and timing
- Wakamo order: WIKI Causew: "Rifle > Rifle > Rocket Launcher > Shotgun", shotgun sometimes appears before rocket; after a groggy the pattern restarts with two rifles. Mapping in raid terms (my reading): rifle = Celadon Flower Divination, rocket = Discharged Explosive, shotgun = Antsy Buckshot, i.e. Ex01, Ex01, Ex03, Ex02. UNKNOWN whether "sometimes" is random or caused by CC timing. Note: WIKI (Fandom "Abydos Resort Restoration Committee/Union Operation", search snippet only) lists a different sequence 1,1,3,4,1,1,2,4 for the Union-Operation version of Wakamo, so do not reuse it for the raid.
- Timing: WIKI Causew: weapons drawn "every 15 seconds when her ATG is full" (summary wording) and she pulls weapons "at the same point in time every run" if CC is applied consistently. Skills fire when ATG is full (ATGCost 3, DATA; also WIKI Gamerch 834895 and game8). WIKI (Fandom Wakamo (Hovercraft) Guide, search snippet only, page blocked, not verified): "Wakamo's ATG gauge is filled every 6.5 sec" and "Hovercraft's ATG gauge is filled every 10 sec". These two figures conflict loosely with Causew's "15 s" and are UNVERIFIED; do not use without a recording.
- Relocation: she runs to a new position at the 2:00 timer mark (WIKI Causew), mortars during the run deal no damage.
- Disruption: CC fills her gauge and groggy cancels her current action and restarts the pattern from rifle (WIKI Causew). Groggy lasts 4 s for Wakamo and 32 s for Hovercraft (DATA GroggyTime; Wakamo's CC gauge can refill 3 times). Whether the ATG gauge keeps filling during groggy: UNKNOWN. Hovercraft MGS summon time (when Ex02 fires), skill order and ATG rate: UNKNOWN (Causew: Hovercraft "retreats after a brief engagement" and summons MGS; no seconds).
- Randomness: no randomness reported for order or timing (Causew), but target selection is not specified (Ex01 hits "one ally"; Ex03 targets the furthest ally = deterministic by positions; Ex01 Hovercraft alternates among up to 4 allies, which ones UNKNOWN).
- Sources: https://docs.google.com/document/u/0/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic ; https://gamerch.com/bluearchive/834895 ; https://game8.jp/blue-archive/661026 ; https://bluearchive.fandom.com/wiki/Wakamo_(Hovercraft)/Guide (not fetched; snippet only)

---

## 3. Kurokage (EN0006, Street)

### Skills (DATA)
| Skill | Effect |
|---|---|
| Myouki's Aftershock (Ex01) ("Quake") | 200% in a circle |
| Myouki's Wail (Ex02) ("Breath") | 250% in multiple circles, no double hit |
| Shriek of Summoning (Ex03) | Summons a clone that rushes the nearest ally and explodes (200%; Insane+ 400% and +500 Compulsion) |
| Myouki's Procession (Ex04) ("Rush") | 300% line, knockback |
| Whispered Legends (Ex05) ("Black Hole") | ATGCost 3: pull then push, 250% + 250%; DoT on Compulsion-afflicted allies (-300 Compulsion/s, up to 20 s) |
| Passives | Ignores shields (Insane+: student KO fills Kurokage's ATG to max); Pieces of Myouki (damage mirrored, hit with EX to fill groggy; no groggy until he moves into his territory; groggy splits into 4 extra pieces and gives allies max crit rate); Compulsion (Eye puddle +350 Normal / +1500 Insane, up to 1500 scaled by closeness on Lunatic; territory +150 per 6 s, +500 Insane+); Overwhelming Compulsion (Confusion at >=50% max HP reduced) |

Stats (DATA): GroggyTime 20 s all difficulties; groggy gauge = 20% of max HP; PhaseChange: Phase 1 at HP < 75%, Phase 2 at HP < 10% (all difficulties; e.g. Torment 70M HP: 52.5M and 7M, Lunatic 159.6M: 119.7M and 15.96M). Boss skill list is named "1Phase" variants; enemies.json lists no separate P2/P3 skill sets.

### Order and timing
- Order: WIKI Causew: P1 (and P3) fixed "Quake > Breath > Summons" ("will always do in order every time"); from the 75% transition onward the loop is "Quake > Breath > Summons > Rush > Black hole", Black Hole used "when ATG is full". Gamerch (834891) gives no order. Exactly how the loop restarts after transitions or groggy: UNKNOWN.
- Seconds: UNKNOWN for first skill, interval, cast. Only timer facts: Compulsion tick in territory every 6 s (DATA/WIKI), Black Hole DoT 1 s ticks up to 20 s (DATA).
- Phase mechanics (WIKI Causew, game8.jp 672125): at 75% further damage is nullified until the phase changes; P2 is Kurokage's domain, groggy possible only in P2 (needs purple/Mystic damage to 20% of max HP per fill; "aim for double groggy"); P3 (10%) begins with about 15 s of groggy per Causew (DATA says GroggyTime 20 s, mismatch unresolved, UNKNOWN which is right). Cancelling the transition with a same-frame groggy window of about 5 frames (WIKI Causew, "TEST-like" claim, unverified).
- Randomness: Eye puddle target "purely random" (WIKI Causew), attack order fixed. Insane+: student death fills ATG to max, so the schedule depends on player deaths (DATA).
- Sources: https://docs.google.com/document/u/0/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic ; https://game8.jp/blue-archive/672125 ; https://gamerch.com/bluearchive/834891 ; https://bluearchive.fandom.com/wiki/Myouki_Kurokage/Guide (not fetched; snippet confirms the 75%/10% thresholds and Quake > Breath > Summons)

---

## 4. Geburah (EN0010, Outdoor)

### Skills (DATA)
| Skill | Effect |
|---|---|
| Subdued Understanding (Ex01) | 220% to all allies |
| Water Amidst Fire, Fire Amidst Water (Ex02) | 100% to all, then three seawater blasts 25%, 50%, 140%; afterwards creates an Ice Pillar |
| Recklessness (Ex03) | Torpedoes at the heater (125% to it), then 250% to all allies except heater |
| Moderator of Divine Will (Ex04) | "When ATG full": iceberg crash 320% to all; groggy gauge does not rise while casting (Glacier skill; per wiki used from Phase 2) |
| Passives | Source of Intelligence (Special +80% damage, Strikers/summons -75%; Insane+: hypothermia gauge +1 per 5 s while not moving, 10 units = Frozen, +80% damage taken, healing capped to 1); Heater Operation (radiator output heals every 6 s: 30-70% = 1200/6000/10000 by difficulty, >70% = 2200/9000/16000 + damage taken -25%); Heater Overload (output 100%: cost regen +500, ATK +30%, crit damage +60%); Pillars of Severity (Ice Pillar: Immortal 2.5 s, shield 400% max HP up to 20 s, self-damage 70% max HP at 20 s, while alive allies DEF -45%, heal cap 1, 30% ATK damage every 4 s; destroyed = heater heal +100%/allies heal power +200% for 20 s; destroyed immediately at Phase 2) |

Stats (DATA): GroggyTime 11.3 s on every difficulty; groggy gauge = 60% of max HP; Phase 1 trigger at HP < 60% (e.g. Torment 134M: 80.4M; Lunatic 175M: 105M). Insane/Torment/Lunatic differ only in heal numbers and the hypothermia passive (Ex01-Ex04 identical across all 8 difficulties).

### Order and timing
- Loop order, WIKI Causew: "radiator, then the Laser, then the Iceberg, then breaking the Iceberg" (player-side and boss steps interleaved; the Laser is presumed to be Ex03/torpedo or Ex01, not identified); Phase 2 adds the Glacier Crash when ATG is full. Skill-to-name mapping and exact repeating Ex sequence: UNKNOWN.
- Rough timeline (WIKI Causew, countdown clock): spend cost on damage before the iceberg at about 3:30, iceberg destructible at "about 3:06" (that is Pillar 2.5 s immortal plus 20 s shield mapped onto a clock read, not a measured skill time), Glacier "every ~50 seconds" in the timeline (approximate). Fixed boss-skill seconds: UNKNOWN.
- Exact timers (WIKI + DATA agree): radiator heal every 6 s, pillar tick every 4 s, pillar shield 20 s, hypothermia +1 per 5 s (full at 10 = 50 s; game8 advises moving every 40-45 s).
- Disruption: Pillar destroyed immediately at 60% HP; groggy can cancel the Glacier only in the few frames before its animation starts (WIKI Causew); groggy gauge frozen while Glacier is cast (DATA). Gamerch says Phase 2 does not change the attack pattern (WIKI), contradicting Causew's "adds Glacier" only partly; UNKNOWN which holds for each difficulty.
- Randomness: none stated by any source.
- Sources: https://docs.google.com/document/u/0/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic ; https://gamerch.com/bluearchive/900216 ; https://gamerch.com/bluearchive/900225 ; https://game8.jp/blue-archive/665197 ; https://gamerblurb.com/articles/blue-archive-geburah-raid-guide-insane-and-up ; https://bluearchive.wiki/wiki/Geburah

---

## What to do with this
- Only Gregorius has a usable second-level schedule (Gamerch table), and it is eyeballed from a countdown clock; best treated as approximate until someone records one run and reads exact frame times.
- For Hovercraft, Kurokage and Geburah the honest representation is order plus gauge-driven (ATG) triggers with UNKNOWN seconds, not a fixed timeline.
- Not reached: namu.wiki, Fandom guides, bluearchive.gg, YouTube/Discord timestamp notes, Korean DC/Inven posts (search results only, images/video). These are the most likely places for real timing measurements.
