var InputManager = {
	HOST: "http://192.168.66.26:9000",
	QUERY_URL: "query",
	MAX_NODES_PER_QUERY: 6,

	init: function(){
		// TOOD : pendant les tests, on ne déclanche l'affichage du
		// input que lors d'un clic sur le <h1>
		$("header h1, form").on("click", function(e){
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
		InputManager.queryServer(word);

		return false;
	},

	queryServer: function(word, callback) {
		// A partir du mot donné, on crée le noeud initial
		// TODO : choisir intelligemment un id
		var queryNode = NodeFactory.create(0, word);
		InputManager.queryServerWithNode(queryNode, callback);
	},
	queryServerWithNode: function(node, callback) {
		if (callback === undefined)
			callback = InputManager.queryCallback;

		console.log("On fait un envoi au serveur : " + JSON.stringify(node));

		// TODO : envoyer le mot au serveur
		$.ajax({
			url: this.HOST + '/' + this.QUERY_URL + "/",
			type: 'GET',
			data: "json=" + JSON.stringify(node) + "&max=" + this.MAX_NODES_PER_QUERY,
			dataType: "json",
			success: callback,
			error: function(json){
				console.log("Erreur pour charger la page : " + json.responseText);
			}
		});
	},

	// Callback par défaut pour construire un nouveau graphe
	queryCallback: function(json) {
		console.log("Succès de la requête vers le serveur !");
		var queryNode = json[0];

		// On peut déjà placer cette nouvelle racine
		// TODO : choisir intelligemment la position de la nouvelle racine
		ViewManager.drawNode(new google.maps.LatLng(-0.005, 0), queryNode);

		// TODO : faire tout ça côté serveur
		// TODO : enregistrer la relevance dans les nodes eux-même
		for(var i in json){
			var thisNode = json[i];
			if (thisNode.relevance === undefined)
				// TODO : remplacer par la vraie valeur
				thisNode.relevance = 1;
			if (thisNode.parentId === null)
				thisNode.parentId = queryNode.id;

			// On restaure la position sous forme d'objet LatLng
			if (thisNode.position !== undefined && thisNode.position !== null)
				thisNode.position = new google.maps.LatLng(thisNode.position.nb, thisNode.position.ob);
		}

		console.log(json);

		// Les noeuds suivants sont tous les nouveaux noeuds
		var newNodes = json.slice(1);

		ViewManager.drawNodesAround(newNodes, queryNode, 0);
	}
};

$(document).ready(function(){
	InputManager.init();
});