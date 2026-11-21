// Hand-written cases with known answers (from SchaleDB and what the player confirmed in game).
const { load } = require('./load');
const E = load(), D = E.SCHALE;
let bad = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)); };
const id = n => +Object.keys(D).find(k => D[k].name === n);
function team(names, lv) {
  const roster = names.map(id), t = { name: 'T', custom: true, roster, casts: [], set: { lv: lv || {}, ext: {}, ue: {}, wait: {} }, events: [] };
  E.state.teams.length = 0; E.state.teams.push(t); E.state.team = 0; E.setTotal(180); return t;
}
const cast = (t, who, tm) => { const c = { t: tm, who: id(who), after: undefined }; delete c.after; t.casts.push(c); return c; };
const spends = (t, who) => t.casts.filter(c => c.who === id(who)).sort((a, b) => b.t - a.t).map(c => E.spendOf(t, c));

let t = team(['Ibuki (Swimsuit)', 'Aru']); [170, 150, 130].forEach(x => cast(t, 'Ibuki (Swimsuit)', x));
eq('Ibuki (Swimsuit): first EX is free, then 3', spends(t, 'Ibuki (Swimsuit)'), [0, 3, 3]);

t = team(['Hina (Dress)', 'Aru']); [170, 160, 150, 140, 130].forEach(x => cast(t, 'Hina (Dress)', x));
eq('Hina (Dress): 6, then three free follow-ups, then 6 again', spends(t, 'Hina (Dress)'), [6, 0, 0, 0, 6]);

t = team(['Toki', 'Aru']); [170, 160, 150, 140, 130].forEach(x => cast(t, 'Toki', x));
eq('Toki: 2, then three Abi-Eshuh EX at 5, then 2 again', spends(t, 'Toki'), [2, 5, 5, 5, 2]);

t = team(['Kisaki (Swimsuit)', 'Aru']); [170, 160, 150, 140].forEach(x => cast(t, 'Kisaki (Swimsuit)', x));
eq('Kisaki (Swimsuit): 2, two free Banzai, then 2', spends(t, 'Kisaki (Swimsuit)'), [2, 0, 0, 2]);

t = team(['Noa (Pajamas)', 'Aru']); [170, 160, 150, 140].forEach(x => cast(t, 'Noa (Pajamas)', x));
eq('Noa (Pajamas): 5, 5, then Shh at 3, then 5', spends(t, 'Noa (Pajamas)'), [5, 5, 3, 5]);

t = team(['Mika (Swimsuit)', 'Aru']); const m = cast(t, 'Mika (Swimsuit)', 170);
eq('Mika (Swimsuit): normal EX 4', E.spendOf(t, m), 4); E.setForm(m, '0'); eq('Mika (Swimsuit): Silent Resolve 2', E.spendOf(t, m), 2); E.setForm(m, '1'); eq('Mika (Swimsuit): Relax a Little 0', E.spendOf(t, m), 0);

t = team(['Ui', 'Aru'], { [id('Ui')]: { ex: 1, basic: 10, sub: 10 } }); const u = cast(t, 'Ui', 170);
eq('Ui at EX 1 costs 5', E.spendOf(t, u), 5); t.set.lv[id('Ui')].ex = 4; eq('Ui at EX 4 costs 4', E.spendOf(t, u), 4); t.set.lv[id('Ui')].ex = 5; eq('Ui at EX 5 costs 3', E.spendOf(t, u), 3);
E.setSpend(u, 2); eq('a typed cost wins over the level', E.spendOf(t, u), 2);

t = team(['Hoshino (Armed · Fortification)'.replace(' · Fortification', ' · Fortification'), 'Aru']); eq('the two Hoshino (Armed) are told apart', [D[10098].name, D[10099].name], ['Hoshino (Armed · Fortification)', 'Hoshino (Armed · Targeted Breakthrough)']);

// Cost reductions
t = team(['Ui', 'Mika', 'Aru']); { const u = cast(t, 'Ui', 170); u.target = id('Mika'); [160, 150, 140].forEach(x => cast(t, 'Mika', x));
  eq('Ui halves Mika next two EX (Mika 6 -> 3, 3, then 6)', spends(t, 'Mika'), [3, 3, 6]); }
t = team(['Ui', 'Mika', 'Aru']); { const u = cast(t, 'Ui', 170); u.target = id('Mika'); cast(t, 'Mika', 171);
  eq('a cast before the reduction lands is not reduced', spends(t, 'Mika'), [6]); }
t = team(['Fuuka (New Year)', 'Mika', 'Aru']); { const f = cast(t, 'Fuuka (New Year)', 170); f.target = id('Mika'); [160, 150].forEach(x => cast(t, 'Mika', x));
  eq('Fuuka (New Year): one reduced EX, then normal', spends(t, 'Mika'), [3, 6]); }
t = team(['Seia', 'Mika', 'Aru'], { [id('Seia')]: { ex: 5, basic: 10, sub: 10 } }); { const s1 = cast(t, 'Seia', 170); s1.target = id('Mika'); [160, 150, 140].forEach(x => cast(t, 'Mika', x));
  eq('Seia at EX 5: two reduced EX', spends(t, 'Mika'), [3, 3, 6]); }
t = team(['Seia', 'Mika', 'Aru'], { [id('Seia')]: { ex: 3, basic: 10, sub: 10 } }); { const s1 = cast(t, 'Seia', 170); s1.target = id('Mika'); [160, 150].forEach(x => cast(t, 'Mika', x));
  eq('Seia below EX 5: one reduced EX', spends(t, 'Mika'), [3, 6]); }
t = team(['Yuzu (Armed)', 'Mika', 'Aru']); { const y = cast(t, 'Yuzu (Armed)', 170); y.target = id('Mika'); [160, 150, 140, 130].forEach(x => cast(t, 'Mika', x));
  eq('Yuzu (Armed): three reduced EX', spends(t, 'Mika'), [3, 3, 3, 6]); }
t = team(['Kisaki (Swimsuit)', 'Mika', 'Aru']); { cast(t, 'Kisaki (Swimsuit)', 170); [160, 150].forEach(x => cast(t, 'Mika', x)); [160].forEach(x => cast(t, 'Aru', x));
  eq('Kisaki (Swimsuit): -1 for the other Strikers next EX', [spends(t, 'Mika'), spends(t, 'Aru')], [[5, 6], [3]]); }
t = team(['Shiroko (Swimsuit)', 'Mika', 'Aru']); { [170, 160].forEach(x => cast(t, 'Mika', x)); cast(t, 'Shiroko (Swimsuit)', 165);
  eq('Shiroko (Swimsuit): -1 on everyone first EX of the battle (not her own)', [spends(t, 'Mika'), spends(t, 'Shiroko (Swimsuit)')], [[5, 6], [D[20027].cost]]); }
t = team(['Ui', 'Mika', 'Aru']); { const u = cast(t, 'Ui', 170); u.target = id('Mika'); const m = cast(t, 'Mika', 160); m.cost = 1; eq('a hand-typed cost beats a reduction', spends(t, 'Mika'), [1]); }

// Cost recovery
{ const near = (x, y) => Math.abs(x - y) < 1e-9;
  t = team(['Azusa (Racing)', 'Mika', 'Aru']); cast(t, 'Azusa (Racing)', 170); let w = E.castWindows(t, t.casts);
  eq('Azusa (Racing): one 25 s window of +986 (EX 5)', [w.length, near(w[0].a - w[0].b, 25), near(w[0].extra, 986/10000*(1 + E.regenInfo(t).boost))], [1, true, true]);
  t = team(['Hifumi', 'Mika', 'Aru']); [170, 150, 130].forEach(x => cast(t, 'Hifumi', x)); w = E.castWindows(t, t.casts);
  eq('Hifumi: 5 s of +1861 after every EX (Sub Lv 10)', [w.length, near(w[0].a - w[0].b, 5), near(w[0].extra, 1861/10000)], [3, true, true]);
  t = team(['Yukari (Swimsuit)', 'Mika', 'Aru']); [170, 150, 130, 110].forEach(x => cast(t, 'Yukari (Swimsuit)', x)); w = E.castWindows(t, t.casts);
  eq('Yukari (Swimsuit): every 2nd EX only', w.map(x => x.a).sort((a, b) => b - a), [150, 110]);
  t = team(['Noa (Pajamas)', 'Mika', 'Aru']); [170, 150, 130, 110, 90, 70].forEach(x => cast(t, 'Noa (Pajamas)', x)); w = E.castWindows(t, t.casts);
  eq('Noa (Pajamas): after the 2nd EX of every 3 (30 s, Basic Lv 10)', [w.map(x => x.a).sort((a, b) => b - a), near(w[0].a - w[0].b, 30), near(w[0].extra, 803/10000)], [[150, 90], true, true]);
  t = team(['Hoshino (Swimsuit)', 'Mika', 'Aru']); cast(t, 'Hoshino (Swimsuit)', 170); w = E.castWindows(t, t.casts);
  eq('Hoshino (Swimsuit): +684 for the 50 s her EX lasts', [w.length, near(w[0].a - w[0].b, 50), near(w[0].extra, 684/10000)], [1, true, true]);
  t = team(['Kurumi', 'Mika', 'Aru']); cast(t, 'Kurumi', 170); w = E.castWindows(t, t.casts);
  eq('Kurumi: flat part always, +854 for the 10 s of her shield', [near(E.regenInfo(t).flat, 183/10000), w.length, near(w[0].a - w[0].b, 10), near(w[0].extra, 854/10000)], [true, 1, true, true]);
  t = team(['Mika', 'Aru']); eq('no cost-recovery passive: no extra windows', [E.castWindows(t, []).length, E.regenInfo(t).flat], [0, 0]);
  const red = Object.keys(D).filter(k => D[k].school === 'RedWinter' && +k !== 10017 && D[k].squad === 'Main').slice(0, 2).map(k => D[k].name);
  t = team(['Cherino', ...red, 'Aru']); eq('Cherino with two other Red Winter students: third value of her list', near(E.regenInfo(t).flat, D[10017].regenFx[0].values[2][9]/10000), true);
  t = team(['Cherino', 'Aru', 'Mika']); eq('Cherino alone: base value', near(E.regenInfo(t).flat, D[10017].regenFx[0].values[0][9]/10000), true);
  // the extra recovery changes the cost the model reports
  t = team(['Hifumi', 'Mika', 'Aru']); cast(t, 'Hifumi', 170); const T0 = 160, withFx = E.costAt(t, -1, T0, E.castsExcept(t, -1)), r0 = E.regenInfo(t).auto;
  eq('Hifumi: cost 10 s after her EX = rate x elapsed + 5 s of the passive - her EX cost',
    near(withFx, Math.min(10, r0*(178.02 - 170) + 0) - D[10003].cost + r0*(170 - T0) + 5*1861/10000*(1 + E.regenInfo(t).boost)), true); }

// No carry: targets are explicit
{ const nag = 'Nagisa (Swimsuit)';
  t = team([nag, 'Mika', 'Aru']); const n1 = cast(t, nag, 170); const m1 = cast(t, 'Mika', 160); m1.cost = 3;
  const over = () => E.costModel(t, E.allResolved()).ev.find(e => e.i === t.casts.indexOf(m1));
  eq('Cost Overload does nothing until a target is picked', over().overload, false);
  n1.target = id('Mika'); E.applyChains(t); eq('picking Mika as the target turns it on', E.allResolved().some(x => x.r.buffs.some(b => b.stat === 'CostOverload')), true);
  t = team(['Ui', 'Mika', 'Aru']); const u = cast(t, 'Ui', 170); cast(t, 'Mika', 160); eq('a reduction without a target goes nowhere', spends(t, 'Mika'), [6]);
  const old = { name: 'old', carry: id('Mika'), roster: [id('Ui'), id('Mika')], casts: [{ t: 170, who: id('Ui') }, { t: 160, who: id('Mika') }], set: { lv: {}, ext: {}, ue: {}, wait: {} } };
  E.dropCarry(old); eq('an old team with a carry: the carry becomes the target of the casts that needed one', [old.carry, old.casts[0].target, old.casts[1].target], [undefined, id('Mika'), undefined]); }

// Cost reduction markers placed by the player
{ t = team(['Kokona', 'Mika', 'Aru']); cast(t, 'Mika', 160); cast(t, 'Mika', 140); cast(t, 'Kokona', 140.5); cast(t, 'Aru', 139); t.reds = [{ id: 'a', t: 150, n: 1, except: id('Kokona') }];
  eq('marker: the next EX of everyone but Kokona costs 1 less, once each', [spends(t, 'Mika'), spends(t, 'Kokona'), spends(t, 'Aru')], [[6, 5], [2], [3]]);
  t.reds = [{ id: 'b', t: 150, n: 2, to: id('Mika') }]; eq('marker for one student, 2 less', [spends(t, 'Mika'), spends(t, 'Aru')], [[6, 4], [4]]);
  t.reds = [{ id: 'c', t: 150, n: 9, to: id('Aru') }]; eq('a marker never takes the price below 0', spends(t, 'Aru'), [0]);
  t.reds = []; eq('no markers: normal prices', spends(t, 'Mika'), [6, 6]); }

// Buff wording: direction follows the skill text, and no raw stat name leaks into a label
{ const lab = (sid, which) => { const d = D[sid]; return (which === 'pub' ? d.public.effects.filter(e => e.type === 'Buff') : d.buffs).map(b => E.buffLabel(b.stat, b.target, b.values)); };
  eq('Kanna (Swimsuit): her passive reduces damage taken', lab(10096, 'pub').includes('Self DMG Taken Down'), true);
  eq('Wakamo (Swimsuit): her drawback raises damage taken', lab(10043, 'pub').includes('Self DMG Taken Up'), true);
  eq('Himari (Armed) debuff: the enemy takes MORE weakness damage', lab(20054, 'ex').some(l => l.startsWith('Enemy Weakness DMG Taken Up')), true);
  const raw = []; Object.keys(D).forEach(i => { [...(D[i].buffs || []), ...((D[i].public || {}).effects || []).filter(e => e.type === 'Buff'), ...(D[i].forms || []).flatMap(f => f.buffs)].forEach(b => { const l = E.buffLabel(b.stat, b.target, b.values); if(/_/.test(l)) raw.push(l); }); });
  eq('no buff label shows a raw stat name', [...new Set(raw)], []); }


// A student cannot cast again while her own EX animation is still playing
{ t = team(['Neru (School)', 'Mika', 'Aru']); t.startCost = 10; const n1 = cast(t, 'Neru (School)', 170); n1.t = 179; n1.cb = 10; const n2 = cast(t, 'Neru (School)', 169.9); n2.after = E.cid(n1);
  E.applyChains(t); const dur = E.animDur(t, n1);
  eq('chained right after her own EX: waits until the animation ends', n2.t <= +(n1.t - dur).toFixed(2) + 1e-9 && n2.t > n1.t - dur - 1.5, true);
  eq('and is not flagged as busy there', E.ownBusy(t, n2, n2.t), null);
  eq('a time inside the animation is flagged busy', E.ownBusy(t, { who: id('Neru (School)') }, n1.t - dur/2) !== null, true); }


// Lock: a locked row is never moved by the planner
{ t = team(['Mika', 'Aru', 'Kokona']); const a = cast(t, 'Mika', 170); a.cb = 6; const b = cast(t, 'Aru', 160); b.cb = 3;
  E.applyChains(t); const tb = b.t, ta = a.t; b.lock = true; t.startCost = 5; E.applyChains(t);
  eq('locked row stays put when the start cost changes', b.t, tb);
  eq('an unlocked one is placed again', a.t !== ta, true);
  delete b.lock; E.applyChains(t); eq('unlocking lets the planner place it again', b.t !== tb, true); }


console.log(bad ? `\n${bad} scenario(s) failed` : '\nALL SCENARIOS PASS'); process.exit(bad ? 1 : 0);
