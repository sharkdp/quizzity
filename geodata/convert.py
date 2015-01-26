from collections import defaultdict
import csv
import json


def parseCSV(source, fields):
    data = []
    with open(source) as fs:
        reader = csv.reader(fs, delimiter='\t')

        for row in reader:
            data.append({field: row[col] for field, col in fields.items()})

        return data


def writeJSON(target, data):
    with open(target, "w") as ft:
        ft.write(json.dumps(data))
        print("{filename}: {num} datasets".format(filename=target, num=len(data)))


if __name__ == '__main__':
    # Read countries
    countriesRaw = parseCSV("countryInfo.txt", {
        'code': 0,
        'name': 4,
        'capital': 5,
        'region': 8
    })

    countries = {
        c['code']: {
            'name': c['name'],
            'capital': c['capital'],
            'region': c['region']
        } for c in countriesRaw
    }

    writeJSON("countries.json", countries)

    # Read cities
    citiesRaw = parseCSV("cities15000.txt", {
        'name': 1,
        'lat': 4,
        'lng': 5,
        'country': 8,
        'citizens': 14,
        'featureCode': 7
    })

    cities = defaultdict(list)
    for city in citiesRaw:
        citizens = int(city['citizens'])
        fc = city['featureCode']

        # we don't want parts of larger cities:
        if fc == 'PPLX':
            continue

        city = {
            'name': city['name'],
            'lat': float(city['lat']),
            'lng': float(city['lng']),
            'country': city['country']
        }

        region = countries[city['country']]['region']

        if citizens >= 500000:
            cities['world'].append(city)

        if citizens >= 200000 and region == 'EU' and city['country'] != 'RU':
            cities['EU'].append(city)

        if fc == 'PPLC':
            cities['capitals'].append(city)

    for key, data in cities.items():
        writeJSON("cities-" + key + ".json", data)
