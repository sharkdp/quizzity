# quizzity

quizzity is a geographical quiz built on top of a Leaflet map. You have to guess the location of several cities on a map while receiving points for being both accurate and fast.

[**Play the game here!**](https://david-peter.de/quizzity/)

### Score distribution
![Score distribution](https://raw.githubusercontent.com/sharkdp/quizzity/master/statistics/histogram.png)

### JavaScript libraries, CSS, icons
* Leaflet - http://leafletjs.com
* lodash - https://lodash.com
* jquery - http://jquery.com
* Leaflet.awesome-markers - https://github.com/lvoogdt/Leaflet.awesome-markers
* Leaflet.Geodesic - https://github.com/henrythasler/Leaflet.Geodesic
* font-awesome - http://fortawesome.github.io/Font-Awesome
* Animate.css - https://github.com/daneden/animate.css

### Geodata, map rendering
* GeoNames - http://www.geonames.org
* Natural Earth - http://www.naturalearthdata.com/
* Tilemill - https://www.mapbox.com/tilemill/
* python-mbtiles - https://github.com/perrygeo/python-mbtiles

The game idea is inspired by [Geosense](http://www.geosense.net/).

### PHP backend and statistics

Set `QUIZZITY_DB` to the absolute path of a writable SQLite database with the
existing Quizzity schema. Keep the database outside the public document root;
it is live data and must be backed up separately. Both PHP endpoints use this
environment variable. No database or credentials belong in Git.

To regenerate the checked-in map statistics from a database snapshot:

```sh
python3 statistics/generate-statistics.py /path/to/games.db geodata statistics/cities.json
```

Review the resulting JSON before committing it. This is a manual maintenance
operation, not part of serving the website.

### Build and preview

```sh
npm ci --ignore-scripts
npm run build
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000 for a static preview. PHP endpoints need a PHP-capable
server and the environment configuration above; a static preview cannot log games.

Browser libraries are installed from npm with exact versions and integrity hashes
in `package-lock.json`, then copied to `dist/assets` with their licenses. CSS is
compiled from LESS. No Bower installation or tracked library sources are needed.
The build explicitly excludes the game database, private configuration and caches.

The original unlabeled map tiles remain tracked in `tiles/`. Their preserved hashes
are recorded in `tiles-sha256.json`. `map/` contains the historical rendering setup.
