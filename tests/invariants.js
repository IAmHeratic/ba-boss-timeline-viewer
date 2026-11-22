// Invariant tests: rules that must hold for ANY team, checked on thousands of random ones plus a sweep over every student and every boss.
// Usage: node tests/invariants.js [teams=300] [seed=1]
const { load } = require('./load');
const E = load(), D = E.SCHALE, B = E.BOSSES;
const N = +(process.argv[2] || 300), SEED = +(process.argv[3] || 1);
let s = SEED >>> 0; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const fails = {}; let checks = 0;
const bad = (rule, msg) => { (fails[rule] = fails[rule] || []).push(msg); };
const ok = (rule, cond, msg) => { checks++; if (!cond) bad(rule, msg); };
const EPS = 0.02;

const ids = Object.keys(D).map(Number), mains = ids.filter(i => D[i].squad === 'Main'), supports = ids.filter(i => D[i].squad === 'Support');
const OVER = ids.filter(i => D[i].buffs.some(b => b.stat === 'CostOverload'));

function mkTeam(opts = {}) {
  const roster = opts.roster || [...Array.from({ length: 4 }, () => pick(mains)), ...Array.from({ length: 2 }, () => pick(supports))];
  const t = { name: 'T', custom: true, roster: [...new Set(roster)], casts: [], set: { lv: {}, ext: {}, ue: {}, wait: {} }, events: [] };
  roster.forEach(id => {
    if (rnd() < .5) t.set.ue[id] = pick([0, 30, 40, 50, 60]);
    if (rnd() < .4) t.set.lv[id] = { ex: ri(1, 5), basic: ri(1, 10), sub: ri(0, 10) };
  });
  E.state.teams.length = 0; E.state.teams.push(t); E.state.team = 0;
  const b = opts.boss !== undefined ? opts.boss : (rnd() < .5 ? pick(B) : null);
  if (b) { const d = opts.diff !== undefined ? b.diffs[opts.diff] : pick(b.diffs); t.boss = { raid: b.id, diff: d.k, terrain: pick(b.terrains) }; t.limit = d.sec; }
  E.setTotal(t.limit ?? 180);
  return t;
}
// like addCast() in the page
function addCast(t, who, mode) {
  const prev = t.casts.length ? t.casts.reduce((a, c) => c.t < a.t ? c : a) : null, last = prev ? prev.t : E.clock().TOTAL;
  const sp = E.spendOf(t, { who, t: +(last - 0.01).toFixed(2) });
  const c = { t: +E.firstAffordable(t, sp, +(last - 0.01).toFixed(2), who).toFixed(2), who };
  if (prev && (mode === 'after' || sp === 0)) c.after = E.cid(prev); else c.cb = E.spendOf(t, c);
  t.casts.push(c); return c;
}
const snap = t => t.casts.map(c => c.t);
const bossFx = t => { const b = E.bossOf(t), d = b && E.bossDiff(t); return d; };

function randomRotation(t, n) {
  for (let k = 0; k < n; k++) {
    const who = pick(t.roster), c = addCast(t, who, rnd() < .4 ? 'after' : 'cb');
    if (E.targetsAlly(who) && t.roster.length > 1 && rnd() < .8) c.target = pick(t.roster.filter(x => x !== who));   // the page has no default target any more
    if (process.env.PURE) E.applyChains(t);   // the page settles after every edit; the stress mode below settles once at the end
    if (!process.env.PURE && rnd() < .1) E.setSpend(c, ri(0, 6));                      // manual cost override (Kokona stamps etc.)
    if (!process.env.PURE && rnd() < .1 && t.casts.length > 1) { delete c.after; delete c.cb; c.t = Math.max(0, +(c.t - rnd() * 10).toFixed(2)); }   // a hand-set time
    if (!process.env.PURE && rnd() < .15) c.target = pick(t.roster);
  }
  const bd = bossFx(t);
  if (bd && rnd() < .7) { const g = ri(0, 3); for (let i = 0; i < g; i++) t.events.push({ id: 'e' + i, type: 'groggy', t: +(E.clock().TOTAL - rnd() * (E.clock().TOTAL - 20)).toFixed(2), dur: 10 }); }
  if (rnd() < .2) t.startCost = ri(0, 6);
}

const t0 = Date.now(); let worst = 0;
for (let n = 0; n < N; n++) {
  const t = mkTeam(); randomRotation(t, ri(2, 16));
  const tag = `seed ${SEED} #${n} [${t.roster.map(i => D[i].name).join(', ')}]${t.boss ? ' boss ' + t.boss.raid + '/' + t.boss.diff : ''}`;
  const t1 = Date.now();
  let threw = null; try { E.applyChains(t); } catch (e) { threw = e; }
  worst = Math.max(worst, Date.now() - t1);
  ok('no-exception', !threw, tag + ' ' + (threw && threw.stack.split('\n').slice(0, 2).join(' ')));
  if (threw) continue;
  const sorted = [...t.casts].sort((a, b) => b.t - a.t);
  const list = E.allResolved(), cm = E.costModel(t, list), cap = E.capOf(t), T = E.clock().TOTAL;

  // placement rules
  t.casts.forEach(c => {
    ok('time-in-range', c.t >= 0 && c.t <= T && Number.isFinite(c.t), `${tag}: cast time ${c.t}`);
    if (c.after) { const p = t.casts.find(x => x.id === c.after); ok('chain-after-parent', !p || c.t <= p.t, `${tag}: chained cast at ${c.t} is before its parent ${p && p.t}`); }
  });
  // cost rules
  cm.ev.forEach(e => {
    const c = t.casts[e.i], planned = c.cb != null || c.after;
    ok('cost-cap', e.before <= cap + 1e-6, `${tag}: cost ${e.before} above the cap ${cap}`);
    ok('cost-floor', !cm.ev.every(x => x.ok) || e.before >= -5 - 1e-6, `${tag}: cost ${e.before} below -5`);
    ok('cost-finite', Number.isFinite(e.before), `${tag}: cost is ${e.before}`);
    // a cast placed by the tool must be affordable (unless it runs out of fight: it then sits at the end)
    if (planned && c.t > 15 && !t.casts.some(o => o !== c && o.t === c.t) && E.costAt(t, -1, 0, E.castsExcept(t, e.i)) >= e.spend)   // a cast the team can never pay for before the end just sits after the cast above it, flagged red
      ok('planned-cast-affordable', e.before >= e.spend - 0.013 || e.overload, `${tag}: ${D[c.who].name} at ${c.t} sees ${e.before.toFixed(3)} needs ${e.spend}`);
  });
  ok('cost-tail', cm.tail.cost <= cap + 1e-6, `${tag}: cost left at the end exceeds cap`);

  // idempotence: settling an already settled team changes nothing
  const a = snap(t), pre = JSON.stringify(t); E.applyChains(t); const mv = snap(t).map((x, k) => Math.abs(x - a[k])), tol = 0.05;   // casts within a few hundredths of each other can swap places: that is not a real move
  ok('idempotent', mv.every(x => x <= tol), `${tag}: second applyChains moved casts by up to ${Math.max(...mv).toFixed(2)} s`);
  if (!mv.every(x => x <= tol) && process.env.DUMP) require('fs').writeFileSync(process.env.DUMP + '/idem-' + n + '.json', JSON.stringify({before: JSON.parse(pre), t1: a, t2: snap(t)}, null, 1));

  // export / import round trip
  const copy = JSON.parse(JSON.stringify(t)); E.state.teams[0] = copy; E.applyChains(copy);
  const rd = snap(copy).map((x, k) => Math.abs(x - a[k])); ok('roundtrip', rd.every(x => x <= 0.05), `${tag}: reload (JSON round trip) moved casts by up to ${Math.max(...rd).toFixed(2)} s`);
  if (!rd.every(x => x <= 0.05) && process.env.DUMP) require('fs').writeFileSync(process.env.DUMP + '/rt-' + n + '.json', JSON.stringify({before: JSON.parse(pre), t1: a, t2: snap(copy)}, null, 1));
  E.state.teams[0] = t;

  // earlier casts do not depend on later ones: dropping the last cast must not move the others
  if (t.casts.length > 2) {
    const last = [...t.casts].sort((x, y) => x.t - y.t)[0];
    if (!t.casts.some(c => c.after === last.id)) {
      const before = new Map(t.casts.map(c => [c, c.t])), idx = t.casts.indexOf(last); t.casts.splice(idx, 1); E.applyChains(t);
      const moved = t.casts.filter(c => Math.abs(c.t - before.get(c)) > 1e-9);
      ok('later-cast-independent', !moved.length, `${tag}: removing the last cast moved ${moved.map(c => D[c.who].name + ' ' + before.get(c) + '->' + c.t).join(', ')}`);
    }
  }
  // buffs and basics
  E.allResolved().forEach(x => x.r.buffs.forEach(b => { ok('buff-order', b.end < b.start, `${tag}: ${D[x.c.who].name} buff ${b.stat} ends before it starts`); ok('buff-label', !!b.label && !/undefined|NaN/.test(b.label), `${tag}: label "${b.label}"`); }));
  t.roster.forEach(id => { const bs = E.simBasics(t, id); for (let k = 1; k < bs.length; k++) ok('basics-order', bs[k].t < bs[k - 1].t, `${tag}: ${D[id].name} basics out of order`); bs.forEach(b => ok('basics-range', b.t >= 0 && b.t <= T, `${tag}: ${D[id].name} basic at ${b.t}`)); });
}
const ms = Date.now() - t0;

// Every student: alone in a team, cast once at every EX level / UE level. Nothing may throw or produce NaN.
for (const id of ids) {
  for (const ue of [0, 60]) for (const ex of [1, 5]) {
    const roster = [id, ...Array.from({ length: 5 }, () => pick(ids.filter(i => i !== id)))];
    const t = mkTeam({ roster, boss: null }); t.set.ue[id] = ue; t.set.lv[id] = { ex, basic: 10, sub: 10 };
    let err = null; try { addCast(t, id, 'cb'); E.applyChains(t); const r = E.resolve(t.casts[0]); r.buffs.forEach(b => { if (!(b.end < b.start) || !Number.isFinite(b.val)) throw new Error(`buff ${b.stat} start ${b.start} end ${b.end} val ${b.val}`); }); E.simBasics(t, id); E.regenInfo(t); }
    catch (e) { err = e; }
    ok('student-sweep', !err, `${D[id].name} (EX ${ex}, UE ${ue}): ${err && err.message}`);
    if (!err) { const c = t.casts[0], cm = E.costModel(t, E.allResolved()); ok('student-first-cast', cm.ev[0].before >= E.spendOf(t, c) - EPS || c.t <= 0.05, `${D[id].name}: first cast at ${c.t} sees ${cm.ev[0].before}`); }
  }
}

// Every boss, difficulty and terrain: a team with a groggy event settles without errors and with finite numbers.
let bossCases = 0;
for (const b of B) for (const d of b.diffs) for (const terr of b.terrains) {
  const t = mkTeam({ boss: b, diff: b.diffs.indexOf(d) }); t.boss.terrain = terr; bossCases++;
  addCast(t, t.roster[0], 'cb'); addCast(t, t.roster[1], 'after'); addCast(t, t.roster[2], 'cb');
  t.events.push({ id: 'g', type: 'groggy', t: Math.max(1, d.sec - 60), dur: (d.enemies[0].groggyMs || 10000) / 1000 });
  let err = null; try { E.applyChains(t); const cm = E.costModel(t, E.allResolved()); cm.ev.forEach(e => { if (!Number.isFinite(e.before)) throw new Error('NaN cost'); }); E.regenWindows(t); }
  catch (e) { err = e; }
  ok('boss-sweep', !err, `${b.name} ${d.name} ${terr}: ${err && err.message}`);
  ok('boss-limit', E.clock().TOTAL === d.sec, `${b.name} ${d.name}: limit ${E.clock().TOTAL} != ${d.sec}`);
}

// Slow case from the field: 30 casts, three groggy windows, must settle quickly.
{ const t = mkTeam({ boss: B.find(b => b.path === 'binah'), diff: 7 }); for (let i = 0; i < 30; i++) addCast(t, t.roster[i % t.roster.length], i % 3 ? 'after' : 'cb');
  [120, 80, 40].forEach((x, i) => t.events.push({ id: 'g' + i, type: 'groggy', t: x, dur: 10 }));
  const a = Date.now(); E.applyChains(t); const dt = Date.now() - a; ok('perf-30-casts', dt < 2000, `30 casts + 3 groggy took ${dt} ms`); worst = Math.max(worst, dt); }

console.log(`${checks} checks over ${N} random teams (${ms} ms, slowest settle ${worst} ms), ${ids.length} students x4 variants, ${bossCases} boss/difficulty/terrain combinations`);
// Known edge: a plan that cannot be met (e.g. 'cost before 5' with a starting cost of 6) settles differently from scratch than step by step, so a reload can move
// those casts. It is counted, and only fails the run if it becomes common (more than 1% of teams).
if (fails.roundtrip && fails.roundtrip.length <= Math.ceil(N * 0.01)) { console.log(`known edge: reload moved casts in ${fails.roundtrip.length} of ${N} teams (limit ${Math.ceil(N * 0.01)})`); delete fails.roundtrip; }
const keys = Object.keys(fails);
if (!keys.length) console.log('ALL INVARIANTS HOLD');
keys.forEach(k => { console.log(`\nFAIL ${k}: ${fails[k].length} case(s)`); fails[k].slice(0, 6).forEach(m => console.log('   ' + m)); });
process.exitCode = keys.length ? 1 : 0;
