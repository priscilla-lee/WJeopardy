var categories = ["History", "Women’s Colleges", "Campus", "Alumnae", "Faculty",  "Student Life"];

function displayBoard(height, width, labels) {  
    for (var row=0; row<height; row=row+1) {
        var rowEl = $("<tr>");
        if (row === 0){
            for (var idx in labels){
                $("<th>").attr({class: 'header'})
                         .text(labels[idx])
                         .appendTo(rowEl); 
            }
        } else {
            for (var col=0; col<width; col=col+1) {
                $("<td>").attr({class: labels[col], 
                                id: labels[col]+"_"+row})
                         .text("$"+row*100)
                         .appendTo(rowEl);          
            }
        }
        rowEl.appendTo("#board");    
    }   
}


displayBoard(6, categories.length, categories);

$("#board td").click(function(){
    var ID = $(this).attr("id");
    var category = ID.split("_")[0];
    var itemNr = ID.split("_")[1];
    var qa = wellesley_round1[category][itemNr];
    //$("#overlay, #infobox").removeClass("hidden");
	$("#infobox").removeClass("hidden");
    $("#infobox #question").html(qa['q']);
    $("#infobox #answer").html(qa['a']);
    $(this).addClass("completed");
});

  $("#close").click(function(){
    $("#overlay, #infobox").addClass("hidden");
    $("#answer").hide();
  });

$("#show").click(function(){
  $("#infobox #answer").show();
});