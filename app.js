var map, searchManager;
var results = [];

jQuery(function () {
    $("#resultsTable").hide();
    $("#formSubmitBtn").prop("disabled", !map);

    $("#loadMapBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()

        map = new Microsoft.Maps.Map('#myMap', {
            credentials: key
        });
        $("#formSubmitBtn").prop("disabled", !map);
        $("#loadMapBtn").prop("disabled", map);
    });

    $("#formSubmitBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()

        if (ValidateFormInput(key, list)) {
            var addressList = list.split("\n");
            addressList.forEach(addr => {
                Search(addr);
            });
        }

        // TODO - move into validate section
        $("#resultsTable").show();
    });

    $("#genTableBtn").on("click", function (event) {
        var id = '1', lat = '42.235', long = '-97.3', name = 'nice name';
        AddLineToGrid(id, lat, long, name);
    });
});

function AddLineToGrid(id, lat, long, description) {
    var markup = "<tr><td>" + id + "</td><td>" + lat + "</td><td>" + long + "</td><td>" + description + "</td></tr>";
    $("table tbody").append(markup);
}

function Search(query) {
    if (!searchManager) {
        //Create an instance of the search manager and perform the search.
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            searchManager = new Microsoft.Maps.Search.SearchManager(map);
            Search(query)
        });
    } else {
        // remove previous results from the map
        //map.entities.clear();

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

                //Create a pushpin for each result. 
                for (var i = 0; i < r.results.length; i++) {
                    if (i == 0) {
                        var id = results.length
                        results.push(r.results[0]);
                        var lat = r.results[0].location.latitude;
                        var long = r.results[0].location.longitude;
                        var name = r.results[0].address.formattedAddress;
                        AddLineToGrid(id, lat, long, name);
                    }

                    pin = new Microsoft.Maps.Pushpin(r.results[i].location, {
                        text: i + ''
                    });
                    pins.push(pin);
                    locs.push(r.results[i].location);

                    output += i + ') ' + r.results[i].name + '<br/>';
                }
                //Display list of results
                // document.getElementById('output').innerHTML = output;

                //Add the pins to the map
                map.entities.push(pins);


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