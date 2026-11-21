// Boss data audit. Usage: node tests/audit_bosses.js [--icons]
// Checks bosses.js (what the tool shows) against research/raids.json + research/enemies.json (SchaleDB), for every Total Assault boss,
// and lists how Grand Assault seasons use them and which boss effects touch cost.
const fs = require('fs'), path = require('path');
const { load, root } = require('./load');
const E = load(), B = E.BOSSES;
const raids = JSON.parse(fs.readFileSync(path.join(root, 'research/raids.json'), 'utf8'));
const enemies = JSON.parse(fs.readFileSync(path.join(root, 'research/enemies.json'), 'utf8'));
const out = { fail: [], warn: [], info: [] };
const F = m => out.fail.push(m), W = m => out.warn.push(m), I = m => out.info.push(m);
const DIFF = ['Normal', 'Hard', 'VeryHard', 'Hardcore', 'Extreme', 'Insane', 'Torment', 'Lunatic'];
const TERRS = new Set(['Outdoor', 'Street', 'Indoor']);
const ARMOR = new Set(['LightArmor', 'HeavyArmor', 'Unarmed', 'ElasticArmor', 'Normal']);

// A. coverage: every Total Assault boss that is released (JP) is in bosses.js
const srcRaids = raids.Raid;
srcRaids.filter(r => r.IsReleased[0]).forEach(r => { if (!B.find(b => b.path === r.PathName)) F(`${r.PathName}: released boss missing from bosses.js`); });
B.forEach(b => { if (!srcRaids.find(r => r.PathName === b.path)) F(`${b.path}: in bosses.js but not in the source`); });
I(`Total Assault bosses in source: ${srcRaids.length}, in bosses.js: ${B.length}`);

for (const b of B) {
  const r = srcRaids.find(x => x.PathName === b.path); if (!r) continue;
  const tag = `${b.name}`;
  if (!b.terrains.length || b.terrains.some(t => !TERRS.has(t))) F(`${tag}: terrains ${JSON.stringify(b.terrains)}`);
  if (JSON.stringify(b.terrains) !== JSON.stringify(r.Terrain)) F(`${tag}: terrains differ from the source`);
  if (!ARMOR.has(b.armor)) F(`${tag}: armor ${b.armor}`);
  const jpMax = r.MaxDifficulty[0];
  if (b.diffs.length !== Math.min(r.EnemyList.length, jpMax + 1)) F(`${tag}: ${b.diffs.length} difficulties, source says ${Math.min(r.EnemyList.length, jpMax + 1)} (JP max index ${jpMax})`);
  if (b.global && !r.IsReleased[1]) F(`${tag}: marked global but the source says it is not released there`);
  b.diffs.forEach((d, k) => {
    const dn = `${tag} ${d.name}`;
    if (d.name !== DIFF[k]) F(`${dn}: difficulty name should be ${DIFF[k]}`);
    if (!(d.sec > 0 && d.sec <= 3600)) F(`${dn}: time limit ${d.sec}`);
    if (r.BattleDuration && d.sec !== r.BattleDuration[0] && d.sec !== r.BattleDuration) W(`${dn}: time limit ${d.sec}s vs source ${JSON.stringify(r.BattleDuration).slice(0, 40)}`);
    if (!d.enemies.length) F(`${dn}: no enemies`);
    const boss = d.enemies.filter(e => e.rank === 'Boss' || e.rank === 'Raid');
    d.enemies.forEach(e => {
      if (!(e.hp > 0)) F(`${dn}: ${e.name} hp ${e.hp}`);
      if (!ARMOR.has(e.armor)) F(`${dn}: ${e.name} armor ${e.armor}`);
      if (e.groggyGauge && !(e.groggyMs > 0)) W(`${dn}: ${e.name} has a groggy gauge but no groggy time`);
      if (!enemies.Enemies[String(e.id)]) F(`${dn}: enemy ${e.id} not in enemies.json`);
    });
    // HP should not shrink as difficulty rises
    if (k > 0) { const a = b.diffs[k - 1].enemies[0], c = d.enemies[0]; if (a && c && c.hp < a.hp) W(`${dn}: main enemy HP ${c.hp} is lower than ${b.diffs[k - 1].name} (${a.hp})`); }
    if (!d.skills || !d.skills.length) W(`${dn}: no boss skills`);
    (d.skills || []).forEach(s => { if (!s.name || !s.desc) W(`${dn}: skill ${s.id} has no ${!s.name ? 'name' : 'description'}`); if (/[<>]|\{\d|undefined|NaN/.test(s.desc || '')) F(`${dn}: skill "${s.name}" description has leftover markup: ${s.desc.slice(0, 80)}`); });
  });
}

// B. Grand Assault: which bosses/armor variants the seasons use, and what the tool can show for them
const ga = raids.RaidSeasons[0].EliminateSeasons, ta = raids.RaidSeasons[0].Seasons;
const use = {};
ga.forEach(s => { const r = srcRaids.find(x => x.Id === s.RaidId); const k = r ? r.PathName : 'raid#' + s.RaidId; (use[k] = use[k] || { n: 0, armors: new Set(), terr: new Set() }).n++; Object.keys(s.OpenDifficulty).forEach(a => use[k].armors.add(a)); use[k].terr.add(s.Terrain); });
I(`Grand Assault seasons: ${ga.length}, Total Assault seasons: ${ta.length}`);
for (const [k, v] of Object.entries(use)) {
  const b = B.find(x => x.path === k);
  if (!b) { F(`Grand Assault uses ${k} (${v.n} seasons) but it is not in bosses.js`); continue; }
  const extra = [...v.armors].filter(a => a !== b.armor);
  I(`GA ${b.name}: ${v.n} seasons, armor types used ${[...v.armors].join('/')}, terrains ${[...v.terr].join('/')}${extra.length ? '  -> the tool only has ' + b.armor + ' (' + extra.join(', ') + ' missing)' : ''}`);
  [...v.terr].filter(t => !b.terrains.includes(t)).forEach(t => W(`GA ${b.name}: season terrain ${t} is not one of the Total Assault terrains ${b.terrains.join('/')}; the terrain drop-down does not offer it`));
}
srcRaids.filter(r => r.IsReleased[0] && !use[r.PathName]).forEach(r => I(`${r.Name}: no Grand Assault season in the source`));

// C. boss effects that touch cost
const sk = raids.RaidSkills, esk = enemies.Skills; const rows = [];
for (const [id, s] of Object.entries(sk)) {
  const eff = (esk[id] || {}).Effects || [];
  const hit = eff.filter(e => /RegenCost|CostChange|CostRegen/.test((e.Stat || '') + (e.Type || '')));
  if (hit.length || /cost recover|EX cost|skill cost/i.test(JSON.stringify(s.Desc || ''))) rows.push(`${id}: ${(s.Name || '').slice(0, 30)} | ${hit.map(e => (e.Type || '') + ' ' + (e.Stat || '') + ' ' + JSON.stringify(e.Target)).join(', ') || 'text only'} | ${String(s.Desc || '').replace(/<[^>]+>/g, '').slice(0, 130)}`);
}
I(`boss skills that mention cost (${rows.length}); the tool models only the groggy Cost Recovery gain (RegenCost on groggy):\n    ` + rows.join('\n    '));
const modelled = new Set(); B.forEach(b => b.diffs.forEach(d => (d.skills || []).forEach(s => (s.fx || []).forEach(f => modelled.add(`${b.name} ${d.name}: ${s.name} (${f.stat} ${f.value} on ${f.on}, ${f.who}, ${f.sec}s)`)))));
I(`boss effects the tool applies to cost (${modelled.size}): ${[...modelled].slice(0, 12).join('; ')}${modelled.size > 12 ? ' ...' : ''}`);

(async () => {
  if (process.argv.includes('--icons')) {
    const DEV = {}; (new Function('return ' + fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/const BOSS_DEV = (\{[^}]*\})/)[1]))();
    const map = (new Function('return ' + fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/const BOSS_DEV = (\{[^}]*\})/)[1]))();
    for (const b of B) {
      const u = `https://schaledb.com/images/raid/Boss_Portrait_${map[b.path] || b.path}_Lobby.png`;
      const r = await fetch(u); const ok = (r.headers.get('content-type') || '').startsWith('image/'); await r.arrayBuffer();
      if (!ok) F(`${b.name}: portrait does not load (${u})`);
    }
    I('boss portraits checked: ' + B.length);
  }
  console.log('=== INFO ===\n' + out.info.join('\n'));
  console.log(`\n=== FAIL (${out.fail.length}) ===\n` + out.fail.join('\n'));
  console.log(`\n=== WARN (${out.warn.length}) ===\n` + out.warn.join('\n'));
  process.exitCode = out.fail.length ? 1 : 0;
})();
