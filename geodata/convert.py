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


if __name__ == '__main__':
    # Read countries
    countriesRaw = parseCSV("countryInfo.txt", {
        'code': 0,
        'name': 4,
        'capital': 5
    })

    countries = {
        c['code']: {
            'name': c['name'],
            'capital': c['capital']
        } for c in countriesRaw
    }

    writeJSON("countries.json", countries)
    print("Saved {} countries".format(len(countries)))

    # Read cities
    citiesRaw = parseCSV("cities15000.txt", {
        'name': 1,
        'lat': 4,
        'lng': 5,
        'country': 8,
        'citizens': 14
    })

    cities = []
    for city in citiesRaw:
        citizens = int(city['citizens'])

        if citizens >= 100000:
            lat = float(city['lat'])
            lng = float(city['lng'])

            cities.append({
                'name': city['name'],
                'lat': lat,
                'lng': lng,
                'citizens': citizens,
                'country': city['country']
            })

    writeJSON("cities.json", cities)
    print("Saved {} cities".format(len(cities)))
