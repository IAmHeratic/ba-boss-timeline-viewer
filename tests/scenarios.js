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
// Casting Seia on Mika again before Mika has used the reduction must not stack a second one (reported 2026-11-24: Mika's EX kept getting cheaper)
t = team(['Seia', 'Mika', 'Aru'], { [id('Seia')]: { ex: 3, basic: 10, sub: 10 } }); { [170, 150, 130].forEach(x => { const s = cast(t, 'Seia', x); s.target = id('Mika'); }); [100, 90].forEach(x => cast(t, 'Mika', x));
  eq('Seia three times on Mika, no Mika cast between: one reduced EX, not a quarter', spends(t, 'Mika'), [3, 6]); }
t = team(['Seia', 'Mika', 'Aru'], { [id('Seia')]: { ex: 5, basic: 10, sub: 10 } }); { [170, 150, 130].forEach(x => { const s = cast(t, 'Seia', x); s.target = id('Mika'); }); [100, 90, 80].forEach(x => cast(t, 'Mika', x));
  eq('Seia at EX 5 repeated: still two reduced EX in a row (renewed, not stacked)', spends(t, 'Mika'), [3, 3, 6]); }
t = team(['Seia', 'Mika', 'Aru'], { [id('Seia')]: { ex: 5, basic: 10, sub: 10 } }); { const s1 = cast(t, 'Seia', 170); s1.target = id('Mika'); cast(t, 'Mika', 160); const s2 = cast(t, 'Seia', 150); s2.target = id('Mika'); [140, 130, 120].forEach(x => cast(t, 'Mika', x));
  eq('Seia renews after Mika used one: back to two reduced EX', spends(t, 'Mika'), [3, 3, 3, 6]); }
t = team(['Seia', 'Ui', 'Mika'], { [id('Seia')]: { ex: 3, basic: 10, sub: 10 } }); { const s = cast(t, 'Seia', 170); s.target = id('Mika'); const u = cast(t, 'Ui', 165); u.target = id('Mika'); cast(t, 'Mika', 150);
  eq('two different givers on Mika still both apply (6 -> 3 -> 2)', spends(t, 'Mika'), [2]); }
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


// Geburah: the heater (Overload = +500 Cost Recovery for every ally) and the Ice Pillar can be put on the timeline (reported 2026-11-25: neither could be added)
{ const near = (x, y) => Math.abs(x - y) < 1e-6, geb = E.BOSSES.find(b => b.path === 'geburah'), dg = geb.diffs[geb.diffs.length - 1];
  const cost = (t, T) => { E.winCache.ok = false; return E.costAt(t, -1, T, E.castsExcept(t, -1), undefined, E.allWindows(t, t.casts)); };
  eq('every Geburah difficulty offers the Heater and the Ice Pillar in "Things on the field"', geb.diffs.map(d => ['Heater', 'Ice Pillar'].every(n => d.enemies.some(en => en.name === n && E.ENTITY[en.name]))), geb.diffs.map(() => true));
  t = team(['Mika', 'Aru', 'Kokona']); t.boss = { raid: geb.id, diff: dg.k, terrain: geb.terrains[0] };
  const T0 = 180, M = T0 - 25, base = cost(t, M), n = t.roster.length, gain = secs => 500 * n / 10000 * (1 + E.regenInfo(t).boost) * secs;
  t.events = [{ id: 'h', type: 'entity', ent: 'Heater', t: T0 }];
  eq('a heater with no Overload span changes nothing', near(cost(t, M), base), true);
  t.events[0].spans = [{ f: T0 - 5, to: T0 - 15 }];
  eq('Overload for 10 s: every ally gets +500 Cost Recovery (specials too: all units count)', near(cost(t, M) - base, gain(10)), true);
  t.events[0].spans = [{ f: T0 - 5, to: T0 - 15 }, { f: T0 - 18, to: T0 - 23 }];
  eq('two Overloads add up', near(cost(t, M) - base, gain(15)), true);
  t.events[0].spans = [{ f: T0 - 5, to: T0 - 15, in: [id('Mika')] }];
  eq('toggling allies off in a span takes their share away', near(cost(t, M) - base, gain(10) / 3), true);
  t.events = [{ id: 'p', type: 'entity', ent: 'Ice Pillar', t: 180 }];
  eq('an Ice Pillar has no Cost Recovery effect', near(cost(t, M), base), true);
  { const m = cast(t, 'Mika', 170); m.hit = 'p'; const k = E.entKills(t, t.casts);
    eq('an EX aimed at the Ice Pillar destroys it (who and when are known)', [k.length, k[0] && k[0].c === m], [1, true]); }
  // the Target box: a healing EX can be aimed at the Heater (reported 2026-11-25: it was missing), an attacking EX at the Ice Pillar
  t.events = [{ id: 'h', type: 'entity', ent: 'Heater', t: 180 }, { id: 'p', type: 'entity', ent: 'Ice Pillar', t: 170 }];
  { const healer = +Object.keys(E.SCHALE).find(k => E.SCHALE[k].exHeal && !E.aimsAtEnemy(+k)), hitter = id('Mika'), names = who => E.aimableEnts(t, who).map(e => e.ent);
    eq('a healing EX can be aimed at the Heater, not at the Ice Pillar', names(healer), ['Heater']);
    eq('an attacking EX can be aimed at the Ice Pillar, not at the Heater', names(hitter), ['Ice Pillar']); }
  { const allyHealer = +Object.keys(E.SCHALE).find(k => E.SCHALE[k].exHeal && E.targetsAlly(+k));
    eq('also a healer that picks an ally as target gets the Heater in her list', E.aimableEnts(t, allyHealer).map(e => e.ent), ['Heater']); } }

// Things on the field (Hod, Yesod): placed by hand, aimed at from the Rotation table, with their cost effects
{ const near = (x, y) => Math.abs(x - y) < 1e-6, hod = E.BOSSES.find(b => b.path === 'hod'), yes = E.BOSSES.find(b => b.path === 'yesod');
  const cost = (t, T) => { E.winCache.ok = false; return E.costAt(t, -1, T, E.castsExcept(t, -1), undefined, E.allWindows(t, t.casts)); };   // (the page clears this cache at the start of every render)
  t = team(['Mika', 'Aru', 'Kokona']); t.boss = { raid: hod.id, diff: hod.diffs[hod.diffs.length - 1].k, terrain: hod.terrains[0] };
  const n = 3, pen = (t, secs) => 350 * n / 10000 * (1 + E.regenInfo(t).boost) * secs;
  const base = cost(t, 160);
  t.events = [{ id: 'a', type: 'entity', ent: 'Erosion Tower', t: 170, dur: 30 }];
  eq('a tower you just placed costs nothing: the team is not inside its area until you say so', near(cost(t, 160), base), true);
  t.events[0].inFrom = 170;
  eq('Erosion Tower: every student in its area loses 350 Cost Recovery while it lives', near(base - cost(t, 160), pen(t, 10)), true);
  t.events[0].area = false; eq('team outside the area (old switch): nothing changes', near(cost(t, 160), base), true); delete t.events[0].area;
  t.events[0].inFrom = 170; t.events[0].inside = [id('Mika')];
  eq('only the students inside lose the 350: one of three inside = a third of the penalty', near(base - cost(t, 160), pen(t, 10) / 3), true);
  delete t.events[0].inFrom; delete t.events[0].inside;
  t.events[0].spans = [{ f: 170, to: 166, in: [id('Mika')] }, { f: 160, to: 156, in: [id('Mika'), id('Aru')] }];
  { const withSpans = cost(t, 150), saved = t.events; t.events = []; const plain = cost(t, 150); t.events = saved;
    eq('the zone grows and shrinks: two spans with their own students (1 student for 4 s, then 2 for 4 s)', near(plain - withSpans, 350 / 10000 * (1 + E.regenInfo(t).boost) * (1 * 4 + 2 * 4)), true); }
  delete t.events[0].spans; t.events[0].inFrom = 170; t.events[0].inside = [id('Mika')];
  t.events[0].inside = []; eq('nobody inside: no penalty', near(cost(t, 160), base), true); delete t.events[0].inside;
  t.events[0].inFrom = 165; eq('the team enters its area at 2:45: 5 s of penalty by 2:40', near(base - cost(t, 160), pen(t, 5)), true);
  t.events[0].inTo = 163; eq('and leaves at 2:43: 2 s in total', near(base - cost(t, 160), pen(t, 2)), true);
  t.events[0].inFrom = 170; delete t.events[0].inTo;
  const k = cast(t, 'Aru', 166), withTower = cost(t, 160); k.hit = 'a';
  eq('an EX aimed at the tower does not cut the span you set short (the cost before a cast must not depend on that cast)', near(cost(t, 160) - withTower, 0), true);
  t = team(['Mika', 'Aru', 'Kokona']); t.boss = { raid: yes.id, diff: yes.diffs[yes.diffs.length - 1].k, terrain: yes.terrains[0] };
  const b2 = cost(t, 164); t.events = [{ id: 'l', type: 'entity', ent: 'Blue Lantern', t: 175 }];
  const m1 = cast(t, 'Mika', 160); eq('a lantern nobody aims at: no reduction and no gain', [spends(t, 'Mika'), near(cost(t, 164), b2)], [[6], true]);
  const a1 = cast(t, 'Aru', 168); a1.hit = 'l'; E.winCache.ok = false;
  eq('Aru aims at the lantern: Mika is not the destroyer, so she pays full', spends(t, 'Mika'), [6]);
  eq('the destroyer’s own EX that kills it still pays full (Aru 4)', spends(t, 'Aru'), [4]);
  const a2 = cast(t, 'Aru', 150); eq('Aru’s next EX is the one that is halved (4 -> 2)', spends(t, 'Aru'), [4, 2]);
  const noHit = () => { const keep = a1.hit; delete a1.hit; const v = cost(t, 160); a1.hit = keep; return v; };
  eq('the team gets 0.6 cost per student at the moment it is destroyed (3 students: 1.8)', near(cost(t, 160) - noHit(), 1.8), true); }

// Who can aim at what: an ally-aimed EX never takes an entity, an enemy-aimed one does not take an ally
{ const side = n => { const i = id(n); return [E.targetsAlly(i), E.aimsAtEnemy(i)]; };
  eq('Seia (Swimsuit) aims at allies only', side('Seia (Swimsuit)'), [true, false]);
  eq('Nozomi aims at enemies only', side('Nozomi'), [false, true]);
  eq('Rio aims at allies only', side('Rio'), [true, false]);
  const bad = Object.keys(D).filter(k => E.targetsAlly(+k) && E.aimsAtEnemy(+k)); eq('nobody aims at both', bad, []);
  const y = E.BOSSES.find(b => b.path === 'yesod'); t = team(['Seia (Swimsuit)', 'Aru', 'Kokona']); t.boss = { raid: y.id, diff: y.diffs[y.diffs.length - 1].k, terrain: y.terrains[0] };
  t.events = [{ id: 'l', type: 'entity', ent: 'Blue Lantern', t: 175 }]; const sc = cast(t, 'Seia (Swimsuit)', 168); sc.hit = 'l';
  eq('a cast by an ally-aimed student cannot destroy a lantern', E.entKills(t, t.casts), []); }


// Specials are not on the field, so they are never targets (except the ones that summon something there)
{ eq('a Striker can be targeted', E.allyTargetable(id('Mika')), true);
  eq('a Special cannot (Kisaki, Nagisa Swimsuit)', [E.allyTargetable(id('Kisaki')), E.allyTargetable(id('Nagisa (Swimsuit)'))], [false, false]);
  eq('Himari (Armed) and Reisa (Magical) can: they put something on the field', [E.allyTargetable(20054), E.allyTargetable(20051)], [true, true]); }

// Raising a row's cost keeps the rows in order: the casts after it are pushed later, not jumped over
{ t = team(['Mika', 'Aru', 'Hikari']); const a = cast(t, 'Mika', 170), b = cast(t, 'Aru', 160), c = cast(t, 'Hikari', 150); a.cb = 4; b.cb = 2; c.cb = 2; E.applyChains(t);
  const order = () => [...t.casts].sort((x, y) => y.t - x.t).map(x => t.casts.indexOf(x)), seen = (k) => E.costAt(t, k, t.casts[k].t, E.castsExcept(t, k));
  const o0 = order(); E.placeByCost(t, 0, 7); E.applyChains(t);
  eq('Mika waits for 7 cost: she moves later', a.t < 170, true);
  eq('the order of the three rows is unchanged', order(), o0);
  eq('Mika now sees about 7 before her cast', Math.abs(seen(0) - 7) < 0.05, true);
  eq('Aru and Hikari are still after her in time', [b.t < a.t, c.t < b.t], [true, true]);
  E.placeByCost(t, 0, 10); E.applyChains(t);
  eq('waiting for the full 10 cost: still the same order, and whoever had to be pushed is chained behind her', [order(), (b.after === E.cid(a) || b.t < a.t - 0.005)], [o0, true]);
  b.lock = true; const bt = b.t; E.placeByCost(t, 0, 9); eq('a locked row below is never moved', b.t, bt); delete b.lock; }


// A phase transition with a length: nothing can be cast during it, so casts wait for its end
{ t = team(['Mika', 'Aru', 'Hikari']); t.startCost = 10; const a = cast(t, 'Mika', 179); a.cb = 10; const b = cast(t, 'Aru', 178); b.after = E.cid(a);
  t.events = [{ id: 'p', type: 'phase', t: 170, dur: 3 }]; a.t = 171; delete a.cb; a.after = undefined; delete a.after;   // Mika casts at 171; Aru is chained right after her
  E.applyChains(t); eq('Aru is chained after Mika, with 10 cost in the bank: she goes right away', b.t > 170, true);
  a.t = 170.0; b.t = 169.9; E.applyChains(t);
  eq('a cast chained right after one inside a phase transition waits until the transition ends (167)', b.t <= 167 + 1e-9 && b.t > 166.9, true);
  eq('and a time inside the transition is flagged', [E.ownBusy(t, { who: id('Hikari') }, 168.5) !== null, E.ownBusy(t, { who: id('Hikari') }, 160)], [true, null]); }


// Typing the cost a row already has (after a reduction) must not throw the row or the rows below it around (a bug that made them red)
{ t = team(['Seia', 'Mika', 'Aru']); const s = cast(t, 'Seia', 170); s.cb = 6; s.target = id('Mika'); const m = cast(t, 'Mika', 160); m.after = E.cid(s); const a = cast(t, 'Aru', 150); a.cb = 7;
  E.applyChains(t); const mikaPrice = E.spendOf(t, m), before = t.casts.map(x => x.t);
  eq('Seia halves Mika\u2019s EX (6 -> 3), so Mika\u2019s price is 3', mikaPrice, 3);
  E.placeByCost(t, t.casts.indexOf(m), mikaPrice); E.applyChains(t);
  eq('typing that same cost (3) leaves Mika where she was (within 0.05 s) and every other row where it was', t.casts.map((x, k) => Math.abs(x.t - before[k]) < 0.05), t.casts.map(() => true));
  const ev = E.costModel(t, E.allResolved()).ev; eq('and nothing is flagged as not enough cost', ev.every(e => e.ok), true); }


// A chained row far below the cast it is tied to must not jump up in front of the rows between them when something above it moves (it used to, and that reshuffled everything below)
{ t = team(['Mika', 'Aru', 'Seia']); t.startCost = 0;
  const p = cast(t, 'Aru', 170); p.cb = 4; const m = cast(t, 'Seia', 100); m.cb = 6; const x = cast(t, 'Mika', 60); x.after = E.cid(p);
  E.applyChains(t);
  eq('a chained row stays below the row that sits above it, even when it is tied to a cast higher up', x.t < m.t, true);
  E.placeByCost(t, t.casts.indexOf(p), 5); E.applyChains(t);
  eq('moving the cast it is tied to does not throw it above the rows in between', [p.t > m.t, x.t < m.t], [true, true]); }

// Typing a cost on a row means its place is settled: only that row moves (inside its slot); no other row moves, and the order stays
{ t = team(['Mika', 'Aru', 'Seia', 'Rio']); t.startCost = 10;
  const r1 = cast(t, 'Mika', 175); r1.cb = 10; const r2 = cast(t, 'Aru', 135); r2.cb = 5; const r3 = cast(t, 'Seia', 95); r3.cb = 5; const r4 = cast(t, 'Rio', 55); r4.after = E.cid(r3);
  E.applyChains(t); const b = t.casts.map(c => c.t); E.placeByCost(t, t.casts.indexOf(r2), 7); E.applyChains(t);
  eq('typing a cost moves that row and no other row', [r1.t === b[0], r3.t === b[2], r4.t === b[3], r2.t !== b[1]], [true, true, true, true]);
  eq('and every row keeps its place in the order', r1.t > r2.t && r2.t > r3.t && r3.t > r4.t, true);
  const c0 = t.casts.map(c => c.t); E.placeByCost(t, t.casts.indexOf(r2), 10); E.applyChains(t);
  const i2 = t.casts.indexOf(r2), seen2 = E.costAt(t, i2, r2.t, E.castsExcept(t, i2));
  eq('a cost that cannot be reached before the next row is still given: the row goes where the team has it and the rows below are pushed down after it', [Math.abs(seen2 - 10) < 0.05, r1.t === c0[0], r2.t > r3.t, r3.t > r4.t], [true, true, true, true]); }

// A cost that falls inside a phase transition cannot be had (nobody can cast there): the arrow keys take the next cost that can, in the direction pressed, and the row keeps what it really sees
{ t = team(['Aru', 'Mika']); t.events = [{ id: 'ph', type: 'phase', t: 120, dur: 6 }];
  const a = cast(t, 'Aru', 100); a.cb = 3; E.applyChains(t); const i = t.casts.indexOf(a), rate = +(t.regen ?? E.regenInfo(t).auto);
  const want = +(E.costAt(t, i, 117, E.castsExcept(t, i))).toFixed(2);   // a cost only reached inside the transition (114 to 120)
  const up = E.placeByCost(t, i, want, 1); eq('Up: the cost it asked for is blocked, so it takes the next higher cost that can be had, after the transition', [up.got > want, up.T <= 114 + 1e-6, a.cb === up.got], [true, true, true]);
  const dn = E.placeByCost(t, i, want, -1); eq('Down: the next lower cost, before the transition', [dn.got < want, dn.T >= 120 - 1e-6, a.cb === dn.got], [true, true, true]);
  E.applyChains(t); eq('and the planner leaves it there', [a.t === dn.T], [true]); }

// Green Relic heals: numbered in time order, the fifth makes the relic leave
{ const ev = {ent: 'Green Relic', t: 240, heals: [{t: 100, d: 20}, {t: 220}, {t: 200}, {t: 180}, {t: 160}, {t: 140}]};
  eq('heals are sorted in time order and capped at 5', E.relicHeals(ev).map(h => h.t), [220, 200, 180, 160, 140]);
  eq('the relic stays for 100 s (until its 5th heal at 140) when nothing else ends it', E.entLife(ev), 100);
  eq('an earlier leave time wins', E.entLife({...ev, dur: 60}), 60);
  eq('with fewer than 5 heals the relic stays to the end', E.entLife({ent: 'Green Relic', t: 240, heals: [{t: 200}]}), 0);
  { const t2 = team(['Serina', 'Aru']); const c1 = cast(t2, 'Serina', 230), c2 = cast(t2, 'Aru', 225); const ev2 = {id: 'r1', ent: 'Green Relic', t: 240}; c1.hit = 'r1'; c2.hit = 'r1';
    eq('a heal aimed at the relic from the Rotation table counts as a heal; a non-healer does not', E.relicHeals(ev2, t2.casts).map(h => h.t), [230]);
    eq('Serina can heal a relic, Aru cannot', [E.healsRelic(id('Serina')), E.healsRelic(id('Aru'))], [true, false]); }
  eq('other things are unaffected', E.entLife({ent: 'Erosion Tower', t: 200, dur: 30}), 30); }


console.log(bad ? `\n${bad} scenario(s) failed` : '\nALL SCENARIOS PASS'); process.exit(bad ? 1 : 0);
