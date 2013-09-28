/*
 * STRUCTURES DE DONNEES
 */

// GRAPHES
var GraphFactory = {
	// Création d'un nouveau graphe vide
	create: function() {
		return {
			nodes: [],

			// Méthode : ajout d'un noeud au graphe
			addNode: function(node) {
				// Le noeud est enregistré à l'index correspondant à son id
				this.nodes[node.id] = node;

				// Pour pouvoir faire des appels chaînés (à la jQuery)
				return this;
			}
		};
	}
};

// NOEUDS ET ARRETES
var NodeFactory = {
	// Création d'un nouveau noeud vide
	create: function(newId, newWord, newEdges) {
		if (newEdges === undefined)
			newEdges = [];

		return {
			id: newId,
			word: newWord,
			edges: newEdges,

			// Méthode : ajouter une nouvelle arrête au noeud
			addEdge: function(whereTo, newRelevance) {
				this.edges.push({
					to: whereTo,
					relevance: newRelevance
				});

				// Pour pouvoir faire des appels chaînés (à la jQuery)
				return this;
			}
		};
	}
};


(function($){
	
	/*
	 * PARCOURS DU GRAPHE
	 */
	function goThroughGraph(graph){
		var nodes = graph.nodes;

		if (nodes.length > 0)
			displayGraphFromNode(nodes[0], null, nodes, 0);
		else
			console.log("Le graphe passé est vide.");
	}
	function displayGraphFromNode(currentNode, parent, nodes, depth){
		// On affiche le noeud en cours
		if (currentNode.position === undefined){
			displayNode(currentNode, nodes, depth);
		}

		// Pour chaque arrête partant de ce noeud
		for (var j in currentNode.edges){
			var edge = currentNode.edges[j];

			// On récupère l'objet node qui représente la cible de cette connexion
			var targetNode = nodes[edge.to];
			// On affiche récursivement la suite du graphe à partir de cette cible
			displayGraphFromNode(targetNode, currentNode, nodes, depth+1);

			// Et on dessine le lien entre le noeud courant et la cible
			// TODO
		}
	}

	/*
	 * AFFICHAGE
	 * (à déplacer dans un module à part)
	 */
	function computeCoordinatesForNode(node, parent, nodes, depth){
		var parentLat = Math.random(), //parent.position.lat,
			parentLng = Math.random(); //parent.position.lng;



		return { lat: Math.random(), lng: Math.random() };
	}

	function displayNode(node, graph, depth){
		var representation = "";
		if (depth > 0)
			representation += "\n";
		for (var i = 0; i < depth; i++){
			representation += "    ";
		}
		representation += node.word;

		// On enregistre les coordonnées auxquelles le noeud a été affiché
		node.position = computeCoordinatesForNode(node, graph, depth);

		$("#dump").text($("#dump").text() + representation);
	}

	/*
	 * TEST DES STRUCTURES DE DONNEES
	 */
	$(document).ready(function(){
		init();
		goThroughGraph(createSampleGraph());
	});

	function init(){
		console.log(">> Unicorns!");
	}

	function createSampleGraph(){
		var graph = GraphFactory.create();

		graph.addNode(NodeFactory.create(0, "pet").addEdge(1, 1).addEdge(2, 0.8).addEdge(3, 0.3))
			.addNode(NodeFactory.create(1, "cat").addEdge(4, 0.7).addEdge(5, 0.5).addEdge(6, 0.9))
			.addNode(NodeFactory.create(2, "dog"))
			.addNode(NodeFactory.create(3, "snake"))
			.addNode(NodeFactory.create(4, "fur"))
			.addNode(NodeFactory.create(5, "fluffy"))
			.addNode(NodeFactory.create(6, "cute").addEdge(41, 0.5).addEdge(42, 1))
			.addNode(NodeFactory.create(41, "baby"))
			.addNode(NodeFactory.create(42, "unicorn"));

		return graph;
	}

})(jQuery);

