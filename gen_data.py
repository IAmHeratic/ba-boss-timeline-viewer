"""Builds data.js from SchaleDB students.min.json (run: python gen_data.py <students.json>)."""
import json, re, sys
src = sys.argv[1]
s = json.load(open(src, encoding='utf8'))
WANT = [int(k) for k,v in s.items() if v.get('IsReleased',[True])[0] and 'Ex' in v['Skills']]
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
            ext = {'values': e['Value'][0], 'name': wp['Name']}
    pub = x['Skills'].get('Public')
    pubd = None
    if pub:
        m = re.search(r'Every (\d+)s', pub['Desc'])
        pubd = {'name': pub['Name'], 'interval': int(m.group(1)) if m else None,
                'desc': re.sub('<[^>]+>', '', pub['Desc']), 'frames': pub.get('Duration', 60),
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
        forms.append({'name': xs['Name'], 'costs': xs.get('Cost'), 'frames': xs.get('Duration') or ex.get('Duration', 90), 'buffs': fb})
    # Cost Recovery given to the student itself by a passive (not by the EX): timed (after an EX use) or permanent. values = one array per variant, indexed by skill level.
    regen_fx = []
    for slot in ('ExtraPassive', 'Public', 'Passive'):
        for e in (x['Skills'].get(slot) or {}).get('Effects', []):
            if e.get('Stat') == 'RegenCost_Base' and e.get('Target') == ['Self']:
                regen_fx.append({'slot': slot, 'ms': e.get('Duration'), 'values': e['Value']})
    out[str(i)] = {'public': pubd, 'id': i, 'name': x['Name'], 'exName': ex['Name'],
                   'desc': re.sub('<[^>]+>', '', ex['Desc']), 'params': ex.get('Parameters'),
                   'squad': x.get('SquadType'), 'regenStat': x.get('RegenCost', 700), 'regenBoost': boost, 'cost': ex['Cost'][-1], 'costs': ex['Cost'], 'school': x.get('School'), 'armor': x.get('ArmorType'), 'regenFx': regen_fx, 'forms': forms, 'frames': ex.get('Duration', 90), 'buffs': buffs, 'extend': ext}
open('data.js', 'w', encoding='utf8').write('const SCHALE = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print('ok', len(out))
