var map, infobox, searchManager;
var masterResults = [];
var searchAddrAndResults = new Map();

jQuery(function () {
    $("#myMap").hide();
    $("#formSubmitBtn").prop("disabled", !map);

    var key = localStorage.getItem("mapKey");
    $("#keyEntry").val(key);

    $("#loadMapBtn").on("click", LoadMapBtnClick);
    $("#formSubmitBtn").on("click", SubmitFormBtnClick);
    $("#formClearAdrBtn").on("click", ClearAddressInput);
    $("#formClearResultsBtn").on("click", ClearResultsGrid);
    $("#formClearAllBtn").on("click", ClearAll);
});

function LoadMapBtnClick() {
    var key = $("#keyEntry").val();
    if (!ValidateKey(key)) {
        return;
    }
    localStorage.setItem("mapKey", key);
    $("#myMap").show();
    map = new Microsoft.Maps.Map('#myMap', {
        credentials: key
    });

    // Create an infobox at the center of the map but don't show it
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false
    });
    infobox.setMap(map);

    $("#formSubmitBtn").prop("disabled", !map);
    $("#loadMapBtn").prop("disabled", map);
}

function SubmitFormBtnClick() {
    var key = $("#keyEntry").val();
    var list = $("#addresses").val();
    // remove previous results from map
    ClearMap();
    ClearResultsGrid();

    if (ValidateFormInput(key, list)) {
        var addressList = list.split("\n");
        addressList.forEach(addr => {
            if (addr.trim().length > 0) {
                Search(addr);
            }
        });
    }
}

function AddResultToGrid(id, result) {
    var lat = result.location.latitude;
    var long = result.location.longitude;
    // var name = result.address.formattedAddress;
    var street = result.address.addressLine;
    var city = result.address.locality;
    var state = result.address.adminDistrict;
    var country = result.address.countryRegion;
    var zip = result.address.postalCode;

    AddLineToGrid(id, lat, long, street, city, state, zip, country);
}

function AddLineToGrid(id, lat, long, street, city, state, zip, country) {
    var markup = "<tr>" +
        GetTableData(id) +
        GetTableData(lat) +
        GetTableData(long) +
        GetTableData("<a href=\"https://www.bing.com/maps?sp=point." + lat + "_" + long + "_" +
            encodeURIComponent(street) + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + street + "</a>") +
        GetTableData(city) +
        GetTableData(state) +
        GetTableData(zip) +
        GetTableData(country) +
        "</tr>";

    $("table tbody").append(markup);
}

function GetTableData(data) {
    return "<td>" + data + "</td>";
}

function ClearAll() {
    ClearAddressInput();
    ClearResultsGrid();
}

function ClearAddressInput() {
    $("#addresses").val("")
}

function ClearResultsGrid() {
    $("table tbody").empty();
    masterResults = [];
    ClearMap();
}

function Search(query) {
    if (!searchManager) {
        // Create an instance of the search manager and perform the search.
        Microsoft.Maps.loadModule('Microsoft.Maps.Search', function () {
            searchManager = new Microsoft.Maps.Search.SearchManager(map);
            Search(query)
        });
    } else {
        GeocodeQuery(query);
    }
}

function GeocodeQuery(query) {
    var searchRequest = {
        where: query,
        callback: function (r) {
            if (r && r.results && r.results.length > 0) {
                masterResults.push(r.results[0]);
                AddResultToGrid(masterResults.length, r.results[0]);

                ClearMap();
                BuildAndAddPinsToMap(masterResults);
                GetAndSetMapBoundingBox(masterResults);
            }
        },
        errorCallback: function (e) {
            // TODO - see about using bootstrap alerts #8
            // If there is an error, alert the user about it.
            //alert("No results found.");
            console.log("No results found");
        }
    };

    // Make the geocode request.
    searchManager.geocode(searchRequest);
}

function ClearMap() {
    if (map) {
        map.entities.clear();
    }
}

function GetMapBoundingBox(results) {
    var locs = [];
    results.forEach(res => {
        locs.push(res.location);
    });

    // Determine a bounding box to best view the results.
    var bounds = Microsoft.Maps.LocationRect.fromLocations(locs);
    return bounds;
}

function SetMapBoundingBox(bounds) {
    map.setView({ bounds: bounds });
}

function GetAndSetMapBoundingBox(results) {
    SetMapBoundingBox(GetMapBoundingBox(results));
}

function BuildListOfPins(results) {
    var pins = [];
    for (var i = 0; i < results.length; i++) {
        var pin = new Microsoft.Maps.Pushpin(results[i].location, {
            text: (i + 1) + ''
        });

        pin.metadata = {
            title: results[i].address.addressLineformattedAddress,
            description: results[i].address.formattedAddress
        };

        Microsoft.Maps.Events.addHandler(pin, 'click', PinMouseClicked);

        pins.push(pin);
    }
    return pins;
}

function PinMouseClicked(e) {
    if (e.target.metadata) {
        infobox.setOptions({
            location: e.target.getLocation(),
            title: e.target.metadata.title,
            description: e.target.metadata.description,
            visible: true
        });
    }
}

function AddPinsToMap(pins) {
    map.entities.push(pins);
}

function BuildAndAddPinsToMap(results) {
    AddPinsToMap(BuildListOfPins(results));
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
    else {
        var list = $("#addresses").val();
        var addressList = list.split("\n");
        searchAddrAndResults.clear();
        addressList.forEach(addr => {
            if (addr.trim().length > 0) {
                if (searchAddrAndResults.has(addr)) {
                    alert("Duplicate address exists: '" + addr + "' please remove duplicates before searching.")
                    return false;
                }
                else {
                    searchAddrAndResults.set(addr, undefined);
                }
            }
        });
    }
    return true;
}