const countDiv = document.getElementById("countBlock");

const dayBlock = document.createElement("h3");
countDiv.appendChild(dayBlock);
dayBlock.innerText = `Day Total: ${dayCount}`;

const yearBlock = document.createElement("h3");
countDiv.appendChild(yearBlock);
yearBlock.innerText = `Year Total: ${yearCount}`;