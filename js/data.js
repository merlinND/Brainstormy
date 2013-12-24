/*
 * STRUCTURES DE DONNEES
 */

// GRAPHES
var GraphFactory = {
	// Création d'un nouveau graphe vide
	create: function() {
		var instanciateGraph = function(){
			this.nodes = [];
			this.roots = [];
		};
		// Méthode : ajout d'un noeud au graphe
		instanciateGraph.prototype.addNode = function(node) {
			// Le noeud est enregistré à l'index correspondant à son id
			this.nodes[node.id] = node;

			// S'il n'y avait aucun noeud avant celui-ci, il devient la racine
			if (this.roots.length <= 0)
				this.roots.push(node.id);

			// Pour pouvoir faire des appels chaînés (à la jQuery)
			return this;
		};
		// Méthode : ajout d'une nouvelle racine au graphe
		instanciateGraph.prototype.addRoot = function(root) {
			root.parentId = null;
			this.roots.push(root.id);
			this.addNode(root);
			console.log("On a ajouté la racine : ");
			console.log(root);
			console.log(" à la liste : ");
			console.log(this.roots);
			// Pour pouvoir faire des appels chaînés (à la jQuery)
			return this;
		};
		// Méthode : récupérer un noeud du graphe par son id
		instanciateGraph.prototype.get = function(nodeId) {
			return this.nodes[nodeId];
		};
		instanciateGraph.prototype.set = function(nodeId, node) {
			this.nodes[nodeId] = node;
			return node;
		};
		// Méthode : récupérer la première racine du graphe
		instanciateGraph.prototype.getRoot = function() {
			return this.get(this.roots[0]);
		};
		// Méthode : récupérer un tableau de toutes les racines du graphe
		instanciateGraph.prototype.getRootNodes = function() {
			var result = [];
			for (var i in this.roots)
				result.push(this.get(this.roots[i]));
			return result;
		};

		return new instanciateGraph();
	}
};

// NOEUDS ET ARRETES
var NodeFactory = {
	// Création d'un nouveau noeud vide
	create: function(newId, newWord, newEdges, newDepth) {
		if (newEdges === undefined)
			newEdges = [];
		if (newDepth === undefined)
			newDepth = null;

		return {
			id: newId,
			word: newWord,
			edges: newEdges,
			relevance: 1,
			parentId: null,
			depth: newDepth,

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
			targetNode.depth = depth;

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
		if (graph.nodes.length > 0) {
			var rootNodes = graph.getRootNodes();

			// Pour chaque racine
			for (var i in rootNodes) {
				// On la place
				ViewManager.drawNode(ViewManager.ORIGIN, rootNodes[i]);

				// Et on lance le parcourt récursif
				this.applyFunctionRecursively(ViewManager.drawNodesAround, rootNodes[i], null, graph, 0);
			}
		}
		else
			console.log("Le graphe passé est vide.");
	},

	extendGraph: function(rootNode, newNodes){
		
		if (newNodes !== undefined && newNodes !== null && newNodes.length > 0) {
			// On ajoute chacun des nouveaux noeuds au graphe
			for(var i in newNodes){
				var thisNode = newNodes[i];

				// On restaure la position sous forme d'objet LatLng
				if (thisNode.position !== undefined && thisNode.position !== null)
					thisNode.position = new google.maps.LatLng(thisNode.position.nb, thisNode.position.ob);

				GraphManager.theGraph.addNode(thisNode);
			}

			GraphManager.applyFunctionRecursively(ViewManager.drawNodesAround, rootNode, GraphManager.theGraph.get(rootNode.parentId), GraphManager.theGraph, rootNode.depth + 1);
		}
		else {
			console.log("Pas de nouveaux résultats à partir du noeud " + rootNode.word);
			if(rootNode.word === undefined)
				rootNode.word = "choisi";
			InputManager.showError("Aucun résultat pour le mot <strong>" + rootNode.word + "</strong>");

			InputManager.cleanDump();
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
	//$("form").hide();
});
