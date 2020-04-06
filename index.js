let map, pos, descriptionWindow, infoWindow;

const markers = [];

const apiKey = '';

const geoBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
//Use Google Geocode API to convert user inputed address to fetch lat/lng coords
//Geocode API finds matching address (default IP bias to find logical match)
function getAddressCoords() {
    const streetAddress = $('#street').val().split(' ').join('+');
    const city = $('#city').val().split(' ').join('+');
    const state = $('#state').val();
    
    const searchString = `${streetAddress},+${city},+${state}`;

    const url = `${geoBaseUrl}${searchString}&key=${apiKey}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then((responseJson) => {
        const addressInput = responseJson.results[0].geometry.location;
        console.log(addressInput);
        renderMap(addressInput)
    })
    .catch(err => {
        $('#js-error-message-geo').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
    $('.results-page').hide();
    $('form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        loadMap();
    })
}

function useGeolocation() {
    $('.results-page').on('click', '#js-geolocation', function (event) {
        geolocation();
    })
}

function loadMap() {
    initMap();
    getAddressCoords();
    useGeolocation();
    $('.landing-page').hide();
    $('.results-page').show();
}

function initMap() {
//Load default Google Map div for page layout, focused on Boston MA
    const options = {
        center: {lat: 42.3145167, lng: -71.2504627},
        zoom: 10
    };    

    map = new google.maps.Map($('#map')[0], options);
}

function renderMap(inputCoords) {
//Find and focus on user inputed address from geocode API
    pos = inputCoords

    infoWindow = new google.maps.InfoWindow;
    descriptionWindow = new google.maps.InfoWindow;

    infoWindow.setPosition(pos);
    infoWindow.setContent('Your address.');
    infoWindow.open(map);
    map.setCenter(pos);
//main function to retrieve markers and brewery information
    findBreweries(map, pos);

}

function geolocation() {
//clear markers from map
    clearResults(markers);

    const infoWindow = new google.maps.InfoWindow;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent('Your location.');
        infoWindow.open(map);
        map.setCenter(pos);

        findBreweries(map, pos);

        }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
    }

function findBreweries(map, pos) {
//use Google Maps Places API Library to find nearby places matching 'brewery'
    const request = {
        query: 'brewery',
        location: pos,
        radius: 100 //default returns 20 results regardless of radius
      };
    
    const service = new google.maps.places.PlacesService(map);

    service.textSearch(request, callback);

    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          calculateDistances(results, pos); 
        }
    }
}

function addMarker(place, distance) {
    const minutes = $('#minutes').val();
    let color;
    //Loop through results and add markers to map
    for (let i = 0; i < place.length; i++){

        if (distance.rows[0].elements[i].duration.value <= (minutes*60)) {
            color = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        } else {
            color = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
        const marker = new google.maps.Marker({
            position: place[i].geometry.location,
            map:map,
            animation: google.maps.Animation.DROP,
            icon: color
        });

        google.maps.event.addListener(marker, 'click', function(){
            descriptionWindow.setContent(
                `<h3>${place[i].name}</h3>
                <h4>${distance.rows[0].elements[i].distance.text}</h4>
                <h4>${distance.rows[0].elements[i].duration.text}</h4>`);
            descriptionWindow.open(map, this);
        });
        //push to global array, used to clear markers from map
        markers.push(marker);
    } 
}

function clearResults(markers) {
    for (let m in markers) {
        markers[m].setMap(null);
    }
    markers = []
    infoWindow.close();
    $('#results-list').empty();
}

function displayBreweryInfo(placesInfo, distanceInfo) {
    //Loop through results and append content to ul
    for (let i = 0; i < placesInfo.length; i++) {
        $('#results-list').append(
            `<li id="brew-list"><h3>${placesInfo[i].name}</h3>
            <p>${distanceInfo.destinationAddresses[i]}</p>
            <p>${distanceInfo.rows[0].elements[i].distance.text}</p>
            <p>${distanceInfo.rows[0].elements[i].duration.text}</p></li>`
        );
    }
}

function getBrewCoords(array) { 
    return array.map(item => item.geometry.location);
}

function calculateDistances(placesResults, pos) {
    //Uses Google Places API Distance Matrix to calculate distances
    //from single origin (user input address or geoloc) and array of
    //destinations
    const breweryCoords = getBrewCoords(placesResults); 

    const originArray = [];
    originArray.push(pos);

    const service = new google.maps.DistanceMatrixService();
        const request = {
            origins: originArray,
            destinations: breweryCoords,
            travelMode: 'WALKING',
            unitSystem: google.maps.UnitSystem.IMPERIAL //USA! USA!
        }

    service.getDistanceMatrix(request, callback);

    // Callback function used to process distance Matrix response
    function callback(results, status) {
        if (status !== "OK") {
        alert("Error with distance matrix");
        } else {
            addMarker(placesResults, results);
            displayBreweryInfo(placesResults, results);
            console.log(placesResults, results);
        }  
    }

}

$(watchForm);