const apiKey = '';

let map, pos;

//https://maps.googleapis.com/maps/api/place/findplacefromtext/output?parameters


function watchForm() {
    $('.results-page').hide();
    $('form').submit(event => {
        event.preventDefault();
        //section landing-page replace with results-page
        // const minutes = $('#minutes').val();
        loadMap();
    })
}

function loadMap() {
    initMap();
    $('.landing-page').hide();
    $('.results-page').show();
}

function initMap() {

    const options = {
        center: {lat: 42.3145167, lng: -71.2504627},
        zoom: 10
    };    

    map = new google.maps.Map($('#map')[0], options);
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
    //find breweries function LOOK HERE!
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
    //   for (let i = 0; i < results.length; i++) {
    //     addMarker(results[i]);
    //     displayBreweryInfo(results[i]);
    //   }
      calculateDistances(results, pos);
    }
  }

function addMarker(place) {
    for (let i = 0; i < place.length; i++){
        const marker = new google.maps.Marker({
            position: place[i].geometry.location,
            map:map,
            // icon:
          });
    }
}

function displayBreweryInfo(placesInfo, distanceInfo) {
    for (let i = 0; i < placesInfo.length; i++) {
        $('#results-list').append(
            `<li><h3>${placesInfo[i].name}</h3>
            <p>${distanceInfo.destinationAddresses[i]}</p></li>
            <p>${distanceInfo.rows[0].elements[i].distance.text}</p>
            <p>${distanceInfo.rows[0].elements[i].duration.text}</p>`
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
            addMarker(placesResults);
            displayBreweryInfo(placesResults, results);
            console.log(placesResults, results);
        }
        //function to display/append distances and walking times
        //function to change markers that meet criteria. Maybe don't create markers until this step.    
      }
}

$(watchForm);

//mapOptions to set markers


//'bounds' to use bounds of current map

//const marker = new google.maps.Marker({
//     position: ,
//     map: map
// });
