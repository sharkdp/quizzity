from collections import defaultdict
import csv
import json


def parseCSV(source, fields):
    data = []
    with open(source) as fs:
        reader = csv.reader(fs, delimiter='\t')

        for row in reader:
            data.append({
                field: typeconv(row[col])
                for field, (col, typeconv) in fields.items()
            })

        return data


def writeJSON(target, data):
    with open(target, "w") as ft:
        ft.write(json.dumps(data, sort_keys=True))
        print("{filename}: {num} datasets".format(filename=target, num=len(data)))


if __name__ == '__main__':
    # Read countries
    countriesRaw = parseCSV("countryInfo.txt", {
        'code': (0, str),
        'name': (4, str),
        'capital': (5, str),
        'region': (8, str)
    })

    # Write dictionary, which maps country codes to full names
    writeJSON("countries.json", {c['code']: c['name'] for c in countriesRaw})

    countries = {
        c['code']: {
            'name': c['name'],
            'capital': c['capital'],
            'region': c['region']
        } for c in countriesRaw
    }

    # Read cities
    cities = parseCSV("cities15000.txt", {
        'name': (1, str),
        'lat': (4, float),
        'lng': (5, float),
        'country': (8, str),
        'citizens': (14, int),
        'featureCode': (7, str)
    })

    datasets = defaultdict(list)
    numCities = defaultdict(int)

    for city in sorted(cities, key=lambda c: c['citizens'], reverse=True):
        citizens = city['citizens']
        fc = city['featureCode']

        # we do not want parts of larger cities:
        if fc == 'PPLX':
            continue

        isCapital = (fc == 'PPLC')
        countryCode = city['country']
        region = countries[countryCode]['region']

        # we need only certain fields in the JSON output
        item = {key: city[key] for key in ['name', 'lat', 'lng', 'country']}

        if isCapital or (citizens >= 500000 and numCities[countryCode] < 3):
            datasets['world'].append(item)
            if not isCapital:
                numCities[countryCode] += 1

        if citizens >= 200000 and region == 'EU' and city['country'] != 'RU':
            datasets['EU'].append(item)

        if isCapital:
            datasets['capitals'].append(item)

    for name, items in datasets.items():
        writeJSON("cities-" + name + ".json", items)
