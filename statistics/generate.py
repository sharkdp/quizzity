import sqlite3
import json
from statistics import mean
from collections import defaultdict

# read countries and cities

with open('../geodata/countries.json') as f:
    countries = json.load(f)

with open('../geodata/cities-world.json') as f:
    cities = json.load(f)
    for city in cities:
        city['fullName'] = city['name'] + ', ' + countries[city['country']]

cityDict = {city['fullName']: (city['lat'], city['lng']) for city in cities}

# read games

conn = sqlite3.connect('../php/db/games.db')

distances = defaultdict(list)
guesses = defaultdict(list)

for row in conn.execute('SELECT * FROM games'):
    cs = json.loads(row[2])
    for c in cs:
        fname = c['fullName']
        distances[fname].append(c['distance'])
        guess = c['guess']
        if (guess['lat'] is None):
            print(c)
            continue
        guesses[fname].append((round(guess['lat'], 5), round(guess['lng'], 5)))

cities = [
    {
        'name': name,
        'guesses': guesses[name],
        'sigma': round(mean(dists)),
        'position': cityDict[name]
    } for (name, dists) in distances.items()
]

with open('cities.json', 'w') as f:
    sortedCities = sorted(cities, key=lambda d: d['sigma'])
    f.write(json.dumps(sortedCities))
