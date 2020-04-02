const apiKey = 'AIzaSyD0v2CTgsFVesI1JkXVzUBbUiwyOsioUjo';

const brewBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=brewery'
const addressBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
//required params: key

//optional but needed to function as intended:
//location:
//radius:

function getAddressCoords() {
    const streetAddress = $('#street').val().split(' ').join('+');
    const city = $('#city').val().split(' ').join('+');
    const state = $('#state').val();
    
    const searchString = `${streetAddress},+${city},+${state}`;

    url = `${addressBaseUrl}${searchString}&key=${apiKey}`;

    console.log(url);

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then((responseJson) => {
        const addressInput = responseJson.results[0].geometry.location;
        renderMap(addressInput)
    })
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

let map, pos;

function watchForm() {
    $('.results-page').hide();
    $('form').submit(event => {
        event.preventDefault();
        $('#js-error-message').empty();
        // const minutes = $('#minutes').val();
        loadMap();
    })
}

function loadMap() {
    initMap();
    //Temporarily removed geolocation. Will implement after user feedback. 
    //Option to use geolocation on loading screen and/OR results screen?
    getAddressCoords();
    $('.landing-page').hide();
    $('.results-page').show();
}

function initMap() {

    const options = {
        center: {lat: 42.3145167, lng: -71.2504627},
        zoom: 10
    };    

    map = new google.maps.Map($('#map')[0], options);
}

function renderMap(inputCoords) {

    pos = inputCoords

    const infoWindow = new google.maps.InfoWindow;

    infoWindow.setPosition(pos);
    infoWindow.setContent('Your address.');
    infoWindow.open(map);
    map.setCenter(pos);

    findBreweries(map, pos);

}

function geolocation() {
    //Removed function from main program for now
    //Will give option to use geolocation OR input address in future and 
    //load map from selection

    //Possibly add a 'use my location' on results screen to override input address
    //and set center, calculate distances
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
    //find breweries function LOOK HERE! Declare function here for scope?
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
    const request = {
        query: 'brewery',
        location: pos,
        radius: 100
      };
    
    const service = new google.maps.places.PlacesService(map);

    service.textSearch(request, callback);
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

      calculateDistances(results, pos);
    }
  }

function addMarker(place, distance) {
    const minutes = $('#minutes').val();

    for (let i = 0; i < place.length; i++){
        if (distance.rows[0].elements[i].duration.value <= (minutes*60)) {
            const marker = new google.maps.Marker({
                position: place[i].geometry.location,
                map:map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
            });
            const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${place[i].name}</h3>
                        <h4>${distance.rows[0].elements[i].distance.text}</h4>
                        <h4>${distance.rows[0].elements[i].duration.text}</h4>`
            })
            marker.addListener('click', function(){
                infoWindow.open(map, marker);
            });
        } else {
            const marker = new google.maps.Marker({
                position: place[i].geometry.location,
                map:map,
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            });
            const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${place[i].name}</h3>
                        <h4>${distance.rows[0].elements[i].distance.text}</h4>
                        <h4>${distance.rows[0].elements[i].duration.text}</h4>`
            })
            marker.addListener('click', function(){
                infoWindow.open(map, marker);
            });
        }

    }
}

function displayBreweryInfo(placesInfo, distanceInfo) {
    for (let i = 0; i < placesInfo.length; i++) {
        $('#results-list').append(
            `<li><h3>${placesInfo[i].name}</h3>
            <p>${distanceInfo.destinationAddresses[i]}</p></li>
            <p>${distanceInfo.rows[0].elements[i].distance.text}</p>
            <p>${distanceInfo.rows[0].elements[i].duration.text}</p>`

            //use distance value to compare to user input. if else to set marker icons.
        )
    }
}

function getBrewCoords(array) {
    return array.map(item => item.geometry.location);
}

function calculateDistances(placesResults, pos) {

    const breweryCoords = getBrewCoords(placesResults);

    const originArray = [];
    originArray.push(pos);

    const service = new google.maps.DistanceMatrixService();
        const request = {
            origins: originArray,
            destinations: breweryCoords,
            travelMode: 'WALKING',
            unitSystem: google.maps.UnitSystem.IMPERIAL
        }

        service.getDistanceMatrix(request, callback);

      // Callback function used to process Distance Matrix response
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

// 5 km/h average walking speed


//'bounds' to use bounds of current map

