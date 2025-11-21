const slides = document.getElementById('carouselSlides');
const totalSlides = slides.children.length;
let currentIndex = 0;
let isTransitioning = false;

function updateSlidePosition() {
  slides.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function moveToNextSlide() {
  currentIndex = (currentIndex + 1) % totalSlides;
  updateSlidePosition();
}

function moveToPrevSlide() {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  updateSlidePosition();
}

document.getElementById('nextBtn').addEventListener('click', () => {
  if (isTransitioning) return;
  isTransitioning = true;
  moveToNextSlide();
  setTimeout(() => isTransitioning = false, 700);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  if (isTransitioning) return;
  isTransitioning = true;
  moveToPrevSlide();
  setTimeout(() => isTransitioning = false, 700);
});

// Autoplay
setInterval(() => {
  if (!isTransitioning) {
    moveToNextSlide();
  }
}, 5000); // cambia cada 5 segundos


