(function($) {

    var MAX_ZOOM = 20;

    /* __INIT__ **/
    $(document).ready(function() {
        init();

    });

    function init() {
        initialize_map();
    }


    /*********** Creating custom Map Type **************/
    var graphTypeOptions = {
        getTileUrl: function(coord, zoom) {
            return "./images/maps_background.jpg"
        },
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
        
        drawNode(myLatlng, 20, 'Hello', '#e74c3c', map);
        //drawTextOverlay(myLatlng, 'hello', map);
        //drawCircle(myLatlng, 20, '#e74c3c', map);
    }

    
    function drawCircle(center, rad, color, map) {
        var CircleOptions = {
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: color ,
            fillOpacity: 1,
            map: map,
            center: center,
            radius: rad
        };
        return new google.maps.Circle(CircleOptions);
    }
    
    
    
    function drawTextOverlay(center, string, map) {
        
        var mapLabelOption = {
            fontSize : map.getZoom(),
            fontColor : "#FFFFFF",
            fontFamily : 'verdana',
            minZoom : 10,
            maxZoom : MAX_ZOOM,
            text : string,
            position : center,
            strokeWeight : 2
            
        };
        
        var label = new MapLabel(mapLabelOption);         
        label.setMap(map);
    }
    
    function drawNode(center, rad, string, color, map){
        drawCircle(center, rad, color, map);
        drawTextOverlay(center, string, map);
    }
    
    


})(jQuery);