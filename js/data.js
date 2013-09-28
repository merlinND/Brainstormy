(function($){
	
	$(document).ready(function(){
		init();
		goThroughGraph(getSampleGraph());
	});

	function init(){
		console.log("Unicorns!");
	}

	function getSampleGraph(){
		var nodes = [
			{
				id: 1,
				word: "pet",
				edges: [
					{ to: 2, relevance: 1 },
					{ to: 3, relevance: 0.8 },
					{ to: 4, relevance: 0.4 }
				]
			},
			{
				id: 2,
				word: "cat",
				edges: [
					{ to: 5, relevance: 0.8 },
					{ to: 6, relevance: 0.7 },
					{ to: 7, relevance: 1 }
				]
			},
			{
				id: 3,
				word: "dog",
				edges: [
				]
			},
			{
				id: 4,
				word: "snake",
				edges: [
				]
			},
			{
				id: 5,
				word: "fur",
				edges: [
				]
			},
			{
				id: 6,
				word: "fluffy",
				edges: [
				]
			},
			{
				id: 7,
				word: "cute",
				edges: [
				]
			}
		];

		return nodes;
	}

	function goThroughGraph(graph){
		if (graph.length > 0)
			buildGraph(graph[0], graph, 0);
		else
			console.log("Le graphe passé est vide.");
	}

	function buildGraph(currentNode, graph, depth){
		// On affiche le noeud en cours
		if (currentNode.position === undefined){
			displayNode(currentNode, graph, depth);
		}

		// Pour chaque arrête partant de ce noeud
		for (var j in currentNode.edges){
			var edge = currentNode.edges[j];

			// On récupère l'objet node qui représente la cible de cette connexion
			// TODO : vraie fonction de recherche
			var targetNode = graph[edge.to-1];
			// On affiche récursivement la suite du graphe à partir de cette cible
			buildGraph(targetNode, graph, depth+1);

			// Et on dessine le lien entre le noeud courant et la cible
			// TODO
		}
	}

	function computeCoordinatesForNode(node, graph, depth){
		return { lat: Math.random(), lng: Math.random() };
	}

	function displayNode(node, graph, depth){
		var representation = "";
		for (var i = 0; i < depth; i++){
			representation += "    ";
		}
		representation += node.word;

		// On enregistre les coordonnées à laquelles le noeud a été affiché
		node.position = computeCoordinatesForNode(node, graph, depth);

		$("#dump").text($("#dump").text() + "\n" + representation);
		console.log("Mot courant : " + node.word);
	}

})(jQuery);