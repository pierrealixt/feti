/*global define*/
define([
    'common'
], function (Common) {
    var Provider = Backbone.Model.extend({
        parse: function (options) {
            var data;
            if (_.isObject(options.results)) {
                data = options.results;
            } else {
                data = options;
            }
            data.counts = data.courses.length;
            return data;
        },
        renderMarker: function () {
            if (!this.get('layer')) {
                var location = this.attributes.location;
                var popup = this.attributes._campus_popup;
                var marker = new L.marker([location.lat, location.lng], {
                    icon: L.ExtraMarkers.icon({
                        markerColor: 'blue leaflet-clickable',
                        icon: 'true',
                        extraClasses: 'fa fa-graduation-cap',
                        iconColor: 'white'
                    })
                });
                if (Common.UserLocation != 'None') {
                    this.getUserLocation(popup, marker);
                    popup += '<div class="user-location">Calculating travel time... </div>';
                }
                marker.bindPopup(popup);
                this.set('marker', marker);
            }
            this.set('layer', L.layerGroup([this.get('marker')]));
            Common.Dispatcher.trigger('map:addLayer', this.get('layer'));
        },
        getUserLocation: function (popup, marker) {
            var marker_location = this.attributes.location;
            var regExp = /\(([^)]+)\)/;
            var user_location = regExp.exec(Common.UserLocation)[1].split(' ');

            var origin = user_location[1] + ',' + user_location[0];
            var destinations = marker_location.lat + ',' + marker_location.lng;

            $.ajax({
                url: 'api/travel-time/' + origin + '/' + destinations,
                type: 'GET',
                success: function (response) {
                    popup += '<div class="user-location">Travel time: ' + response + '</div>';
                },
                error: function (response) {
                },
                complete: function () {
                    marker._popup.setContent(popup)
                }
            });
        },
        removeMarker: function () {
            if (this.get('layer')) {
                this.get('layer').clearLayers();
            }
        },
        destroy: function () {
            // destroy by remove layers and delete this object
            this.removeMarker();
            delete this;
        },
        clicked: function () {
            var marker = this.get('marker');
            marker.openPopup();
            Common.Dispatcher.trigger('map:pan', marker._latlng);
        },
    });

    return Provider;
});