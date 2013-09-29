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
			relevance: 1,
			parentId: null,

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

var theGraph = null;


(function($){
	
	/*
	 * PARCOURS DU GRAPHE
	 */
	function goThroughGraph(graph){
		var nodes = graph.nodes;

		// On place la racine
		ViewManager.drawNode(ViewManager.ORIGIN, nodes[0]);

		// Et on lance le parcourt récursif
		if (nodes.length > 0)
			displayGraphFromNode(nodes[0], null, nodes, 0);
		else
			console.log("Le graphe passé est vide.");
	}
	function displayGraphFromNode(currentNode, parent, nodes, depth){
		// Pour chaque arrête partant de ce noeud
		var childrenNodes = [];
		for (var j in currentNode.edges){
			var edge = currentNode.edges[j];
			// On récupère l'objet node qui représente la cible de cette connexion
			var targetNode = nodes[edge.to];
			targetNode.parentId = currentNode.id;
			// On l'ajoute à la liste des enfants
			childrenNodes.push(targetNode);
		}

		// On affiche tous les noeuds de ce niveau
		ViewManager.drawNodesAround(childrenNodes, currentNode);

		for (var k in childrenNodes){
			var child = childrenNodes[k];
			// On parcourt récursivement la suite du graphe à partir de cet enfant
			displayGraphFromNode(child, currentNode, nodes, depth+1);
		}
	}

	/*
	 * TEST DES STRUCTURES DE DONNEES
	 */
	$(document).ready(function(){
		init();
		goThroughGraph(theGraph);
	});

	function init(){
		theGraph = createSampleGraph();
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

