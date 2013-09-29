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
        return data.Word;
    }


$(document).ready(function() {
    RandomWord();
});

function getRandomWord(nb) {
    var list = [];
    for(var i = 0; i < nb; i++) {
        list.push(RandomWord());
    }
    
    return list;
}