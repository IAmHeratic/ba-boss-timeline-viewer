# Raid boss determinism research D: Yesod, Drumbarka, Nightmare (+ World/Final-style raids)

Labels: DATA = SchaleDB json (raids.json / enemies.json, local), WIKI = named guide page, TEST = player measurement, UNKNOWN = not found.
Research date 2026-11-20. Important meta-finding: **no source I could reach gives per-skill timing (first-cast time, interval, cast length) for any of the three bosses.** SchaleDB's json holds skill text, damage scale, HP thresholds, groggy gauge/time and battle duration only. The skill rows have ATGCost (0 or 3) but no cooldown/cast fields. Nothing below is estimated.

Source access: Fandom guides (Yesod/Drumbarka/Nightmare /Guide) returned HTTP 402; namu.wiki 403; web.archive.org blocked; schaledb.com is a JS shell (empty to fetch). game8.jp and appmedia.jp (Yesod, Drumbarka) were readable. The community "General Raid Strategy Guide" Google Doc (Causew) was readable but its Yesod/Drumbarka sections only link to separate tabs (not fetched), and it has no Nightmare section in the part I read (about 111k chars; last ~11k chars of the doc not seen). No Nightmare guide page found on game8/appmedia/Fandom via search.

---

## Yesod (EN0013, Street, ElasticArmor, 8 difficulties, battle time 270 s every difficulty [DATA])

**Verdict: PARTLY deterministic.** The EX skill order in phase 1 is reported fixed; lantern marks are random (Insane+); no timing anywhere (UNKNOWN).

### Skills (DATA raids.json unless noted; numbers are Normal-Extreme / Insane+)
| Skill | Effect |
|---|---|
| Purification by Force (Red) EN0013Ex01 | Red light, right hand slam, 1500% / 3000% to all allies. If the ground is lit blue the skill is "blocked" and allies instead get DoT 15% / 30% every 2 s for 20 s and +100% CostRegen until Yesod's next EX (DATA text; the exact branch semantics of "blocked" vs. damage are as written in SchaleDB, not independently verified). DATA hit frames: 10 hits at frames 60..600 (60-frame spacing, i.e. the 20 s DoT at 30 fps; this is DoT tick timing, not cast timing). |
| Purification by Force (Blue) EN0013Ex02 | Same with blue light / left hand; blocked if ground lit red. |
| Rebuilt Foundation EN0013Ex03 | Debris from chest, 1500% / 3000% to all; blocked if ground NOT illuminated (any colour blocks). |
| Unshakable Bedrock (passive) | Each EX summons 3 blue + 3 red lanterns. Lantern kill = 0.1% max HP to Yesod. JP version: 2+ lanterns destroyed within 2 s stuns Strikers 10 s and halves CostRegen 50 s (Global/CN older version: stun + electric shock DoT). |
| Azure/Sunset lanterns (passives) | Kill raises Analysis Level by 1, 30% AoE damage, halves next EX cost of the killer, lights the area (blue, red, or clears it: opposite colours cancel through "no area"). |
| Revelation (passive) | Analysis Level 1-5, buffs only at 5 or when Yesod's skill is blocked; reset when EX unblocked or next EX used. Buff per level: ATK +20%/+40% (Torment+), EX dmg +25%/+50%, crit dmg +25%/+50%, crit rate +20%. |
| Mark of Prophecy / Mark of Eschaton (Insane+) | One lantern randomly gets a mark: Prophecy = +1 level then no more gains; Eschaton = resets level to 1. |
| Right Hand (phase 2) | Judgment of the Great Will: when Right Hand blocks the path and ATG is full, left hand slams, 200% to all. Pillars of Power (left side, immortal, heal every 4 s, at >99% HP deal 100% and -400 CostRegen for 10 s; CC gauge fills, damage taken after 3 s CC (5 s Insane+)). Pillars of Foundation (right side, destroying one adds +1000% DamagedRatio to Right Hand, up to 2x). Support drones (ATK/dmg buffs). |

### Phases
- Phase 1 = Yesod body (EnemyList slot 101: lanterns 102/103). Phase 2 = Right Hand (First, then Second: enemies 104 and 105, 35000 HP each at lv1, pillars 106/107, drones 108) [DATA]. No PhaseChange HP trigger in enemies.json for Yesod (UNKNOWN how/when phase 2 starts; appmedia says at Extreme phase 2 begins after the left/right hand attacks finish, no HP threshold given) [WIKI appmedia].
- Right Hand must be defeated twice (appears twice) [WIKI appmedia]. ATG gauge fills only in phase 2 [WIKI appmedia]. Yesod body and Right Hand have a GroggyGauge in data but GroggyTime 0; appmedia says Yesod and Right Hand do not gain groggy gauge and take 99% less damage (Fandom snippet: both phases 99% damage reduction, bypassed by accumulation-type damage). So **no groggy windows**.

### Order / timing
- EX order fixed: Red -> Blue -> Rebuilt Foundation [WIKI, Fandom Yesod/Guide, as quoted in search-result summary; I could not open the page itself]. Whether it loops A-B-C-A-B-C is not stated explicitly (UNKNOWN; "fixed order" only).
- Time of first EX, interval, cast length, ATG rules for phase 1: UNKNOWN. game8 and appmedia state no seconds for Yesod's own attacks. Stated durations are only effects: DoT 20 s, same-colour area extra DoT 10 s, lantern-mark window 2 s, stun 10 s, pillar heal 4 s.
- Whether the cadence is fixed seconds or driven by player action (e.g. EX is triggered once lanterns are broken?) : UNKNOWN. Note the area colour and Analysis Level depend on player lantern kills, so the *outcome* of each EX (blocked or not) is player-driven, even if the order is fixed.

### Randomness
- Which lantern gets which mark, from Insane up (both random) [WIKI appmedia, DATA passive text "randomly"].
- game8 says nothing on randomness in skill order.

### Sources
- https://bluearchive.fandom.com/wiki/Yesod/Guide (402, content only via search summary)
- https://game8.jp/blue-archive/733809
- https://appmedia.jp/?p=79433603 (first 100k of 129k chars read)
- local raids.json / enemies.json

---

## Drumbarka / ドラム缶ガニ (EN0022, Street, Unarmed + LightArmor parts, 8 difficulties, battle time 270 s [DATA])

**Verdict: PARTLY.** Two phases with a data-confirmed HP threshold; phase 1 skill list and phase 2 skill list known, but order and timing UNKNOWN; Counter Claw is gauge (ATG) triggered per WIKI.

### Phase change [DATA]
HPUnder trigger, fraction of boss total HP: Normal/Hard/VeryHard/HardCore/Extreme = 50% (Argument 200000/400000 etc.), Insane = 45%, Torment = about 45.8% (110M of 240M), Lunatic = about 41.7% (200M of 480M). appmedia says 50% on Extreme and below, slightly larger phase 1 on Insane+ (consistent). Debuffs on the boss are cleared at phase change [DATA]. GroggyGauge 55,000,000 and GroggyTime 20000 (20 s) on the main enemy [DATA]. Note: groggy is mainly triggered by the Cargo Crane (see below).

### Skills
| Phase | Skill | Effect [DATA] |
|---|---|---|
| 1 | Right Jab / Left Jab (Ex01/02) | 500% to a straight line + knockback. If it hits a control panel, all allies stunned 20 s. Claw part becomes a targetable weak point (EX only) while the jab is used. Avoid by removing the debuff on the opposite control panel [WIKI appmedia]. |
| 1 | Spray Bile (Ex03) | 100% fan (Insane+: +500% extra vs Heavy Armor). Applies the sticky debuff to control panels for 20 s. Removing the debuff from a panel moves the crane in that panel's direction. |
| 1 | Fishy Foam (Ex04) | Bubbles at nearest ally: 600% (Normal-Extreme), 6000% (Insane+). |
| 1 | Divided Exoskeleton (passive) | Parts: belly, claws, hull; destroying claws+hull gives +50% (Insane+: +300%) damage taken to all parts for the battle. |
| 2 | Spray Toxic Bile (Ex01) | 70% fan; adds a debuff stack to the rusted oil drum for 60 s (max stacks 1 normal, 3 Insane, 5 Torment+). |
| 2 | Claw Sweep (Ex02) | 100% fan shockwave; steel claws targetable by EX while used. |
| 2 | Fire Main Armament (Ex03) | 85% to all allies. |
| 2 | Counter Claw (Ex04) | Defensive stance, steel claws block attacks; accumulates 6x damage taken (cap 90,000 Normal; 160k Hard; 300k VeryHard; 500k HardCore; 900k Extreme; 3M Insane; 6M Torment; 10M Lunatic). After a fixed duration allies get Immortal 10 s, then take 10% of accumulated damage (DATA text, all difficulties). If boss goes Groggy first, it takes 100% of the accumulated damage instead. Afterwards stored damage resets and cap grows by 2x. Conflict: appmedia states 10% on Extreme, 100% on Insane+; SchaleDB text says 10% everywhere. UNRESOLVED. |
| 2 | Decaying Drum Barrel (passive on drum) | Every 10 s adds 1 debuff stack to the drum (60 s each). Every 4 s deals 20% to all allies; more with stacks (40% at 1 stack on Normal; Insane +20%/stack max 80%; Torment max 120%). When a stack is removed: allies get +25% ATK, +75% attack speed for 35 s, and boss parts take +5% damage per removed stack. |
| 2 | Express Delivery / Cargo Crane (passive) | Belly damage charges the crane. When full, it triggers Groggy and gives allies +100% CostRegen until the boss recovers; the energy needed doubles after each use. Crane on the boss causes groggy (also can interrupt Counter Claw) [DATA, WIKI game8/appmedia]. |

### Order / timing
- Skill order per phase: UNKNOWN (no source lists a rotation; game8/appmedia explicitly give none).
- Drum barrel tick intervals are the only hard periodic numbers: 10 s stack, 4 s damage [DATA].
- Counter Claw start condition: ATG gauge full [WIKI appmedia, game8 p.786114 summary as relayed]; gauge fill rate and delay length: UNKNOWN. Groggy time 20 s on the main enemy [DATA] (appmedia: not stated on page).
- Timing of first skill, jab cast time, interval: UNKNOWN. Whether it is HP- or event-driven: partly event-driven (crane, panels, phase change at HP).
- The user's reported time limit 4:30 = 270 s matches DATA BattleDuration.

### Randomness
Not documented in any reachable source (UNKNOWN). Jab side (left or right) and sequence are not stated as random or fixed.

### Sources
- https://appmedia.jp/?p=80033854
- https://game8.jp/blue-archive/786114 (page content relayed by summariser; Drumbarka-specific action pattern absent)
- local raids.json / enemies.json
- Google doc general guide (Drumbarka section links to a separate tab; text: "Each individual mechanic in Drumbarka is simple, however lining them up and satisfying every requirement simultaneously challenges your ability to manage your cost"): https://docs.google.com/document/u/0/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic

---

## Nightmare / Nightmare Train (EN0023, Indoor + Street, only difficulties 0-7 on JP: IsReleased [true,false,false] meaning JP only, battle time 240 s [DATA])

**Verdict: UNKNOWN (insufficient).** Skill text is in DATA but no order or timing source found; no Fandom/game8/appmedia page reachable. Mostly event/gauge-driven by description (groggy via lever damage, groggy via damage to the opposite lane).

### Structure [DATA]
Phase 1 (indoors) = enemy slot 101-108 (Nightmare Core, Brake Lever, plushie bomb, bento drone, Monkey Drivers A1/A2, Monkey Conductors B1/B2); Phase 2 (street) = slot 601+ (slots 6xx swap list). Core: GroggyGauge 2,000,000,000 and GroggyTime 15 s; no PhaseChange HP trigger (so phase change cause UNKNOWN; Patch comparison doc says "Phase 1 indoors, phase 2 urban").

### Skills
| Skill | Effect [DATA] |
|---|---|
| Unending Dream (Core passive) | Every 5 s, 50% to all allies. CostRegen -3000 for allies below 50% HP. Attacks cannot be evaded but are reduced by hit rate. Insane+: ignores shields, +300% explosion. Lunatic: ATK up, damage reduced by terrain rank. |
| Memory Depredation (Core Ex01) | 50% to all allies. |
| Plushie Bomb (Core Ex02, ATG 3) | Summons 5 plushie bombs; each explodes after a set duration for 300% (Insane/Torment 1000%, Lunatic 2000%), permanent -80% ATK (not removable). Bombs only attackable by EX (destroyed after 10 hits Insane, 20 Torment/Lunatic). |
| Handling Nuisance Passengers (Monkey Ex01) | 800% to one ally, -25% dodge (3 stacks); max stacks = -3 EX cost. Lunatic: hit twice = marked. |
| Boarding Refused (Monkey Ex02, ATG 3) | Absorbs souls of allies in the same lane, stuns 14 s, then after a set duration deals 400% + 100%/s for 3 s + stun 20 s. Interrupted (monkey groggy, then +80% damage taken 16 s) if allies in the opposite lane deal 1,000 (Normal) / 15,000 (Insane) / 30,000 (Lunatic) total damage. |
| Dead Man's Switch (Lever) | Train speeds up; at max speed Core is invulnerable, ATK +50%. Lever is attackable only then; damage forwarded to Core. Every N damage (10k Normal ... 240k Extreme, 500k Insane, 1M Torment, 1.5M Lunatic) is one activation; after 3 activations Core is Groggy and allies get +125% CostRegen 16 s. |
| Station Bento Express | EX-only drones; kill heals allies; respawn 30 s after destroy; Insane+ need 3 hits. Allies cannot heal each other aboard. |
| Between Nightmares (Insane+) | Purification Gauge per 150k/300k/500k dealer damage; at 10 gauges raises explosion rate for nearby allies. |

### Timing/order/randomness
- Order, first-cast time, intervals, cast/bomb fuse length: UNKNOWN.
- Fixed numbers from DATA only: 5 s core tick, 30 s bento respawn, 14 s / 20 s stun, 16 s groggy-regen, 15 s core GroggyTime.
- Randomness: UNKNOWN (no sources).
- Battle time 240 s [DATA].

### Sources
- local raids.json / enemies.json
- https://docs.google.com/document/d/e/2PACX-1vSL8xgtLxBr1kxc60cgra6PY4mWZVqw_BIRtakUlJ-dq0PfYkSuHarHEGgQPBe4m8qzunUSb6pL1B0Z/pub (patch compare doc: "Nightmare Train TA" 11/11 JP week 2, "Phase 1 indoors, phase 2 urban")

---

## Other raid-style bosses in raids.json (brief) [DATA lists]

Timing sources found: none reachable for any of these (searches returned only general Total Assault pages). General community-guide examples of fixed sequences exist for other bosses but not these (WIKI Google doc: Wakamo weapon order fixed and a weapon pull "every 15 seconds when her ATG is full", Kurokage fixed Quake > Breath > Summons, Gregorius Yellow > Blue > Red > White, Geburah icebergs fixed, Goz train spawn timeline 3:30/3:00/2:30) - these are not the bosses asked about.

- **WorldRaid [9]:** Wakamo (Swimsuit) 240 s; Wakamo (Hovercraft) 240 s; Binah (Chroma) 180 s; Chesed (Chroma) 240; Shiro & Kuro (Chroma) 240; Hieronymus (Chroma) 240; Hod (Chroma) 240; Perorodzilla (Chroma) 240; Shiroko*Terror 180. Verdict UNKNOWN (not researched in depth).
- **InteractiveWorldRaid [10]:** Binah 180; Chesed 240; Hod 240; Kether 240; Tiphareth 300; Geburah 240; Chokmah 300; Yesod 270; Malkuth 240; Decagrammaton 250. Verdict UNKNOWN.
- **MultiFloorRaid [6] (Final Restriction style):** The Fury of Set (special/light armor) 270; Chokmah (special/heavy) 300; Tiphareth (elastic/heavy) 300. Verdict UNKNOWN.
- Skills for these bosses are in raids.json RaidSkills (names/descriptions); I did not extract them.
- Note: "Yesod" also appears as InteractiveWorldRaid yesod_854 (270 s); not checked for differences from the Total Assault version.

---

## What would fill the gaps
1. Frame/second timing is not in SchaleDB's skill json. A video-derived timeline (the user's own project approach: casts read from video) or the raid battle log would be the only TEST-grade source.
2. Fandom Yesod/Drumbarka/Nightmare guide pages (402) and the Causew Google Doc tabs for Yesod/Drumbarka may hold ordering text; open in a normal browser.
3. namu.wiki (403) likely has Korean pattern tables; try in a browser.
