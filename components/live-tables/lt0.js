const tableDiv = document.getElementById("tableBlock");

const tableWrap = document.createElement("table");
tableDiv.appendChild(tableWrap);
tableWrap.className = "tableWrap";

data.forEach(function (bar) {
    const tRow = document.createElement("tr");
    tableWrap.appendChild(tRow);

    const typeTc = document.createElement("tc");
    tRow.appendChild(typeTc);
    typeTc.innerText = `${bar.agency_type}`;

    const statTc = document.createElement("tc");
    tRow.appendChild(statTc);
    statTc.innerText = `${bar.status}`;

    const numbTc = document.createElement("tc");
    tRow.appendChild(numbTc);
    numbTc.innerText = `${bar.sequencenumber}`;

    let date = new Date(bar.creation);

    let readableDate = date.toLocaleDateString("en-US", {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' ' + date.toLocaleTimeString('en-US');

    const dateTc = document.createElement("tc");
    tRow.appendChild(dateTc);
    dateTc.innerText = `${readableDate}`;

    const agencyTc = document.createElement("tc");
    tRow.appendChild(agencyTc);
    agencyTc.innerText = `${bar.jurisdiction}`;

    const eventTc = document.createElement("tc");
    tRow.appendChild(eventTc);
    eventTc.innerText = `${bar.type}`;

    const locTc = document.createElement("tc");
    tRow.appendChild(locTc);
    locTc.innerText = `${bar.location}`;

    const areaTc = document.createElement("tc");
    tRow.appendChild(areaTc);
    areaTc.innerText = `${bar.db_city}`;
});