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
}