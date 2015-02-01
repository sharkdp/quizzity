#!/bin/bash

if [[ ! -e python-mbtiles ]]; then
    git clone "https://github.com/perrygeo/python-mbtiles"
fi

tilefile="quizzity.mbtiles"
tiledir="tiles"

rm -f "$tilefile"
rm -r $tiledir

# render tiles to mbtiles file
tilemill export quizzity "$tilefile"

# export from sqlite database (mbtiles) to png images
python python-mbtiles/mbtiles2files.py -f "$tilefile" -o "$tiledir"

# cleanup
rm -f "$tilefile" "quizzity.export-failed" "quizzity.export"
