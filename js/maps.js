var flatColors = {
	"turquoise": "#1abc9c",
	"emerald": "#2ecc71",
	"peter-river": "#3498db",
	"amethyst": "#9b59b6",
	"sun-flower": "#f1c40f",
	"carrot": "#e67e22",
	"alizarin": "#e74c3c",
	"clouds": "#ecf0f1",
	"concrete": "#95a5a6",
	"green-sea": "#16a085",
	"nephritis": "#27ae60",
	"belize-hole": "#2980b9",
	"wisteria": "#8e44ad",
	"orange": "#f39c12",
	"pumpkin": "#d35400",
	"pomegranate": "#c0392b",
	"silver": "#bdc3c7",
	"asbestos": "#7f8c8d",
	"wet-asphalt": "#34495e",
	"midnight-blue": "#2c3e50"
};
// TODO : changer l'ordre pour qu'il y ait une alternance sympathique
var flatColorsNum = [
	"#1abc9c",
	"#2ecc71",
	"#3498db",
	"#9b59b6",
	"#f1c40f",
	"#e67e22",
	"#e74c3c",
	"#95a5a6",
	"#16a085",
	"#27ae60",
	"#2980b9",
	"#8e44ad",
	"#f39c12",
	"#d35400",
	"#c0392b",
	"#7f8c8d"
	// Couleurs trop proches du background
	//"#ecf0f1",
	//"#bdc3c7",
	//"#34495e",
	//"#2c3e50"
];

var k = 0;

var ViewManager = {
	MAP: null,
	MAX_ZOOM: 20,
	ORIGIN: new google.maps.LatLng(0, 0),
	MAX_RADIUS: 100,
	HORIZONTAL_PADDING: 0.015,
	DEFAULT_ORBIT: null,
	DEFAULT_FONT_SIZE: 22,
	EDGES: [],
	CIRCLES_LABELS: [],
	deepestNodeLevel: 0,
	init: function() {
		this.initializeMap();
	},
	/*********** Creating custom Map Type **************/

	initializeMap: function() {
		this.DEFAULT_ORBIT = (this.MAX_RADIUS) / 20000;

		var graphTypeOptions = {
			getTileUrl: function(coord, zoom) {
				return "images/maps_background.jpg";
			},
			tileSize: new google.maps.Size(256, 256),
			maxZoom: this.MAX_ZOOM,
			minZoom: 0,
			radius: 1738000,
			name: 'Graph'
		};
		var graphMapType = new google.maps.ImageMapType(graphTypeOptions);
		
		var mapOptions = {
					center: this.ORIGIN,
					zoom: this.MAX_ZOOM,
			zoomControl: true,

					streetViewControl: false,
			mapTypeControl: false,
			panControl: false,
			scaleControl: false
				};

		this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		this.map.mapTypes.set('graph', graphMapType);
		this.map.setMapTypeId('graph');
	},
	/******* GRAPH DRAWING FUNCTIONS ****/

	/**
	 * Draw the circle of the node
	 * 
	 * @param {google.maps.LngLat} center Centre du cercle
	 * @param {int} radius Rayon
	 * @param {string} color Couleur de fond et de contour
	 * @param {google.maps.Map} map Map sur laquelle déssiner
	 * @returns {google.maps.Circle} Le cercle créé
	 * 
	 */
	drawCircle: function(center, radius, color, nodeId) {
		var CircleOptions = {
			strokeWeight: 0,
			fillColor: color,
			fillOpacity: 1,
			map: this.map,
			center: center,
			radius: radius
		};

		var circle = new google.maps.Circle(CircleOptions);

		// On ajoute un listener pour le clic sur ce cercle
		google.maps.event.addListener(circle, 'click', function(e) {
			ViewManager.clickListener(e, nodeId);
		});

		return circle;
	},
	drawTextOverlay: function(center, string) {
		var mapLabelOption = {
			fontSize: this.map.getZoom(),
			fontColor: "#FFFFFF",
			fontFamily: 'verdana',
			minZoom: 16,
			maxZoom: this.MAX_ZOOM,
			text: string,
			map: this.map,
			position: new google.maps.LatLng(center.lat() + 0.00005, center.lng()),
			strokeWeight: 1,
			zIndex: 1001
		};

		var label = new MapLabel(mapLabelOption);
		label.setMap(this.map);
		return label;
	},
	
	drawNode: function(center, node, depth){
		if (depth === undefined || depth === null)
			depth = 0;

		var string = node.word;
		var color = flatColorsNum[depth % flatColorsNum.length];
		var radius = node.relevance * this.MAX_RADIUS;

//        node.view.circle = this.drawCircle(center, radius, color, node.id);
//        node.view.label =  this.drawTextOverlay(center, string);

		var tab = [node.id, this.drawCircle(center, radius, color, node.id),
					this.drawTextOverlay(center, string)];

		ViewManager.CIRCLES_LABELS.push(tab);

		// On enregistre la position du node dans celui-ci
		node.position = center;
		return node;
	},
	drawNodesAround: function(nodes, centerNode, depth, globalRadius) {
		if (globalRadius === null || globalRadius === undefined)
			globalRadius = ViewManager.DEFAULT_ORBIT;

		var ancestorPosition = new google.maps.LatLng(-0.001, 0.000);
		if (centerNode.parentId !== null && centerNode.parentId !== undefined) {
			ancestorPosition = GraphManager.theGraph.get(centerNode.parentId).position;
		}

		var center = centerNode.position;

		// L'angle total parcouru est grand quand on a beaucoup de noeuds
		var maxAngle = (4 / 3) * Math.PI;
		// Quand on est à la première profondeur, on peut décrire un cercle entier
		if (depth <= 1 && nodes.length > 8)
			maxAngle = 2 * Math.PI;
		// Mais quand on en a deux ou trois, on fait plus petit
		else if (nodes.length <= 4)
			maxAngle = (2 / 3) * Math.PI;


		var ancestorOffset = Math.PI - getHeading(ancestorPosition, center),
			angularOffset = ((2 * Math.PI) - maxAngle) / 2 - ancestorOffset;

		var theta = ancestorOffset / Math.PI;

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
			ViewManager.drawNode(thisCenter, nodes[i], depth);

			// On dessine également la connexion entre ce noeud et son parent 
			// et on la sauvegarde dans le tableau de EDGES
			var e = ViewManager.drawEdge(centerNode, nodes[i]);
			ViewManager.EDGES.push([centerNode.id, nodes[i].id, e]);
		}

		// On dézoom la map afin de voir au moins globalRadius
		// TODO : zoom intelligent ? Ou bien zoom statique bien choisi
		ViewManager.map.setZoom(ViewManager.MAX_ZOOM - 4);
	},
	drawEdge: function(node1, node2) {

		var polyLineOption = {
			path: [node1.position, node2.position],
			map: this.map,
			strokeWeight: 2,
			strokeColor: '#FFFFFF',
			strokeOpacity: 1.0,
			zIndex: -1
		};

		var l = new google.maps.Polyline(polyLineOption);

		return l;
	},
	animateCircleTo: function(circle, targetPosition, speed) {
		if (speed === undefined)
			speed = 0.001;

		// v = d / t
		// => d = v * t
		var dT = 5,
				dPosition = (dT / 1000) * speed;

		window.setTimeout()(function() {
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
	},
	moveCircleTo: function(circle, position) {
		circle.setCenter(position);
	},
	// Trouve une position libre pour commencer un nouveau graphe
	getCozyPosition: function() {
		var cozy = ViewManager.ORIGIN;

		// TODO : si le graphe est vide, aller direct à l'origine
		if (GraphManager.theGraph.nodes.length > 0) {
			var allRoots = GraphManager.theGraph.getRootNodes();

			// Par défaut, on va chercher à se caler à droite du noeud le plus à droite
			// et au même niveau que la racine du premier graphe
			var minLat = allRoots[0].position.lat(),
					maxLng = allRoots[0].position.lng();

			var compareLat = function(childrenNodes, currentNode, depth) {

				if (currentNode.position.lng() > maxLng)
					maxLng = currentNode.position.lng();
			};

			// Pour chaque racine du graphe
			for (var i in allRoots) {
				var thisRoot = allRoots[i];

				// On parcourt le graphe à la recherche de la position la plus à droite
				GraphManager.applyFunctionRecursively(compareLat, thisRoot, null, GraphManager.theGraph, 0);

				cozy = new google.maps.LatLng(minLat, maxLng + ViewManager.HORIZONTAL_PADDING);
			}
		}

		return cozy;
	},
	resizeEdge: function(parent, enfant, edge, facteur, frames) {
		/**
		 * Coordonnées de l'enfant
		 */
		var elat = enfant.position.lat();
		var elng = enfant.position.lng();
		/**
		 * Coordonnées du parent
		 */
		var plat = parent.position.lat();
		var plng = parent.position.lng();

		var nlat = plat + (elat - plat) * facteur;
		var nlng = plng + (elng - plng) * facteur;

		var circle = null;
		var label = null;

		for (var i = 0; i < ViewManager.CIRCLES_LABELS.length; i++) {
			if (ViewManager.CIRCLES_LABELS[i][0] === enfant.id) {

				circle = ViewManager.CIRCLES_LABELS[i][1];
				label = ViewManager.CIRCLES_LABELS[i][2];
			}
		}
		k = 0;
		var theInterval = window.setInterval(function() {

			elat = elat + (nlat - elat) / 50;
			elng = elng + (nlng - elng) / 50;
			k++;


			var pos = new google.maps.LatLng(elat, elng);
			edge.setPath([parent.position, pos]);
			//var node = GraphManager.theGraph.get(ViewManager.EDGES[j][2]);
			circle.setCenter(pos);
			label.set('position', pos);
			if (k >= 5000) {
				//i = ViewManager.EDGES.length + 1;
				window.clearInterval(theInterval);
			}
		}, 10);
	},
	/******* INTERACTION FUNCTIONS ****/
	clickListener: function(e, nodeId) {

		var clickedNode = GraphManager.theGraph.get(nodeId);
		this.map.panTo(e.latLng);

		// On déploie à partir de cette feuille,
		// mais seulement si c'en est une
		if (clickedNode.edges.length <= 0) {
			
			InputManager.queryServerWithNode(clickedNode, InputManager.extendGraphCallback);
			var circle = null;
			var label = null;
			// On recherche l'arrete entre le nœud cliqué et son parent
			// Pour pouvoir resizer et ainsi laisser de la place
			// TODO : ne resizer que s'il y a eu des résultats à la requête !
			var parent, child;
			for (var i = 0; i < ViewManager.EDGES.length; i++) {
				if (ViewManager.EDGES[i][1] === clickedNode.id &&
					ViewManager.EDGES[i][0] === clickedNode.parentId) {
					parent = GraphManager.theGraph.get(ViewManager.EDGES[i][0]);
					child = GraphManager.theGraph.get(ViewManager.EDGES[i][1]);

					this.resizeEdge(parent, child, ViewManager.EDGES[i][2], 1, 50);
				}
				else if (ViewManager.EDGES[i][0] === clickedNode.parentId) {
					parent = GraphManager.theGraph.get(ViewManager.EDGES[i][0]);
					child = GraphManager.theGraph.get(ViewManager.EDGES[i][1]);

					if (child.edges.length < 1)
						this.resizeEdge(parent, child, ViewManager.EDGES[i][2], 0.5, 50);
				}
			}
		}
	}
};


/**
 * INIT
 */
$(document).ready(function() {
	ViewManager.init();
});


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


