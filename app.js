var map, searchManager;
var results = [];

jQuery(function () {
    $("#myMap").hide();
    // $("#resultsTable").hide();
    $("#formSubmitBtn").prop("disabled", !map);

    $("#loadMapBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()
        $("#myMap").show();
        map = new Microsoft.Maps.Map('#myMap', {
            credentials: key
        });
        $("#formSubmitBtn").prop("disabled", !map);
        $("#loadMapBtn").prop("disabled", map);
    });

    $("#formSubmitBtn").on("click", function (event) {
        var key = $("#keyEntry").val()
        var list = $("#addresses").val()
        // remove previous results from map
        map.entities.clear();

        if (ValidateFormInput(key, list)) {
            var addressList = list.split("\n");
            addressList.forEach(addr => {
                Search(addr);
            });
        }

        // TODO - move into validate section
        // $("#resultsTable").show();
    });

    $("#formClearAdrBtn").on("click", function (event) {
        ClearAddressInput();
    });

    $("#formClearResultsBtn").on("click", function (event) {
        ClearResultsGrid();
    });

    $("#formClearAllBtn").on("click", function (event) {
        ClearAddressInput();
        ClearResultsGrid();
    });

    $("#genTableBtn").on("click", function (event) {
        var id = '1', lat = '42.235', long = '-97.3', name = 'nice name';
        AddLineToGrid(id, lat, long, name);
    });
});

function AddLineToGrid(id, lat, long, description) {
    // TODO - add hyperlink for issue #4
    var markup = "<tr><td>" + id + "</td><td>" + lat + "</td><td>" + long + "</td><td>" + description + "</td></tr>";
    $("table tbody").append(markup);
}

function ClearAddressInput() {
    $("#addresses").empty()
}

function ClearResultsGrid() {
    $("table tbody").empty();
}

function Search(query) {
    if (!searchManager) {
        //Create an instance of the search manager and perform the search.
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            searchManager = new Microsoft.Maps.Search.SearchManager(map);
            Search(query)
        });
    } else {
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

                //SetMapBoundingBox(locs, pins);
            }
        },
        errorCallback: function (e) {
            //If there is an error, alert the user about it.
            //alert("No results found.");
            console.log("No results found");
        }
    };

    //Make the geocode request.
    searchManager.geocode(searchRequest);
}

function SetMapBoundingBox(locs, pins) {
    //Add the pins to the map
    map.entities.push(pins);

    //Determine a bounding box to best view the results.
    var bounds;

    //Use the locations from the results to calculate a bounding box.
    bounds = Microsoft.Maps.LocationRect.fromLocations(locs);

    map.setView({ bounds: bounds });
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
    return true;
}