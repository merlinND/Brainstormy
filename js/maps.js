(function($) {
    var MAP = null;
    var MAX_ZOOM = 20;
    
    var flatColors = {
        "turquoise": "#1abc9c",
        "emerald": "#2ecc71",
        "peter-river": "#3498db",
        "amethyst": "#9b59b6",
        "wet-asphalt": "#34495e",
        "green-sea": "#16a085",
        "nephritis": "#27ae60",
        "belize-hole": "#2980b9",
        "wisteria": "#8e44ad",
        "midnight-blue": "#2c3e50",
        "sun-flower": "#f1c40f",
        "carrot": "#e67e22",
        "alizarin": "#e74c3c",
        "clouds": "#ecf0f1",
        "concrete": "#95a5a6",
        "orange": "#f39c12",
        "pumpkin": "#d35400",
        "pomegranate": "#c0392b",
        "silver": "#bdc3c7",
        "asbestos": "#7f8c8d"
    };
    var flatColorsNum = [
        "#1abc9c",
        "#2ecc71",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#ecf0f1",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#bdc3c7",
        "#7f8c8d"
    ];

    var lvlNode = 0;

    /* __INIT__ **/
    $(document).ready(function() {
        init();

    });

    function init() {
        initializeMap();
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
    function initializeMap() {
        var originPosition = new google.maps.LatLng(0, 0);
        var mapOptions = {
            center: originPosition,
            zoom: MAX_ZOOM,
            streetViewControl: false,
            mapTypeControlOptions: {
                mapTypeIds: ['graph']
            }
        };
        MAP = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        MAP.mapTypes.set('graph', graphMapType);
        MAP.setMapTypeId('graph');
        
        var originNode = NodeFactory.create(0, "pet"),
            allNodes = [
                NodeFactory.create(1, "dog"),
                NodeFactory.create(2, "cat"),
                NodeFactory.create(3, "snake"),
                NodeFactory.create(4, "racoon"),
                NodeFactory.create(5, "python")
            ],
            secondNodes = [
                NodeFactory.create(6, "dog"),
                NodeFactory.create(7, "cat"),
                NodeFactory.create(8, "snake"),
                NodeFactory.create(9, "racoon"),
                NodeFactory.create(10, "python")
            ];
        
        drawNode(originPosition, originNode);
        drawNodesAround(allNodes, originNode, 0.002, null);
        // On affiche un deuxième tour de test
        drawNodesAround(secondNodes, allNodes[1], 0.001, allNodes[1].position);
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
    function drawCircle(center, rad, color) {
        var CircleOptions = {
            strokeWeight: 0,
            fillColor: color,
            fillOpacity: 1,
            map: MAP,
            center: center,
            radius: rad
        };

        return new google.maps.Circle(CircleOptions);
    }
    
    function drawTextOverlay(center, string) {
        var mapLabelOption = {
            fontSize : MAP.getZoom(),
            fontColor : "#FFFFFF",
            fontFamily : 'verdana',
            minZoom : 16,
            maxZoom : MAX_ZOOM,
            text : string,
            position : new google.maps.LatLng(center.lat() + 0.00005, center.lng()),
            strokeWeight : 1
            
        };
        
        var label = new MapLabel(mapLabelOption);         
        label.setMap(MAP);
    }
    
    function drawNode(center, node){
        
        var string = node.word;
        var color = flatColorsNum[lvlNode++];
        
        lvlNode %= flatColorsNum.length;
        var rad = node.relevance * 30;
        
        
        drawCircle(center, rad, color);
        drawTextOverlay(center, string);
        
        // On enregistre la position du node dans celui-ci
        node.position = center;

        return node;
    }
    
    function drawNodesAround(nodes, centerNode, globalRadius, ancestorPosition) {
        if(ancestorPosition === null)
            ancestorPosition = new google.maps.LatLng(-0.001, 0.000);

        var center = centerNode.position;

        var maxAngle = (3/2) * Math.PI,
            ancestorOffset = Math.PI - getHeading(ancestorPosition, center),
            angularOffset = ((2*Math.PI) - maxAngle) / 2 - ancestorOffset;

        // On va décrire un grand cercle,
        // et placer les marqueurs à intervalle régulier
        for (var i = 0; i < nodes.length; i++) {
            var progress = 0.5;
            if (nodes.length > 1)
                progress = i / (nodes.length - 1);
            var lat = center.lat(),
                lng = center.lng(),
                dLat = globalRadius * Math.sin(progress * maxAngle + angularOffset),
                dLng = globalRadius * Math.cos(progress * maxAngle + angularOffset);
            
            var thisCenter = new google.maps.LatLng(lat + dLat, lng + dLng);
            drawNode(thisCenter, nodes[i]);

            // On dessine également la connexion entre ce noeud et son parent
            drawEdge(centerNode, nodes[i]);
        }

        // On dézoom la map afin de voir au moins globalRadius
        // TODO : zoom intelligent ? Ou bien zoom statique bien choisi
        MAP.setZoom(MAX_ZOOM - 3);
    }
    
    function drawEdge(node1, node2) {
        
        var polyLineOption = {
            path : [node1.position, node2.position],
            map : MAP,
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

})(jQuery);


/**
 * FONCTIONS D'AIDE GÉOMÉTRIQUES
 */

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

// Source : http://stackoverflow.com/questions/2908892/get-degrees-0-360-from-one-latlng-to-another-in-javascript
Number.prototype.toRad = function() {
   return this * Math.PI / 180;
};
Number.prototype.toDeg = function() {
   return this * 180 / Math.PI;
};
function getHeading(position1, position2) {
    var lat1 = position1.lat().toRad(),
        lat2 = position2.lat().toRad(),
        lon1 = position1.lng().toRad(),
        lon2 = position2.lng().toRad(),

        dLon = (lon2 - lon1),

        y = Math.sin(dLon) * Math.cos(lat2),
        x = Math.cos(lat1) * Math.sin(lat2) - 
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon),

        heading = Math.atan2(x, y);

    // En degrés (entre 0 et 360°)
    //return (((heading * 180 / Math.PI) + 360) % 360);
    // En radians
    return heading;
}
