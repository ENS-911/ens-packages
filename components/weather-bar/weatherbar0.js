let curWeatherData = ""
let vis = "visible"

const weatherStyle = document.createElement('link');
weatherStyle.href = 'https://ensloadout.911emergensee.com/ens-packages/components/weather-bar/weatherbar0.css';
weatherStyle.rel = 'stylesheet';
weatherStyle.type = 'text/css';
document.head.appendChild(weatherStyle);

const weatherBarWrap = document.createElement('div');
countDiv.appendChild(weatherBarWrap);
weatherBarWrap.id = "weatherBarWrap";

const controlButt = document.createElement('button');
controlButt.id = "controlButt";
weatherBarWrap.appendChild(controlButt);

const controlButtP = document.createElement('p');
controlButt.appendChild(controlButtP);
controlButtP.innerText = "Hide Weather";

document.getElementById('controlButt').addEventListener('click', function() {
    var layer = map.getLayer('simple-tiles');
    if (layer) {
    var visibility = map.getLayoutProperty('simple-tiles', 'visibility');
    
        // Toggle visibility
        if (vis != 'visible') {
            map.setLayoutProperty('simple-tiles', 'visibility', 'visible');
            controlButtP.innerText = "Hide Weather";
            vis = "visible"
        } else if (vis == 'visible') {
            map.setLayoutProperty('simple-tiles', 'visibility', 'none');
            controlButtP.innerText = "Show Weather";
            vis = "none"
        }
    } else {
        console.log("Layer not found");
    }
});

if (alertStatus == "Watch") {
    const watchBar = document.createElement('div');
    weatherBarWrap.appendChild(watchBar);

    const watchBarP = document.createElement('p');
    watchBar.appendChild(watchBarP);

    watchBarP.innerText = `${watch}`;
}

const url = `https://api.weather.gov/points/${latitude},${longitude}`;

// Fetch the grid point URL from NWS
fetch(url)
    .then(response => response.json())
    .then(data => {
        // Fetch weather conditions from the grid point forecast URL
        const forecastUrl = data.properties.forecastHourly;
        return fetch(forecastUrl);
    })
    .then(response => response.json())
    .then(data => {
        // Process the weather data
        console.log(data)
        curWeatherData = data.properties.periods[0]
        console.log(curWeatherData);

        const tempBox = document.createElement('div');
        weatherBarWrap.appendChild(tempBox);

        const tempBoxP = document.createElement('p');
        tempBox.appendChild(tempBoxP);
        tempBoxP.innerText = `Current Temp ${curWeatherData.temperature}F`;
    })
    .catch(error => console.error('Error:', error));