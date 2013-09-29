/*
 * STRUCTURES DE DONNEES
 */

// GRAPHES
var GraphFactory = {
	// Création d'un nouveau graphe vide
	create: function() {
		return {
			nodes: [],
			rootId: null,

			// Méthode : ajout d'un noeud au graphe
			addNode: function(node) {
				// Le noeud est enregistré à l'index correspondant à son id
				this.nodes[node.id] = node;

				// S'il n'y avait aucun noeud avant celui-ci, il devient la racine
				if (this.rootId === null)
					this.rootId = node.id;

				// Pour pouvoir faire des appels chaînés (à la jQuery)
				return this;
			},
			// Méthode : récupérer un noeud du graphe par son id
			get: function(nodeId) {
				return this.nodes[nodeId];
			},
			set: function(nodeId, node) {
				this.nodes[nodeId] = node;
				return node;
			},
			// Méthode : récupérer un noeud du graphe par son id
			getRoot: function(nodeId) {
				return this.get(this.rootId);
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
            view: {
                circle : null,
                label : null
            },

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


var GraphManager = {
	theGraph: GraphFactory.create(),

	init: function(){
		this.theGraph = this.createSampleGraph();
		console.log(">> Unicorns!");
	},

	/*
	 * PARCOURS DU GRAPHE
	 */
	applyFunctionRecursively: function(action, currentNode, parent, graph, depth){
		// Pour chaque arrête partant de ce noeud
		var childrenNodes = [];
		for (var j in currentNode.edges){
			var edge = currentNode.edges[j];
			// On récupère l'objet node qui représente la cible de cette connexion
			var targetNode = graph.get(edge.to);
			targetNode.parentId = currentNode.id;
			targetNode.relevance = edge.relevance;
			// On l'ajoute à la liste des enfants
			childrenNodes.push(targetNode);
		}

		// On applique l'action à cette liste d'enfants
		action(childrenNodes, currentNode, depth);

		for (var k in childrenNodes){
			// On parcourt récursivement la suite du graphe à partir de cet enfant
			GraphManager.applyFunctionRecursively(action, childrenNodes[k], currentNode, graph, depth+1);
		}
	},

	displayAllGraph: function(graph){
		var rootNode = graph.getRoot();

		// On place la racine
		ViewManager.drawNode(ViewManager.ORIGIN, rootNode);

		// Et on lance le parcourt récursif
		if (graph.nodes.length > 0)
			this.applyFunctionRecursively(ViewManager.drawNodesAround, rootNode, null, graph, 0);
		else
			console.log("Le graphe passé est vide.");
	},
	displayGraphFromNode: function(currentNode, parent, graph, depth){
		console.log("Fonction displayGraphFromNode deprecated !");
	},

	extendGraph: function(rootNode, newNodes){
		if (newNodes.length > 1) {
			// On ajoute chacun des nouveaux noeuds au graphe
			for(var i in newNodes){
				var thisNode = newNodes[i];

				// On restaure la position sous forme d'objet LatLng
				if (thisNode.position !== undefined && thisNode.position !== null)
					thisNode.position = new google.maps.LatLng(thisNode.position.nb, thisNode.position.ob);

				GraphManager.theGraph.addNode(thisNode);
			}

			// TODO : se débrouiller pour connaître la depth
			GraphManager.applyFunctionRecursively(ViewManager.drawNodesAround, rootNode, GraphManager.theGraph.get(rootNode.parentId), GraphManager.theGraph, 5);
		}
		else {
			console.log("Pas de nouveaux résultats à partir du noeud " + rootNode.word);
			// TODO : indiquer à l'utilisateur qu'il n'y a pas de résultat
		}
	},

	createSampleGraph: function(){
		var graph = GraphFactory.create();

		graph.addNode(NodeFactory.create(0, "pet").addEdge(1, 1).addEdge(2, 0.8).addEdge(3, 0.3))
			.addNode(NodeFactory.create(1, "cat").addEdge(4, 0.7).addEdge(5, 0.5).addEdge(6, 0.9))
			.addNode(NodeFactory.create(2, "dog"))
			.addNode(NodeFactory.create(3, "snake"))
			.addNode(NodeFactory.create(4, "fur"))
			.addNode(NodeFactory.create(5, "fluffy"))
			.addNode(NodeFactory.create(6, "cute").addEdge(41, 0.5).addEdge(42, 1))
			.addNode(NodeFactory.create(41, "baby"))
			.addNode(NodeFactory.create(42, "unicorn").addEdge(43, 0.5).addEdge(44, 1).addEdge(45, 0.5).addEdge(46, 1))
			.addNode(NodeFactory.create(43, "pink"))
			.addNode(NodeFactory.create(44, "awesome").addEdge(47, 1).addEdge(48, 1).addEdge(49, 1))
			.addNode(NodeFactory.create(45, "horse"))
			.addNode(NodeFactory.create(46, "smile"))
			.addNode(NodeFactory.create(47, "Henri"))
			.addNode(NodeFactory.create(48, "Vadim"))
			.addNode(NodeFactory.create(49, "Merlin"));

		return graph;
	}
};

/*
 * TEST DES STRUCTURES DE DONNEES
 */
$(document).ready(function(){
	GraphManager.init();
	GraphManager.displayAllGraph(GraphManager.theGraph);
});
