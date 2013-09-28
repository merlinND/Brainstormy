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
		for(var i in graph){
			console.log(graph[i]);
		}
	}

})(jQuery);