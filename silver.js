// Helper function to load external scripts
function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => console.error(`Error loading script: ${src}`);
    document.head.appendChild(script);
}

// Helper function to load external stylesheets
function loadStylesheet(href) {
    const link = document.createElement('link');
    link.href = href;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
}

// Data Store (use an object for better structure)

map = null
activeData = ""
dayCount = ""
yearCount = ""
countyCords = ""
weatherData = ""
countyCode = ""
alertStatus = "off"
warnings = []
warningData = []
watch = []
latitude = ""
longitude = ""
centcord = ""


// Remove all child elements from rootDiv (optimize with innerHTML)
rootDiv.innerHTML = "";

// Initialize countBlock and mapArea
const countBlock = document.createElement("div");
countBlock.id = 'countBlock';
rootDiv.appendChild(countBlock);

const mapArea = document.createElement("div");
mapArea.id = "map";
mapArea.style.height = "900px";
rootDiv.appendChild(mapArea);

const tableBlock = document.createElement("div");
tableBlock.id = 'tableBlock';
rootDiv.appendChild(tableBlock);

// Load Mapbox script and styles
loadScript('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js', dataGrab);
loadStylesheet('https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css');

// Fetch and process active data
async function dataGrab() {
    try {
        console.log(clientID);
        const response = await fetch(`https://matrix.911-ens-services.com/data/${clientID}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        activeData = await response.json();
        console.log(activeData);
        countyCode = nwsId;
        console.log(countyCode);
        countsLoad(); 
    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
}

// Fetch and process counts data
async function countsLoad() {
    try {
        const response = await fetch(`https://matrix.911-ens-services.com/count/${clientID}`);
        const countData = await response.json();
        dayCount = countData.currentDateCount;
        yearCount = countData.totalCount;
        countTrigger();
    } catch (error) {
        console.error('Error fetching counts:', error.message);
    }
}

// Trigger external count bar script
function countTrigger() {
    loadScript('https://ensloadout.911emergensee.com/ens-packages/components/count-bars/cb0.js');
    loadStylesheet('https://ensloadout.911emergensee.com/ens-packages/components/count-bars/cb0.css');
    countyCordsGrab();
}

// Fetch and process county coordinates
async function countyCordsGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/zones/county/${countyCode}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        countyData = await response.json();
        countyCords = countyData.geometry.coordinates;
        centcord = findCentroid(countyCords);
    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
    let centcordstr = String(centcord);
    let parts = centcordstr.split(',');
    longitude = parseFloat(parts[0]);
    latitude = parseFloat(parts[1]);
    mapLoad();
}

// Load external map script
function mapLoad() {
    loadScript('https://ensloadout.911emergensee.com/ens-packages/components/map/map.js', () => {
        console.log('External map loaded successfully');
    });
}

// Fetch and process weather alerts
async function countyWeatherGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/alerts/active?zone=${countyCode}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const countyWeatherData = await response.json();
        weatherData = countyWeatherData;
        weather();
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

// Process weather data
function weather() {
    if (weatherData.features?.length) {
        weatherData.features.forEach(item => {
            if (item.properties.event.includes("Warning")) {
                alertStatus = "Warning";
                warningData.push(item);
                warnings.push(item.properties.headline);
            } else if (item.properties.event.includes("Watch")) {
                if (alertStatus === "off") {
                    alertStatus = "Watch";
                }
                watch.push(item.properties.headline);
            }
        });
    } else {
        alertStatus = "off";
        console.log("No warnings");
    }
}

// Trigger table script
function tableTrigger() {
    loadScript('https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.js');
    loadStylesheet('https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.css');
}

function findCentroid(coordsArray) {
    let latSum = 0;
    let lonSum = 0;
    let count = 0;
    if (coordsArray.length > 1) {
        coordsArray.forEach(coordBlock => {
        coordBlock.forEach(coords => {
            coords.forEach(coord => {
                latSum += coord[0];
                lonSum += coord[1];
                count++;
            });
        });
    })
    } else {
        coordsArray.forEach(coords => {
        coords.forEach(coord => {
            latSum += coord[0];
            lonSum += coord[1];
            count++;
        });
    });
    }
    return [latSum / count, lonSum / count];
    }
