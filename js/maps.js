(function($) {
    
    var MAX_ZOOM=20;

    /* __INIT__ **/
    $(document).ready(function() {
        init();

    });

    function init() {
        initialize_map();
    }


    /*********** Creating custom Map Type **************/
    var graphTypeOptions = {
        getTileUrl: function(coord, zoom) { return "./images/maps_background.jpg"},
        tileSize: new google.maps.Size(256, 256),
        maxZoom: MAX_ZOOM,
        minZoom: 0,
        radius: 1738000,
        name: 'Graph'
    };
    var graphMapType = new google.maps.ImageMapType(graphTypeOptions);

    function initialize_map() {
        var myLatlng = new google.maps.LatLng(0, 0);
        var mapOptions = {
            center: myLatlng,
            zoom: MAX_ZOOM,
            streetViewControl: false,
            mapTypeControlOptions: {
                mapTypeIds: ['graph']
            }
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
        map.mapTypes.set('graph', graphMapType);
        map.setMapTypeId('graph');
        drawEllipse(myLatlng, 2000, 5000);
    }
    
    function drawEllipse(center, vRad, hRad) {
        var point = new google.maps.LatLng(43,-78);
      var ellipse = google.maps.Polygon.Ellipse(center,hRad,vRad,-45,"#000000",2,1,"#ffff00",0.5);
      ellipse.setMap(map);
    }



})(jQuery);