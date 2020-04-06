const placesBaseUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=brewery'

function formatQueryParams(params) { 
    const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`);
    return queryItems.join('&');
}

// Places API, No CORS. Used Maps API Places Library

function findBreweries(map, pos) {
    
    const params = {
        query: 'brewery',
        location: `${pos.lat},${pos.lng}`,
        radius: '100',
        key: apiKey
        };
    
    const searchString = formatQueryParams(params);
    const url = placesBaseUrl + '?' + searchString;
    
    console.log(url);

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then((responseJson) => {
        const breweryArr = responseJson.results;
        console.log(breweryArr); 
        calculateDistance(breweryArr, pos);
    })
    .catch(err => {
        $('#js-error-message-places').text(`Something went wrong: ${err.message}`);
    });
}

