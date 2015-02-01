/*jslint browser: true, nomen: true, white: true*/
/*global $*/
/*global _*/
/*global L*/

'use strict';

var Quizzity = function() {
    this.cities = []; // cities to guess
    this.markers = []; // map elements
};

Quizzity.prototype.initializeInterface = function() {
    // Set up the map and tiles
    this.map = L.map('map', {
        doubleClickZoom: false
    });

    this.layer = L.tileLayer(
        'tiles/{z}/{x}/{y}.png',
        {
            maxZoom: Quizzity.maxZoom,
            minZoom: Quizzity.minZoom,
            noWrap: true,
            tms: true
        }
    ).addTo(this.map);

    // Initial view
    this.map.fitWorld();
    this.map.panTo(Quizzity.mapCenter);

    // Register events
    this.map.on('click', _.bind(this.userClick, this));
    $('#start').click(_.bind(this.newGame, this));

    // HTML elements
    this.$dialog = $('#dialog');
    this.$panel = $('#panel');
    this.$points = $('#points');
};

Quizzity.maxZoom = 5;
Quizzity.minZoom = 2;
// usually a bad idea: a germany-based worldview:
Quizzity.mapCenter = L.latLng(50, 10);
Quizzity.citiesPerGame = 6;

Quizzity.prototype.currentCity = function() {
    return this.cities[this.pointer];
};

Quizzity.prototype.showCity = function() {
    var prefix;

    // Reset map (again), in case the user scrolled while viewing the dialog
    this.resetMapView();

    prefix = '<i class="fa fa-location-arrow"></i> ';
    this.$panel.html(prefix + this.currentCity().fullName);

    this.startTime = new Date().getTime();
};

Quizzity.prototype.newGame = function() {
    this.removeMarkers();

    // Select random cities and add information
    this.cities = _(Quizzity.dbCities)
        .sample(Quizzity.citiesPerGame)
        .map(function(city) {
            // Replace country code by country name
            city.countryName = Quizzity.dbCountries[city.country];

            city.fullName = decodeURIComponent(city.name) + ', ' +
                            decodeURIComponent(city.countryName);

            city.position = L.latLng(city.lat, city.lng);
            return city;
        }, this)
        .value();

    this.pointer = 0;

    this.showCity();

    this.$dialog.hide();
    this.$panel.slideDown(200);
};

Quizzity.prototype.showPoints = function() {
    var score, avgdist, sorted, bestcity, highscore, text, strprevious;

    this.$panel.slideUp(200);

    // Show all markers
    _.each(this.cities, function(city) {
        this.showMarkers(city, true);
    }, this);

    // Score
    score = _.reduce(this.cities, function(sum, city) {
        return sum + city.points;
    }, 0);

    // Average and best distance:
    avgdist = Math.round(_.reduce(this.cities, function(sum, city) {
        return sum + city.distance;
    }, 0) / Quizzity.citiesPerGame);

    sorted = _.sortBy(this.cities, 'distance');
    bestcity = _.first(sorted);

    // Highscore?
    highscore = localStorage.getItem('highscore');
    if (_.isString(highscore)) {
        highscore = parseInt(highscore, 10);
    }
    if (!_.isNumber(highscore)) {
        highscore = 0;
    }

    text = '<ul class="fa-ul">';
    if (score > highscore) {
        strprevious = '';
        if (highscore > 0) {
            strprevious = ' (was: ' + highscore.toString() + ')';
        }
        text += '<li><i class="fa-li fa fa-trophy"></i>New personal highscore!' + strprevious + '</li>';
    } else if (highscore > 0) {
        text += '<li><i class="fa-li fa fa-trophy"></i>Personal highscore: ' + highscore.toString() + '</li>';
    }
    text += '<li><i class="fa-li fa fa-area-chart"></i>Average distance: ' + avgdist.toString() + 'km</li>';
    text += '<li><i class="fa-li fa fa-thumbs-o-up"></i>Best guess: ' + bestcity.distance.toString() + 'km<br>(' + bestcity.fullName + ')</li>';
    text += '</ul>';

    if (score > highscore) {
        localStorage.setItem('highscore', score);
    }

    $('#dialogTitle').html(score.toString() + ' points');
    $('#dialogContent').html(text);
    $('#dialogLabel').html('Try again!');

    this.$dialog.fadeIn();
};

Quizzity.prototype.isGameActive = function() {
    return !_.isEmpty(this.cities) && this.pointer < Quizzity.citiesPerGame;
};

Quizzity.prototype.removeMarkers = function() {
    if (!_.isUndefined(this.markers)) {
        _.each(this.markers, function(m) {
            this.map.removeLayer(m);
        }, this);
    }
};

Quizzity.prototype.showMarkers = function(city, drawLine) {
    this.markers.push(
        L.marker(city.position, {
            icon: Quizzity.Icons.city,
            clickable: false,
            keyboard: false,
            title: city.fullName
        }).addTo(this.map)
    );

    this.markers.push(
        L.marker(city.guess, {
            icon: Quizzity.Icons.guess,
            clickable: false,
            keyboard: false
        }).addTo(this.map)
    );

    if (drawLine) {
        this.markers.push(
            L.polyline([city.guess, city.position], {
                color: 'black',
                weight: 3,
                opacity: 0.6,
                clickable: false
            }).addTo(this.map)
        );
    }
};

Quizzity.prototype.resetMapView = function() {
    this.map.setView(Quizzity.mapCenter, Quizzity.minZoom, {
        animation: true
    });
};

Quizzity.prototype.userClick = function(e) {
    var time, city, points, dist, multiplier;

    if (!this.isGameActive()) {
        return;
    }

    time = (new Date().getTime()) - this.startTime;

    city = this.currentCity();
    city.guess = e.latlng;

    // Calculate points
    points = 0;

    // Distance in kilometers
    dist = Math.round(city.guess.distanceTo(city.position) / 1000);

    if (dist < 15) { // Consider this exact
        points = 2000;
    } else if (dist < 1500) {
        points = 1500 - dist;
    }

    multiplier = 1;
    if (time < 1000) {
        multiplier = 1.4;
    } else if (time < 2000) {
        multiplier = 1.3;
    } else if (time < 3000) {
        multiplier = 1.2;
    } else if (time < 5000) {
        multiplier = 1.1;
    }

    points *= multiplier;
    points = Math.round(points);

    // Show on screen
    this.$points.html('<div class="points animated bounceOut" style="left: ' + e.containerPoint.x + 'px; top: ' + e.containerPoint.y + 'px">' + points.toString() + '</div>');

    // TODO: remove element

    // Save for stats
    city.distance = dist;
    city.points = points;
    city.time = time;

    this.resetMapView();

    this.pointer += 1;
    if (this.isGameActive()) {
        // Show guess and solution on the map
        this.removeMarkers();
        this.showMarkers(city, false);

        // Show next city in panel
        this.showCity();
    } else {
        // Game over!
        this.showPoints();
    }

    return true;
};

// font-awesome
L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

Quizzity.Icons = {
    guess: L.AwesomeMarkers.icon({
        icon: 'question-circle',
        markerColor: 'orange'
    }),
    city: L.AwesomeMarkers.icon({
        icon: 'check',
        markerColor: 'green'
    })
};


$(document).ready(function() {
    var game = new Quizzity();

    game.initializeInterface();

    // Load JSON data (countries and cities)
    $.getJSON('geodata/countries.json').success(function(countries) {
        Quizzity.dbCountries = countries;

        $.getJSON('geodata/cities-world.json', function(cities) {
            Quizzity.dbCities = cities;

            $('#dialog').show();
        });
    });
});
