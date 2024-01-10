function weatherAlertTrigger() {
    console.log("weather warning triggered");
    if (alertStatus == "Watch") {

    } else if (alertStatus == "Warning") {
        function createMarquee(warning) {
            const marquee = document.createElement('div');
            marquee.className = 'marquee';
          
            warning.forEach((line, index) => {
                const textElement = document.createElement('div');
                textElement.className = 'marquee-content';
                textElement.textContent = line;
                textElement.style.animationDelay = `${index * 12}s`; // Adjust time as needed
                textElement.style.animation = 'scrollText 12s linear infinite';
                marquee.appendChild(textElement);
            });
          
            const dropBox = document.getElementById("countBlock")
            dropBox.appendChild(marquee);
          }
          
        const alertStyle = document.createElement('link');
        alertStyle.href = 'https://ensloadout.911emergensee.com/ens-packages/components/alert-bars/ab0.css';
        alertStyle.rel = 'stylesheet';
        alertStyle.type = 'text/css';
        document.head.appendChild(alertStyle);

        createMarquee(warning);
    }
}

weatherAlertTrigger();