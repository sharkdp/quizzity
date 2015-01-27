# Geodata

* The bash script ``build.sh`` downloads two geodata ``.txt`` databases from http://geonames.org/ 
  (see``build.sh`` for exact urls).
* The python script ``createJSON.py`` compiles several JSON files out of this data.

## countries.json

A dictionary which maps the country codes to full country names.

## cities-world.json

This file includes the following cities:
* Every capital city (such that we have at least one entry per country).
* The three biggest cities of each country (not including the capital) if they have a population of over 500,000.
