var map, searchManager;

jQuery(function () {
    //alert("Handler for .submit() called.");

    $("#loadMapBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()

        map = new Microsoft.Maps.Map('#myMap', {
            credentials: key
        });
    });

    $("#formSubmitBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()

        ValidateFormInput(key, list)
    });


});

function Search(query) {
    if (!searchManager) {
        //Create an instance of the search manager and perform the search.
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            searchManager = new Microsoft.Maps.Search.SearchManager(map);
            Search(query)
        });
    } else {
        // remove previous results from the map
        map.entities.clear();

        // geocode user query
        geocodeQuery(query);
    }
}

function geocodeQuery(query) {
    var searchRequest = {
        where: query,
        callback: function (r) {
            if (r && r.results && r.results.length > 0) {
                var pin, pins = [], locs = [], output = 'Results:<br/>';

                for (var i = 0; i < r.results.length; i++) {
                    //Create a pushpin for each result. 
                    pin = new Microsoft.Maps.Pushpin(r.results[i].location, {
                        text: i + ''
                    });
                    pins.push(pin);
                    locs.push(r.results[i].location);

                    output += i + ') ' + r.results[i].name + '<br/>';
                }

                //Add the pins to the map
                map.entities.push(pins);

                //Display list of results
                document.getElementById('output').innerHTML = output;

                //Determine a bounding box to best view the results.
                var bounds;

                if (r.results.length == 1) {
                    bounds = r.results[0].bestView;
                } else {
                    //Use the locations from the results to calculate a bounding box.
                    bounds = Microsoft.Maps.LocationRect.fromLocations(locs);
                }

                map.setView({ bounds: bounds });
            }
        },
        errorCallback: function (e) {
            //If there is an error, alert the user about it.
            alert("No results found.");
        }
    };

    //Make the geocode request.
    searchManager.geocode(searchRequest);
}

function ValidateFormInput(key, addresses) {
    return ValidateKey(key) && ValidateAddressList(addresses);
}

function ValidateKey(key) {
    if (key.trim().length == 0) {
        alert("Map key is required");
        return false;
    }
    return true;
}

function ValidateAddressList(addresses) {
    if (addresses.trim().length == 0) {
        alert("Address text is required");
        return false;
    }
    // else {
    //     var addressList = addresses.split("\n");
    //     addressList.forEach(addr => {
    //         submitRest(key, addr);
    //     });
    // }
    return true;
}

function submitRest(key, address) {
    var baseUrl = "http://dev.virtualearth.net/REST/v1/Locations";
    var encodedAdr = encodeURIComponent(address);
    var urlToPost = baseUrl + "?q=" + encodedAdr + "&key=" + key + ""
    console.log('urlToPost ' + urlToPost)
    //return

    $.post(urlToPost, { q: encodedAdr, key: key, contentType: "application/json", crossDomain: true },
        function (returnedData) {
            console.log(returnedData);
        }).fail(function (ts) {
            console.log("error");
        });

    return;

    $.ajax({
        url: urlToPost + "&inclnb=1",
        contentType: "application/json",
        dataType: 'jsonp',
        //crossDomain: true,
        success: function (result) {
            var tt = result;
        },
        error: function (ts) {
            alert(ts.status + " " + ts.responseText);
            var x = 11;
        }

    }).then(function (data) {

    });
}