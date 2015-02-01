#!/bin/bash

mkdir -p natural-earth-data
cd natural-earth-data

# Download countries and states/provices shapesfiles
for zipfile in ne_10m_admin_0_countries.zip ne_10m_admin_1_states_provinces.zip; do
    if [[ ! -e "$zipfile" ]]; then
        wget "http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/$zipfile"
    fi

    unzip "$zipfile"
done
