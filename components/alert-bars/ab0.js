function createMarquee(warning) {
  const marquee = document.createElement('div');
  marquee.className = 'marquee';

  warning.forEach((line, index) => {
      const textElement = document.createElement('div');
      textElement.className = 'marquee-content';
      textElement.textContent = line;
      textElement.style.animationDelay = `${index * 10}s`; // Adjust time as needed
      textElement.style.animation = 'scrollText 10s linear infinite';
      marquee.appendChild(textElement);
  });

  const dropBox = document.getElementById("countBlock")
  dropBox.appendChild(marquee);
}

createMarquee(warning);

  tableTrigger()