function mapRun() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0MTk3MiIsImEiOiJjbDdycmxjNXIwaTJ1M3BudXB2ZTZoZm1tIn0.v-NAvl8Ba0yPtAtxOt9iTg';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/standard',
        center: [longitude, latitude],
        zoom: 10
    });

    countyWeatherGrab();

    // Add full-screen control
    map.addControl(new mapboxgl.FullscreenControl());

    const icons = {
        'Fire': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/fire.png',
        'Law': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/police.png',
        'EMS': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/ems.png',
        'Road Closure': 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/roadclosure.png'
    };
      
    const roadClosureIconUrl = 'https://ensloadout.911emergensee.com/ens-packages/icopacks/0/roadclosure.png';

    activeData.forEach((point, index) => {
        console.log('Icon type:', point.agency_type);
        if (point.location.includes('-')) {
            const match = point.location.match(/(\d+)-(\d+)\s+(.*)/);
            if (match) {
                const [_, startNumber, endNumber, streetName] = match;
                const street = streetName.trim();
                const cityState = `${point.db_city}, ${point.db_state}`;
                const startAddress = `${startNumber} ${street}, ${cityState}`;
                const endAddress = `${endNumber} ${street}, ${cityState}`;
    
                // Calculate intermediate address numbers
                let intermediateAddresses = [];
                for (let num = parseInt(startNumber, 10) + 100; num < parseInt(endNumber, 10); num += 100) {
                    intermediateAddresses.push(`${num} ${street}, ${cityState}`);
                }
    
                // Geocode the start, intermediate, and end addresses
                let addressesToGeocode = [startAddress, ...intermediateAddresses, endAddress];
                Promise.all(addressesToGeocode.map(address => 
                    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.features && data.features.length > 0) {
                            return data.features[0].center;
                        } else {
                            console.error('No geocoding result for address');
                            return null; // Or handle this case as appropriate
                        }
                    })
                )).then(allPoints => {
                    // Ensure all geocoded points are valid
                    const validPoints = allPoints.filter(point => point !== undefined);
                    if (validPoints.length < 2) {
                        console.error('Geocoding failed for some addresses');
                        return; // Exit if not enough valid points for a route
                    }
    
                    // Construct the waypoints string for the Directions API
                    const waypointsString = validPoints.slice(1, -1).map(coord => coord.join(',')).join(';');
    
                    // Fetch the route with intermediate waypoints
                    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${validPoints[0].join(',')};${waypointsString};${validPoints[validPoints.length - 1].join(',')}?geometries=geojson&access_token=${mapboxgl.accessToken}&steps=true`;
    
                    fetch(directionsUrl)
                        .then(response => response.json())
                        .then(data => {
                            if (data.routes && data.routes.length > 0) {
                                const route = data.routes[0].geometry;
                        
                                // Proceed with adding/updating the route on the map
                            } else {
                                console.error('No routes found from Directions API');
                                // Handle the absence of routes as needed
                            }
    
                            // Add or update the route on the map
                            const routeId = `route${index}`;
                            if (map.getSource(routeId)) {
                                map.getSource(routeId).setData(route);
                            } else {
                                map.addSource(routeId, {
                                    'type': 'geojson',
                                    'data': route
                                });
    
                                map.addLayer({
                                    'id': routeId,
                                    'type': 'line',
                                    'source': routeId,
                                    'layout': {
                                        'line-join': 'round',
                                        'line-cap': 'round'
                                    },
                                    'paint': {
                                        'line-color': '#ff7e5f',
                                        'line-width': 4
                                    }
                                });
                            }
    
                            // Add custom markers for start, intermediate, and end points
                            validPoints.forEach(coord => {
                                const el = document.createElement('div');
                                el.className = 'custom-marker';
                                el.style.backgroundImage = `url(${roadClosureIconUrl})`; // Define this variable based on your icon selection logic
                                el.style.width = '29px';
                                el.style.height = '37px';
                                el.style.backgroundSize = 'cover';
    
                                new mapboxgl.Marker(el)
                                    .setLngLat(coord)
                                    .addTo(map);
                            });
                        })
                        .catch(err => console.error('Error fetching directions:', err));
                }).catch(err => console.error('Error geocoding addresses:', err));
            }
          } else {
              const iconType = point.agency_type; // Adjust this according to how you determine the icon type
              const iconUrl = icons[iconType] || icons['Default']; // Provide a default icon URL if necessary
      
              const el = document.createElement('div');
              el.className = 'custom-marker';
              el.style.backgroundImage = `url(${iconUrl})`;
              el.style.width = '29px';
              el.style.height = '37px';
              el.style.backgroundSize = 'cover';
      
              new mapboxgl.Marker(el)
                  .setLngLat([point.longitude, point.latitude])
                  .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.battalion}</h3><p>${point.type}</p>`))
                  .addTo(map);
          }
      });

      map.on('load', function () {
        if (countyCords.length === 1) {
            const coordinates = countyCords[0];
    
            // Create the GeoJSON object for the single polygon
            const geojsonData = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [coordinates] // Wrap the coordinates array inside another array for GeoJSON
                }
            };
    
            // Add the layer to the map
            map.addLayer({
                'id': 'polygon-outline',
                'type': 'line',
                'source': {
                    'type': 'geojson',
                    'data': geojsonData
                },
                'layout': {},
                'paint': {
                    'line-color': '#FF0000',
                    'line-width': 2
                }
            });
        } else {
            // For multiple polygons
            countyCords.forEach((singleCord, i) => {
                const geojsonData = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [singleCord] // Wrap each single polygon inside an array for GeoJSON
                    }
                };
    
                // Add each layer to the map
                map.addLayer({
                    'id': `polygon-outline${i}`,
                    'type': 'line',
                    'source': {
                        'type': 'geojson',
                        'data': geojsonData
                    },
                    'layout': {},
                    'paint': {
                        'line-color': '#FF0000',
                        'line-width': 2
                    }
                });
            });
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
    tableTrigger()
}

mapRun();