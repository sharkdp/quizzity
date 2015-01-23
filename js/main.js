/*jslint browser: true, nomen: true, white: true, vars: true, todo: true*/
/*global $*/
/*global _*/
/*global L*/
/*global alertify*/

'use strict';

var options = {
    minZoom: 2,
    maxZoom: 5,
    mapCenter: L.latLng(50, 10) // generally a bad idea: a germany-based worldview
};

var countries;
var cities;
var map;
var city;

var newTarget = function() {
    city = _.sample(cities);
    city.position = L.latLng(city.lat, city.lng);
    city.country = countries[city.country].name;
    alertify.log(decodeURIComponent(city.name) + ", " + decodeURIComponent(city.country));
};

var userClick = function(e) {
    if (city === undefined) {
        return;
    }
    console.log(e.latlng);

    var guess = e.latlng;
    var dist = Math.round(guess.distanceTo(city.position) / 1000);

    var method = dist < 500 ? alertify.success : alertify.error;
    method(dist.toString() + "km");

    // L.marker(guess).addTo(map);
    L.marker(city.position).addTo(map);

    // TODO
    // we could use geodesics here:
    // https://github.com/henrythasler/Leaflet.Geodesic
    L.polyline([guess, city.position], {
        color: 'black',
        weight: 3,
        opacity: 0.6,
        clickable: false
    }).addTo(map);

    // Pan to the central point of the line between the user guess
    // and the city's actual position.
    // var center = L.latLngBounds([city.position, guess]).getCenter();
    // map.fitWorld({animation: true});
    map.setView(options.mapCenter, options.minZoom, {
        animation: true,
        pan: { duration: 2 }
    });

    newTarget();

    return true;
};

$(document).ready(function() {
    // Load JSON data (countries and cities)
    $.getJSON("geodata/countries.json", function(cs) {
        countries = cs;
    });

    $.getJSON("geodata/cities.json", function(cs) {
        cities = cs;
        newTarget();
    });

    // Prepare the map
    map = L.map('map', {
        doubleClickZoom: false
    });

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        id: 'sharkdp.e01ecf2e',
        maxZoom: options.maxZoom,
        minZoom: options.minZoom,
        noWrap: true
    }).addTo(map);

    map.fitWorld();
    map.panTo(options.mapCenter);

    map.on('click', userClick);

});
