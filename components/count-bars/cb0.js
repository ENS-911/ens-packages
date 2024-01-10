const countDiv = document.getElementById("countBlock");

const countWrap = document.createElement("div");
countDiv.appendChild(countWrap);
countWrap.className = "countWrap";

const dayBlock = document.createElement("h3");
countWrap.appendChild(dayBlock);
dayBlock.innerText = `Day Total: ${dayCount}`;
dayBlock.className = "countItem";

const yearBlock = document.createElement("h3");
countWrap.appendChild(yearBlock);
yearBlock.innerText = `Year Total: ${yearCount}`;
yearBlock.className = "countItem";
