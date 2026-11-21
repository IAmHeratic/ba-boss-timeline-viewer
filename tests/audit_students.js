// Student data audit. Usage: node tests/audit_students.js <students.min.json from SchaleDB> [--icons]
// Compares data.js (what the tool uses) with the SchaleDB source, flags broken or suspicious entries, and lists every cost-related
// mechanic in the game that the tool does or does not model.
const fs = require('fs');
const { load } = require('./load');
const E = load(), D = E.SCHALE;
const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const withIcons = process.argv.includes('--icons');
const out = { fail: [], warn: [], info: [] };
const F = (id, m) => out.fail.push(`${id} ${(D[id] || src[id] || {}).name || (src[id] || {}).Name}: ${m}`);
const W = (id, m) => out.warn.push(`${id} ${(D[id] || {}).name || (src[id] || {}).Name}: ${m}`);

// A. coverage
const want = Object.keys(src).filter(k => (src[k].IsReleased || [true])[0] && src[k].Skills && src[k].Skills.Ex);
const have = Object.keys(D);
want.filter(k => !D[k]).forEach(k => F(k, 'released with an EX skill but missing from data.js'));
have.filter(k => !src[k]).forEach(k => F(k, 'in data.js but not in the source'));
out.info.push(`students in source with EX: ${want.length}, in data.js: ${have.length}`);

// B. per-student sanity
const TARGETS = new Set(['Self', 'AllyMain', 'Ally', 'AllySupport', 'Enemy', 'AllyAll', '', undefined]);
const squadCount = {};
for (const id of have) {
  const d = D[id]; if (!d) continue;
  squadCount[d.squad] = (squadCount[d.squad] || 0) + 1;
  if (!d.name) F(id, 'no name');
  if (d.cost === 0) W(id, 'EX costs 0 in SchaleDB (it only designates targets), so casts of it spend nothing');
  else if (!(d.cost >= 1 && d.cost <= 10) || !Number.isInteger(d.cost)) F(id, `EX cost ${d.cost} outside 1-10`);
  if (!(d.frames > 0 && d.frames < 900)) F(id, `EX animation frames ${d.frames}`);
  if (!['Main', 'Support'].includes(d.squad)) F(id, `squad ${d.squad}`);
  if (!d.regenStat) W(id, 'no Cost Recovery stat');
  else if (d.regenStat !== 700) W(id, `Cost Recovery stat is ${d.regenStat}, not 700 (the tool's team formula assumes the stat per student)`);
  if (!d.params || !d.params.length) W(id, 'no EX parameters');
  for (const b of d.buffs) {
    if (!(b.ms > 0)) F(id, `buff ${b.stat} has duration ${b.ms}`);
    if (!Array.isArray(b.values) || !b.values.length) F(id, `buff ${b.stat} has no values`);
    else if (b.stat !== 'Summon' && b.stat !== 'CostOverload' && b.values.length !== 5) W(id, `buff ${b.stat} has ${b.values.length} values, EX has 5 levels`);
    if (b.apply < 0 || b.apply > 600) W(id, `buff ${b.stat} apply frame ${b.apply}`);
    if (b.target !== undefined && !TARGETS.has(b.target)) W(id, `buff ${b.stat} target "${b.target}"`);
  }
  if (d.regenBoost) {
    if (!d.regenBoost.values || d.regenBoost.values.length !== 10) W(id, `Sub Skill cost boost has ${d.regenBoost.values && d.regenBoost.values.length} levels, expected 10`);
    if (d.regenBoost.stat !== 'RegenCost_Coefficient') W(id, `cost-recovery Sub Skill uses ${d.regenBoost.stat}: the tool treats every value as a percentage of team regen (RegenCost_Base is a flat amount)`);
  }
  if (d.extend && (!d.extend.values || d.extend.values.length < 1)) F(id, 'UE buff extension without values');
}
out.info.push('squads: ' + JSON.stringify(squadCount));

// C. source effects that the generator may have dropped silently
for (const id of want) {
  const s = src[id], ex = s.Skills.Ex, d = D[id]; if (!d) continue;
  const srcBuffs = (ex.Effects || []).filter(e => e.Type === 'Buff' && e.Duration && e.Value);
  const dataBuffs = d.buffs.filter(b => b.stat !== 'Summon' && b.stat !== 'CostOverload');
  if (srcBuffs.length !== dataBuffs.length) F(id, `EX has ${srcBuffs.length} timed buffs in the source, ${dataBuffs.length} in data.js`);
  const noDur = (ex.Effects || []).filter(e => e.Type === 'Buff' && !e.Duration && e.Value);
  if (noDur.length) W(id, `EX has ${noDur.length} buff(s) without a duration (not shown): ${noDur.map(e => e.Stat).join(', ')}`);
  const srcExt = ((s.Skills.WeaponPassive || {}).Effects || []).some(e => e.Stat === 'ExtendBuffDuration_Base');
  if (srcExt !== !!d.extend) F(id, `UE buff-duration extension: source ${srcExt}, data.js ${!!d.extend}`);
}

// D. mechanics that touch cost
const modelled = [], unmodelled = [];
for (const id of want) {
  const s = src[id];
  for (const [slot, q] of Object.entries(s.Skills)) for (const e of (q.Effects || [])) {
    const stat = e.Stat || e.Type, isCost = e.Type === 'CostChange' || /RegenCost/.test(e.Stat || '');
    if (!isCost) continue;
    const row = { id, name: s.Name, slot, type: e.Type, stat };
    const d = D[id];
    let ok = false;
    if (e.Type === 'Buff' && slot === 'Ex') ok = !!(d && d.buffs.some(b => b.stat === e.Stat));
    if (e.Type === 'Buff' && slot === 'ExtraPassive') ok = !!(d && d.regenBoost);
    (ok ? modelled : unmodelled).push(row);
  }
}
const uniq = a => [...new Set(a.map(r => `${r.name} [${r.slot} ${r.type} ${r.stat}]`))];
out.info.push(`cost mechanics modelled (${uniq(modelled).length}): ${uniq(modelled).join('; ')}`);
out.info.push(`cost mechanics NOT modelled (${uniq(unmodelled).length}):\n    ` + uniq(unmodelled).join('\n    '));

// E. short names
const seen = {};
for (const id of have) {
  const d = D[id], sn = E.shortName(d.name);
  (seen[sn] = seen[sn] || []).push(d.name);
  const m = d.name.match(/\(([^)]*)\)$/);
  if (m && !E.OUTFIT[m[1].split(' · ')[0]]) W(id, `outfit "${m[1]}" has no short form, the full name is shown`);
}
Object.entries(seen).filter(([, v]) => v.length > 1).forEach(([k, v]) => out.fail.push(`short name "${k}" is shared by: ${v.join(' / ')}`));

(async () => {
  // F. icons (the page hides a missing icon, so it would only show as a blank square)
  if (withIcons) {
    const bad = []; let i = 0;
    const ids = have.slice();
    await Promise.all(Array.from({ length: 12 }, async () => {
      while (i < ids.length) {
        const id = ids[i++];
        try { const r = await fetch(`https://schaledb.com/images/student/icon/${id}.webp`); const ct = r.headers.get('content-type') || ''; if (!ct.startsWith('image/')) bad.push(id); await r.arrayBuffer(); }
        catch (e) { bad.push(id + ' (' + e.message + ')'); }
      }
    }));
    bad.forEach(id => F(String(id).split(' ')[0], 'icon does not load: ' + id));
    out.info.push(`icons checked: ${ids.length}, bad: ${bad.length}`);
  }
  console.log('=== INFO ===\n' + out.info.join('\n'));
  console.log(`\n=== FAIL (${out.fail.length}) ===\n` + out.fail.join('\n'));
  console.log(`\n=== WARN (${out.warn.length}) ===\n` + out.warn.join('\n'));
  process.exitCode = out.fail.length ? 1 : 0;
})();
