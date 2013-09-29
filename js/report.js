
var ReportManager = {


	init: function(){
		console.log(">> Report ready");
	},

	generateReportFromGraph: function(graph){
		var html = '';
		var analyseNode = function(childrenNodes, currentNode, depth) {
			// On ne conserve que les noeuds qui ont des enfants, puisque ça veut
			// dire qu'ils ont été explorés
			if (childrenNodes.length > 0) {
				html += '<div class = "step">';
					html += '<span class = "nodeName">'+ currentNode.word +'</span>';
				html += '</div>';
			}

			// TODO : comment avoir les noeuds finaux ?
		};

		// Le graph peut avoir plusieurs racines, c'est autant de "fils" d'idées
		console.log("On va générer un rapport de : ");
		console.log(graph);

		// On parcourt toutes les arrêtes
		var allRoots = graph.getRootNodes();
		for (var i in allRoots) {
			var thisRoot = allRoots[i];

			// On parcourt récursivement les noeuds du graphe
			GraphManager.applyFunctionRecursively(analyseNode, thisRoot, null, graph, 0);
		}


		return html;
	},

	showReport: function(html){
		$("#report").fadeIn();
		$("#report .container").html(html);
	}
};

$(document).ready(function(){
	//ReportManager.init();
	//var mySampleGraph = GraphManager.createSampleGraph();
	//var html = ReportManager.generateReportFromGraph(mySampleGraph);
	//ReportManager.showReport(html);
});