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
let data = "";
let nowCount = "";
let dayCount = "";
let yearCount = "";
let countyCords = "";
let weatherData = "";
let countyCode = "TNC065";
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
        mapRun();
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
        countyCords = countyData.geometry.coordinates[0];
        console.log(countyCords);

    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
    countyWeatherGrab()
}

async function countyWeatherGrab() {
    try {
        const response = await fetch(`https://api.weather.gov/alerts?zone=${countyCode}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        countyWeatherData = await response.json();
        weatherData = countyWeatherData;
        console.log(weatherData);

    } catch (error) {
        console.error('Error fetching client information:', error.message);
    }
}

function mapRun() {
  mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0MTk3MiIsImEiOiJjbDdycmxjNXIwaTJ1M3BudXB2ZTZoZm1tIn0.v-NAvl8Ba0yPtAtxOt9iTg';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [data[0].longitude, data[0].latitude],
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

    map.on('load', function () {
        map.addLayer({
            'id': 'polygon-outline',
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [countyCords],
                    }
                }
            },
            'layout': {},
            'paint': {
                'line-color': '#FF0000',
                'line-width': 2
            }
        });
    });

    map.on('load', function(){
        map.addLayer({
            "id": "simple-tiles",
            "type": "raster",
            "source": {
                "type": "raster",
                "tiles": ["https://tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png?appid=bfa689a00c0a5864039c9e7396f1e745"],
                "tileSize": 256
            },
        });
    });

    countsLoad();
}

function weather() {
    if (weatherData.features && weatherData.features.length > 0) {
    weatherData.features.forEach(function(item) {
    // Check if the word "Warning" is in the value of the "event" key
    if (item.event && item.event.includes("Warning")) {
        console.log("Warning found in event:", item.event);
        weatherActivate();
    } else {
        console.log("No Warning in event:", item.event);
    }
    });
} else {
    console.log("No warnings")
}
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
      weather()
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

function alertTrigger() {
  const scroll = document.createElement('script');
  
  scroll.src = `https://ensloadout.911emergensee.com/ens-packages/components/alert-bars/ab0.js`;

  document.head.appendChild(scroll);
          
  scroll.onload = function () {
    console.log('External scroll loaded successfully');
  };
          
  scroll.onerror = function () {
    console.error('Error loading external scroll');
  };

  const alertStyle = document.createElement('link');
  alertStyle.href = 'https://ensloadout.911emergensee.com/ens-packages/components/alert-bars/ab0.css';
  alertStyle.rel = 'stylesheet';
  alertStyle.type = 'text/css';
  document.head.appendChild(alertStyle);
  
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