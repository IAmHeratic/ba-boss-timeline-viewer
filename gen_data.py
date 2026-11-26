"""Builds data.js from SchaleDB students.min.json (run: python gen_data.py <students.json>)."""
import json, re, sys
src = sys.argv[1]
s = json.load(open(src, encoding='utf8'))
WANT = [int(k) for k,v in s.items() if v.get('IsReleased',[True])[0] and 'Ex' in v['Skills']]

CAMEL = re.compile(r'(?<=[a-z])(?=[A-Z])')
NICE = {'CostRegen':'Cost Recovery','EnhanceExplosionRate':'Explosive DMG','EnhanceMysticRate':'Mystic DMG','EnhancePierceRate':'Piercing DMG','EnhanceSonicRate':'Sonic DMG','CriticalDamageRate':'Crit DMG','CriticalChanceResist':'Crit Rate Resist','ExDamage':'EX Skill DMG','ATK':'ATK','DEF':'DEF'}
# Skill names SchaleDB only has in Japanese so far (not localized yet): my own plain translations, so the whole site reads in English
JP_EN = {'フロイラインのスーツケース': "Fraulein's Suitcase", 'お互い苦労しますね': "We Both Have It Rough, Don't We", 'イブキのお友達！': "Ibuki's Friend", 'イブキも手伝う！': 'Ibuki Helps Too!', 'どれがいいかな？': 'Which One Should I Pick?', '万魔殿の良心+': "Pandemonium's Conscience+"}
def en(text):
    if not isinstance(text, str): return text
    for k, v in JP_EN.items(): text = text.replace(k, v)
    return text
def skill_text(raw, st):
    """A skill description for display: {1}, {2} stand for the numbers (one array per number, indexed by skill level); tags become plain names."""
    def tag(m):
        kind, key = m.group(1), m.group(2)
        if kind == 's':   # a skill of the same student, e.g. CH0345_ExtraPassive_01
            g = re.match(r'^.*?_([A-Za-z]+)_\d+$', key)
            sk = (st['Skills'].get(g.group(1)) or {}) if g else {}
            return sk.get('Name') or 'a passive'
        return NICE.get(key) or CAMEL.sub(' ', key)
    out = re.sub(r'<\?(\d+)>', lambda m: '{' + m.group(1) + '}', raw)
    out = re.sub(r'<([bdcse]):([^>]+)>', tag, out)
    return en(re.sub('<[^>]+>', '', out))
LABEL = {'EnhanceExDamageRate_Base':'EX Damage','AttackPower_Coefficient':'ATK','CriticalDamageRate_Coefficient':'Crit Damage',
         'DefensePower_Coefficient':'DEF','RegenCost_Base':'Cost Regen','ReduceWeakDamagedRate_Base':'Weak-hit dmg taken','EnhancePierceRate_Base':'Pierce Effectiveness','DodgePoint_Coefficient':'Dodge','DamagedRatio2_Coefficient':'Damage taken','CriticalDamageResistRate_Coefficient':'Crit Dmg Resist'}
out = {}
for i in WANT:
    x = s[str(i)]; ex = x['Skills']['Ex']
    if not ex.get('Cost') or not ex.get('Effects') and False: pass
    buffs = []
    for e in ex['Effects']:
        if e['Type'] == 'Summon' and e.get('Duration'):
            buffs.append({'stat': 'Summon', 'label': 'On field', 'target': 'Self', 'ms': e['Duration'], 'apply': 0, 'values': [0]*5, 'slot': 'Summon'})
        if e['Type'] == 'Buff' and e.get('Duration') and e.get('Value'):
            v = e['Value'][0]
            buffs.append({'stat': e['Stat'], 'label': LABEL.get(e['Stat'], e['Stat']),
                          'target': e['Target'][0] if e.get('Target') else '', 'ms': e['Duration'],
                          'apply': e.get('ApplyFrame', 0), 'values': v, 'slot': e.get('OverrideSlot')})
    if i == 20048:  # Cost Overload is not a 'Buff' effect in SchaleDB; duration/apply frame mirror the crit buff (26s, sources agree)
        crit = [b for b in buffs if b['stat'] == 'CriticalDamageRate_Coefficient'][0]
        buffs.append({'stat': 'CostOverload', 'label': 'Cost Overload', 'target': 'AllyMain', 'ms': crit['ms'], 'apply': crit['apply'], 'values': [0]*5})
    boost = None
    for slot in ('ExtraPassive', 'Passive', 'WeaponPassive'):
        q = x['Skills'].get(slot) or {}
        for e in q.get('Effects', []):
            if e.get('Stat') in ('RegenCost_Coefficient', 'RegenCost_Base') and set(e.get('Target', [])) & {'AllyMain', 'AllySupport'}:
                boost = {'slot': slot, 'stat': e['Stat'], 'values': e['Value'][0]}
    wp = x['Skills'].get('WeaponPassive', {})
    ext = None
    for e in wp.get('Effects', []):
        if e.get('Stat') == 'ExtendBuffDuration_Base':
            ext = {'values': e['Value'][0], 'name': en(wp['Name'])}
    pub = x['Skills'].get('Public')
    pubd = None
    if pub:
        m = re.search(r'Every (\d+)s', pub['Desc'])
        pubd = {'name': en(pub['Name']), 'interval': int(m.group(1)) if m else None,
                'desc': skill_text(pub['Desc'], x), 'params': pub.get('Parameters'), 'frames': pub.get('Duration', 60),
                'effects': [{'type': e['Type'], 'stat': e.get('Stat'), 'ms': e.get('Duration'), 'apply': e.get('ApplyFrame', 0),
                             'target': (e['Target'][0] if isinstance(e.get('Target'), list) else e.get('Target')), 'values': (e['Value'][0] if e.get('Value') else None)}
                            for e in pub['Effects'] if e['Type'] in ('Buff', 'Shield', 'Damage', 'Heal')]}
    # Alternate EX skills (a student whose EX changes after the first use, or by target): their own cost, animation and buffs. Cost[-1] is EX level 5.
    forms = []
    for xs in ex.get('ExtraSkills') or []:
        fb = []
        for e in xs.get('Effects', []):
            if e['Type'] == 'Buff' and e.get('Duration') and e.get('Value'):
                fb.append({'stat': e['Stat'], 'label': LABEL.get(e['Stat'], e['Stat']), 'target': e['Target'][0] if e.get('Target') else '', 'ms': e['Duration'],
                           'apply': e.get('ApplyFrame', 0), 'values': e['Value'][0], 'slot': e.get('OverrideSlot')})
        forms.append({'name': en(xs['Name']), 'desc': skill_text(xs['Desc'], x) if xs.get('Desc') else None, 'params': xs.get('Parameters'), 'costs': xs.get('Cost'), 'frames': xs.get('Duration') or ex.get('Duration', 90), 'buffs': fb})
    # An extra skill with no cost of its own, the same length as the EX and no buffs changes nothing the planner models, so it is not an EX the player can choose:
    # Kurumi's "Iron Defense" is the stance her own EX puts her in (it showed up as a second, identical option in the Rotation table).
    forms = [f for f in forms if f['costs'] or f['buffs'] or f['frames'] != ex.get('Duration', 90)]
    # Cost Recovery given to the student itself by a passive (not by the EX): timed (after an EX use) or permanent. values = one array per variant, indexed by skill level.
    # What the EX is aimed at, for the Target column: 'enemy' when it deals damage or puts an effect on an enemy, else nothing to aim (allies are told apart by the buffs / text in index.html)
    efx = ex.get('Effects', [])
    ex_target = 'enemy' if (any(e.get('Type') == 'Damage' for e in efx) or any('Enemy' in (e.get('Target') or []) for e in efx) or re.search(r'target enem|enemy target|one enem|an enem|to enem|nearest enem|all enem|enemies', ex['Desc'], re.I)) else 'none'
    heals_ = [e for e in efx if e.get('Type') == 'Heal']
    ex_heal_frame = next((e.get('ApplyFrame', 0) for e in heals_ if e.get('Target') != 'Self'), 0)   # the frame the heal on someone else lands, counted from the cast
    ex_heal = bool(heals_)   # the EX heals someone: it can heal a relic
    regen_fx = []
    for slot in ('ExtraPassive', 'Public', 'Passive'):
        for e in (x['Skills'].get(slot) or {}).get('Effects', []):
            if e.get('Stat') == 'RegenCost_Base' and e.get('Target') == ['Self']:
                regen_fx.append({'slot': slot, 'ms': e.get('Duration'), 'values': e['Value']})
    out[str(i)] = {'public': pubd, 'id': i, 'name': x['Name'], 'exName': en(ex['Name']),
                   'desc': skill_text(ex['Desc'], x), 'params': ex.get('Parameters'),
                   'squad': x.get('SquadType'), 'regenStat': x.get('RegenCost', 700), 'regenBoost': boost, 'cost': ex['Cost'][-1], 'costs': ex['Cost'], 'school': x.get('School'), 'armor': x.get('ArmorType'), 'bullet': x.get('BulletType'), 'exTarget': ex_target, 'exHeal': ex_heal, 'exHealFrame': ex_heal_frame, 'regenFx': regen_fx, 'forms': forms, 'frames': ex.get('Duration', 90), 'buffs': buffs, 'extend': ext}
open('data.js', 'w', encoding='utf8').write('const SCHALE = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print('ok', len(out))
