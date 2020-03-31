const apiKey = 'AIzaSyCZQwAjWM4MWpvcHAAl7kK6-mMuo3xJ54Q';

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
      for (let i = 0; i < results.length; i++) {
        addMarker(results[i]); //place
        displayBreweryInfo(results[i]);
      }
      const breweryCoords = getBrewCoords(results);
      calculateDistances(breweryCoords, pos);
    }
  }

function addMarker(place) {
    const marker = new google.maps.Marker({
        position: place.geometry.location,
        map:map,
        // icon:
      });
}

function displayBreweryInfo(place) {
    $('#results-list').append(
        `<li><h3>${place.name}</h3>
        <p>${place.formatted_address}</p></li>`
    )
}

function getBrewCoords(array) {
    return array.map(item => item.geometry.location);
}

function calculateDistances(breweryCoords, pos) {

    originArray = [];
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
      function callback(response, status) {
        if (status !== "OK") {
          alert("Error with distance matrix");
          return;
        }
        console.log(response);   
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
