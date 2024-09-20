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