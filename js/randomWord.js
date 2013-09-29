var allRandomWords = [];
function RandomWord() {
    var requestStr = "http://randomword.setgetgo.com/get.php";

    $.ajax({
        type: "GET",
        url: requestStr,
        dataType: "jsonp",
        jsonpCallback: 'RandomWordComplete'
    });
}

function RandomWordComplete(data) {
    allRandomWords.push(data.Word);
}

function getRandomWord(nb) {
    for(var i = 0; i < nb; i++) {
        console.log("On lance une requete.");
        RandomWord();
    }
}

$(document).ready(function() {
    console.log("On devrait être ready");
    //getRandomWord(10);

});

