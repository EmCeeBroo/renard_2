// Script básico para funcionalidades de la página principal

const URL_RESTAURANTES = "http://127.0.0.1:3000/renard/restaurante";

// Función para obtener datos de restaurantes
async function fetchRestaurantes() {
    try {
        const response = await fetch(URL_RESTAURANTES);
        if (!response.ok) {
            throw new Error('Error al obtener datos de restaurantes');
        }
        const restaurantes = await response.json();
        return restaurantes;
    } catch (error) {
        console.error('Error fetching restaurantes:', error);
        return [];
    }
}

// Variables globales para controlar el carrusel
let currentSlide = 0;
let totalSlides = 0;
let carouselTrack = null;
let autoPlayInterval = null;

// Función para renderizar el carrusel de restaurantes
function renderRestaurantesCarousel(restaurantes) {
    const container = document.getElementById('restaurantes-carousel');
    if (!container) return;

    container.innerHTML = '';

    if (restaurantes.length === 0) {
        container.innerHTML = '<div class="image-placeholder"><span>No hay restaurantes disponibles</span></div>';
        return;
    }

    // Crear estructura del carrusel
    const carouselWrapper = document.createElement('div');
    carouselWrapper.classList.add('carousel-wrapper');

    carouselTrack = document.createElement('div');
    carouselTrack.classList.add('carousel-track');

    // Agregar imágenes al carrusel
    restaurantes.forEach((restaurante, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        if (index === 0) slide.classList.add('active');

        const img = document.createElement('img');
        // CORREGIDO: URL de imagen correcta
        img.src = restaurante.url_imagen || `../public/src/img/restaurantes/${restaurante.url_imagen}`;
        img.alt = restaurante.nombre;
        img.onerror = function() {
            this.src = `../public/assets/img/restaurantes/${restaurante.url_imagen}` // Imagen por defecto
        };

        slide.appendChild(img);
        carouselTrack.appendChild(slide);
    });

    carouselWrapper.appendChild(carouselTrack);

    // Controles del carrusel
    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-control', 'prev');
    prevButton.innerHTML = '&#10094;';
    prevButton.onclick = () => changeSlide(-1);

    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-control', 'next');
    nextButton.innerHTML = '&#10095;';
    nextButton.onclick = () => changeSlide(1);

    carouselWrapper.appendChild(prevButton);
    carouselWrapper.appendChild(nextButton);

    // Indicadores
    const indicators = document.createElement('div');
    indicators.classList.add('carousel-indicators');

    restaurantes.forEach((_, index) => {
        const indicator = document.createElement('span');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.onclick = () => goToSlide(index);
        indicators.appendChild(indicator);
    });

    carouselWrapper.appendChild(indicators);
    container.appendChild(carouselWrapper);

    // Inicializar variables del carrusel
    currentSlide = 0;
    totalSlides = restaurantes.length;

    // Auto-play del carrusel
    startAutoPlay();
}

function changeSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

function updateCarousel() {
    if (!carouselTrack) return;
    
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });

    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

function startAutoPlay() {
    // Limpiar intervalo anterior si existe
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
    
    // Configurar nuevo intervalo
    autoPlayInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Cambiar cada 5 segundos
}

// Pausar auto-play cuando el usuario interactúa
function pauseAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Reanudar auto-play
function resumeAutoPlay() {
    if (!autoPlayInterval) {
        startAutoPlay();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Cargar restaurantes al iniciar
    fetchRestaurantes().then(restaurantes => {
        renderRestaurantesCarousel(restaurantes);
    });

    // Smooth scrolling para enlaces de anclaje
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Modal de Contacto
    const contactoModal = document.getElementById('contactoModal');
    const openContactModal = document.getElementById('openContactModal');
    const closeModal = document.querySelector('.close-modal');
    
    // Abrir modal al hacer clic en "Contacto"
    if (openContactModal) {
        openContactModal.addEventListener('click', function(e) {
            e.preventDefault();
            contactoModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        });
    }
    
    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            contactoModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        });
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    contactoModal.addEventListener('click', function(e) {
        if (e.target === contactoModal) {
            contactoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Cerrar modal con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && contactoModal.style.display === 'block') {
            contactoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Animación de aparición para elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación
    const elementsToAnimate = document.querySelectorAll('.benefit-card, .step, .section-content');
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
    
    // Efecto de hover mejorado para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Funcionalidad básica para botones de registro
    const registerButtons = document.querySelectorAll('.btn-primary');
    registerButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Redirigiendo al formulario de registro...');
        });
    });
    
    // Añadir clase visible inicial para elementos en viewport
    setTimeout(() => {
        document.querySelectorAll('.benefit-card, .step, .section-content').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                el.classList.add('visible');
            }
        });
    }, 100);
});