// The Skills window (Team tab): skill texts must read exactly as on SchaleDB, with the same numbers, icons and tags.
// Expected wording below is copied from SchaleDB's Skills tab for Mika (Global data, checked 2026-11-26).
const { load, read } = require('./load');
const E = load(), D = E.SCHALE, DB = E.SKILLDB;
let bad = 0;
const eq = (name, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want); if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)); };
const plain = h => h.replace(/<[^>]+>/g, '').replace(/&times;/g, '×').replace(/&deg;/g, '°').replace(/&amp;/g, '&');
const id = n => +Object.keys(D).find(k => D[k].name === n);
const rec = n => DB.students[id(n)], skill = (n, t) => rec(n).s.find(s => s.t === t);
const maxOf = t => t === 'Ex' ? 5 : t === 'Normal' ? 1 : 10;
const text = (n, t) => plain(E.skillTextHtml(skill(n, t), maxOf(t), rec(n).b));

// 1. the wording on the site (Mika at max level)
eq('Mika Normal Attack', text('Mika', 'Normal'), 'Deals 100% damage to one enemy.');
eq('Mika EX Skill (Kyrie Eleison)', text('Mika', 'Ex'), 'Deals 1540% damage to one enemy. Damage is multiplied by up to 2× the higher the current HP of the target.');
eq('Mika Basic Skill (Call of the Stars)', text('Mika', 'Public'), 'Every 5 normal attacks, deals 169% damage to one enemy. Every 3 times this skill is activated, summons a meteorite dealing an additional 339% damage.');
eq('Mika Enhanced Skill (Gloria Patri)', text('Mika', 'Passive'), 'Increases ATK by 26.6%.');
eq('Mika Sub Skill (Benedictio), two lines', text('Mika', 'ExtraPassive'), 'All attacks will deal guaranteed critical damage.\nIncreases Damage Dealt by 24.2% and reduces Incoming Damage by 12.2%.');
eq('names and types', rec('Mika').s.map(s => [s.n, DB.type[s.t]]), [['Normal Attack', 'Normal Attack'], ['Kyrie Eleison', 'EX Skill'], ['Call of the Stars', 'Basic Skill'], ['Gloria Patri', 'Enhanced Skill'], ['Benedictio', 'Sub Skill']]);
eq('the text follows the skill level (EX Lv 1: 810%)', plain(E.skillTextHtml(skill('Mika', 'Ex'), 1, 'Pierce')).slice(0, 26), 'Deals 810% damage to one e');
eq('Basic at Lv 1 and Lv 10', [1, 10].map(l => plain(E.skillTextHtml(skill('Mika', 'Public'), l, 'Pierce')).match(/deals ([\d.]+%)/)[1]), ['89.4%', '169%']);

// 2. symbols: numbers coloured by attack type, cover icons, buff tags with their icon, the hover text
{ const ex = E.skillTextHtml(skill('Mika', 'Ex'), 5, 'Pierce'), pub = E.skillTextHtml(skill('Mika', 'Public'), 10, 'Pierce'), pas = E.skillTextHtml(skill('Mika', 'Passive'), 10, 'Pierce'), sub = E.skillTextHtml(skill('Mika', 'ExtraPassive'), 10, 'Pierce');
  eq('numbers take the attack type colour (Mika is Piercing)', ex.includes('class="no-wrap ba-col-pierce text-hits"'), true);
  eq('EX 1540% partially ignores cover: the half-shield icon', ex.includes('images/ui/Cover_PartialBlock.png') && !ex.includes('Cover_NoBlock'), true);
  eq('Basic Skill: the first number respects cover (no icon), the meteorite ignores it (full icon)', [(pub.match(/Cover_NoBlock/g) || []).length, (pub.match(/Cover_PartialBlock/g) || []).length], [1, 0]);
  eq('the meteorite number is the one with the icon', /Cover_NoBlock\.png" alt=""><span>339%/.test(pub), true);
  eq('ATK is a buff tag with its own icon', pas.includes('<span class="ba-skill-buff"') && pas.includes('images/buff/Buff_ATK.webp') && pas.includes('<span class="buff-label">ATK</span>'), true);
  eq('Damage Dealt / Incoming Damage tags', ['Buff_DamageRatio', 'Buff_DamagedRatio'].every(b => sub.includes('images/buff/' + b + '.webp')) && sub.includes('>Damage Dealt<') && sub.includes('>Incoming Damage<'), true);
  eq('the buff tag explains itself on hover', pas.includes('title="ATK Up (Buff)\nIncreases the amount of damage dealt by attacks."'), true); }
eq('hits tooltip of the EX: 11 hits, 77.02% x10 and 770.18% x1 (the site\'s sums)', E.skillHitsTip(skill('Mika', 'Ex').e[0], 5), '11 hits\n77.02% ×10\n770.18% ×1\nPartially Ignores Cover');
eq('hits tooltip of the meteorite: one hit that ignores cover', E.skillHitsTip(skill('Mika', 'Public').e[1], 10), '1 hit\n339.84% ×1\nIgnores Cover');
{ const by = bullet => { const k = Object.keys(D).find(k => DB.students[k].b === bullet && D[k].squad === 'Main'); return E.skillTextHtml(DB.students[k].s.find(s => s.t === 'Ex'), 5, bullet); };
  eq('the number colour follows the student\'s attack type (Explosive, Piercing, Mystic, Sonic)', ['Explosion', 'Pierce', 'Mystic', 'Sonic'].map(t => by(t).includes('ba-col-' + t.toLowerCase() + ' ')), [true, true, true, true]); }

// 3. the card: type line, COST, pills
{ const html = E.skillCardHtml(skill('Mika', 'Ex'), 5, rec('Mika'), 'Pierce', false), pills = n => E.skillPillsHtml(skill('Mika', n), rec('Mika')).map(p => plain(p));
  eq('EX card: "EX Skill / COST: 6", name, hexagon icon', [html.includes('<i>EX Skill</i>'), plain(html).includes('COST: 6'), html.includes('<h4>Kyrie Eleison</h4>'), html.includes('images/skill/COMMON_SKILLICON_TARGET.webp')], [true, true, true, true]);
  eq('EX pills: range 650 and 5.9s', pills('Ex'), ['650', '5.9s']);
  eq('Basic pills: range 650 and 3s', pills('Public'), ['650', '3s']);
  eq('Normal Attack pills: range 450 and the magazine 25 (5)', pills('Normal'), ['450', '25 (5)']);
  eq('passives have no pills', pills('Passive'), []);
  eq('animation time tooltip carries the frames', E.skillPillsHtml(skill('Mika', 'Ex'), rec('Mika')).some(p => p.includes('Skill Animation: 5.9s (177 frames)')), true);
  eq('a skill whose cost changes with level colours it (cost box has the type class)', /class="cost ba-col-pierce"/.test(E.skillCardHtml({ ...skill('Mika', 'Ex'), c: [6, 6, 6, 6, 5] }, 5, rec('Mika'), 'Pierce', false)), true); }
eq('a plain card keeps the cost uncoloured when it does not change', /class="cost "/.test(E.skillCardHtml(skill('Mika', 'Ex'), 5, rec('Mika'), 'Pierce', false)), true);

// 3b. the window reads every skill at the level set on the student's card (read-only: no sliders)
{ const r = rec('Mika'), kis = rec('Kisaki'), all = ['Public', 'Passive', 'ExtraPassive'];
  const lv = (d, L) => E.skillLevelsFor(d, L);
  eq('which card level each kind of skill reads at: EX from EX Lv, Basic and Enhanced from Basic Lv, Sub from Basic Lv when the card has no Sub box', lv(D[id('Mika')], { ex: 3, basic: 7, sub: 10 }), { Ex: 3, Public: 7, Passive: 7, ExtraPassive: 7 });
  eq('a student whose card has a Sub Lv box reads the Sub Skill at it', lv(D[id('Kisaki')], { ex: 5, basic: 10, sub: 4 }), { Ex: 5, Public: 10, Passive: 10, ExtraPassive: 4 });
  eq('Sub Lv 0 (locked) is shown at Lv 1', lv(D[id('Kisaki')], { ex: 5, basic: 10, sub: 0 }).ExtraPassive, 1);
  const txt = (types, l) => plain(E.skillPanelHtml(r, types, l));
  eq('EX Lv 1 reads 810%, EX Lv 5 reads 1540%', [txt(['Ex'], 1).includes('810%'), txt(['Ex'], 5).includes('1540%'), txt(['Ex'], 1).includes('1540%')], [true, true, false]);
  eq('EX panel shows the cost line', txt(['Ex'], 5).includes('EX Skill') && txt(['Ex'], 5).includes('COST: 6'), true);
  eq('one panel, each skill at its own level (Basic Lv 1 but Sub Lv 10): 89.4% Basic, 14% Enhanced, 24.2% / 12.2% Sub', ['89.4%', '178%', '14%', '24.2%', '12.2%'].every(x => txt(all, { Public: 1, Passive: 1, ExtraPassive: 10 }).includes(x)), true);
  eq('Basic Lv 10 reads 169%, 339%, 26.6%', ['169%', '339%', '26.6%'].every(x => txt(all, { Public: 10, Passive: 10, ExtraPassive: 10 }).includes(x)), true);
  eq('the panels hold the five skills of a Striker in the order the site uses', ['Normal', 'Ex', 'Public', 'Passive', 'ExtraPassive'].map(t => (E.skillPanelHtml(r, [t], 5).match(/<h4>([^<]+)<\/h4>/) || [])[1]), ['Normal Attack', 'Kyrie Eleison', 'Call of the Stars', 'Gloria Patri', 'Benedictio']);
  eq('the panel for a skill type a student does not have is empty (a Special has no Normal Attack)', E.skillPanelHtml(kis, ['Normal'], 1), ''); }

// 4. related skills (an EX that has others under it) are drawn under it
{ const withX = Object.keys(DB.students).filter(k => DB.students[k].s.some(s => s.x && s.x.length));
  eq('students with related skills exist (22 of them in the data)', withX.length > 10, true);
  const k = withX[0], r = DB.students[k], parent = r.s.find(s => s.x && s.x.length), html = E.skillCardHtml(parent, 5, r, r.b, false);
  eq('the card has a Related button and each related skill as a small card', [html.includes('data-skrel'), (html.match(/sk-icon small/g) || []).length], [true, parent.x.length]); }

// 5. students: who has what
eq('every student the page knows has skill data', Object.keys(D).filter(k => !DB.students[k]), []);
eq('every student has an EX', Object.keys(D).filter(k => !DB.students[k].s.some(s => s.t === 'Ex')), []);
eq('Specials have no Normal Attack (the data has none)', Object.keys(D).filter(k => D[k].squad !== 'Main' && DB.students[k].s.some(s => s.t === 'Normal')), []);
eq('Strikers do', Object.keys(D).filter(k => D[k].squad === 'Main' && !DB.students[k].s.some(s => s.t === 'Normal')), []);
eq('the skill order is Normal, EX, Basic, Enhanced, Sub', Object.keys(D).filter(k => { const o = DB.students[k].s.map(s => ['Normal', 'Ex', 'Public', 'Passive', 'ExtraPassive'].indexOf(s.t)).filter(x => x >= 0); return o.some((x, i) => i && x < o[i - 1]); }), []);
eq('Kurumi\'s Iron Defense is a related skill of her EX, as on the site (it is the stance\'s effect text, not a second EX to pick in the Rotation tab)', (skill('Kurumi', 'Ex').x || []).map(x => x.n), ['Iron Defense']);

// 6. sweep: every skill of every student at every level draws cleanly
{ let n = 0; const problems = [];
  const check = (who, sk, lv, bullet, extra) => { const h = E.skillCardHtml(sk, lv, DB.students[who], bullet, extra); n++;
    const p = plain(h);
    if (/<\?\d|<[bdcs]:|&lt;|undefined|NaN|\[object|\{\d\}/.test(h)) problems.push([D[who].name, sk.n, lv, 'leftover markup or a bad value']);
    if (!sk.n || !sk.i) problems.push([D[who].name, sk.t, 'missing name or icon']);
    if ((h.match(/<span/g) || []).length !== (h.match(/<\/span>/g) || []).length) problems.push([D[who].name, sk.n, lv, 'unbalanced span']);
    if (!['Explosion', 'Pierce', 'Mystic', 'Sonic'].includes(bullet)) problems.push([D[who].name, 'attack type', bullet]);
    (sk.x || []).forEach(x => check(who, x, lv, bullet, true)); };
  for (const who of Object.keys(DB.students)) { const r = DB.students[who];
    for (const sk of r.s) for (let lv = 1; lv <= maxOf(sk.t); lv++) check(who, sk, lv, r.b, false); }
  eq(`all ${n} skill cards (every student, skill and level) draw with no leftover markup or bad value`, problems.slice(0, 5), []); }
eq('every buff tag used in a text has its name, type and tooltip', Object.entries(DB.buffs).filter(([k, v]) => !v[0] || !v[1] || !v[2]).map(x => x[0]), []);
eq('and every tag in the texts is in that table', (() => { const miss = new Set(); const scan = s => { for (const m of (s.d || '').matchAll(/<([bdcs]):(\w+)/g)) { const id = { b: 'Buff', d: 'Debuff', c: 'CC', s: 'Special' }[m[1]] + '_' + m[2]; if (!DB.buffs[id]) miss.add(id); } (s.x || []).forEach(scan); }; Object.values(DB.students).forEach(r => r.s.forEach(scan)); return [...miss]; })(), []);
eq('knockback distances are numbers (7 skills use <kb:n>)', (() => { const out = []; Object.keys(DB.students).forEach(k => DB.students[k].s.forEach(s => { if (/<kb:/.test(s.d)) out.push(plain(E.skillTextHtml(s, 5, 'Pierce')).includes('NaN') || /<kb/.test(E.skillTextHtml(s, 5, 'Pierce'))); })); return out.length >= 7 ? out.every(x => x === false) : out; })(), true);
eq('the Skills window is in index.html (button on the card, the window, the loader), is for reference only (no sliders or other controls in it) and nothing is left of an in-card or section version', (h => ['data-skills=', 'id="skillwin"', "s.src = 'skills.js", 'openSkills'].every(x => h.includes(x)) && !h.includes('data-sklv') && !h.includes('skLevelRow') && !h.includes('sk-level') && !h.includes('class="sks"') && !h.includes('skillsec'))(read('index.html')), true);

console.log(bad ? `\n${bad} SKILL CHECK(S) FAILED` : '\nALL SKILL CHECKS PASS');
process.exit(bad ? 1 : 0);
