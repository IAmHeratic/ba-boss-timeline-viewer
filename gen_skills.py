"""Builds skills.js: the skill texts the Team tab shows (Normal Attack, EX, Basic, Enhanced, Sub) exactly as SchaleDB writes them.
Run: python gen_skills.py <students.json> [localization.json]
  students.json     the same SchaleDB file gen_data.py reads (research/students.json)
  localization.json SchaleDB's English strings (research/schaledb-localization.json, from https://schaledb.com/data/en/localization.min.json): buff names and tooltips
The descriptions keep SchaleDB's own markup (<?1> = a number that depends on the skill level, <b:ATK> / <d:DEF> / <c:Stun> / <s:...> = a buff, debuff, crowd control or
status tag with its icon, <kb:1> = a knockback distance, plain <b> = bold): index.html turns that into the same coloured numbers and icons the site shows."""
import json, re, sys
from gen_common import en

src = sys.argv[1]
loc = json.load(open(sys.argv[2] if len(sys.argv) > 2 else 'research/schaledb-localization.json', encoding='utf8'))
students = json.load(open(src, encoding='utf8'))
have = set(int(k) for k in re.findall(r'"(\d+)": \{"public"', open('data.js', encoding='utf8').read()))   # the students the page knows (same list as data.js)

UI = loc['UI']
NORMAL = {'Circle': ('skill_normalattack_circle', 'COMMON_SKILLICON_CIRCLE'), 'Obb': ('skill_normalattack_line', 'COMMON_SKILLICON_LINE'), 'Fan': ('skill_normalattack_fan', 'COMMON_SKILLICON_FAN')}
TAGKIND = {'b': 'Buff', 'd': 'Debuff', 'c': 'CC', 's': 'Special'}
used = set()   # buff ids that appear in some description, e.g. Buff_ATK

def buffs_in(text):
    for m in re.finditer(r"<([bdcs]):(\w+)(?:='[^']*')?>", text or ''):
        used.add(TAGKIND[m.group(1)] + '_' + m.group(2))

def radius_of(s):
    out = []
    for r in s.get('Radius') or []:
        out.append({k: r[k] for k in ('Type', 'Radius', 'ExcludeRadius', 'Degree', 'Width', 'Height') if k in r})
    return out

def effects_of(s, normal_first=False):
    """Only what the text needs: the damage effect each <?n> belongs to (hit weights, damage per level, cover) and the knockback distances."""
    out = []
    for e in s.get('Effects') or []:
        if 'DescParamId' in e: out.append({'id': e['DescParamId'], 'h': e.get('Hits'), 's': e['Scale'], 'b': e.get('Block')})
        elif e['Type'] == 'Knockback': out.append({'k': 1, 's': e['Scale']})
    return out

def skill(s, typ, extra_ok=True):
    d = en(s.get('Desc') or '')
    buffs_in(d)
    out = {'t': typ, 'n': en(s['Name']), 'd': d, 'p': s.get('Parameters') or [], 'i': s.get('Icon')}
    if s.get('Cost'): out['c'] = s['Cost']
    if s.get('Duration'): out['u'] = s['Duration']
    if s.get('Range'): out['r'] = s['Range']
    if s.get('Radius'): out['o'] = radius_of(s)
    out['e'] = effects_of(s)
    if extra_ok and s.get('ExtraSkills'):
        out['x'] = [skill(x, x.get('Type') or typ, False) for x in s['ExtraSkills']]
    return out

def normal(st, base, name):
    """SchaleDB writes the normal attack's text itself from the shape of its hit area, and every normal attack is 100% damage."""
    rad = (base.get('Radius') or [{}])[0].get('Type')
    key, icon = NORMAL.get(rad, ('skill_normalattack_target', 'COMMON_SKILLICON_TARGET'))
    s = {'t': 'Normal', 'n': name, 'd': UI[key], 'p': [['100%']], 'i': icon, 'r': st['Range'], 'e': []}
    if base.get('Radius'): s['o'] = radius_of(base)
    eff = [e for e in base.get('Effects') or [] if e['Type'] == 'Damage']
    if eff: s['e'] = [{'id': 1, 'h': eff[0].get('Hits'), 's': eff[0]['Scale'], 'b': eff[0].get('Block')}]
    return s, eff

def normal_augmented(st, fc):
    """A normal attack that changes (Toki, Kirara, ...): each damage effect after the first is "additional damage", and each number is that effect's total per hit table."""
    s, eff = normal(st, fc, 'Normal Attack (Augmented)')
    n = len(eff[0]['Scale']) if eff else 1
    s['p'], s['e'] = [], []
    for h, g in enumerate(eff):
        if h > 0 and not g.get('ExcludeDesc'): s['d'] += '\n' + UI['skill_normalattack_additional'].replace('{0}', str(h + 1))
        row = []
        for m in range(n):
            tot = sum(g.get('Hits') or [10000])
            row.append(('%.2f' % (round(g['Scale'][m] * (tot / 1e4)) / 100)).rstrip('0').rstrip('.') + '%')
        s['p'].append(row)
        if not (h > 0 and g.get('ExcludeDesc')): s['e'].append({'id': h + 1, 'h': g.get('Hits'), 's': g['Scale'], 'b': g.get('Block')})
    return s

out = {}
for k, st in students.items():
    i = int(k)
    if i not in have: continue
    sk = st['Skills']
    rec = {'b': st['BulletType'], 'a': [st.get('AmmoCount'), st.get('AmmoCost')], 's': []}
    if sk.get('Normal'):   # Specials have no normal attack in the data (the site shows none for them either)
        rec['s'].append(normal(st, sk['Normal'], loc['SkillType']['Normal'])[0])
        if sk['Normal'].get('FormChange'): rec['s'].append(normal_augmented(st, sk['Normal']['FormChange']))
    for typ in ('Ex', 'Public', 'Passive', 'ExtraPassive'):
        if sk.get(typ): rec['s'].append(skill(sk[typ], typ))
    out[str(i)] = rec

tags = {}
for b in sorted(used):
    name, long_, tip = loc['BuffName'].get(b), loc['BuffNameLong'].get(b), loc['BuffTooltip'].get(b)
    if name is None: print('no name for', b); continue
    tags[b] = [name, long_ or name, loc['BuffType'][b.split('_')[0]], tip or '']

db = {'buffs': tags, 'type': loc['SkillType'], 'students': out}
open('skills.js', 'w', encoding='utf8').write('// Generated by gen_skills.py from SchaleDB (skill texts, with SchaleDB\'s own markup). Loaded by index.html the first time a student\'s skills are opened.\nconst SKILLDB = ' + json.dumps(db, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('ok', len(out), 'students,', len(tags), 'buff tags')
