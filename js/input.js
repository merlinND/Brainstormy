$.HOST = "http://192.168.66.26:9000";
$.QUERY_URL = "query";

(function($){

	$(document).ready(function(){
		init();
	});

	function init(){
		console.log(">> Input ready");

		// TOOD : pendant les tests, on ne déclanche l'affichage du
		// input que lors d'un clic sur le <h1>
		$("header h1, form").on("click", function(e){
			e.stopPropagation();

			if (e.target.nodeName != "INPUT")
				toggleInputForm();
		});
		$("#startingPoint").parent("form").on("submit", startSubmit);
	}

})(jQuery);

function toggleInputForm() {
	if ($("form").is(":visible"))
		$("form").fadeOut();
	else {
		$("#startingPoint").val("");
		$("form").fadeIn();
		$("#startingPoint").focus();
	}
}

function startSubmit(e) {
	e.preventDefault();
	$(e.target).fadeOut();
	
	// A partir du mot donné, on crée le noeud initial
	// TODO : choisir intelligemment un id
	var word = $("#startingPoint").val(),
		firstNode = NodeFactory.create(0, word);
	console.log(word);
	// On interroge le serveur pour obtenir les noeuds correspondants
	queryServer(firstNode);
	
	return false;
}

function queryServer(node) {
	console.log("On fait un envoi au serveur : " + JSON.stringify(node));

	// TODO : envoyer le mot au serveur
	$.ajax({
		url: $.HOST + '/' + $.QUERY_URL + "/",
		type: 'GET',
		data: "json=" + JSON.stringify(node),
		dataType: "json",
		success: function(json){
			console.log("Succès de la requête vers le serveur :");

			// TODO : enregistrer la relevance dans les nodes eux-même
			for(var i in json){
				var thisNode = json[i];
				if (thisNode.relevance === undefined)
					// TODO : remplacer par la vraie valeur
					thisNode.relevance = 1;
			}

			console.log(json);

			// TODO : déclancher l'affichage des nouveaux noeuds et liens
			var centralNode = node;

			ViewManager.drawNodesAround(nodes, centralNode, ViewManager.DEFAULT_RADIUS, centralNode.position);
		},
		error: function(json){
			console.log("Erreur pour charger la page : " + json.responseText);
		}
	});
}