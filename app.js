// $(document).ready(function() {
//     alert("something");
//     return
//     $.ajax({
//         url: "https://newsapi.org/v2/top-headlines?country=us&amp;apiKey=e03753c9126b408d870a44318813ac3d"
//     }).then(function(data) {

//         for (i = 0; i < data.articles.length; i++) {
//           $('#news').append("<ul><li>"+data.articles[i].title+"</li></ul>");
//         }

//     });
// });


$(document).ready(function () {
    //alert("Handler for .submit() called.");

    $("#formSubmitBtn").click(function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()
        
        ValidateFormInput(key, list)
        //alert("Handler for .submit() called.");
        // event.preventDefault();
    });
});

function ValidateFormInput(key, text) {
    if (key.trim().length == 0) {
        alert("API key required");
        return false;
    } else {

    }

    return false;
}

function submitRest(params) {

}