import sqlite3
import json

# read countries and cities

with open("../../geodata/countries.json") as f:
    countries = json.load(f)

db_new = sqlite3.connect("games.db")

with open("../../geodata/cities-world.json") as f:
    cities = json.load(f)
    for city in cities:
        fullName = city["name"] + ", " + countries[city["country"]]
        print(fullName)
        db_new.execute("INSERT INTO cities (name) VALUES (?)", (fullName, ))

db_new.commit()
