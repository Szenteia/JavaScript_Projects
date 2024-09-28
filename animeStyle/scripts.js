// Smooth scrolling effect for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Simple gallery hover effect
const galleryImages = document.querySelectorAll('.image-gallery img');

galleryImages.forEach(image => {
  image.addEventListener('mouseover', () => {
    image.style.transform = 'scale(1.1)';
    image.style.transition = 'transform 0.5s ease';
  });

  image.addEventListener('mouseout', () => {
    image.style.transform = 'scale(1)';
  });
});

// JavaScript to handle horizontal scroll on vertical scroll
let scrollAmount = 0;
const aboutSection = document.querySelector('.about-section');
const aboutWrapper = document.querySelector('.about-wrapper');
const aboutItems = document.querySelectorAll('.about-item');

// Calculate the total scrollable width
const maxScroll = (aboutItems.length - 1) * window.innerWidth;

// Add event listener for the wheel event to simulate horizontal scroll
aboutSection.addEventListener('wheel', (event) => {
  event.preventDefault();

  // Adjust the scroll amount based on the wheel delta
  scrollAmount += event.deltaY;

  // Limit the scroll amount to the maximum scrollable width
  if (scrollAmount < 0) {
    scrollAmount = 0;
  } else if (scrollAmount > maxScroll) {
    scrollAmount = maxScroll;
  }

  // Apply the translation based on the current scroll amount
  aboutWrapper.style.transform = `translateX(-${scrollAmount}px)`;
});

window.addEventListener('scroll', () => {
  const heroSection = document.querySelector('.hero-section');
  const scrollPosition = window.scrollY;

  // Change background image when scroll passes 300px
  if (scrollPosition > 100) {
    heroSection.classList.add('demon');
  } else {
    heroSection.classList.remove('demon');
  }

  // Parallax effect: Move background down slightly on scroll
  const parallaxValue = scrollPosition * 0.5; // Adjust speed by changing multiplier
  heroSection.style.backgroundPositionY = `${parallaxValue}px`;
});

let currentLimit = 20; // Initial limit for the number of items displayed
let animeList = []; // Store the fetched anime data globally
let currentSortCriteria = 'alphabetical'; // Default sort criteria
let favourites = []; // Store the user's favourite animes

// Function to fetch currently airing anime and display them
async function fetchCurrentlyAiringAnime() {
    try {
        const response = await fetch('https://api.jikan.moe/v4/seasons/now');
        const data = await response.json();
        animeList = data.data; // Store the data in the global animeList variable
        displayAnimeList(animeList, currentLimit);
    } catch (error) {
        console.error('Error fetching currently airing anime:', error);
    }
}

// Function to display anime list with a specified limit
function displayAnimeList(animeList, limit) {
    const gallery = document.querySelector('.image-gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Sort the list based on the current sort criteria
    const sortedList = sortAnimeList(animeList, currentSortCriteria);

    // Show only the first 'limit' items
    sortedList.slice(0, limit).forEach(anime => {
        const animeElement = document.createElement('div');
        animeElement.classList.add('anime-item');
        animeElement.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
            <h3>${anime.title}</h3>
            <p>Episodes: ${anime.episodes || 'N/A'}</p>
            <p>Score: ${anime.score || 'N/A'}</p>
            <button class="select-btn">Select as Favourite</button>
        `;

        // Add event listener to the "Select" button
        const selectBtn = animeElement.querySelector('.select-btn');
        selectBtn.addEventListener('click', () => addToFavourites(anime));

        gallery.appendChild(animeElement);
    });

    // Ensure "Want to see more?" button is always at the bottom
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) {
        createLoadMoreButton();
    } else {
        loadMoreBtn.style.display = (limit >= animeList.length) ? 'none' : 'block';
    }
}

// Function to add an anime to the favourites list
function addToFavourites(anime) {
    if (favourites.length < 3 && !favourites.some(fav => fav.mal_id === anime.mal_id)) {
        favourites.push(anime);
        displayFavourites();
    } else if (favourites.some(fav => fav.mal_id === anime.mal_id)) {
        alert('This anime is already in your favourites.');
    } else {
        alert('You can only select up to 3 favourite animes.');
    }
}

// Function to display the favourite animes immediately in the "My Favourites" section
function displayFavourites() {
    const favouritesList = document.querySelector('.favourites-list');
    favouritesList.innerHTML = ''; // Clear existing content

    favourites.forEach(fav => {
        const favElement = document.createElement('li');
        favElement.classList.add('favourite-item');
        favElement.innerHTML = `
            <img src="${fav.images.jpg.image_url}" alt="${fav.title}" class="favourite-img"/>
            <h3>${fav.title}</h3>
            <button class="remove-btn">Remove</button>
        `;

        // Add event listener to the "Remove" button
        const removeBtn = favElement.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => removeFromFavourites(fav.mal_id));

        favouritesList.appendChild(favElement);
    });
}

// Function to remove an anime from favourites
function removeFromFavourites(animeId) {
    favourites = favourites.filter(fav => fav.mal_id !== animeId);
    displayFavourites();
}

// Function to create the "Want to see more?" button
function createLoadMoreButton() {
    const galleryContainer = document.querySelector('#gallery');
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.classList.add('load-more-btn');
    loadMoreBtn.textContent = 'Want to see more?';
    loadMoreBtn.addEventListener('click', () => {
        currentLimit += 1; // Increase limit by 20 each time the button is clicked
        displayAnimeList(animeList, currentLimit); // Redisplay the list with the new limit
    });
    galleryContainer.appendChild(loadMoreBtn);
}

// Function to sort anime list based on criteria
function sortAnimeList(animeList, criteria) {
    if (criteria === 'alphabetical') {
        return animeList.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === 'score') {
        return animeList.sort((a, b) => b.score - a.score);
    }
    return animeList;
}

// Sorting event listener
document.querySelector('.sort-dropdown').addEventListener('change', function () {
    const selectedOption = this.value;
    currentSortCriteria = selectedOption; // Update current sorting criteria
    displayAnimeList(animeList, currentLimit); // Redisplay the list with the updated sort and current limit
});

// Call the function to fetch anime when the page loads
window.addEventListener('load', fetchCurrentlyAiringAnime);
