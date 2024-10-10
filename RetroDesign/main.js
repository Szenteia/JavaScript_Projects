const pixabayAPI = {
    baseUrl: "https://pixabay.com/api/",
    key: "40183-9b47af445c3952742a6617b36"
};

// Kulcsszavak a különböző témákhoz
const themeKeywords = {
    sixties: "1960s",
    seventies: "1970s",
    eighties: "1980s"
};

function fetchImages(keyword) {
    const url = `${pixabayAPI.baseUrl}?key=${pixabayAPI.key}&q=${keyword}&image_type=photo&per_page=15`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Galéria törlése
            const imageGallery = document.getElementById('image-gallery');
            imageGallery.innerHTML = "";

            // Képek dinamikus betöltése és megjelenítése
            data.hits.forEach(photo => {
                const imageItem = document.createElement('div');
                imageItem.classList.add('image-item');

                // Kép és információ megjelenítése
                imageItem.innerHTML = `
                    <img src="${photo.webformatURL}" alt="${photo.tags}">
                `;

                // Hozzáadás a galériához
                imageGallery.appendChild(imageItem);
            });
        })
        .catch(error => {
            console.error("Hiba történt a képek betöltése közben: ", error);
        });
}

// Function to switch themes based on button click
function switchTheme(themeClass) {
    // Remove existing theme classes
    document.body.classList.remove('sixties', 'seventies', 'eighties');
    
    // Add the selected theme class
    document.body.classList.add(themeClass);

    // Update the information dynamically based on the theme
    updateInformation(themeClass);
}

// Function to update the information content based on theme
function updateInformation(themeClass) {
    const infoContent = document.getElementById('info-content');
    
    // Define content for each theme
    const themeInformation = {
        sixties: `
            <strong>The 60s Design Style:</strong><br>
            The 1960s were a time of bold colors and psychedelic designs. Inspired by the counterculture movement, 
            the era saw the use of swirling patterns, peace symbols, and floral motifs. Graphic design from the 60s often featured hand-drawn typography, 
            bright colors like lime green, hot pink, and sunny yellow. The hippie culture influenced art with optical illusions, kaleidoscope designs, 
            and swirling patterns that represented freedom and individuality.
        `,
        seventies: `
            <strong>The 70s Design Style:</strong><br>
            The 1970s introduced earthy tones and geometric shapes. Brown, orange, and yellow were prominent colors used in fashion and interior design. 
            The aesthetic was heavily influenced by the disco culture and the rise of electronic music. Patterns in the 70s were often wavy and fluid, 
            drawing inspiration from nature. The use of gradients and warm tones became popular, creating a sense of nostalgia and comfort.
        `,
        eighties: `
            <strong>The 80s Design Style:</strong><br>
            The 1980s embraced neon colors, geometric shapes, and digital fonts. The aesthetic was characterized by vibrant colors such as neon pink, electric blue, 
            and bright yellow against dark backgrounds. Neon lights, grids, and futuristic designs were influenced by the rise of personal computers and video games. 
            The 80s design style is often described as loud, bold, and energetic, reflecting the fast-paced and technology-driven culture of the decade.
        `
    };

    // Set the content based on the selected theme
    infoContent.innerHTML = themeInformation[themeClass] || "Select a theme to learn more about it!";
}

// Attach event listeners to each theme button
document.getElementById('sixties').addEventListener('click', () => {
    switchTheme('sixties');
});

document.getElementById('seventies').addEventListener('click', () => {
    switchTheme('seventies');
});

document.getElementById('eighties').addEventListener('click', () => {
    switchTheme('eighties');
});
