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
	}

})(jQuery);

function startSubmit(e) {
	e.preventDefault();
	$(e.target).fadeOut();
	
	// A partir du mot donné, on crée le noeud initial
	console.log(NodeFactory);
	var firstNode = NodeFactory.create(0, $("#startingPoint").val());
	
	// On interroge le serveur pour obtenir les noeuds correspondants
	queryServer(firstNode);
	
	return false;
}

function queryServer(node) {
	console.log(node);
	
	// TODO : envoyer le mot au serveur
}