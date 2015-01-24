/*jslint browser: true, nomen: true, white: true, vars: true, todo: true*/
/*global $*/
/*global _*/
/*global L*/
/*global alertify*/

'use strict';

L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

var Icons = {
    guess: L.AwesomeMarkers.icon({
        icon: 'question-circle',
        markerColor: 'orange'
    }),
    city: L.AwesomeMarkers.icon({
        icon: 'check',
        markerColor: 'green'
    })
};

var Quizzity = function() {
    this.cities = []; // cities to guess

    // Set up the map and tiles
    this.map = L.map('map', {
        doubleClickZoom: false
    });

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        id: 'sharkdp.e01ecf2e',
        maxZoom: Quizzity.maxZoom,
        minZoom: Quizzity.minZoom,
        noWrap: true
    }).addTo(this.map);

    // Initial view
    this.map.fitWorld();
    this.map.panTo(Quizzity.mapCenter);

    // Register events
    this.map.on('click', _.bind(this.userClick, this));

    // Top panel
    this.panel = document.getElementById("panel");
};

Quizzity.minZoom = 2;
Quizzity.maxZoom = 5;
Quizzity.mapCenter = L.latLng(50, 10); // usually a bad idea: a german-based worldview

Quizzity.citiesPerGame = 5;

Quizzity.prototype.currentCity = function() {
    return this.cities[this.pointer];
};

Quizzity.prototype.showCity = function() {
    // Show name of the city in the panel
    this.panel.innerHTML = this.currentCity().fullName;
};

Quizzity.prototype.newGame = function() {
    // Select random cities and add information
    this.cities = _(this.dbCities)
        .sample(Quizzity.citiesPerGame)
        .map(function(city) {
            // Replace country code by country name
            city.country = this.dbCountries[city.country].name;

            city.fullName = decodeURIComponent(city.name) + ", " +
                            decodeURIComponent(city.country);

            city.position = L.latLng(city.lat, city.lng);
            return city;
        }, this)
        .value();

    this.pointer = 0;

    this.showCity();
};

Quizzity.prototype.gameActive = function() {
    return !_.isEmpty(this.cities) && this.pointer < Quizzity.citiesPerGame;
};

Quizzity.prototype.userClick = function(e) {
    if (!this.gameActive()) {
        return;
    }

    var city = this.currentCity();
    var guess = e.latlng;

    // Distance in kilometers
    var dist = Math.round(guess.distanceTo(city.position) / 1000);

    var method = dist < 500 ? alertify.success : alertify.error;
    method(dist.toString() + "km");

    if (!_.isUndefined(this.markers)) {
        _.each(this.markers, function(m) {
            this.map.removeLayer(m);
        }, this);
    }

    this.markers = [
        L.marker(city.position, {
            icon: Icons.city,
            clickable: false,
            keyboard: false,
            title: city.fullName
        }).addTo(this.map),

        L.marker(guess, {
            icon: Icons.guess,
            clickable: false,
            keyboard: false
        }).addTo(this.map)
    ];

    // TODO
    // we could use geodesics here:
    // https://github.com/henrythasler/Leaflet.Geodesic
    // L.polyline([guess, city.position], {
    //     color: 'black',
    //     weight: 3,
    //     opacity: 0.6,
    //     clickable: false
    // }).addTo(this.map);

    // Reset map view
    this.map.setView(Quizzity.mapCenter, Quizzity.minZoom, {
        animation: true,
    });

    this.pointer += 1;
    if (this.gameActive()) {
        this.showCity();
    }
    else {
        console.log("Points: ...");
        this.newGame();
    }

    return true;
};


$(document).ready(function() {
    var quizzity = new Quizzity();

    // Load JSON data (countries and cities)
    $.getJSON("geodata/countries.json").success(function(countries) {
        quizzity.dbCountries = countries;

        $.getJSON("geodata/cities.json", function(cities) {
            quizzity.dbCities = cities;

            quizzity.newGame();
        });
    });
});
