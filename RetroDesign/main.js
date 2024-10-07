

// Function to switch themes based on button click
function switchTheme(themeClass) {
    // Remove existing theme classes
    document.body.classList.remove('sixties', 'seventies', 'eighties');
    
    // Add the selected theme class
    document.body.classList.add(themeClass);
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