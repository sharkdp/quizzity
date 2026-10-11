#!/usr/bin/env python3
"""Regenerate cities.json from the current Quizzity schema (manual maintenance)."""
import argparse
import collections
import json
import os
from pathlib import Path
import sqlite3
import tempfile

p = argparse.ArgumentParser()
p.add_argument('database')
p.add_argument('geodata', type=Path)
p.add_argument('output', type=Path)
a = p.parse_args()
countries = json.loads((a.geodata / 'countries.json').read_text())
positions = {c['name'] + ', ' + countries[c['country']]: [c['lat'], c['lng']]
             for c in json.loads((a.geodata / 'cities-world.json').read_text())}
data = collections.defaultdict(lambda: {'guesses': [], 'total': 0, 'count': 0})
with sqlite3.connect('file:' + a.database + '?mode=ro', uri=True) as db:
    for name, lat, lng, distance in db.execute('SELECT c.name, g.lat, g.lng, g.distance FROM guesses g JOIN cities c ON c.id = g.city'):
        if name not in positions:
            continue
        d = data[name]
        if distance is not None:
            d['total'] += distance
            d['count'] += 1
        if lat is not None and lng is not None:
            d['guesses'].append([round(lat, 5), round(lng, 5)])
result = [{'name': name, 'position': positions[name], 'guesses': d['guesses'],
           'sigma': round(d['total'] / d['count'])}
          for name, d in data.items() if d['count']]
result.sort(key=lambda c: c['sigma'])
fd, tmp = tempfile.mkstemp(dir=a.output.parent, prefix='.statistics-')
try:
    with os.fdopen(fd, 'w') as f:
        json.dump(result, f, separators=(',', ':'))
    os.replace(tmp, a.output)
finally:
    if os.path.exists(tmp): os.unlink(tmp)
