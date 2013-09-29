var InputManager = {
	HOST: "http://192.168.66.26:9000",
	QUERY_URL: "query",
	MAX_NODES_PER_QUERY: 8,

	init: function(){
		// TOOD : pendant les tests, on ne déclanche l'affichage du
		// input que lors d'un clic sur le <h1>
		$("header button").on("click", function(e){
			e.stopPropagation();

			if (e.target.nodeName != "INPUT")
				InputManager.toggleInputForm();
		});
		$("#startingPoint").parent("form").on("submit", this.inputSubmit);

		console.log(">> Input ready");
	},

	toggleInputForm: function() {
		if ($("form").is(":visible"))
			$("form").fadeOut();
		else {
			$("#startingPoint").val("");
			$("form").fadeIn();
			$("#startingPoint").focus();
		}
	},

	inputSubmit: function(e) {
		e.preventDefault();
		$(e.target).fadeOut();

		var word = $("#startingPoint").val();
		InputManager.queryServer("", word);

		return false;
	},

	queryServer: function(queryId, queryWord, callback) {
		// A partir du mot donné, on crée une requête
		var query = { 
			id: queryId, 
			word: queryWord
		};

		if (callback === undefined)
			callback = InputManager.newGraphCallback;

		console.log("On fait un envoi au serveur : " + JSON.stringify(query));
		$("header h1").addClass("pulsing");

		// TODO : envoyer le mot au serveur
		$.ajax({
			url: this.HOST + '/' + this.QUERY_URL + "/",
			type: 'GET',
			data: "json=" + JSON.stringify(query) + "&max=" + this.MAX_NODES_PER_QUERY,
			dataType: "json",
			success: function(json){
				$("header h1").removeClass("pulsing");
				callback(json);
			},
			error: function(json){
				$("header h1").removeClass("pulsing");
				console.log("Erreur pour charger la page : " + json.responseText);

				$("#dump").html($("#dump").html() + "Erreur serveur <strong>" + json.responseText + "</strong>");
				InputManager.cleanDump();
			}
		});
	},
	queryServerWithNode: function(node, callback) {
		InputManager.queryServer(node.id, node.word, callback);
	},

	// Callback appelé lorsqu'on veut simplement étendre un graphe
	extendGraphCallback: function(json) {
		console.log("On étend le graphe grâce à un résultat de query.");

		// On met à jour le noeud déclancheur avec les edges trouvées
		var queryNode = GraphManager.theGraph.get(json.queryNode.id);
		queryNode.edges = json.edges;

		GraphManager.extendGraph(queryNode, json.newNodes);
	},

	// Callback appelé lorsqu'on construit un nouveau graphe suite à une requête
	newGraphCallback: function(json) {
		console.log("Succès de la requête vers le serveur ! On crée un nouveau graphe.");
		
		// On calcule la position à laquelle on pourra loger notre nouveau graphe
		var cozyPosition = ViewManager.getCozyPosition();

		// On crée le nouveau noeud qui constitue la racine de notre nouveau graphe
		var newRoot = NodeFactory.create(json.queryNode.id, json.queryNode.word);
		for (var j in json.edges){
			var edge = json.edges[j];
			newRoot.addEdge(edge.to, edge.relevance);
		}
		// Ce noeud est une nouvelle racine de graphe
		GraphManager.theGraph.addRoot(newRoot);

		// On affiche cette nouvelle racine dans l'espace
		ViewManager.drawNode(cozyPosition, newRoot);
		ViewManager.map.panTo(newRoot.position);

		// Puis on étend ce nouveau graphe avec les noeuds fraichement créés
		GraphManager.extendGraph(newRoot, json.newNodes);
	},

	cleanDump: function(confirm) {
	if (confirm === undefined || confirm === null) {
		setTimeout(function(){
			InputManager.cleanDump(true);
		}, 5000);
	}
	else {
		$("#dump").fadeOut(800, function(){
			$("#dump").empty().fadeIn();
		});
	}
}
};

$(document).ready(function(){
	InputManager.init();
});