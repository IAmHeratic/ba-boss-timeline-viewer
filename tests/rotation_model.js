// Model-based test of the Rotation table: random SEQUENCES of the edits a player makes (type a cost, step it with the arrow keys, type a time, tie/untie a row, change the student,
// add / insert / delete / lock rows, ...) are run through the same functions the page's handlers call (op* and placeByCost in index.html), the planner settles after every edit like the page's render does,
// and after EVERY edit the rules below are checked. When one breaks, the sequence is shrunk to the fewest edits that still break it and printed so it can be replayed.
//
// Usage: node tests/rotation_model.js [sequences=200] [seed=1] [--files]     (--files also starts from every rotation in tests/fixtures and ~/Documents/Blue Archive PC/Rotations)
//
// THE RULES (what the player has asked for, one by one; see tests/ROTATION_TESTING.md):
//   ORDER     the order of the rows is the player's. Changing a cost / student / target / price / tie / lock never reorders the table. A typed time moves that row (and the rows tied to it)
//             and nothing else. Insert / add / delete put the row exactly where asked and leave the rest in order.
//   ABOVE     rows above the edited row never move.
//   FROZEN    only what the edit needs moves: the rows tied to the edited row, and (cost edit only) rows that would otherwise end up above it. Nothing else changes time.
//   LOCKED    a locked row is never touched.
//   ASKED     a typed cost is honoured whenever the team can have it anywhere after the row above (checked against a brute-force sweep); when it cannot, the row gets a cost the team can really have.
//             an arrow step goes to the very next cost that can be had, never skipping one. A typed time is exactly that time.
//   STABLE    settling again changes nothing; saving and reloading the file changes nothing.
//   SANE      times inside the fight, chained rows after their parent, rows the planner placed by cost are affordable unless the team can never afford them.
const fs = require('fs'), path = require('path');
const { load } = require('./load');
const args = process.argv.slice(2), NUM = args.filter(a => !a.startsWith('--')).map(Number);
const N = NUM[0] || 200, SEED = NUM[1] || 1, USE_FILES = args.includes('--files');
const E = load(), D = E.SCHALE, B = E.BOSSES;
let s = SEED >>> 0; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const clone = o => JSON.parse(JSON.stringify(o));
const TOL = 1e-9;

// ------------------------------------------------------------------ states to start from
const ids = Object.keys(D).map(Number), mains = ids.filter(i => D[i].squad === 'Main'), supports = ids.filter(i => D[i].squad === 'Support');
function install(t) { E.state.teams.length = 0; E.state.teams.push(t); E.state.team = 0; E.setTotal(t.limit ?? 180); E.winCache.ok = false; }
const settle = t => { E.winCache.ok = false; E.applyChains(t); };
function randomTeam() {
  const roster = [...new Set([...Array.from({ length: 4 }, () => pick(mains)), ...Array.from({ length: 2 }, () => pick(supports))])];
  const t = { name: 'T', custom: true, roster, casts: [], set: { lv: {}, ext: {}, ue: {}, wait: {} }, events: [] };
  roster.forEach(id => { if (rnd() < .5) t.set.ue[id] = pick([0, 30, 40, 50, 60]); if (rnd() < .4) t.set.lv[id] = { ex: ri(1, 5), basic: ri(1, 10), sub: ri(0, 10) }; });
  if (rnd() < .6) { const b = pick(B), d = pick(b.diffs); t.boss = { raid: b.id, diff: d.k, terrain: pick(b.terrains) }; t.limit = d.sec; }
  install(t);
  if (rnd() < .3) t.startCost = ri(0, 6);
  const T = E.clock().TOTAL;
  if (rnd() < .4) for (let g = ri(1, 2); g > 0; g--) t.events.push({ id: 'g' + g, type: 'groggy', t: +(T - 20 - rnd() * (T - 60)).toFixed(2), dur: 10 });
  if (rnd() < .3) t.events.push({ id: 'ph', type: 'phase', t: +(T - 30 - rnd() * (T - 80)).toFixed(2), dur: pick([2, 3, 6]) });   // nobody can cast during a phase transition
  // a rotation built the way a player builds one: Add cast (chained or by cost), then a few hand edits, settling after each (the page renders after every edit)
  const n = ri(3, 16), chainNew = rnd() < .4;
  for (let k = 0; k < n; k++) {
    const who = pick(roster), c = E.opAddCast(t, who, rnd() < .4 ? true : chainNew);
    if (E.targetsAlly(who) && roster.length > 1 && rnd() < .8) c.target = pick(roster.filter(x => x !== who));
    settle(t);
  }
  const ord = E.rowOrder(t), lockN = rnd() < .5 ? ri(0, Math.floor(ord.length / 2)) : 0;
  ord.slice(0, lockN).forEach(c => { c.lock = true; });   // the rows already played are locked
  if (rnd() < .4 && ord.length > 2) { const c = ord[ri(lockN, ord.length - 1)]; if (!c.lock) { E.setSpend(c, ri(0, 6)); settle(t); } }
  return t;
}
function fixtureTeams() {
  const out = [], dirs = [path.join(__dirname, 'fixtures'), path.join(process.env.USERPROFILE || process.env.HOME || '', 'Documents', 'Blue Archive PC', 'Rotations')];
  for (const dir of dirs) { if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
      let d; try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
      if (!d.teams) continue; delete d.images;
      d.teams.forEach((tm, ti) => { if ((tm.casts || []).length >= 3 && tm.casts.length <= 60) out.push({ name: f + '#' + ti, doc: d, ti }); });
    } }
  return out;
}
function startFromDoc(fx) {   // exactly like opening the file: a new team object, settled once as loaded
  const d = clone(fx.doc); Object.keys(E.state).forEach(k => delete E.state[k]); Object.assign(E.state, d, { team: fx.ti });
  const t = E.team(); E.setTotal(+(t.limit ?? 180)); E.winCache.ok = false; settle(t); return t;
}

// ------------------------------------------------------------------ the edits (rows are named by their place in the table, so a sequence can be replayed on a reloaded copy)
const shown = (t, i) => { const ev = E.costModel(t, E.allResolved()).ev.find(e => e.i === i), c = t.casts[i]; return ev ? (c.cb != null && Math.abs(ev.before - c.cb) <= 0.02 ? c.cb : +ev.before.toFixed(1)) : null; };
function reachable(t, i, want, aboveSet, keepSet) {   // brute force: every cost the row could see at some moment after the row above it, with the rows that stay below it left out (they come after it)
  const me = t.casts[i], tt = Object.assign(Object.create(t), { casts: t.casts.filter(x => aboveSet.has(x) || keepSet.has(x) || x === me) }), ii = tt.casts.indexOf(me);
  const above = [...aboveSet].filter(x => x !== me && !E.chainKids(t, me).has(x)).sort((a, b) => a.t - b.t)[0], hi = above ? above.t - 0.01 : E.clock().TOTAL, ok = E.castable(tt, me, want, E.castsExcept(tt, ii)), out = [];
  const ex = E.castsExcept(tt, ii);
  for (let T = hi; T >= 0; T = +(T - 0.01).toFixed(2)) if (ok(T)) out.push(E.costAt(tt, ii, T, ex));
  return out;
}
function describe(t, c) { return D[c.who].name + '@' + (process.env.PRECISE ? c.t : c.t.toFixed(2)) + (c.cb != null ? ' cb' + c.cb : '') + (c.after ? ' ch' : '') + (c.lock ? ' L' : ''); }

const OPS = ['cost', 'cost', 'cost', 'up', 'down', 'same', 'time', 'time', 'nudge', 'clear', 'chain', 'who', 'spend', 'target', 'delete', 'insA', 'insB', 'add', 'lock'];
function chooseOp(t) {   // returns a replayable description: {k, pos, a}
  const ord = E.rowOrder(t), free = ord.map((c, p) => [c, p]).filter(x => !x[0].lock);
  const k = pick(OPS);
  if (k === 'add') return { k, a: [pick(t.roster), rnd() < .5] };
  if (k === 'lock') return { k, pos: ri(0, ord.length - 1) };
  if (!free.length) return null;
  const pos = pick(free)[1];
  if (k === 'insA' || k === 'insB') return { k, pos };
  if (k === 'cost') return { k, pos, a: pick([ri(0, E.capOf(t)), ri(0, E.capOf(t)), +(rnd() * E.capOf(t)).toFixed(1)]) };
  if (k === 'up' || k === 'down') return { k, pos, a: rnd() < .15 };
  if (k === 'time') { const nb = ord[Math.max(0, Math.min(ord.length - 1, pos + pick([-1, 1])))]; return { k, pos, a: pick([+(rnd() * E.clock().TOTAL).toFixed(2), +(nb.t + pick([0, 0.01, -0.01])).toFixed(2)]) }; }
  if (k === 'nudge') return { k, pos, a: pick([1, -1, 0.1, -0.1]) };
  if (k === 'who') return { k, pos, a: pick(t.roster) };
  if (k === 'spend') return { k, pos, a: pick(['', 0, 1, 2, 3, 4, 5, 6]) };
  if (k === 'target') return { k, pos, a: pick([null, ...t.roster]) };
  return { k, pos };
}
const STRUCT = new Set(['delete', 'insA', 'insB', 'add']), TIMEOP = new Set(['time', 'nudge']);

// Applies one edit and settles (like the page: edit, save, render => applyChains). Returns what the checks need.
function applyOp(t, op) {
  const ord = E.rowOrder(t), x = op.pos != null ? ord[Math.min(op.pos, ord.length - 1)] : null, i = x ? t.casts.indexOf(x) : -1;
  if (x && x.lock && !['lock', 'insA', 'insB'].includes(op.k)) return null;   // a locked row's boxes and buttons are disabled in the page (so a shrunk sequence cannot edit one)
  const info = { op, x, ordBefore: ord, pos: ord.indexOf(x), snap: new Map(t.casts.map(c => [c, { t: c.t, cb: c.cb, after: c.after, lock: c.lock, who: c.who, cost: c.cost, form: c.form, target: c.target, hit: c.hit, imgs: c.imgs }])),
    kids: x ? E.chainKids(t, x) : new Set(), cap: E.capOf(t) };
  info.aboveSet = new Set(ord.filter((c, p) => p < info.pos)); info.belowSet = new Set(ord.filter((c, p) => p > info.pos));
  if (x) info.shownBefore = shown(t, i);
  switch (op.k) {
    case 'cost': info.res = E.placeByCost(t, i, Math.max(-5, Math.min(info.cap, op.a)), 0); info.want = Math.max(-5, Math.min(info.cap, op.a)); t.estimated = false; break;
    case 'same': { const cur = info.shownBefore; if (cur == null) return null; info.res = E.placeByCost(t, i, cur, 0); info.want = cur; break; }
    case 'up': case 'down': { const cur = info.shownBefore; if (cur == null) return null; info.cur = cur; info.up = op.k === 'up'; info.want = E.stepWant(cur, info.up, op.a); info.res = E.opStepCost(t, i, cur, info.up, op.a); break; }
    case 'time': E.opSetTime(t, i, op.a); break;
    case 'nudge': E.opNudgeTime(t, i, op.a); break;
    case 'clear': E.opClearTime(t, i); break;
    case 'chain': E.opToggleChain(t, i); break;
    case 'who': E.opSetWho(t, i, op.a); break;
    case 'spend': E.setSpend(x, op.a); break;
    case 'target': if (op.a == null) delete x.target; else x.target = op.a; break;
    case 'delete': E.opRemove(t, i); break;
    case 'insA': info.n = E.opInsert(t, x, 'above'); break;
    case 'insB': info.n = E.opInsert(t, x, 'below'); break;
    case 'add': info.n = E.opAddCast(t, op.a[0], op.a[1]); break;
    case 'lock': E.opLock(t, i); break;
  }
  if (process.env.DBG2) console.log('  (before settle)', t.casts.map(c => c.t + (c.after ? 'ch' : '') + (c.cb != null ? 'cb' : '')).join(' '));
  settle(t); info.afterSettle1 = new Map(t.casts.map(c => [c, c.t]));
  return info;
}

// ------------------------------------------------------------------ the rules
function check(t, info) {
  const fails = [], f = (rule, msg) => fails.push({ rule, msg }), op = info.op, T = E.clock().TOTAL;
  const x = info.x, alive = new Set(t.casts), ordAfter = E.rowOrder(t), kidsNow = x && alive.has(x) ? E.chainKids(t, x) : new Set();
  const before = c => info.snap.get(c), moved = c => before(c) && Math.abs(c.t - before(c).t) > TOL;
  const others = t.casts.filter(c => before(c) && c !== x && !(info.kids.has(c)) && !kidsNow.has(c));
  // SANE
  t.casts.forEach(c => { if (!(Number.isFinite(c.t) && c.t >= 0 && c.t <= T)) f('SANE time-range', `${describe(t, c)} outside 0..${T}`); });
  // (a locked row stays put even when its parent is edited to a later time, so locked rows are exempt)
  t.casts.forEach(c => { if (c.after && !c.lock) { const p = t.casts.find(y => y.id === c.after); if (p && c.t > p.t + 1e-9) f('SANE chained-after-parent', `${describe(t, c)} is before its parent ${describe(t, p)}`); } });
  // LOCKED
  info.snap.forEach((b, c) => { if (!b.lock || !alive.has(c) || (x === c && op.k === 'lock')) return;
    for (const k of Object.keys(b)) if (JSON.stringify(c[k]) !== JSON.stringify(b[k])) f('LOCKED untouched', `locked row ${D[c.who].name} changed ${k}: ${JSON.stringify(b[k])} -> ${JSON.stringify(c[k])}`); });
  if (op.k === 'lock') { if (x && ((!!x.lock) === (!!before(x).lock))) f('LOCKED toggle', 'lock did not toggle'); }
  // ORDER
  if (!STRUCT.has(op.k)) {
    if (TIMEOP.has(op.k)) {   // the edited row (and the rows tied to it) go where the time says; every other row keeps its place relative to the others
      const a = info.ordBefore.filter(c => c !== x && !info.kids.has(c) && !kidsNow.has(c)), b = ordAfter.filter(c => c !== x && !info.kids.has(c) && !kidsNow.has(c));
      if (a.map(c => t.casts.indexOf(c)).join() !== b.map(c => t.casts.indexOf(c)).join()) f('ORDER time-edit-reordered-others', 'rows other than the edited one changed their order: ' + b.map(c => D[c.who].name.slice(0, 5) + c.t.toFixed(1)).join(' '));
    } else {
      const a = info.ordBefore.map(c => t.casts.indexOf(c)).join(), b = ordAfter.map(c => t.casts.indexOf(c)).join();
      if (a !== b) f('ORDER reordered', `${op.k} on row ${info.pos + 1} changed the order of the table:\n      before ${info.ordBefore.map(c => D[c.who].name.slice(0, 5) + ' ' + before(c).t.toFixed(2)).join(' | ')}\n      after  ${ordAfter.map(c => D[c.who].name.slice(0, 5) + ' ' + c.t.toFixed(2)).join(' | ')}`);
    }
  } else if (op.k === 'delete') {
    const a = info.ordBefore.filter(c => c !== x), b = ordAfter, same = a.length === b.length && a.every((c, k) => c === b[k]);
    if (alive.has(x)) f('ORDER delete', 'row still there'); else if (!same && !a.some(c => info.kids.has(c))) f('ORDER delete-reordered', 'deleting a row reordered the others');
  } else {
    const n = info.n, a = info.ordBefore, b = ordAfter.filter(c => c !== n);
    if (!(a.length === b.length && a.every((c, k) => c === b[k]) || a.some(c => info.snap.has(c) && E.chainKids(t, n).has(c)))) f('ORDER insert-reordered', 'adding a row reordered the others');
    if ((op.k === 'insA' || op.k === 'insB') && !(x.t < 0.02 && op.k === 'insB') && !(x.t > T - 0.02 && op.k === 'insA')) { const want = op.k === 'insA' ? info.pos : info.pos + 1, got = ordAfter.indexOf(n); if (got !== want && !a.some(c => E.chainKids(t, n).has(c))) f('ORDER insert-position', `new row asked at place ${want + 1}, it is at ${got + 1}`); }
    if (op.k === 'add') { if (ordAfter[ordAfter.length - 1] !== n && !ordAfter.slice(ordAfter.indexOf(n) + 1).every(c => c.t === n.t)) f('ORDER add-last', 'the added row is not the last one'); }
    if (n.t !== info.afterSettle1.get(n)) f('ORDER new-row-moved', 'settling moved the new row');
  }
  // ABOVE: rows above the edited row never move
  if (x && alive.has(x) && !STRUCT.has(op.k)) info.aboveSet.forEach(c => { if (alive.has(c) && !info.kids.has(c) && moved(c) && !kidsNow.has(c)) f('ABOVE moved', `row above (${D[c.who].name} ${before(c).t.toFixed(2)} -> ${c.t.toFixed(2)}) moved by a ${op.k} on row ${info.pos + 1}`); });
  // FROZEN: only what the edit needs moves
  {
    let allowed = new Set([...(info.kids)]); if (x) allowed.add(x);
    if (op.k === 'cost' || op.k === 'up' || op.k === 'down' || op.k === 'same') {   // rows that would otherwise end up above the edited row are pushed under it, with what is tied to them
      // the rows that now sit above (or on) the edited row slide under it; each slide can crowd the next row, which then slides too
      let at = x.t, moving = true, first = true; info.ordBefore.forEach((y, k) => { if (k <= info.pos || y.lock || !(info.belowSet.has(y) || info.kids.has(y))) return;
        const must = first ? (before(y).t > at + 1e-9 || (Math.abs(before(y).t - at) <= 1e-9 && t.casts.indexOf(y) < t.casts.indexOf(x))) : moving ? before(y).t >= at - 1e-9 : before(y).t > at + 1e-9; first = false;
        if (must) { allowed.add(y); at = Math.max(0, at - 0.01); moving = true; } else { at = before(y).t; moving = false; } });
    }
    if (STRUCT.has(op.k) && info.n) { allowed.add(info.n); t.casts.forEach(c => { if (before(c) && before(c).after !== c.after) allowed.add(c); }); }   // an inserted row ties the rows after it to follow it (each right after the one before): those moved on purpose
    if (op.k === 'delete' && x) info.kids.forEach(k => allowed.add(k));
    let grew = true; while (grew) { grew = false; t.casts.forEach(c => { if (c.after && !allowed.has(c)) { const p = t.casts.find(y => y.id === c.after); if (p && allowed.has(p)) { allowed.add(c); grew = true; } } }); }
    if (op.k === 'delete') allowed = new Set([...allowed, ...[...info.kids]]);
    if (process.env.SHOWCH && t.casts.some(c => before(c) && !allowed.has(c) && moved(c))) console.log('CHAINS\n  ' + t.casts.map(z => [D[z.who].name.slice(0, 5), z.t, z.id, '->', z.after, z.lock ? 'L' : '', z.cb != null ? 'cb' + z.cb : ''].join(' ')).join('\n  '));
    t.casts.forEach(c => { if (before(c) && !allowed.has(c) && moved(c)) f('FROZEN moved-without-need', `${describe(t, c)} (was ${before(c).t.toFixed(2)}) moved after ${op.k}${op.a != null && !Array.isArray(op.a) ? ' ' + op.a : ''} on row ${info.pos + 1}`); });
  }
  // ASKED (when a locked row sits below the edited one the cast may not pass it and the window shrinks in ways this sweep does not model, so those cases are only checked for the other rules)
  const lockedBelow = [...info.belowSet].some(c => c.lock && alive.has(c));
  const idx = x ? t.casts.indexOf(x) : -1;
  if ((op.k === 'cost' || op.k === 'same') && idx >= 0 && !lockedBelow) {
    const ev = E.costModel(t, E.allResolved()).ev.find(e => e.i === idx), want = Math.min(info.res ? info.res.want : info.want, info.cap), got = ev && ev.before;   // placeByCost raises the ask to what the cast spends (less only with Cost Over)
    const reach = reachable(t, idx, want, info.aboveSet, new Set(t.casts.filter(c => c.lock && c !== x)));   // locked rows below stay where they are, so they still count
    const can = reach.some(r => Math.abs(r - want) <= 0.012);
    if (got != null && can && Math.abs(got - want) > 0.03 && !(info.res && info.res.got != null && Math.abs(info.res.got - want) <= 0.03)) f('ASKED cost-not-honoured', `asked ${want}, the team can have it, but the row sees ${got.toFixed(2)}`);
    if (got != null && reach.length && !can && Math.abs(x.t - before(x).t) > TOL && !reach.some(r => Math.abs(r - got) <= 0.03) && got > -5 + 1e-6) f('ASKED cost-not-reachable', `asked ${want} (unreachable) and the row sees ${got.toFixed(2)}, which the team never has`);
  }
  if ((op.k === 'up' || op.k === 'down') && idx >= 0 && !lockedBelow) {
    const ev = E.costModel(t, E.allResolved()).ev.find(e => e.i === idx), got = ev && ev.before;
    const reach = reachable(t, idx, info.want, info.aboveSet, new Set(t.casts.filter(c => c.lock && c !== x)));
    const cand = reach.filter(r => info.up ? r >= info.want - 0.012 : r <= info.want + 0.012);
    if (cand.length && got != null) { const best = info.up ? Math.min(...cand) : Math.max(...cand); if (Math.abs(got - best) > 0.03 && Math.abs(got - info.want) > 0.03) f('ASKED step-skipped', `${op.k} from ${info.cur} wanted ${info.want}; the next cost the team can have is ${best.toFixed(2)}, the row sees ${got.toFixed(2)}`); }
    if (info.up && got != null && got < info.cur - 0.03 && cand.length) f('ASKED step-wrong-way', `up from ${info.cur} went to ${got.toFixed(2)}`);
    if (!info.up && got != null && got > info.cur + 0.03 && cand.length) f('ASKED step-wrong-way', `down from ${info.cur} went to ${got.toFixed(2)}`);
  }
  if (op.k === 'time' && x) { const want = Math.max(0, Math.min(T, +(+op.a).toFixed(3))); if (Math.abs(x.t - want) > 1e-6) f('ASKED time', `typed ${want}, row is at ${x.t}`); }
  // STABLE: settling again changes nothing; reload changes nothing
  { const a = t.casts.map(c => c.t); settle(t); const d = t.casts.map((c, k) => Math.abs(c.t - a[k])); if (d.some(v => v > TOL)) f('STABLE settle-twice', `a second settle moved rows by up to ${Math.max(...d).toFixed(3)}s`); }
  { const copy = clone(t), a = t.casts.map(c => c.t), keep = E.state.teams[0], ti = E.state.team; E.state.teams[E.state.team] = copy; E.winCache.ok = false;
    try { E.applyChains(copy); const d = copy.casts.map((c, k) => Math.abs(c.t - a[k])); if (d.some(v => v > 1e-6)) f('STABLE reload', `saving and reloading moved rows by up to ${Math.max(...d).toFixed(3)}s`); } finally { E.state.teams[ti] = t; E.winCache.ok = false; } }
  return fails;
}

// ------------------------------------------------------------------ run a sequence; shrink a failing one
function runSeq(start, ops, stopRule) {   // start(): a fresh team; returns the first failure or null
  const t = start(); const log = [];
  for (let k = 0; k < ops.length; k++) {
    let info; try { info = applyOp(t, ops[k]); } catch (e) { return { step: k, rule: 'THROW', msg: (e.stack || e).toString().split('\n').slice(0, 3).join(' | '), t }; }
    if (!info) continue;
    let fl; try { fl = check(t, info); } catch (e) { return { step: k, rule: 'THROW-check', msg: (e.stack || e).toString().split('\n').slice(0, 3).join(' | '), t }; }
    if (fl.length) { const hit = stopRule ? fl.find(x => x.rule === stopRule) : fl[0]; if (hit) return { step: k, rule: hit.rule, msg: hit.msg, more: fl.length - 1, t }; }
  }
  return null;
}
const failures = {}; let seqs = 0, edits = 0;
function note(label, start, ops, fail) {
  let cur = ops.slice(0, fail.step + 1);
  for (let k = cur.length - 2; k >= 0; k--) { const trial = cur.filter((_, j) => j !== k), r = runSeq(start, trial, fail.rule); if (r) cur = trial.slice(0, r.step + 1); }   // drop every earlier edit that is not needed
  const r = runSeq(start, cur, fail.rule) || fail;
  (failures[r.rule] = failures[r.rule] || []).push({ label, ops: cur, msg: r.msg, json: JSON.stringify(cur) });
}
function opText(o) { return o.k + (o.pos != null ? ' row ' + (o.pos + 1) : '') + (o.a != null ? ' ' + JSON.stringify(o.a) : ''); }

globalThis.DBG = !!process.env.DBG;
const t0 = Date.now(), ONLY = (args.find(a => a.startsWith('--only=')) || '').slice(7), startStates = [];
for (let n = 0; n < N; n++) { const sd = (SEED * 7919 + n * 104729) >>> 0; startStates.push({ label: `random seed ${SEED} #${n}`, key: String(n), sd, make: () => { s = sd; return randomTeam(); } }); }
if (USE_FILES) fixtureTeams().forEach((fx, k) => startStates.push({ label: 'file ' + fx.name, key: 'f' + k, sd: 1000 + k, file: true, make: () => { s = 1000 + k; return startFromDoc(fx); } }));
const show = t => E.rowOrder(t).map((c, k) => (k + 1) + ':' + describe(t, c)).join('\n      ');
for (const st of startStates) {
  if (ONLY && st.key !== ONLY) continue;
  const live = st.make(), ops = []; seqs++;   // ops are drawn from the live state as the run goes (the random stream continues from the team's), then replayed from a fresh start if one breaks a rule
  const len = st.file ? 14 : ri(6, 14); let fail = null; const FIX = (args.find(a => a.startsWith('--ops=')) || '').slice(6), fixed = FIX ? JSON.parse(FIX) : null;   // --ops='[{"k":"cost","pos":0,"a":9}]' replays exactly those edits
  if (ONLY) console.log('START\n      ' + show(live));
  for (let k = 0; k < (fixed ? fixed.length : len) && !fail; k++) {
    const op = fixed ? fixed[k] : chooseOp(live); if (!op) break; ops.push(op);
    let info; try { info = applyOp(live, op); } catch (e) { fail = { step: ops.length - 1, rule: 'THROW', msg: (e.stack || e).toString().split('\n').slice(0, 3).join(' | ') }; break; }
    if (!info) { ops.pop(); continue; } edits++;
    if (ONLY) console.log('AFTER ' + opText(op) + (info.res ? '  -> ' + JSON.stringify(info.res) : '') + '\n      ' + show(live));
    let fl; try { fl = check(live, info); } catch (e) { fl = [{ rule: 'THROW-check', msg: (e.stack || e).toString().split('\n').slice(0, 3).join(' | ') }]; }
    if (fl.length) fail = { step: ops.length - 1, rule: fl[0].rule, msg: fl[0].msg };
  }
  if (fail) note(st.label + ' (--only=' + st.key + ')', st.make, ops, fail);
}
const ms = Date.now() - t0, keys = Object.keys(failures);
console.log(`${edits} edits in ${seqs} sequences checked against the rules (${ms} ms)`);
if (!keys.length) console.log('ALL ROTATION RULES HOLD');
keys.sort().forEach(k => { console.log(`\nFAIL ${k}: ${failures[k].length} sequence(s)`); failures[k].slice(0, 3).forEach(x => { console.log('   ' + x.label + '\n   edits: ' + x.ops.map(opText).join(' ; ') + '\n   ' + x.msg); }); });
process.exitCode = keys.length ? 1 : 0;
