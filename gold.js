while (rootDiv.firstChild) {
    rootDiv.removeChild(rootDiv.firstChild);
}

const packageLoad = document.createElement("h1");
rootDiv.appendChild(packageLoad);
packageLoad.innerText = "Gold Package Render File Has Been Loaded";