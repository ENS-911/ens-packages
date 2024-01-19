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