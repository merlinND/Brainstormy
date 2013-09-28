$.HOST = "http://192.168.66.26";
$.QUERY_URL = "query";

(function($){

	$(document).ready(function(){
		// TODO : à désactiver
		$("#startingPoint").parent("form").hide();

		init();
	});

	function init(){
		$("#startingPoint").focus();
		$("#startingPoint").parent("form").on("submit", startSubmit);

		console.log(">> Input ready");

		// Test d'une requête vers le serveur
		var testNode = NodeFactory.create(0, "cat");
		queryServer(testNode);
	}

})(jQuery);

function startSubmit(e) {
	e.preventDefault();
	$(e.target).fadeOut();
	
	// A partir du mot donné, on crée le noeud initial
	var firstNode = NodeFactory.create(0, $("#startingPoint").val());
	
	// On interroge le serveur pour obtenir les noeuds correspondants
	queryServer(firstNode);
	
	return false;
}

function queryServer(node) {
	console.log(node);
	
	// TODO : envoyer le mot au serveur
	$.ajax({
		url: $.HOST + '/' + $.QUERY_URL,
		type: 'POST',
		data: "hey=yo",
		dataType: "json",
		success: function(json){
			console.log("Succès de la requête vers le serveur :");
			console.log(json);
		},
		error: function(json){
			console.log("Erreur pour charger la page : " + json.responseText);
		}
	});
}