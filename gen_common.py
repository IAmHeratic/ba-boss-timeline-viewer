"""Shared by gen_data.py and gen_skills.py."""
# Skill names SchaleDB only has in Japanese so far (not localized yet): my own plain translations, so the whole site reads in English
JP_EN = {'フロイラインのスーツケース': "Fraulein's Suitcase", 'お互い苦労しますね': "We Both Have It Rough, Don't We", 'イブキのお友達！': "Ibuki's Friend", 'イブキも手伝う！': 'Ibuki Helps Too!', 'どれがいいかな？': 'Which One Should I Pick?', '万魔殿の良心+': "Pandemonium's Conscience+"}
def en(text):
    if not isinstance(text, str): return text
    for k, v in JP_EN.items(): text = text.replace(k, v)
    return text
