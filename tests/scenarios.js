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


// Cost Overload edge: a 6-cost Mika cast under Overload needs 1 cost held. Typing "1" lands within 0.012 of it (0.998 shows as 1), and that must still count as paid.
{ const nag = 'Nagisa (Swimsuit)';
  const mikaSees = deficit => {   // Mika's cast with her cost before it set to 1 - deficit (by moving the start cost), Nagisa's Overload on her
    t = team([nag, 'Mika', 'Aru']); t.regen = 0.1; const n1 = cast(t, nag, 170); n1.target = id('Mika'); const m1 = cast(t, 'Mika', 160);
    const ev = () => E.costModel(t, E.allResolved()).ev.find(e => e.i === t.casts.indexOf(m1));
    t.startCost = 0; const base = ev().before; t.startCost = +(1 - deficit - base).toFixed(4); const e = ev();
    return { before: +e.before.toFixed(3), spend: e.spend, ok: e.ok, overload: e.overload }; };
  eq('Overload: exactly 1 held pays a 6-cost cast', mikaSees(0), { before: 1, spend: 6, ok: true, overload: true });
  eq('Overload: 0.998 held (what typing 1 can land on) still pays it', mikaSees(0.002), { before: 0.998, spend: 6, ok: true, overload: true });
  eq('Overload: 0.989 held still pays it (inside the 0.012 slack)', mikaSees(0.011), { before: 0.989, spend: 6, ok: true, overload: true });
  eq('Overload: 0.97 held is really short and is flagged', mikaSees(0.03), { before: 0.97, spend: 6, ok: false, overload: false }); }

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

// Extra EX skills must be real alternatives: Kurumi's "Iron Defense" (the stance her own EX puts her in) showed up as a second, identical option in the Rotation table (reported 2026-11-25)
eq('Kurumi has one EX, so no form box', D[id('Kurumi')].forms, []);
eq('no student offers an EX form identical to the normal one (no cost of its own, same length, no buffs)', Object.values(D).filter(d => (d.forms || []).some(f => !f.costs && !(f.buffs || []).length && f.frames === d.frames)).map(d => d.name), []);

// Kurumi's Iron Defense: after her EX the timeline draws the stance (as long as her shield lasts) and the stun when she leaves it (asked for 2026-11-26, for timing the stun on Wakamo)
{ const near = (x, y) => Math.abs(x - y) < 1e-6, k = id('Kurumi'); t = team(['Kurumi', 'Mika', 'Aru']);
  const sn = E.stanceOf(t, { who: k, t: 170 });
  const ms = (x, y) => Math.abs(x - y) < 0.0011;   // times are kept to the millisecond
  eq('stance: starts 19 frames into the cast, lasts the shield\'s 10 s', [ms(sn.from, 170 - 19 / 30), ms(sn.to, 170 - 19 / 30 - 10)], [true, true]);
  eq('stun at EX Lv 5 is 3.1 s and runs from the end of the stance', [sn.stun, ms(sn.stunTo, sn.to - 3.1), sn.ended], [3.1, true, true]);
  t.set.lv[k] = { ex: 1 }; eq('stun at EX Lv 1 is 2 s', E.stanceOf(t, { who: k, t: 170 }).stun, 2);
  t.set.lv[k] = { ex: 3 }; eq('stun at EX Lv 3 is 2.6 s', E.stanceOf(t, { who: k, t: 170 }).stun, 2.6); delete t.set.lv[k];
  eq('nobody else has a stance', E.stanceOf(t, { who: id('Mika'), t: 170 }), null);
  eq('a cast so late that the shield outlasts the fight: no stun, the bar stops at the end', (s => [s.to, s.ended])(E.stanceOf(t, { who: k, t: 5 })), [0, false]);
  // the numbers come from SchaleDB: the EX's Shield effect (10 s, 19 frames in) and Iron Defense's stun durations
  const sdb = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'research', 'students.json'), 'utf8'))[k].Skills.Ex, shield = sdb.Effects.find(e => e.Type === 'Shield'), iron = sdb.ExtraSkills.find(x => x.Name === 'Iron Defense');
  eq('stance length and start match the EX\'s Shield effect in the data', [E.STANCE[k].ms, E.STANCE[k].apply], [shield.Duration, shield.ApplyFrame]);
  eq('stun durations match Iron Defense\'s text in the data (EX Lv 1-5)', E.STANCE[k].stun, iron.Parameters[1].slice(0, 5).map(x => parseFloat(x)));
  eq('and the stun is what Iron Defense does on exit', /exiting .* stance, inflicts <c:Stunned>/.test(iron.Desc), true); }

// Skill activations placed by hand (asked for 2026-11-26, for Fubuki's "Every Last Round!", which fires once her ammo is 3 or less): the Basic Skill's stun, and the list the Team tab edits
{ const fu = id('Fubuki'), sdb = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'research', 'students.json'), 'utf8'));
  eq('Fubuki\'s Basic Skill has no "every N s": the rules cannot predict it, so it is added by hand', D[fu].public.interval, null);
  eq('its stun lasts 1.9 s at Basic Lv 1-3, 2.1 s at 4-6, 2.3 s at 7-9 and 2.5 s at Lv 10, landing 77 frames after the skill starts, always', [1, 3, 4, 6, 7, 9, 10].map(l => E.basicCC(D[fu], l)[0].sec).concat(E.basicCC(D[fu], 10)[0].apply, E.basicCC(D[fu], 10)[0].chance, E.basicCC(D[fu], 10)[0].name), [1.9, 1.9, 2.1, 2.1, 2.3, 2.3, 2.5, 77, 100, 'Stun']);
  eq('a chance to apply is kept: Karin 50% Stun 3.1 s, Kayoko 30% Fear 3.6 s', [E.basicCC(D[id('Karin')], 5)[0], E.basicCC(D[id('Kayoko')], 5)[0]].map(x => [x.name, x.chance, x.sec]), [['Stun', 50, 3.1], ['Fear', 30, 3.6]]);
  eq('Konoka provokes rather than stuns', E.basicCC(D[id('Konoka')], 1)[0].name, 'Provoke');
  const withCC = Object.values(D).filter(d => E.basicCC(d, 1).length).map(d => d.name).sort(), want = Object.values(sdb).filter(s => ((s.Skills || {}).Public || {}).Effects && s.Skills.Public.Effects.some(e => e.Type === 'CrowdControl')).map(s => D[s.Id].name).sort();
  eq('exactly the students whose Basic Skill has crowd control in SchaleDB (' + want.length + ') get a stun / fear / provoke bar', withCC, want);
  eq('every one of them reads its seconds per Basic Lv from the data', want.every(n => { const s = sdb[id(n)], e = s.Skills.Public.Effects.find(x => x.Type === 'CrowdControl'); return [1, 2, 5, 10].every(l => E.basicCC(D[id(n)], l)[0].sec === e.Scale[l - 1] / 1000); }), true);
  eq('crowd-control kinds on a Basic Skill are all named (no raw icon names on the timeline)', [...new Set(Object.values(D).flatMap(d => E.basicCC(d, 1).map(x => x.name)))].every(n => Object.values(E.CCNAME).includes(n)), true);
  eq('no Basic Skill has both a timed buff and crowd control (the timeline draws one effect bar per activation)', Object.values(D).filter(d => d.public && d.public.cc.length && d.public.effects.some(e => e.ms)).map(d => d.name), []);

  t = team(['Fubuki', 'Mika', 'Aru']);
  eq('nothing is added until you add it', E.actsOf(t, null), []);
  const a1 = E.opAddAct(t, fu); eq('the first activation is 20 s into the fight', a1.t, 160);
  eq('the next one 20 s after the last', E.opAddAct(t, fu).t, 140);
  eq('a time you give is used as it is', E.opAddAct(t, id('Mika'), 100).t, 100);
  eq('listed earliest first, each keeping its place in the saved list', E.actsOf(t, null).map(a => [a.who === fu ? 'Fubuki' : 'Mika', a.t, a.k]), [['Fubuki', 160, 0], ['Fubuki', 140, 1], ['Mika', 100, 2]]);
  eq('one student at a time', E.actsOf(t, fu).map(a => a.t), [160, 140]);
  eq('moving one clamps it to the fight (0:00 to the time limit) and keeps it to hundredths', [E.opMoveAct(t, 0, -5).t, E.opMoveAct(t, 0, 999).t, E.opMoveAct(t, 0, 123.456).t], [0, 180, 123.46]);
  E.opRemoveAct(t, 1); eq('removing one leaves the others', E.actsOf(t, null).map(a => a.t), [123.46, 100]);
  E.opRemoveAct(t, 9); eq('removing one that is not there does nothing', E.actsOf(t, null).length, 2);
  t = team(['Fubuki', 'Aru']); E.setTotal(240); eq('the time limit is the fight\'s own (a 4:00 raid starts the first one at 3:40)', E.opAddAct(t, fu).t, 220); E.setTotal(180);
  eq('adding for a student whose first activation is within 20 s of the end stops at 0:00', (() => { t = team(['Fubuki', 'Aru']); E.opAddAct(t, fu, 10); return E.opAddAct(t, fu).t; })(), 0); }

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

// EX cards in hand: replays the presses of the Hod Yellow Torment recording (Documents/Blue Archive PC/Video References, 2026-11-26): 29 presses and the card each one drew, read from the video.
// [who, copy?, target, slot refilled, card drawn]. A copy of Mika is told apart from the real card by the Note "COPY", like in the player's own rotations.
{ const names = ['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki'];
  t = team(names); t.startOrder = ['Seia', 'Rio', 'Kotama (Camp)', 'Aru (Dress)', 'Mika'].map(id);
  const P = [['Seia', 0, 0, 1, 'Aru (Dress)'], ['Rio', 0, 'Mika', 2, 'copy:Mika'], ['Kotama (Camp)', 0, 0, 3, 'Mika'], ['Mika', 1, 0, 2, 'Kisaki'], ['Aru (Dress)', 0, 0, 1, 'Seia'],
    ['Seia', 0, 0, 1, 'Kotama (Camp)'], ['Kotama (Camp)', 0, 0, 1, 'Rio'], ['Mika', 0, 0, 3, 'Aru (Dress)'], ['Aru (Dress)', 0, 0, 3, 'Seia'], ['Seia', 0, 0, 3, 'Kotama (Camp)'],
    ['Rio', 0, 'Mika', 1, 'copy:Mika'], ['Mika', 1, 0, 1, 'Mika'], ['Mika', 0, 0, 1, 'Aru (Dress)'], ['Aru (Dress)', 0, 0, 1, 'Seia'], ['Seia', 0, 0, 1, 'Rio'],
    ['Rio', 0, 'Mika', 1, 'copy:Mika'], ['Kotama (Camp)', 0, 0, 3, 'Mika'], ['Mika', 0, 0, 3, 'Aru (Dress)'], ['Kisaki', 0, 0, 2, 'Seia'], ['Mika', 1, 0, 1, 'Kotama (Camp)'],
    ['Seia', 0, 0, 2, 'Mika'], ['Mika', 0, 0, 2, 'Kisaki'], ['Aru (Dress)', 0, 0, 3, 'Rio'], ['Rio', 0, 'Mika', 3, 'copy:Mika'], ['Kisaki', 0, 0, 2, 'Seia'],
    ['Seia', 0, 0, 2, 'Mika'], ['Kotama (Camp)', 0, 0, 1, 'Aru (Dress)'], ['Mika', 1, 0, 3, 'Kisaki'], ['Mika', 0, 0, 2, 'Seia']];
  P.forEach(([who, copy, target], n) => { const c = cast(t, who, 230 - n * 5); if (target) c.target = id(target); if (copy) c.tag = 'COPY'; });
  const cs = E.cardStrips(t), what = s => s.copy > 0 ? 'copy:' + D[s.copy].name : D[s.id].name;
  const got = t.casts.map(c => { const r = cs.casts.get(c); return r.slot >= 0 ? [r.slot + 1, what(r.hand[r.slot])] : [r.mode]; });
  eq('Hod Yellow video: all 29 presses refill the slot, and with the card, that the recording shows', got, P.map(p => [p[3], p[4]]));
  eq('and none of them was a card that is not in the hand', t.casts.every(c => cs.casts.get(c).mode !== 'missing'), true);
  { const tagged = t.casts.filter(c => c.tag === 'COPY'); tagged.forEach(c => { c.copy = true; delete c.tag; });   // the same rotation with the Student box choice instead of the Note
    const cs3 = E.cardStrips(t), got3 = t.casts.map(c => { const r = cs3.casts.get(c); return r.slot >= 0 ? [r.slot + 1, what(r.hand[r.slot])] : [r.mode]; });
    eq('Hod Yellow video again with "(Copy)" in the Student box instead of the Note: the same 29 presses', [tagged.length, got3], [4, P.map(p => [p[3], p[4]])]);
    tagged.forEach(c => { delete c.copy; c.tag = 'COPY'; }); }
  eq('the opening hand is the first three starting skills; the queue is the 4th, the 5th, then the student not in the five', [cs.start.hand.map(s => D[s.id].name), cs.start.queue.map(i => D[i].name)], [['Seia', 'Rio', 'Kotama (Camp)'], ['Aru (Dress)', 'Mika', 'Kisaki']]);
  eq('a hand always has 3 slots and the queue holds the other cards (one is Rio\'s copy at times)', t.casts.every(c => { const r = cs.casts.get(c); return r.hand.length === 3 && r.queue.length === 3; }), true);
  // the same casts with no Note: a copy is the card in hand only when the real one is not
  t.casts.forEach(c => delete c.tag); const cs2 = E.cardStrips(t);
  eq('without the COPY note: the real Mika is in hand at press 4, so that press counts as the real card (the note is what says it was the copy)', cs2.casts.get(t.casts[3]).mode, 'real');
  { const t3 = team(names); t3.startOrder = ['Rio', 'Seia', 'Kotama (Camp)', 'Aru (Dress)', 'Mika'].map(id); const r1 = cast(t3, 'Rio', 200); r1.target = id('Mika'); const m1 = cast(t3, 'Mika', 190);
    const o = E.cardStrips(t3).casts.get(m1); eq('a plain Mika cast while only Rio\'s copy of her is in hand is the real card, which is not there: flagged, with the hint to pick "(Copy)"', [o.mode, o.want, o.copyInHand, E.cardsNote(Object.assign({who: id('Mika')}, o))[1].includes('Mika (Copy)')], ['missing', 'real', true, true]);
    m1.copy = true; const o2 = E.cardStrips(t3).casts.get(m1); eq('the same cast as "Mika (Copy)" uses the copy: Rio goes to the back after it', [o2.mode, o2.hand.map(s => D[s.id].name), o2.queue.map(i => D[i].name)], ['copy', ['Aru (Dress)', 'Seia', 'Kotama (Camp)'], ['Mika', 'Kisaki', 'Rio']]); }
  // not set / partly set starting skills
  t.startOrder = ['Seia', 'Rio', 'Kotama (Camp)', 'Aru (Dress)'].map(id); eq('four of the five starting skills set: nothing to show', E.cardStrips(t), null);
  delete t.startOrder; eq('no starting skills set: nothing to show', E.cardStrips(t), null);
  // a cast of a card that is not in hand: flagged, the hand stays, the card goes to the back of the queue
  t.startOrder = ['Seia', 'Rio', 'Kotama (Camp)', 'Aru (Dress)', 'Mika'].map(id); t.casts.length = 0; cast(t, 'Kisaki', 200);
  { const r = E.cardStrips(t).casts.get(t.casts[0]); eq('Kisaki is still in the queue: flagged, hand unchanged, Kisaki goes to the back', [r.mode, r.hand.map(s => D[s.id].name), r.queue.map(i => D[i].name)], ['missing', ['Seia', 'Rio', 'Kotama (Camp)'], ['Aru (Dress)', 'Mika', 'Kisaki']]); }
  // a roster of four: the 4th card is in the queue, a hand of three and nothing else waiting
  t = team(['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)']); t.startOrder = ['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)'].map(id); cast(t, 'Seia', 200);
  { const r = E.cardStrips(t).casts.get(t.casts[0]); eq('a team of four: Seia goes behind Aru and Aru takes her slot', [r.hand.map(s => D[s.id].name), r.queue.map(i => D[i].name)], [['Aru (Dress)', 'Mika', 'Kotama (Camp)'], ['Seia']]); }
  // the strip HTML: 3 cards, a divider, the queue; the pressed slot is outlined; a copy glows
  { t = team(names); t.startOrder = ['Seia', 'Rio', 'Kotama (Camp)', 'Aru (Dress)', 'Mika'].map(id); const c = cast(t, 'Rio', 200); c.target = id('Mika'); const r = E.cardStrips(t).casts.get(c), h = E.cardsHtml(r, r);
    eq('the strip shows 3 hand cards and 3 queue cards, the new copy outlined and glowing', [(h.match(/class="hc /g) || []).length, /hc new cp/.test(h)], [6, true]); } }

// EX cards that come straight back into the same slot ("immediately redraws the EX Skill"), from three more recordings (2026-11-26). Same layout as the Hod replay above:
// [who, {copy, target, form}, slot refilled, card there afterwards]; 'again' marks a card redrawn at once.
{ const replay = (names, start, presses) => {
    const tm = team(names); tm.startOrder = start.map(id);
    presses.forEach(([who, o], n) => { const c = cast(tm, who, 230 - n * 5); if (o.target) c.target = id(o.target); if (o.copy) c.tag = 'COPY'; if (o.form !== undefined) c.form = o.form; });
    const cs = E.cardStrips(tm), what = s => s.copy > 0 ? 'copy:' + D[s.copy].name : D[s.id].name;
    return { got: tm.casts.map(c => { const r = cs.casts.get(c); return r.slot >= 0 ? [r.slot + 1, what(r.hand[r.slot])] : [r.mode]; }), again: tm.casts.map(c => !!(cs.casts.get(c).hand[cs.casts.get(c).slot] || {}).again), cs, tm }; };
  // Binah Lunatic Yellow Field, second team (Neru (School)): her first EX is redrawn at once as the follow-up (cost 4); the follow-up and Rio's copy of it go to the back like any card
  const N = 'Neru (School)', K = 'Kanna (Swimsuit)', S = 'Seia (Swimsuit)', A = 'Aru (Dress)', H = 'Himari (Armed)';
  const bn = [[H, {}, 1, A], ['Rio', { target: N }, 2, 'copy:' + N], [A, {}, 1, S], [N, {}, 3, N], [N, { form: 0 }, 3, K], [K, {}, 3, H], [S, {}, 1, A], [N, { copy: 1, form: 0 }, 2, N], [N, { form: 0 }, 2, K],
    [A, {}, 1, S], [H, {}, 3, 'Rio'], ['Rio', { target: N }, 3, 'copy:' + N], [N, { copy: 1, form: 0 }, 3, N], [K, {}, 2, A], [S, {}, 1, H], [N, { form: 0 }, 3, 'Rio'], ['Rio', { target: N }, 3, 'copy:' + N], [N, { copy: 1, form: 0 }, 3, K]];
  { const r = replay([K, N, S, A, H, 'Rio'], [H, 'Rio', N, A, S], bn);
    eq('Binah (Neru): all 18 presses refill the slot, with the card, that the recording shows', r.got, bn.map(p => [p[2], p[3]]));
    eq('Binah (Neru): only her first EX is redrawn at once (press 4); her follow-ups and the copies are not', r.again.map((a, i) => a ? i + 1 : null).filter(Boolean), [4]); }
  // Shiro Kuro Torment (mock), Aris (Armed): Sword of Light (form 1) stays in her slot; Awakening: Supernova (form 0) goes to the back and the next card drops in
  const AR = 'Aris (Armed)', HF = 'Hoshino (Armed · Fortification)';
  const sk = [['Yuuka (Track)', {}, 2, 'Nagisa (Swimsuit)'], [AR, { form: 1 }, 1, AR], ['Nagisa (Swimsuit)', {}, 2, 'Kisaki'], ['Kei', {}, 3, HF], ['Kisaki', {}, 2, 'Yuuka (Track)'], [HF, {}, 3, 'Nagisa (Swimsuit)'], [AR, { form: 0 }, 1, 'Kei']];
  { const r = replay([AR, 'Yuuka (Track)', 'Kei', 'Nagisa (Swimsuit)', 'Kisaki', HF], [AR, 'Yuuka (Track)', 'Kei', 'Nagisa (Swimsuit)', 'Kisaki'], sk);
    eq('Shiro Kuro (Aris Armed): all 7 presses refill the slot, with the card, that the recording shows', r.got, sk.map(p => [p[2], p[3]]));
    eq('Shiro Kuro (Aris Armed): only Sword of Light is redrawn at once', r.again.map((a, i) => a ? i + 1 : null).filter(Boolean), [2]);
    eq('Aris with no form picked is Supernova (form 0): not redrawn', replay([AR, 'Kei', 'Kisaki', 'Aru', 'Mika', 'Seia'], [AR, 'Kei', 'Kisaki', 'Aru', 'Mika'], [[AR, {}, 1, 'Aru']]).again, [false]); }
  // Gregorius Torment, Hina (Dress): the stance cast and the First and Second Note come straight back (the card shows x3, x2, x1 notes left), The Final Song goes to the back
  { const HD = 'Hina (Dress)', r = replay([HD, 'Fuuka (New Year)', 'Mine', 'Kisaki', 'Hoshino (Swimsuit)', HF], [HD, 'Fuuka (New Year)', 'Mine', 'Kisaki', 'Hoshino (Swimsuit)'], [[HD, {}, 1, HD], [HD, {}, 1, HD], [HD, {}, 1, HD], [HD, {}, 1, 'Kisaki']]);
    eq('Gregorius (Hina Dress): stance, First Note and Second Note stay in slot 1, The Final Song hands slot 1 to the next card', r.got, [[1, HD], [1, HD], [1, HD], [1, 'Kisaki']]);
    eq('Hina: a fifth cast straight after The Final Song is flagged (she is at the back of the queue, not in hand)', replay([HD, 'Fuuka (New Year)', 'Mine', 'Kisaki', 'Hoshino (Swimsuit)', HF], [HD, 'Fuuka (New Year)', 'Mine', 'Kisaki', 'Hoshino (Swimsuit)'], [[HD, {}], [HD, {}], [HD, {}], [HD, {}], [HD, {}]]).got[4], ['missing']);
    eq('Hina: the queue does not move while the notes are played, and she is at the back after The Final Song', [r.cs.casts.get(r.tm.casts[2]).queue.map(i => D[i].name), r.cs.casts.get(r.tm.casts[3]).queue.map(i => D[i].name)], [['Kisaki', 'Hoshino (Swimsuit)', HF], ['Hoshino (Swimsuit)', HF, HD]]); }
  // students whose redraw has not been recorded are marked, the recorded ones are not
  { const tt = team(['Toki', N, 'Mika', 'Aru', 'Seia', 'Kisaki']); tt.startOrder = ['Toki', N, 'Mika', 'Aru', 'Seia'].map(id); const c1 = cast(tt, 'Toki', 200), c2 = cast(tt, N, 190), cs = E.cardStrips(tt);
    eq('a Toki cast is marked as an unchecked redraw, a Neru (School) cast is not', [cs.casts.get(c1).redraws, cs.casts.get(c2).redraws], [true, false]); }
  // the line under a strip: what is special about the cast (nothing for an ordinary press)
  { const names2 = ['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki'], t2 = team(names2); t2.startOrder = ['Seia', 'Rio', 'Kotama (Camp)', 'Aru (Dress)', 'Mika'].map(id);
    const a = cast(t2, 'Seia', 200), b = cast(t2, 'Rio', 190); b.target = id('Mika'); const c3 = cast(t2, 'Kotama (Camp)', 180), d = cast(t2, 'Mika', 170); d.tag = 'COPY'; const e2 = cast(t2, 'Seia', 160), cs = E.cardStrips(t2), n = c => E.cardsNote(cs.casts.get(c));
    eq('an ordinary press has no note', n(a), null);
    eq('Rio: her card turns into a copy of the target, nothing is drawn', n(b), [false, "Rio's card turns into a copy of Mika's EX; nothing is drawn."]);
    eq('using the copy: Rio goes to the back', n(d), [false, "The copy is used up: Rio's card goes to the back of the queue."]);
    eq('a card that is not in hand is a warning', n(e2)[0], true);
    const rows = E.cardsRowHtml(cs.casts.get(b), 7, false, 1); eq('the row under a cast spans the table and holds the strip and the note', [/colspan="7"/.test(rows), /data-cr="1"/.test(rows), /class="cs"/.test(rows), /turns into a copy/.test(rows)], [true, true, true, true]);
    // "only under the latest cast": the last row of the table (the latest in the battle), whatever order the casts were added in
    const g = cast(t2, 'Mika', 300), all = E.cardsShown(t2, false), last = E.cardsShown(t2, true);
    eq('cards under every cast: all six casts get a row', [all.size, [a, b, c3, d, e2, g].every(x => all.has(x))], [6, true]);
    eq('only under the latest cast: just the cast with the least time left, even though it was not the last one added', [last.size, last.has(e2), last.has(g)], [1, true, false]);
    eq('no casts, no rows', E.cardsShown(team(names2), true).size, 0); }
  // Neru (School)'s mark: her normal EX marks for 70 s from the cast; the follow-up (form 0) does not; near the end of the fight the 70 s are cut short
  { const tn = team(['Neru (School)', 'Seia', 'Mika', 'Aru', 'Kisaki', 'Rio']), n1 = cast(tn, 'Neru (School)', 220), n2 = cast(tn, 'Neru (School)', 200), n3 = cast(tn, 'Neru (School)', 40), s1 = cast(tn, 'Seia', 210); n2.form = 0;
    const m1 = E.markOf(tn, n1), m3 = E.markOf(tn, n3);
    eq('a normal Neru EX marks for 70 s, starting 33 frames (1.1 s) into the cast, and the card is the normal EX again 71.1 s after the cast', [m1.from, m1.to, m1.secs, m1.ended, m1.back], [218.9, 148.9, 70, true, 148.9]);
    eq('her follow-up (form 0) does not start a mark, and nobody else has one', [E.markOf(tn, n2), E.markOf(tn, s1)], [null, null]);
    eq('a mark near the end of the fight runs to the end instead of 70 s', [m3.from, m3.to, m3.ended], [38.9, 0, false]);
    // with no form picked: the first EX is the normal one, every cast inside its 70 s is the follow-up (cost 4), the first one after the mark is the normal EX again
    const t4 = team(['Neru (School)', 'Seia', 'Mika', 'Aru', 'Kisaki', 'Rio']), k = [220, 200, 190, 140].map(x => cast(t4, 'Neru (School)', x));
    eq('Neru with no form picked: normal EX, follow-up, follow-up, then (mark over) the normal EX again', k.map(c => E.formIdx(t4, c)), [null, 0, 0, null]);
    eq('and what each costs: 1, 4, 4, 1', k.map(c => E.spendOf(t4, c)), [1, 4, 4, 1]);
    k[1].form = null; eq('a normal EX picked by hand starts a mark of its own: the cast after it is the follow-up', [E.formIdx(t4, k[2]), E.markOf(t4, k[1]).to], [0, 128.9]);
    k[1].form = 0; k[2].form = null; eq('a form picked by hand wins over the window', [E.formIdx(t4, k[1]), E.formIdx(t4, k[2])], [0, null]); }
  // popups: a skill text with double quotes (Neru's "This'll Hurt, Y'know") cut a popup short when it was put into the data-tip attribute unescaped; every data-tip built from a value must escape quotes
  { const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8'), bare = [...html.matchAll(/data-tip="\$\{([^}]*)\}/g)].map(m => m[1]).filter(x => !/replace\(\/"\/g|esc\(/.test(x));
    eq('every data-tip in index.html escapes double quotes', bare, []); }
  eq('every student whose skill text redraws the EX card is either recorded or marked', [...E.COPYERS].length + Object.keys(E.INPLACE).length + [...E.REDRAWERS].length, 10); }

// Rio's copy as a choice in the Student box ("Mika (Copy)", c.copy = true): cost, form, busy rule, options
{ const names = ['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki'], tc = team(names), m = cast(tc, 'Mika', 200), mc = cast(tc, 'Mika', 190), r = cast(tc, 'Rio', 195); r.target = id('Mika'); mc.copy = true;
  eq('isCopy: the flag, and the old Note "copy" until the flag is set', [E.isCopy(m), E.isCopy(mc), E.isCopy({tag: 'COPY'}), E.isCopy({tag: 'a copy', copy: false}), E.isCopy({tag: 'nothing'})], [false, true, true, false, false]);
  eq('a copy of Mika (base 6) costs 5, the real card 6', [E.spendOf(tc, m), E.spendOf(tc, mc)], [6, 5]);
  mc.cost = 2; eq('a price typed by hand is still the final price', E.spendOf(tc, mc), 2); delete mc.cost;
  { const tr = team(['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki']), ts = cast(tr, 'Seia', 220); ts.target = id('Mika'); const cm = cast(tr, 'Mika', 210); cm.copy = true;
    eq('Seia halves the price of the next EX: a copy of Mika costs 5 then 3 (the reduction works on the copy\'s base, like the 5 -> 3 in the Hod recording)', E.spendOf(tr, cm), 3); }
  { const tz = team(['Seia', 'Neru (School)', 'Maki', 'Kokona', 'Himari (Armed)', 'Rio']), nz = cast(tz, 'Neru (School)', 217.23), sz = cast(tz, 'Seia', 215.2); sz.target = id('Neru (School)'); const rz = cast(tz, 'Rio', 204.6); rz.target = id('Neru (School)'); const cz = cast(tz, 'Neru (School)', 190); cz.copy = true;
    eq('Rio\'s copy of Neru\'s follow-up under Seia\'s halving costs 2 (follow-up 4, copy 4 - 1 = 3, the cut then takes off 1): the blue 2 on the card in the Maki recording, not 1', [E.ownSpend(tz, cz, tz.casts, true), E.ownSpend(tz, cz, tz.casts), E.spendOf(tz, cz)], [4, 3, 2]); }
  { const tn = team(['Neru (School)', 'Seia', 'Mika', 'Aru', 'Kisaki', 'Rio']); tn.casts.length = 0; const rio1 = cast(tn, 'Rio', 230); rio1.target = id('Neru (School)'); const n1 = cast(tn, 'Neru (School)', 225), cn = cast(tn, 'Neru (School)', 220), rio2 = cast(tn, 'Rio', 100); rio2.target = id('Neru (School)'); const cn2 = cast(tn, 'Neru (School)', 90); cn.copy = true; cn2.copy = true;
    eq('a copy used while Neru is marked is the follow-up (cost 4 - 1 = 3) and starts no mark', [E.formIdx(tn, cn), E.spendOf(tn, cn), E.markOf(tn, cn)], [0, 3, null]);
    eq('a copy used after her mark has ended is her normal EX again (cost 1 - 1 = 0)', [E.formIdx(tn, cn2), E.spendOf(tn, cn2)], [null, 0]);
    const tn2 = team(['Neru (School)', 'Seia', 'Mika', 'Aru', 'Kisaki', 'Rio']), a1 = cast(tn2, 'Neru (School)', 225), rio3 = cast(tn2, 'Rio', 200); rio3.target = id('Neru (School)'); const c3 = cast(tn2, 'Neru (School)', 140); c3.copy = true;
    const c4 = cast(tn2, 'Neru (School)', 190); c4.copy = true;
    eq('(marked at 225 until 153.9) Rio copied her card at 200: used at 190 it is the follow-up (cost 3), used at 140 (the mark ended) the copy has changed back to her normal EX (cost 0)', [E.formIdx(tn2, c4), E.spendOf(tn2, c4), E.formIdx(tn2, c3), E.spendOf(tn2, c3), E.markOf(tn2, c3) && [E.markOf(tn2, c3).from, E.markOf(tn2, c3).to]], [0, 3, null, 0, [138.9, 68.9]]);
    eq('... and that copy, being her normal EX, starts a new mark (the one on the timeline), so her own cast right after it is the follow-up with no form picked', (() => { const n2 = cast(tn2, 'Neru (School)', 130); return [E.formIdx(tn2, n2), E.spendOf(tn2, n2)]; })(), [0, 4]); }
  // The Wakamo Phase 2 rotation as it was played (saved file, 2026-11-27): Neru's own casts and Rio's copies alternate; the cast after the last copy was picked as the follow-up by hand, and the copy before it is what starts that mark
  { const tw = team(['Seia', 'Neru (School)', 'Maki', 'Kokona', 'Himari (Armed)', 'Rio']), N = 'Neru (School)', nz = (tt, cp) => { const c = cast(tw, N, tt); if(cp) c.copy = true; return c; };
    const first = nz(217.23), c1 = nz(196.15, 1), f1 = nz(184.54), c2 = nz(176.46, 1), f2 = nz(168.01), c3w = nz(154.68, 1), f3 = nz(147.04), c4w = nz(135.6, 1), f4 = nz(130.53);
    eq('the first cast is her normal EX and starts the mark (216.1 -> 146.1); everything up to 147.04 is inside it', [first, c1, f1, c2, f2, c3w, f3].map(c => E.formIdx(tw, c)), [null, 0, 0, 0, 0, 0, 0]);
    eq('the copy at 135.6 comes after the mark ended: her normal EX again, so it starts a second mark (134.5 -> 64.5)', [E.formIdx(tw, c4w), E.markOf(tw, c4w).from, E.markOf(tw, c4w).to], [null, 134.5, 64.5]);
    eq('so the next cast, at 130.53, is the follow-up without picking the form by hand', [E.formIdx(tw, f4), E.markOf(tw, f4)], [0, null]);
    f4.form = 0; eq('picking it by hand changes nothing', E.formIdx(tw, f4), 0); }

  { const tb = team(['Neru (School)', 'Seia', 'Mika', 'Aru', 'Kisaki', 'Rio']), n = cast(tb, 'Neru (School)', 200), cp = cast(tb, 'Neru (School)', 198); cp.copy = true, plain = cast(tb, 'Neru (School)', 196);
    const dur = E.animDur(tb, n); eq('the copy plays Neru\'s animation: while her own EX is playing the copy cannot go off (busy), and neither can a second cast of hers', [E.ownBusy(tb, cp, cp.t) !== null, E.ownBusy(tb, plain, plain.t) !== null, dur > 2], [true, true, true]);
    tb.casts.splice(tb.casts.indexOf(plain), 1); cp.t = 200 - dur - 0.5; eq('after her animation it can', E.ownBusy(tb, cp, cp.t), null); }
  { const to = team(['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki']), c0 = cast(to, 'Mika', 200), copies = c => E.whoOptions(to, c).filter(x => x.copy).map(x => x.label);
    eq('Student box with Rio in the team but no copy made yet: just the six students', [E.whoOptions(to, c0).filter(x => !x.copy).length, copies(c0)], [6, []]);
    const rio = cast(to, 'Rio', 210); rio.target = id('Mika');
    eq('after Rio copied Mika the only copy on offer is Mika\'s (not one of every student)', copies(c0), ['Mika (Copy)']);
    eq('the cast of Rio itself (before the copy exists) and a cast before Rio\'s offer none', [copies(rio), copies(cast(to, 'Seia', 220))], [[], []]);
    const used = cast(to, 'Mika', 205); used.copy = true;
    eq('once the copy of Mika has been used, no copy is on offer for the rows after it', copies(c0), []);
    used.copy = false; rio.target = id('Kisaki'); eq('Rio cannot copy a Special (not targetable): none on offer', copies(c0), []);
    rio.target = id('Aru (Dress)'); eq('she can copy any Striker', copies(c0), ['D. Aru (Copy)']);
    eq('copyable: Strikers yes, Specials (Rio, Kisaki, Himari (Armed) on her wheelchair) no', [E.copyable(id('Seia')), E.copyable(id('Rio')), E.copyable(id('Kisaki')), E.copyable(id('Himari (Armed)'))], [true, false, false, false]);
    rio.target = id('Mika'); eq('exactly one option is selected: Mika, and after "Mika (Copy)" the copy', [E.whoOptions(to, c0).filter(x => x.selected).map(x => x.value), (() => { E.opSetWho(to, to.casts.indexOf(c0), 'copy:' + id('Mika')); return [E.whoOptions(to, c0).filter(x => x.selected).map(x => x.value), c0.copy, c0.who === id('Mika')]; })()], [[String(id('Mika'))], [['copy:' + id('Mika')], true, true]]);
    rio.target = id('Aru (Dress)'); eq('a copy already chosen for the row stays in its list even when Rio holds another one now', copies(c0).sort(), ['D. Aru (Copy)', 'Mika (Copy)']);
    E.opSetWho(to, to.casts.indexOf(c0), id('Seia')); eq('back to a plain student: the copy flag is off (false when it was on, so a leftover Note cannot bring it back)', [c0.copy, E.isCopy(c0), c0.who === id('Seia')], [false, false, true]);
    const tx = team(['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Kisaki', 'Hoshino (Swimsuit)']); eq('no Rio in the team: no (Copy) options', E.whoOptions(tx, { who: id('Mika') }).some(x => x.copy), false); }
}

// What an EX that cuts the cost of others says on the timeline (Seia's "the next two EX of one ally cost half"): the bar and popup lead with it and list who used it
{ const tc = team(['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki']), sc = cast(tc, 'Seia', 215); sc.target = id('Mika');
  const m1 = cast(tc, 'Mika', 200), m2 = cast(tc, 'Mika', 190), m3 = cast(tc, 'Mika', 180);
  const e = E.costCuts(tc, tc.casts).get(sc), lv = E.exLv(tc, id('Seia')), cl = E.cutLabel(tc, sc, e);
  eq('Seia at EX Lv 5 cuts the next two EX of her target: two casts used it, 6 -> 3 each, the third is full price', [lv, e.uses, e.used.map(u => [u.c === m1 || u.c === m2, u.before, u.after]), E.spendOf(tc, m3)], [5, 2, [[true, 6, 3], [true, 6, 3]], 6]);
  eq('the bar label leads with the cut', cl.text, "Mika's next 2 EX: cost -50%");
  eq('the popup says what it does and who used it', [cl.lines[0].includes("Mika's next 2 EX skills cost 50% less (the cut is rounded down)"), cl.lines[1].includes('used by: Mika @ 3:20.0 (6 \u2192 3), Mika @ 3:10.0 (6 \u2192 3)')], [true, true]);
  m2.who = id('Kotama (Camp)'); const e2 = E.costCuts(tc, tc.casts).get(sc);
  eq('a cast of someone else does not use it: Mika\'s second EX is the second use', [e2.used.length, E.cutLabel(tc, sc, e2).lines[1].includes('used by: Mika @ 3:20.0 (6 \u2192 3), Mika @ 3:00.0 (6 \u2192 3)')], [2, true]);
  m1.who = id('Aru (Dress)'); m3.who = id('Aru (Dress)'); m2.who = id('Aru (Dress)'); const e3 = E.costCuts(tc, tc.casts).get(sc);
  eq('nobody cast Mika\'s EX: used by nobody yet', [e3.used.length, E.cutLabel(tc, sc, e3).lines[1].trim()], [0, 'used by: nobody yet']);
  delete sc.target; eq('no target picked: the label says so', [E.costCuts(tc, tc.casts).get(sc), E.cutLabel(tc, sc, undefined).text], [undefined, 'pick a target for the EX cost cut']);
  { const tk = team(['Kisaki (Swimsuit)', 'Seia', 'Mika', 'Aru', 'Hina', 'Rio']), kc = cast(tk, 'Kisaki (Swimsuit)', 200); const ck = E.costCuts(tk, tk.casts).get(kc);
    eq('Kisaki (Swimsuit): 1 less on the next EX of each other Striker', E.cutLabel(tk, kc, ck).text, "the other Strikers' next EX: cost -1"); } }
// A cut that changes nothing is not used up. Wakamo recording (attempt 2, 2026-11-27): Seia's halving was on U. Neru; her normal EX (cost 1: half of 1 rounds the cut down to 0) paid 1,
// and her next EX (the follow-up, 4 -> 2) and Rio's copy of it (3 -> 2) were both still halved.
{ const tw = team(['Seia', 'Neru (School)', 'Maki', 'Kokona', 'Himari (Armed)', 'Rio']), sw = cast(tw, 'Seia', 200); sw.target = id('Neru (School)');
  const n1 = cast(tw, 'Neru (School)', 190), n2 = cast(tw, 'Neru (School)', 170), n3 = cast(tw, 'Neru (School)', 150), n4 = cast(tw, 'Neru (School)', 110); n3.copy = true;
  eq('the forms: normal EX starts the mark, the follow-up and the copy are inside it, the last cast is after the mark', [n1, n2, n3, n4].map(c => E.formIdx(tw, c)), [null, 0, 0, null]);
  eq('the cost-1 normal EX is not halved and does not use up the cut: it goes to the follow-up (4 -> 2) and Rio\'s copy of it (3 -> 2); a later cast is full price', [n1, n2, n3, n4].map(c => E.spendOf(tw, c)), [1, 2, 2, 1]);
  const cuts = E.costCuts(tw, tw.casts).get(sw);
  eq('... and the cut lists only the two casts it changed', [cuts.used.length, cuts.used.map(u => [u.before, u.after])], [2, [[4, 2], [3, 2]]]); }
// A full cost bar. The bar stops at the cap (10.5 here), so "cost before 10.5" fits every moment the bar sits full; the row goes to the first of them, the moment the bar fills
// (the Wakamo Phase 2 rotation had Rio at 3:24.62 where the recording shows her at 3:29.63: she was cast the moment the bar filled, 5 s earlier).
{ const tf = team(['Seia', 'Neru (School)', 'Maki', 'Kokona', 'Himari (Armed)', 'Rio']); E.setTotal(240); tf.set.ue[id('Rio')] = 60;
  const mk = (who, tm, cb, extra) => { const c = Object.assign({ t: tm, who: id(who), cb, id: who.slice(0, 3) + tm }, extra || {}); tf.casts.push(c); return c; }, ix = c => tf.casts.indexOf(c), nn = id('Neru (School)');
  const f1 = mk('Neru (School)', 217.23, 10.5), f2 = mk('Seia', 215.25, 10.5, { target: nn }), f3 = mk('Rio', 204.62, 10.5, { target: nn }), f4 = mk('Himari (Armed)', 201.23, 10.5, { target: nn });
  const ff = E.fullFrom(tf, ix(f3));
  eq('the cost cap here is 10.5', E.capOf(tf), 10.5);
  eq('Rio at 3:24.62 sees a full bar that filled at about 3:29.7 (5.1 s of regen wasted); the casts that follow the previous one at once do not', [Math.round(ff.T * 10) / 10, ff.secs, E.fullFrom(tf, ix(f1)), E.fullFrom(tf, ix(f2)), E.fullFrom(tf, ix(f4))], [209.7, 5.1, null, null, null]);
  f3.lock = true; eq('a locked row is left alone', [E.retimeByCost(tf), f3.t], [0, 204.62]); delete f3.lock;
  const mv = E.retimeByCost(tf);
  eq('re-timing by cost moves Rio to the moment the bar fills and Himari to the moment she can be paid after that (the recording: 3:29.63 and 3:26.27); the first two rows stay', [mv, f1.t, f2.t, Math.abs(f3.t - 209.63) < 0.2, Math.abs(f4.t - 206.27) < 0.2], [2, 217.23, 215.25, true, true]);
  eq('... and a second time nothing moves, no row sees a full bar any more', [E.retimeByCost(tf), tf.casts.map((c, k) => E.fullFrom(tf, k))], [0, [null, null, null, null]]);
  f3.t = 200; f3.cb = 10.5; f4.t = 190;
  E.placeByCost(tf, ix(f3), 10.5);
  eq('typing 10.5 on a row that sits later on the full-bar stretch takes it to the moment the bar fills', Math.abs(f3.t - 209.63) < 0.2, true);
  const f5 = mk('Maki', 150, 7); f5.t = 150; E.placeByCost(tf, ix(f5), 7); const at7 = f5.t;
  eq('a row planned below the cap is placed as before (the cost passes 7 once)', E.fullFrom(tf, ix(f5)), null); }
// Re-timing puts a row planned at a cost at the first moment after the cast above it where the bar shows that cost. The cost you planned stays: a row met first while the cast tied above it
// had not followed its parent yet (Seia at 3:10 instead of 3:37) used to be overwritten with the cost it saw there (7.5), and then sat in the wrong place (recording: the "cost 6" row was cast 0.7 s after Seia).
{ const tr = team(['Seia', 'Neru (School)', 'Maki', 'Kokona', 'Himari (Armed)', 'Rio']); E.setTotal(240); tr.set.ue[id('Rio')] = 60; const nn = id('Neru (School)');
  const g1 = { t: 217.23, who: nn, cb: 10.5, id: 'gn', form: 0 }, g2 = { t: 190, who: id('Seia'), after: 'gn', target: nn, id: 'gs' }, g3 = { t: 183.55, who: id('Rio'), cb: 6, target: nn, id: 'gr' };
  tr.casts.push(g1, g2, g3); E.retimeByCost(tr);
  eq('Seia follows Neru at once; Rio goes when the bar shows 6 (3.5 left after Neru 4 and Seia 3: 4.7 s later, the regen boost from Seia comes in after 3.2 s) and keeps its planned cost 6', [g2.t < 217.23 && g2.t > 217.1, Math.abs((g2.t - g3.t) - 4.69) < 0.15, g3.cb], [true, true, 6]);
  eq('... and nothing is left to move', E.retimeByCost(tr), 0); }

// Rio's copy only appears E.COPY_DELAY (116 frames = 3.87 s) after her cast: before that the card is greyed out, so the copy cannot be cast. (Measured: 10 Rio casts in the Binah, Hod and Kaiten recordings, 3.79-3.97 s of game clock between her cost drop and the copy showing up.)
{ const names = ['Seia', 'Mika', 'Kotama (Camp)', 'Aru (Dress)', 'Rio', 'Kisaki'], mk = () => { const t = team(names); E.setTotal(240); return t; };
  eq('the delay is 116 frames', [E.COPY_DELAY, Math.round(E.COPY_DELAY * 30)], [116 / 30, 116]);
  { const t = mk(), r = cast(t, 'Rio', 200); r.target = id('Mika'); const c = cast(t, 'Mika', 190); c.copy = true; const plain = cast(t, 'Mika', 205);
    eq('copySource: the Rio cast that made the copy; a plain cast has none', [E.copySource(t, c) === r, E.copySource(t, plain)], [true, null]);
    const c2 = cast(t, 'Mika', 180); c2.copy = true; eq('a copy that was already used has no source for a second one (no new Rio cast)', E.copySource(t, c2), null);
    const r2 = cast(t, 'Rio', 185); r2.target = id('Mika'); eq('after a second Rio cast the later copy goes back to a source', E.copySource(t, c2) === r2, true);
    const t2 = mk(), r3 = cast(t2, 'Rio', 200); r3.target = id('Mika'); const other = cast(t2, 'Kotama (Camp)', 190); other.copy = true;
    eq('a copy of someone Rio did not copy has no source', E.copySource(t2, other), null); }
  { const t = mk(), r = cast(t, 'Rio', 200); r.target = id('Mika'); const c = cast(t, 'Mika', 197); c.copy = true;
    eq('a copy 3 s after Rio is inside the wait: busy until 196.133', [E.ownBusy(t, c, 197), E.copyWait(t, c)], [196.133, true]);
    eq('a copy 3.9 s after her is fine', [E.ownBusy(t, c, 196.1), E.copyWait(t, Object.assign({}, c, {t: 196.1}))], [null, false]);
    eq('the same cast as the real card (not a copy) has no wait', E.ownBusy(t, Object.assign({}, c, {copy: false}), 197), null);
    eq('the instant of her cast itself is not inside the wait of an earlier row', E.ownBusy(t, c, 200), null); }
  // tied right after Rio: lands where the copy shows up
  { const t = mk(), r = cast(t, 'Rio', 200); r.target = id('Mika'); r.id = 'rr'; const c = cast(t, 'Mika', 199.99); c.copy = true; c.after = 'rr'; c.id = 'cc'; const k = cast(t, 'Aru (Dress)', 199.98); k.after = 'cc'; k.id = 'kk';
    E.applyChains(t); eq('a copy tied to Rio is placed 3.87 s after her cast', c.t, 196.13);
    eq('... and what is tied to the copy follows it', k.t <= 196.12 && k.t >= 196.0, true);
    // a rotation saved before this rule: the row stays where it was (it is flagged), and Re-time by cost moves it
    c.t = 199.99; k.t = 199.98; E.applyChains(t); eq('a saved row inside the wait is left alone by a reload (and shows as busy)', [c.t, E.ownBusy(t, c, c.t) !== null], [199.99, true]);
    const n = E.retimeByCost(t); eq('Re-time by cost places the tied copy at 3.87 s after Rio and its kid after it', [c.t, k.t <= 196.12 && k.t >= 196.0, n >= 2], [196.13, true, true]);
    eq('... and a second Re-time has nothing left to move', E.retimeByCost(t), 0); }
  { const t = mk(), r = cast(t, 'Rio', 200); r.target = id('Mika'); const c = cast(t, 'Mika', 199); c.copy = true; c.cb = 3; E.placeByCost(t, t.casts.indexOf(c), 3);
    eq('a copy planned by cost never lands inside the wait', c.t <= 196.14, true); }
  { const t = mk(), r = cast(t, 'Rio', 200); r.target = id('Mika'); const c = cast(t, 'Mika', 190); c.copy = true; const before = c.t; E.applyChains(t);
    eq('a copy cast long after Rio is not touched', c.t, before); }
}

console.log(bad ? `\n${bad} scenario(s) failed` : '\nALL SCENARIOS PASS'); process.exit(bad ? 1 : 0);
