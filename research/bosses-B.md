# Raid boss determinism research, batch B: Kaiten FX Mk.0, Perorodzilla, Hod, Goz

Labels: DATA = local SchaleDB dump (raids.json / enemies.json), WIKI = named page/guide, TEST = player-measured (only where the source says so), UNKNOWN = not found.
Difficulty index in the dumps: 0 Normal, 1 Hard, 2 VeryHard, 3 Hardcore, 4 Extreme, 5 Insane, 6 Torment, 7 Lunatic.

## Verdicts

| Boss | Verdict | Main gaps |
|---|---|---|
| Kaiten FX Mk.0 | Partly | Part-activation cycle is fixed (20 s, pink > red > green, starts pink). Which EX skill is cast is random (WIKI). No cast intervals, no ATG fill time for current version, no first-cast time. |
| Perorodzilla | Partly (likely mostly fixed) | One old community doc says patterns are fixed and gives per-wave clock times (Extreme, old version, "roughly"). No current-version, per-difficulty, or datamine timings. Lunatic/Torment/Insane changes untested. |
| Hod | Partly | Tower expand every 15 s (DATA text + WIKI). ATG fill 50 s then 30 s after 50% HP (WIKI gamerch). No skill order, no first-skill time, no intervals for Destroy I/II, Excess Energy. Entirely CC-driven (ATG/groggy reduced by CC), so not a fixed clock. |
| Goz | Partly | Scream Rider every 30 s with a fixed loop (WIKI). Phase 2 (clones/Three Light Monte/hats) has no timing numbers; Lunatic phase-2 positions random. Phase threshold in DATA (75% Lunatic, 60% others) disagrees with one wiki value for Lunatic. |

No source found gives frame/second data per skill (datamine AI cooldowns, first-cast delays). Searches for such a datamine returned nothing. UNKNOWN for all four.

Sources that refused or failed: bluearchive.fandom.com (HTTP 402 on every page), breezewiki mirror (Anubis block / denied), namu.wiki (not reached via search), ludo.guide (page has no per-boss info). The Google-doc "Blue Archive General Raid Strategy Guide" was readable and is the best timing source; it is old (written for early JP/GL versions, difficulty tables stop at Extreme) so treat timings as Extreme-era WIKI, not current.

Common sources:
- DOC = https://docs.google.com/document/d/1bvYGwIh-9o-2JQ4Q2MQXtsL0peiCPrRuw0l3HQmTrZ0/mobilebasic (community "General Raid Strategy Guide", sections per boss with "Simplified Timeline")
- gamerch per boss: Kaiten https://gamerch.com/bluearchive/834727 ; Perorodzilla https://gamerch.com/bluearchive/834817 ; Hod https://gamerch.com/bluearchive/834846 ; Goz https://gamerch.com/bluearchive/834880
- appmedia Kaiten https://appmedia.jp/?p=78180677 ; appmedia Goz https://appmedia.jp/blue_archive/78052928
- game8 Goz https://game8.jp/blue-archive/675592 ; ludo.guide https://www.ludo.guide/guide/blue-archive/database/raid-total-assault-strategies

---

## 1. Kaiten FX Mk.0 (kaiten)

Verdict: Partly. Battle limit 180 s all difficulties (DATA: BattleDuration [180 x8]). Terrain Outdoor, Street. Max difficulty index 7 (Lunatic), Insane max 6/7 per MaxDifficulty [7,7,6].

Structure (DATA): two stages. Stage 1 = five Kaitengers (Red AR, Black HG, Green MG, Yellow SR, Pink RL), stage 2 = KAITEN FX Mk.0. Boss GroggyTime 10 s (DATA, all difficulties). Boss groggy gauge Normal..Torment equals its max HP (e.g. Extreme 7,500,000); Lunatic gauge 2,000,000,000 (DATA; raw units, filled by part destruction per text). Lunatic only has a PhaseChange: phase 2 at HP under 60,000,000 of 120,000,000 (50%) (DATA). Other difficulties: none in the dump.

### Skills (DATA, descriptions; values shown Lunatic unless noted)

| Skill | Colour/part | ATG | Effect |
|---|---|---|---|
| Super Shrimp Machine Gun (Ex01) | Right arm pink | 0 | Circular AoE; 400% (Normal-Insane), 600% Torment, 2400% Lunatic |
| Hyper Sardine Missile (Ex02) | Chest red | 0 | 300% to all allies |
| Ultra Cap Shield (Ex03) | Left arm green | 0 | Self DamagedRatio -50%; removed after 10 student-EX hits (15 hits Torment+) |
| Final Mackerel Slash (Ex04) | none | 3 | 400% all allies, unevadable; Torment+: removes all Shield first; Lunatic: also ignores Shield |
| Eggvincible Overcharge (Ex05, Insane+) | Foot yellow | 0 | +4,000 ATK for 30 s (Insane), 180 s (Torment) |
| Absolute Eel Charge (Ex06, Lunatic) | Foot black | 0 | +2,000 HIT for 180 s and charges ATG by 1/3 |
| Endless Burning Heart (passive) | all | 0 | Every 20 s the parts activate in order pink > red > green. Pink: +50% ATK (Lunatic +100%). Red: EX skills also Stun 5 s. Green: +1,000 DEF (Insane+: EX also -80% healing received, 30 s). Damage dealt while a part is active accumulates; at threshold the part is destroyed, groggy gauge fills to max, and that part and its EX are disabled for the rest of the battle. Thresholds by difficulty (DATA param list, 7 entries, mapping Normal..Lunatic): 70,000 / 157,500 / 350,000 / 595,000 / 2,500,000 / 3,500,000 / 11,000,000; Lunatic text says 40,000,000 |
| Villains! How Sneaky You Are! (Kaitenger passive, Torment/Lunatic) | stage 1 | 0 | Kaitenger CC'd: +40% (Torment) / +80% (Lunatic) damage taken for 15 s; Lunatic also +10% crit rate stacks x5 |

Kaitenger skills (stage 1, from wiki doc, Extreme-era): Red taunts and cancels EX (WIKI DOC, "Red will taunt you every 20 seconds", first taunt about 2:40 on the clock); Yellow single-target big hit; Pink buffs allies' attack; Green line AoE; Black single-target damage-taken debuff. Kaitenger skill internals beyond this: UNKNOWN.

### Order and timing
- Part activation: DATA text + WIKI (DOC, gamerch https://gamerch.com/bluearchive/834727, appmedia https://appmedia.jp/?p=78180677): fixed 20 s cycle pink > red > green, starts in pink at battle start. DOC clock: pink 3:00-2:40, red 2:40-2:20, green 2:20-2:00, then repeat (3:00 = start of a 180 s battle).
- Which EX the boss casts: WIKI gamerch states the action is random ("行動はランダム"); appmedia: shield use is random Insane and below, and in Torment the shield is always used first ("Tormentでは必ず初手で使う"). Full order: UNKNOWN. A part's EX is only usable while its part is intact (DATA text).
- Final Mackerel Slash (ATG cost 3): fires when ATG is full. DOC (old version): ATG fill takes "exactly 1 minute", sword at 1:00 and 2:00 into the fight if uninterrupted; ATG resets on groggy. Current-version value and Lunatic (Eel Charge adds 1/3 ATG) interaction: UNKNOWN beyond this. Status: WIKI (old).
- Normal-attack/EX interval, first-EX time: UNKNOWN.
- Disruptions: part destroyed (groggy 10 s, disables that EX, resets ATG per DOC), phase change (Lunatic, 50% HP), stage 1 clear. After the 2026-04-21 update per-part HP is shown (appmedia).

### Randomness
- Which EX is cast: random (WIKI gamerch, appmedia). Shield: random below Torment, forced first in Torment (WIKI appmedia). Target selection of single-target/circle skills: UNKNOWN.

---

## 2. Perorodzilla (perorodzilla)

Verdict: Partly (probably deterministic; evidence is one old doc). Battle limit 240 s all difficulties (DATA). Terrain Indoor, Outdoor. Boss groggy time 20 s (DATA). Groggy gauge: Normal-Insane 100,000,000; Torment 1,000,000,000; Lunatic 2,000,000,000 (DATA raw units). The doc says groggy needs 7 knocked-down big Peroros on Extreme and below; DATA text says 1/7 of gauge per knocked-down minion (Normal-Extreme), 1/10 (Insane), 1/12 (Torment, Lunatic). gamerch says two summons' worth of knockdowns causes groggy (INSANE/TORMENT context).

Phase changes (DATA, HPUnder on boss; the boss HP values are fractions of max):
| Diff | Max HP | Phase 1 under | Phase 2 under |
|---|---|---|---|
| Normal | 380,000 | 260,000 | 130,000 |
| Extreme | 8,000,000 | 5,500,000 | 3,000,000 |
| Insane (outdoor) | 22,000,000 | 15,000,000 | 7,500,000 |
| Torment | 44,000,000 | 30,000,000 | 15,000,000 |
| Lunatic (outdoor) | 176,000,000 | 100,000,000 | 50,000,000 |
(Hard/VeryHard/Hardcore also in dump, same ratios.) What the phases change in behavior: UNKNOWN. The DOC says Perorodzilla "has no phases" (old version), conflicting with the DATA phase triggers.

### Skills (DATA)

| Skill | Effect |
|---|---|
| White-Hot Heat Vision (Ex01) | One ally: DEF -9,999 for 60 s, 90% damage/s for 10 s. Insane+: if the DEF debuff is not cleansed by expiry, 250% fan AoE. Torment: chains to nearest ally up to 2 times (100% /s first, 20% second, 10% third), unremoved debuff also -50% ATK 40 s. Lunatic: chains to all nearby allies at 40%/s |
| Aqua Ball (Ex02) | 400% circular AoE; Lunatic also DEF -9,999 60 s |
| Summon Minion (Ex03) | Summons big Peroro minions: Immortal, 100% of their damage is taken by the boss; at HP under 50% they fall and are permanently Stunned; Insane+: shiny ones deal 200,000 to nearby big minions when knocked down; HP scales with MAXHP stacks |
| Absorb Minion (Ex09) | Absorbs all minions, +50% ATG; each knocked-down minion fills groggy (see above); at full groggy summons 5 small Peroro minions (reduced DEF, damage also reflected to boss); Lunatic knocks back allies |
| Hyper Spiral Glare Beam (Ex10) | When ATG is full: 300% to all allies |
| Burning Perorodzilla (passive, Torment+) | +50% (Torment) / +200% (Lunatic) mystic bonus for boss and minions |

### Order and timing
- Order: cycle appears to be Heat Vision / Aqua Ball / Summon > Absorb > ATG beam; exact order UNKNOWN in DATA. WIKI DOC (Extreme-era, "fixed pattern", "no RNG"): minions move in a fixed pattern; the eye laser is "always fired at a fixed time after he summons his Peros"; boss "eats the Peroros after a fixed amount of time".
- Clock times, WIKI DOC "Simplified Timeline" (Extreme, status WIKI, approximate "roughly"; 4:00 start): wave 1 spawn at start (two pairs left and right), heat laser about 3:35, minions absorbed about 3:00; wave 2 spawn about 2:45, laser about 2:30, absorbed about 2:00; stage transition (Hyper Spiral) starts about 1:50, damage lands about 1:40 (10 s later); wave 3 spawn about 1:25, laser about 1:10, absorbed about 0:40; wave 4 only about 20 s before timeout. If groggy is triggered, add 20 s to the timeline from then on (consistent with DATA GroggyTime 20 s).
- DOC note: groggy bar carries between teams (a prior team's progress counts), and two groggies are possible on Extreme.
- Spawn/absorb intervals as game values, ATG fill rates: UNKNOWN (only the DOC's rounded clock times).
- First-skill time: about 25 s after start (laser at 3:35 of 4:00) per DOC; heat-vision first-cast detail otherwise UNKNOWN.

### Randomness
- DOC: "There is no RNG here". Heat Vision target selection (one ally, then chain by nearest): UNKNOWN whether fixed. Status of DOC claim: WIKI (not independently verified for Torment/Lunatic).
- Varies with player actions: groggy timing shifts the whole timeline by +20 s (DOC); phase changes by HP (DATA).

---

## 3. Hod (hod)

Verdict: Partly. Battle limit 240 s all difficulties (DATA). Terrain Street, Indoor. Boss GroggyTime 20 s (DATA); gauge 100,000,000 (Normal-Torment), 1,000,000,000 Lunatic (raw). No PhaseChange triggers in DATA for Hod; the 50% HP behavior is in skill text only. Two stages: phase 1 = run through map breaking Erosion Towers; phase 2 = Hod itself (WIKI DOC).

### Skills (DATA; Lunatic list in brackets)

| Skill | ATG | Effect |
|---|---|---|
| Destroy - Type I (Ex01) | 0 | 150% circular AoE; Insane+ expands 3 times |
| Destroy - Type II (Ex02) | 0 | 200% straight-line AoE |
| Erosion Tower Construction (Ex03) | 0 | Summons an Erosion Tower (two on Insane+). Allies in the erosion area: CostRegen -350 (Torment+: also CritDmg -3,000). Defense turrets in the area attack allies. Area expands every 15 s. Tower death: Hod ATG -50%, groggy +25% |
| Excess Energy Release (Ex04) | 0 | 150% all allies; if Hod under 50% HP: 300% and destroys all turrets |
| Light of Glory (Ex05) | 3 | 740% all allies, +50% ATK (Lunatic +75%) until end of battle, stacks to 99; Lunatic: stack removed when Hod becomes groggy |
| Behind the Glory (passive) | 0 | Hod and towers immune to CC but CC fills a CC gauge: threshold 6/7/8/9/10 s CC (Normal..Extreme), 15 s Insane, 20 s Torment and Lunatic; CC added is multiplied by inflicter CC Power from Insane up. On fill: +300% damage taken 30 s (Lunatic also crit resist -400), Hod ATG -50% and groggy +25% (towers: area -1 stage) |
| Shadow of Honor (passive) | 0 | +400% crit RES; towers immune to Focus |

### Order and timing
- Order of Hod's EX skills: UNKNOWN (no source). WIKI DOC: Hod fires the stage-sweeping laser (Light of Glory) when ATG is full; at about 50% HP (Excess Energy Release) it fires an EMP and stops summoning towers ("no longer summon towers for the remainder"); after that ATG fills "roughly twice as fast". gamerch https://gamerch.com/bluearchive/834846: ATG fill "from 50 s to 30 s" after Overload Energy (WIKI). Both state ATG-driven, not fixed clock; CC reduces ATG by 50% per CC-gauge fill, and four CC-gauge fills = groggy 20 s (DOC: "After filling up 4 CC gauges, HOD will be stunned ... 20 seconds"; consistent with DATA +25% per fill and GroggyTime 20 s).
- Tower erosion expands every 15 s: DATA (skill text) + WIKI (gamerch).
- Tower summon can be cancelled by groggy during the summon animation (WIKI DOC, "the tell is when Hod opens the hatch").
- Light of Glory first cast time: about 50 s into phase 2 implied if ATG fill is 50 s from 0 (gamerch value); not stated as a first-cast time -> UNKNOWN for exact, uncertain whether ATG starts at 0.
- Phase 1 Hod "attack" cadence (the "AA" double laser): UNKNOWN.

### Randomness
- None reported; no source states random choices. Behavior varies heavily with player CC (CC fills reduce ATG, give groggy, delay Light of Glory). Therefore a fixed timeline is only valid for a fixed CC pattern.

---

## 4. Goz (goz)

Verdict: Partly. Battle limit 240 s all difficulties (DATA). Terrain Indoor, Outdoor. Boss GroggyTime 10 s (DATA); Normal..Torment groggy gauge = 80% of HP (e.g. Extreme 10,400,000 of 13,000,000), Lunatic gauge 2,000,000,000 (raw, "significantly increased" by Prank or Protect text).

Phase change (DATA): HPUnder trigger of 60% of max on Normal..Torment (e.g. Extreme 7,800,000 of 13,000,000; Torment 30,000,000 of 50,000,000) and 75% on Lunatic (150,000,000 of 200,000,000). gamerch https://gamerch.com/bluearchive/834880 says about 60% (a map move then Goz splits into three) and "phase change is blocked during the bomb attack motion" (WIKI). Lunatic's 75% in DATA is not confirmed by any page (appmedia mentions only 60-50% as a suggested handover point). Status: DATA vs WIKI discrepancy for Lunatic.

### Skills (DATA)

| Skill | ATG | Effect |
|---|---|---|
| Now You See Us (Ex01) | 0 | Goz vanishes, cleanses self, creates 2 clones with same abilities (clone ATK 0 Normal-Extreme, 50% Insane+; clone HP 60,000,000 Lunatic) |
| Three Light Monte (Ex02) | 3 | When ATG full: Goz and clones shine spotlights; lit areas of clones explode after a short delay for 1500% (7500% Lunatic) on allies not in the real Goz's light; Lunatic: +12.5% groggy, Strikers in the real light get CostRegen +750 for 5 s |
| Magical Coin Hat (Ex03) | 0 | Hides coins in three hats, shuffles; allies in line in front of hats without a coin take 800%, knockback, Stun 5 s (Torment+: AtkSpd -50% 30 s). Lunatic: yellow-coin zone gives Strikers CostRegen +350 each (up to 4) 5 s; blue-coin zone +7.5% damage each (up to 4) 20 s |
| Surprise Present (Ex04_0) | 0 | Bomb on one ally, 900% (laser-marked, unavoidable per DOC) |
| Screamrider (Ex04_1) | 0 | Periodically appears: 1200% on its path, knockback; Insane+: also 600% nearby; summons Slumpian soldiers (bears/rabbits) along its path |
| Prank or Protect (Ex04_2) | 0 | Damage to Shield-protected targets -75% (Lunatic -50%); all allies healing -50% (Lunatic -90%), undispellable |

### Order and timing
- Scream Rider: every 30 s (WIKI DOC: "Every 30 seconds"; game8 https://game8.jp/blue-archive/675592: "30秒毎"). Loop (WIKI DOC and gamerch): first appearance random left or right lane, second the opposite lane, third both lanes together (no outer AoE), repeats until phase change. Leaves 2 rabbits + 2 bears (4+4 for the double). Phase 1 only. Status: WIKI (two sources agree; DOC is Extreme-era). First-appearance time after start: UNKNOWN (30 s interval implies about 30 s but not stated as such).
- Surprise Present (bomb): used in both phases; cadence UNKNOWN.
- Phase 2: Goz teleports to one of three stages and spawns clones (DOC); after the clone split, lights fire "when the ATG is full" (WIKI DOC); after the explosion Goz re-casts Now You See Us and splits again (WIKI DOC). So phase 2 is an ATG-driven loop: Now You See Us > (spotlights + hats/bomb as extra skills) > Three Light Monte explosion > repeat. Exact intervals and ATG fill time: UNKNOWN.
- Magical Coin Hat: DOC says the bomb always starts in the middle and its final position equals the direction of the first shuffle move (WIKI DOC, Extreme-era, so the hat result is deterministic by that rule); gamerch adds coin position is random but on Torment and below always in front of the real body, and the coin positions "shift until the last moment" (appmedia, Lunatic). These conflict on randomness; which is right per difficulty: UNKNOWN.
- Lunatic: gamerch says after the first fixed moves (right, middle, left) the real-body positions are random ("Lunatic ではそれ以降の本体位置はランダム"). Status: WIKI (gamerch).
- Disruptions: phase change (60%, or 75% Lunatic per DATA), groggy, taunt makes clones stop moving; Wakamo petal mark can reveal real Goz.

### Randomness
- Scream Rider first lane: random (WIKI x3). Phase-2 real-Goz position: fixed first three positions (right, middle, left), random after on Lunatic (WIKI gamerch); Normal..Torment positions otherwise: UNKNOWN beyond that. Hat/coin position: conflicting sources as above. Clone colors fixed: red left, blue centre, yellow right (WIKI DOC, gamerch).

---

## What a timeline can safely show now
- Kaiten: 20 s part cycle pink/red/green from t=0 (DATA text + WIKI), groggy 10 s on part break. Cast times of EXes: not safe (random).
- Perorodzilla: only the DOC's Extreme clock times, flagged approximate, old version; not safe across difficulties.
- Hod: tower erosion expand every 15 s; ATG-driven Light of Glory only as a function of CC; no fixed times.
- Goz: Scream Rider every 30 s in phase 1 with the left/right/both loop (first lane random); phase 2 only qualitative.

## Open gaps (need a datamine of enemy AI or measured video)
1. Per-skill first-cast time and intervals for all four bosses (not in SchaleDB dump).
2. ATG fill times per difficulty (only: Kaiten about 60 s old DOC, Hod 50 s then 30 s).
3. Exact order of EX skills per phase for Hod, Goz (phase 2), Perorodzilla, Kaiten.
4. Torment/Lunatic changes (hat/coin rules, Goz Lunatic phase 75%, Perorodzilla phase effects).
