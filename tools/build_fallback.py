from pathlib import Path
import csv, json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'

def read_csv(name):
    with (DATA / name).open('r', encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def write_js(target, key, rows):
    text = 'window.NODOKA_DATA = window.NODOKA_DATA || {};\n'
    text += f'window.NODOKA_DATA.{key} = ' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
    (DATA / target).write_text(text, encoding='utf-8')

write_js('fallback_dialogues.js', 'dialogues', read_csv('dialogues.csv'))
write_js('fallback_poses.js', 'poses', read_csv('poses.csv'))
write_js('fallback_events.js', 'events', read_csv('events.csv'))
print('fallback files rebuilt')
