const marquee = document.createElement('marquee');

  // Set marquee attributes and content
  marquee.setAttribute('behavior', 'scroll');
  marquee.setAttribute('direction', 'left');
  marquee.setAttribute('scrollamount', '5'); // Adjust the scroll speed as needed
  marquee.textContent = 'This is a dynamically generated marquee! ';
  marquee.className = "alertBar";

  // Append the marquee to the body or any other element you prefer
  countDiv.appendChild(marquee);

  tableTrigger()