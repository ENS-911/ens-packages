const mapScript = document.createElement('script');
mapScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.js';
document.head.appendChild(mapScript);

const mapStyle = document.createElement('script');
mapStyle.href = 'https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css';
mapStyle.rel = 'stylesheet';
document.head.appendChild(mapStyle);

while (rootDiv.firstChild) {
    rootDiv.removeChild(rootDiv.firstChild);
}

const packageLoad = document.createElement("h1");
rootDiv.appendChild(packageLoad);
packageLoad.innerText = "Silver Package Render File Has Been Loaded";

const mapArea = document.createElement("div");
rootDiv.appendChild(mapArea);
mapArea.setAttribute("id", "map");


  mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [longitude, latitude],
    zoom: 12
  });

  // Add full-screen control
  map.addControl(new mapboxgl.FullscreenControl());

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
              coordinates: [longitude, latitude]
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