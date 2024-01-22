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
        let i = 1

        if (point.location.includes('-')) {
            // Use a regular expression to extract the start number, end number, and street name
            const match = point.location.match(/(\d+)-(\d+)\s+(.*)/);
            if (match) {
                const [_, startNumber, endNumber, streetName] = match;

                let addressSet = []
                // Create two separate addresses
                const address1 = `${startNumber} ${streetName}, ${point.db_city} ${point.db_state}`;
                const address2 = `${endNumber} ${streetName}, ${point.db_city} ${point.db_state}`;
                console.log("Address 1:", address1);
                console.log("Address 2:", address2);
                addressSet.push(address1);
                addressSet.push(address2);

                let twoPoints = [];

                addressSet.forEach(function (setPoint) {
                    var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(setPoint) + '.json?access_token=' + mapboxgl.accessToken;
                    fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        var coordinates = data.features[0].center;
                        twoPoints.push(coordinates);
                    })
                    .catch(err => console.error(err));

                });
                console.log('2P '+twoPoints);

                twoPoints.forEach(function(coord) {
                    new mapboxgl.Marker()
                    .setLngLat(coord)
                    .addTo(map);
                });
              
                // Add a line connecting the markers
                map.on('load', function () {
                    map.addSource(`route${i}`, {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': twoPoints
                            }
                        }
                    });
              
                    map.addLayer({
                        'id': `route${i}`,
                        'type': 'line',
                        'source': `route${i}`,
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': 'orange',
                            'line-width': 6
                        }
                    });
                });
            }
        }

        i++;

        var marker = new mapboxgl.Marker()
        .setLngLat([point.longitude, point.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.battalion}</h3><p>${point.type}</p>`))
        .addTo(map);
    });

    map.on('load', function () {
        if (countyCords.length === 1) {
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

mapRun();