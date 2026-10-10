/*jslint browser: true, nomen: true, white: true*/
/*global $*/
/*global _*/
/*global L*/
/*global ga*/

'use strict';

var Statistics = function() {
    this.mapElements = []; // map elements
};

Statistics.prototype.initializeInterface = function() {
    // Set up the map and tiles
    this.map = L.map('map', {
        doubleClickZoom: false
    });

    this.layer = L.tileLayer(
        'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
        // 'http://openmapsurfer.uni-hd.de/tiles/roads/x={x}&y={y}&z={z}',
        {minZoom: 1}
    ).addTo(this.map);

    // Initial view
    this.map.fitWorld();
    this.map.panTo(Statistics.mapCenter);
};

Statistics.mapCenter = L.latLng(50, 10);

Statistics.prototype.removeMarkers = function() {
    if (!_.isUndefined(this.mapElements)) {
        _.each(this.mapElements, function(m) {
            this.map.removeLayer(m);
        }, this);
    }
};

Statistics.prototype.show = function(city) {
    this.removeMarkers();
    _.each(city.guesses, function(p) {
        var m = L.circle(p, 20000, {
            stroke: true,
            color: 'black',
            opacity: 0.7,
            fill: true,
            fillColor: '#000',
            fillOpacity: 0.2,
            keyboard: false,
            clickable: false
        }).addTo(this.map);

        this.mapElements.push(m);
    }, this);

    this.mapElements.push(
        L.circle(city.position, city.sigma * 1000, {
            clickable: false,
            color: '#090',
        }).addTo(this.map)
    );

    this.mapElements.push(
        L.marker(city.position, {
            icon: Statistics.Icons.city
    }).addTo(this.map));
};


// font-awesome
L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

Statistics.Icons = {
    // guess: L.AwesomeMarkers.icon({
    //     icon: 'question-circle',
    //     markerColor: 'orange'
    // }),
    city: L.AwesomeMarkers.icon({
        icon: 'check',
        markerColor: 'green'
    })
};

Statistics.prototype.showCurrent = function() {
    var current = $("#citySelect").val();
    this.show(_.find(Statistics.cities, function(c) {
        return c.name === current;
    }));

    return true;
};

$(document).ready(function() {
    var s = new Statistics();

    s.initializeInterface();

    // Load JSON data (countries and cities)
    $.getJSON('cities.json').success(function(cities) {
        var $sel = $("#citySelect");

        Statistics.cities = cities;

        _.each(cities, function(city) {
            $sel.append($("<option></option>")
                .attr("value", city.name)
                .text(city.name + ' (σ = ' + city.sigma.toString() + 'km)'));
        });

        $sel.select2({
            multiple: false
        });
        $sel.focus();

        $sel.on('change', _.bind(Statistics.prototype.showCurrent, s));
        s.showCurrent();
    });
});
