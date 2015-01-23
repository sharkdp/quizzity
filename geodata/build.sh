#!/bin/bash

if [[ ! -e "cities15000.txt" ]]; then
    wget http://download.geonames.org/export/dump/cities15000.zip
    unp cities15000.zip
    rm cities15000.zip
fi

if [[ ! -e "countryInfo.txt" ]]; then
    wget http://download.geonames.org/export/dump/countryInfo.txt

    # remove CSV comments:
    sed -i -e '/^#.*$/d' countryInfo.txt
fi

python3 convert.py
