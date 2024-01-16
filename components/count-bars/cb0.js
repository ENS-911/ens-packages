const countDiv = document.getElementById("countBlock");

const countWrap = document.createElement("div");
countDiv.appendChild(countWrap);
countWrap.className = "countWrap";

const dayBlock = document.createElement("h3");
countWrap.appendChild(dayBlock);
dayBlock.innerText = `DAILY TOTAL INCIDENTS: ${dayCount}`;
dayBlock.className = "countItem";

const yearBlock = document.createElement("h3");
countWrap.appendChild(yearBlock);
yearBlock.innerText = `YEARLY INCIDENTS: ${yearCount}`;
yearBlock.className = "countItem";
