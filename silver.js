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
let countyCode = "TNC065";
//let countyCode = "AKC185";
//let countyCode = "GAC127";
//let countyCode = "AZC019";
let alertStatus = "off";
let warning = [];
let warningData = [];
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

function mapRun() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0MTk3MiIsImEiOiJjbDdycmxjNXIwaTJ1M3BudXB2ZTZoZm1tIn0.v-NAvl8Ba0yPtAtxOt9iTg';

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [longitude, latitude],
    zoom: 10
  });


  // Add full-screen control
  map.addControl(new mapboxgl.FullscreenControl());

  data.forEach(function (point) {
    var marker = new mapboxgl.Marker()
      .setLngLat([point.longitude, point.latitude])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.battalion}</h3><p>${point.type}</p>`))
      .addTo(map);
  });

  // Add marker clustering
  map.on('load', function () {
    map.addSource('markers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          // Your GeoJSON features go here
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [-81.5367365, 35.081401]
            },
            properties: {
              title: 'Your Marker Title',
              description: 'Marker description'
            }
          }
        ]
      }
    });

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'markers',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'markers',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'markers',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });

        // Add popups
        map.on('click', 'clusters', function (e) {
            var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            var clusterId = features[0].properties.cluster_id;
            map.getSource('markers').getClusterExpansionZoom(clusterId, function (err, zoom) {
                if (err) return;

                map.easeTo({
                    center: features[0].geometry.coordinates,
                    zoom: zoom
                });
            });
        });

        map.on('click', 'unclustered-point', function (e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = e.features[0].properties.description;

            new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        map.on('mouseenter', 'clusters', function () {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'clusters', function () {
            map.getCanvas().style.cursor = '';
        });
    });
    console.log("cord count = "+ countyCords.length)
    map.on('load', function () {
        if (countyCords.length === 1) {
            console.log("single map run")
        map.addLayer({
            'id': 'polygon-outline',
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': countyCords,
                    }
                }
            },
            'layout': {},
            'paint': {
                'line-color': '#FF0000',
                'line-width': 2
            }
        });
        } else {
            console.log("multi map run")
            let i = 1
            countyCords.forEach(singleCord => {
                map.addLayer({
                    'id': `polygon-outline${i}`,
                    'type': 'line',
                    'source': {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Polygon',
                                'coordinates': singleCord,
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
            })
        }
    });

    map.on('load', function() {
        if (warningData.length >= 1) {
            warningData.forEach((warning, index) => {
                if (warning.geometry != null) {
                    const layerIdFill = `warning-fill-${index}`;
                    const layerIdText = `warning-text-${index}`;
    
                    // Create a fill layer for polygon
                    try {
                        map.addLayer({
                            'id': layerIdFill,
                            'type': 'fill',
                            'source': {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'geometry': {
                                        'type': 'Polygon',
                                        'coordinates': warning.geometry.coordinates,
                                    }
                                }
                            },
                            'paint': {
                                'fill-color': '#FF0000', // Adjust fill color as needed
                                'fill-opacity': 0.5      // Adjust fill opacity as needed
                            }
                        });
                    } catch (e) {
                        console.error(`Error adding fill layer ${layerIdFill}:`, e);
                    }

                    const centroid = findCentroid(warning.geometry.coordinates);
                    console.log('Centroid:', centroid);
    
                    // Create a text layer for labels
                    try {
                        map.addLayer({
                            'id': layerIdText,
                            'type': 'symbol',
                            'source': {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'geometry': {
                                        'type': 'Point',
                                        'coordinates': centroid // Set the coordinates for label positioning
                                    },
                                    'properties': {
                                        'title': warning.properties.event // Replace with your text property
                                    }
                                }
                            },
                            'layout': {
                                'text-field': '{title}', // Use the 'title' property from the GeoJSON properties
                                'text-size': 18          // Adjust text size as needed
                            },
                            'paint': {
                                'text-color': '#000000' // Adjust text color as needed
                            }
                        });
                    } catch (e) {
                        console.error(`Error adding text layer ${layerIdText}:`, e);
                    }
                }
            });
        }
    });

    if (alertStatus != "off") {
        map.on('load', function(){
            map.addLayer({
                "id": "simple-tiles",
                "type": "raster",
                "source": {
                    "type": "raster",
                    "tiles": ["https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=bfa689a00c0a5864039c9e7396f1e745"],
                    "tileSize": 256
                },
                "layout": {
                    "visibility": "visible" // or "none" if you want it hidden initially
                },
            });
            weatherActivate();
        });
    }
}

function weather() {
    if (weatherData.features && weatherData.features.length > 0) {
    
        function extractHighestValueObjects(jsonData) {
            const urlGroups = {};
        
            jsonData.forEach(item => {
                const url = item.id; // Assuming 'id' is the field name where URL is stored
                const basePart = url.match(/(https:\/\/api\.weather\.gov\/alerts\/urn:oid:2\.49\.0\.1\.840\.0\.[^.]+)\./)[1];
                const numericPart = parseInt(url.split('.').slice(-2, -1), 10); // Extract the second last part
        
                if (!urlGroups[basePart] || numericPart > urlGroups[basePart].numericPart) {
                    urlGroups[basePart] = { numericPart: numericPart, object: item };
                }
            });
        
            return Object.values(urlGroups).map(group => group.object);
        }
        const highestValueObjects = extractHighestValueObjects(weatherData.features);
        console.log(highestValueObjects);

        highestValueObjects.forEach(function(item) {
    // Check if the word "Warning" is in the value of the "event" key
    if (item.properties.event && item.properties.event.includes("Warning")) {
        alertStatus = "Warning";
        warningData.push(item);
        warning.push(item.properties.headline);
        console.log("Warning found in event:", item.properties.event);
    } else if (item.properties.event && item.properties.event.includes("Watch")) {
        if (alertStatus == "off") {
            alertStatus = "Watch"
        }
        console.log("Watch found in event:", item.properties.event); 
    } else {
        console.log("No Warning in event:", item.properties.event);
    }
    
    });
} else {
    console.log("No warnings")
    alertStatus == "off"
}


function warningBoxes() {
    if (!map || typeof map.addLayer !== 'function') {
        console.error('Invalid map object or map does not support addLayer');
        return;
    }

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
}

async function countsLoad() {
    try {
        const response = await fetch(`https://matrix.911-ens-services.com/count/${clientID}`); // Replace with your server URL
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
    let latSum = 0;
    let lonSum = 0;
    let count = 0;

    coordsArray.forEach(coords => {
        coords.forEach(coord => {
            latSum += coord[0]; // Assuming coord[0] is latitude
            lonSum += coord[1]; // Assuming coord[1] is longitude
            count++;
        });
    });

    return [latSum / count, lonSum / count];
}