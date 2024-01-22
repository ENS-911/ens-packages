const tableDiv = document.getElementById("tableBlock");

const tableWrap = document.createElement("table");
tableDiv.appendChild(tableWrap);
tableWrap.className = "tableWrap";

activeData.forEach(function (bar) {
    const tRow = document.createElement("tr");
    tableWrap.appendChild(tRow);

    const typeTc = document.createElement("td");
    tRow.appendChild(typeTc);
    typeTc.innerText = `${bar.agency_type}`;

    const statTc = document.createElement("td");
    tRow.appendChild(statTc);
    statTc.innerText = `${bar.status}`;

    const numbTc = document.createElement("td");
    tRow.appendChild(numbTc);
    numbTc.innerText = `${bar.sequencenumber}`;

    let date = new Date(bar.creation);

    let readableDate = date.toLocaleDateString("en-US", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + date.toLocaleTimeString('en-US');

    const dateTc = document.createElement("td");
    tRow.appendChild(dateTc);
    dateTc.innerText = `${readableDate}`;

    const agencyTc = document.createElement("td");
    tRow.appendChild(agencyTc);
    agencyTc.innerText = `${bar.jurisdiction}`;

    const eventTc = document.createElement("td");
    tRow.appendChild(eventTc);
    eventTc.innerText = `${bar.type}`;

    const locTc = document.createElement("td");
    tRow.appendChild(locTc);
    locTc.innerText = `${bar.location}`;

    const areaTc = document.createElement("td");
    tRow.appendChild(areaTc);
    areaTc.innerText = `${bar.db_city}`;
});