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
            return "./images/maps_background.jpg";
        },
        tileSize: new google.maps.Size(256, 256),
        maxZoom: MAX_ZOOM,
        minZoom: 0,
        radius: 1738000,
        name: 'Graph'
    };
    var graphMapType = new google.maps.ImageMapType(graphTypeOptions);

    /****** Initialize map ******/
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
        var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.mapTypes.set('graph', graphMapType);
        map.setMapTypeId('graph');

        var centerCircle = drawCircle(myLatlng, 20, '#3498db', map);
        // Test d'animation du cercle central
        var destination = new google.maps.LatLng(Math.random() / 500 - 0.0005, Math.random() / 500 - 0.0005);
        animateCircleTo(centerCircle, destination);
        
        drawCirclesAround(8, myLatlng, 0.001, 20, '#d35400', map);
        
        // Node de test
        drawNode(myLatlng, 20, 'Hello', '#e74c3c', map);
    }

    
    /******* Drawing function ****/
    
    /**
     * Draw the circle of the node
     * 
     * @param {google.maps.LngLat} center Centre du cercle
     * @param {int} rad Rayon
     * @param {string} color Couleur de fond et de contour
     * @param {google.maps.Map} map Map sur laquelle déssiner
     * @returns {google.maps.Circle} Le cercle créé
     * 
     */
    function drawCircle(center, rad, color, map) {
        var CircleOptions = {
            strokeWeight: 0,
            fillColor: color,
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
        
        return {
            center : center,
            text : string
        };
            
        }
    

    function drawCirclesAround(numberOfCircles, center, globalRadius, circleRadius, circleColor, map) {

        var maxAngle = (3/2) * Math.PI,
            angularOffset = ((2*Math.PI) - maxAngle) / 2 - Math.PI / 2;

        // On va décrire un grand cercle,
        // et placer les marqueurs à intervalle régulier
        for (var i = 0; i < numberOfCircles; i++) {
            var progress = 0.5;
            if (numberOfCircles > 1)
                progress = i / (numberOfCircles - 1);
            var lat = center.lat(),
                lng = center.lng(),
                dLat = globalRadius * Math.sin(progress * maxAngle + angularOffset),
                dLng = globalRadius * Math.cos(progress * maxAngle + angularOffset);
            var thisCenter = new google.maps.LatLng(lat + dLat, lng + dLng);
            drawCircle(thisCenter, circleRadius, circleColor, map);
        }

        // On dézoom la map afin de voir au moins globalRadius
        // TODO : zoom intelligent ? Ou bien zoom statique bien choisi
        map.setZoom(MAX_ZOOM - 2);
    }
    
    function drawEdge(node1, node2, map) {
        
        var polyLineOption = {
            path : [node1.center, node2.center],
            map : map,
            strokeWeight : 2,
            strokeColor : '#FFFFFF',
            strokeOpacity : 1.0,
            zIndex : -1
        };
        
        return new google.maps.Polyline(polyLineOption);
        
    }
    
    
    function animateCircleTo(circle, targetPosition, speed) {
        if (speed === undefined)
            speed = 0.001;

        // v = d / t
        // => d = v * t
        var dT = 5,
            dPosition = (dT/1000) * speed;

        window.setTimeout(function(){
            var lat = circle.center.lat(),
                lng = circle.center.lng(),
                dLat = dPosition,
                dLng = dPosition;

            if (targetPosition.lat() - lat < 0)
                dLat *= -1;
            if (targetPosition.lng() - lng < 0)
                dLng *= -1;

            intermediatePosition = new google.maps.LatLng(lat + dLat, lng + dLng);
            moveCircleTo(circle, intermediatePosition);

            if (!arePositionsEquivalent(intermediatePosition, targetPosition, 0.0001))
                animateCircleTo(circle, targetPosition, speed);
        }, dT);
    }
    function moveCircleTo(circle, position) {
        circle.setCenter(position);
    }

    function arePositionsEquivalent(position1, position2, epsilon) {
        if (epsilon === undefined)
            // TODO : ajuster cette valeur d'acceptation
            epsilon = 0.0000001;

        if (Math.abs(position1.lat() - position2.lat()) > epsilon)
            return false;
        else if (Math.abs(position1.lng() - position2.lng()) > epsilon)
            return false;
        else
            return true;
    }

})(jQuery);
