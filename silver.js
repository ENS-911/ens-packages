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
let appState = {
    map: null,
    activeData: "",
    dayCount: "",
    yearCount: "",
    countyCords: "",
    weatherData: "",
    countyCode: "",
    alertStatus: "off",
    warnings: [],
    warningData: [],
    watch: [],
    latitude: "",
    longitude: "",
    centcord: ""
};

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
        
        appState.activeData = await response.json();
        console.log(appState.activeData);
        appState.countyCode = nwsId;
        console.log(appState.countyCode);
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
        appState.dayCount = countData.currentDateCount;
        appState.yearCount = countData.totalCount;
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
        const response = await fetch(`https://api.weather.gov/zones/county/${appState.countyCode}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const countyData = await response.json();

        // Log the coordinates to ensure it's structured as expected
        console.log('County coordinates:', countyData.geometry.coordinates);

        // Ensure that countyData.geometry.coordinates is a valid array
        if (!countyData.geometry || !Array.isArray(countyData.geometry.coordinates)) {
            throw new Error('Invalid coordinates format in response');
        }

        // Since countyData.geometry.coordinates is an array with a single item that contains the actual coordinates
        appState.countyCords = countyData.geometry.coordinates[0]; // Access the first element directly

        // Pass the array of coordinates to find the centroid
        appState.centcord = findCentroid(appState.countyCords);
        const [longitude, latitude] = appState.centcord.map(parseFloat);
        appState.longitude = longitude;
        appState.latitude = latitude;

        // Proceed to map load
        mapLoad();
    } catch (error) {
        console.error('Error fetching county coordinates:', error.message);
    }
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
        const response = await fetch(`https://api.weather.gov/alerts/active?zone=${appState.countyCode}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const countyWeatherData = await response.json();
        appState.weatherData = countyWeatherData;
        weather();
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
    }
}

// Process weather data
function weather() {
    if (appState.weatherData.features?.length) {
        appState.weatherData.features.forEach(item => {
            if (item.properties.event.includes("Warning")) {
                appState.alertStatus = "Warning";
                appState.warningData.push(item);
                appState.warnings.push(item.properties.headline);
            } else if (item.properties.event.includes("Watch")) {
                if (appState.alertStatus === "off") {
                    appState.alertStatus = "Watch";
                }
                appState.watch.push(item.properties.headline);
            }
        });
    } else {
        appState.alertStatus = "off";
        console.log("No warnings");
    }
}

// Trigger table script
function tableTrigger() {
    loadScript('https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.js');
    loadStylesheet('https://ensloadout.911emergensee.com/ens-packages/components/live-tables/lt0.css');
}

// Helper to find centroid of coordinates
function findCentroid(coordsArray) {
    // Check if coordsArray is a valid array
    if (!Array.isArray(coordsArray) || coordsArray.length === 0) {
        console.error('Invalid coordsArray for calculating centroid');
        return [0, 0]; // Return default coordinates if invalid
    }

    let latSum = 0, lonSum = 0, count = 0;

    // Calculate the centroid by summing all the latitudes and longitudes
    coordsArray.forEach(([lon, lat]) => {
        if (typeof lat === 'number' && typeof lon === 'number') {
            latSum += lat;
            lonSum += lon;
            count++;
        } else {
            console.warn('Invalid coordinate:', [lat, lon]);
        }
    });

    if (count === 0) {
        console.error('No valid coordinates found');
        return [0, 0]; // Return default coordinates if no valid points
    }

    return [lonSum / count, latSum / count]; // Return the calculated centroid
}
