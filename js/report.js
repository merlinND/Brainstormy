
var ReportManager = {

	init: function(){
		$("header h1").on("click", ReportManager.summarizeBrainstorm);
		$("#report #close").on("click", ReportManager.hideReport);

		console.log(">> Report ready");
	},

	generateReportFromGraph: function(graph){
		var html = '';
		var analyseNode = function(childrenNodes, currentNode, depth) {
			// On ne conserve que les noeuds qui ont des enfants, puisque ça veut
			// dire qu'ils ont été explorés
			if (childrenNodes.length > 0) {
				color = flatColorsNum[currentNode.depth % flatColorsNum.length];

				html += '<div class="step" style="background-color: '+ color +'">';
					html += '<span class="nodeName">'+ currentNode.word +'</span>';
				html += '</div>';
			}

			// TODO : comment avoir les noeuds finaux ?
		};

		// Le graph peut avoir plusieurs racines, c'est autant de "fils d'idées"

		// On parcourt toutes les arrêtes
		var allRoots = graph.getRootNodes();
		for (var i in allRoots) {
			var thisRoot = allRoots[i];

			// On parcourt récursivement les noeuds du graphe
			GraphManager.applyFunctionRecursively(analyseNode, thisRoot, null, graph, 0);
		}

		return html;
	},


	summarizeBrainstorm: function(){
		if (GraphManager.theGraph.nodes.length > 0) {
			var html = ReportManager.generateReportFromGraph(GraphManager.theGraph);
			ReportManager.fillReport(html);
		}
	},
	fillReport: function(html){
		$("#report .container").append(html);
		ReportManager.showReport();
	},
	showReport: function(){
		$("#report").animate({
			"top": 0,
			"bottom": 0
		}).fadeIn();
	},
	hideReport: function(){
		console.log("Closing");
		$("#report").animate({
			"top": -window.innerHeight,
			"bottom": +window.innerHeight
		}).fadeOut();
	}
};

$(document).ready(function(){
	ReportManager.init();
});