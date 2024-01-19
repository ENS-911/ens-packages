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