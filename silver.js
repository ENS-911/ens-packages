const mapScript = document.createElement('script');
mapScript.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
document.head.appendChild(mapScript);
mapScript.onload = dataGrab;

const mapStyle = document.createElement('link');
mapStyle.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
mapStyle.rel = 'stylesheet';
mapStyle.type = 'text/css';
document.head.appendChild(mapStyle);

//Data Store
let map;
let data = "";
let nowCount = "";
let dayCount = "";
let yearCount = "";
let countyCords = "";
let weatherData = "";
let countyCode = "";
//let countyCode = "AKC185";
//let countyCode = "GAC127";
//let countyCode = "AZC019";
let alertStatus = "off";
//let alertStatus = "Warning";
let warning = [];
//let warning = ["This is a test of the ENS alert system"];
let warningData = [];
let watch = "";
let latitude = "";
let longitude = "";
let centcord = "";
//End Data Store

while (rootDiv.firstChild) {
    rootDiv.removeChild(rootDiv.firstChild);
}

const countBlock = document.createElement("div");
rootDiv.appendChild(countBlock);
countBlock.id = 'countBlock';

const mapArea = document.createElement("div");
rootDiv.appendChild(mapArea);
mapArea.setAttribute("id", "map");
mapArea.style.height = "900px";

const tableBlock = document.createElement("div");
rootDiv.appendChild(tableBlock);
tableBlock.id = 'tableBlock';

async function dataGrab() {
    try {
        console.log(clientID)
        const response = await fetch(`https://matrix.911-ens-services.com/data/${clientID}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        data = await response.json();
        countyCode = data.nws;
        console.log(data);
        countyCordsGrab(); 
    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
}

async function countyCordsGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        countyData = await response.json();
        countyCords = countyData.geometry.coordinates;
        console.log(countyData);
        centcord = findCentroid(countyCords);
        console.log('county center cords '+ centcord);
    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
    let centcordstr = String(centcord);
    let parts = centcordstr.split(',');
    longitude = parseFloat(parts[0]);
    latitude = parseFloat(parts[1]);
    countyWeatherGrab()
}

async function countyWeatherGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        countyWeatherData = await response.json();
        weatherData = countyWeatherData;
        console.log(weatherData);
    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
    weather();
    mapRun();
}



function weather() {
    if (weatherData.features && weatherData.features.length > 0) {
        jsonData.forEach(function(item) {
            if (item.properties.event && item.properties.event.includes("Warning")) {
                alertStatus = "Warning";
                warningData.push(item);
                warning.push(item.properties.headline);
                console.log("Warning found in event:", item.properties.event);
            } else if (item.properties.event && item.properties.event.includes("Watch")) {
                if (alertStatus == "off") {
                    alertStatus = "Watch"
                }
                watch.push(item.properties.headline);
                console.log("Watch found in event:", item.properties.event); 
            } else {
                console.log("No Warning in event:", item.properties.event);
            }
        });
    } else {
        console.log("No warnings")
        alertStatus == "off"
    }
}

function warningBoxes() {
    let i = 1
    warningData.forEach(warning => {
        if (warning.geometry != null) {
            const warnCoord = [warning.geometry.coordinates];
            console.log("warnCoords " + warnCoord)
            map.addLayer({
                'id': `warning-outline${i}`,
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': warnCoord,
                        }
                    }
                },
                'layout': {},
                'paint': {
                    'line-color': '#FF0000',
                    'line-width': 2
                }
            });
            i++
        }
    })  
}

countsLoad();
tableTrigger()


async function countsLoad() {
    try {
        const response = await fetch(`https://matrix.911-ens-services.com/count/${clientID}`);
        const countData = await response.json();

        console.log(countData)

        dayCount = countData.currentDateCount;
        yearCount = countData.totalCount;

        countTrigger();
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
      
}

function countTrigger() {
  const script = document.createElement('script');
  script.src = `https://ensloadout.911emergensee.com/ens-packages/components/count-bars/cb0.js`;
  document.head.appendChild(script);
  script.onload = function () {
    console.log('External script loaded successfully');
  };
  script.onerror = function () {
    console.error('Error loading external script');
  };

  const countStyle = document.createElement('link');
  countStyle.href = 'https://ensloadout.911emergensee.com/ens-packages/components/count-bars/cb0.css';
  countStyle.rel = 'stylesheet';
  countStyle.type = 'text/css';
  document.head.appendChild(countStyle);
}

function sortTrigger() {
  console.log('Sort Triggered');
}

function tableTrigger() {
    const script = document.createElement('script');
    script.src = `https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.js`;
    document.head.appendChild(script);
    script.onload = function () {
      console.log('Table script loaded successfully');
    };
    script.onerror = function () {
      console.error('Error loading table script');
    };
  
    const tableStyle = document.createElement('link');
    tableStyle.href = 'https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.css';
    tableStyle.rel = 'stylesheet';
    tableStyle.type = 'text/css';
    document.head.appendChild(tableStyle);
}

function weatherActivate() {
    const WeatherActivation = document.createElement('script');
    WeatherActivation.src = `https://ensloadout.911emergensee.com/ens-packages/components/weatherAlertTrigger.js`;
    document.head.appendChild(WeatherActivation);
    WeatherActivation.onload = function () {
        console.log('External WeatherActivation loaded successfully');
    };
    WeatherActivation.onerror = function () {
        console.error('Error loading external WeatherActivation');
    };
}

function findCentroid(coordsArray) {
    console.log(coordsArray.length);
    let latSum = 0;
    let lonSum = 0;
    let count = 0;

    if (coordsArray.length > 1) {
        console.log('multi center')
        coordsArray.forEach(coordBlock => {
        coordBlock.forEach(coords => {
            coords.forEach(coord => {
                latSum += coord[0]; // Assuming coord[0] is latitude
                lonSum += coord[1]; // Assuming coord[1] is longitude
                count++;
            });
        });
    })

    } else {
        console.log('single center')
    coordsArray.forEach(coords => {
        coords.forEach(coord => {
            latSum += coord[0]; // Assuming coord[0] is latitude
            lonSum += coord[1]; // Assuming coord[1] is longitude
            count++;
        });
    });
}

    return [latSum / count, lonSum / count];
}