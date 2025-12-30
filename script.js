/**
 * Interactive Photo Gallery Script
 * Created: 2025-12-30
 * Provides photo carousel, lightbox, and gallery navigation functionality
 */

// Gallery Configuration
const galleryConfig = {
  autoplay: true,
  autoplayInterval: 5000,
  transitionDuration: 500,
  enableKeyboard: true,
  enableTouch: true
};

// Gallery State
let galleryState = {
  currentIndex: 0,
  isPlaying: false,
  touchStartX: 0,
  touchEndX: 0,
  photos: []
};

/**
 * Initialize Photo Gallery
 */
function initGallery() {
  const galleryContainer = document.querySelector('[data-gallery]');
  
  if (!galleryContainer) {
    console.warn('Gallery container not found');
    return;
  }

  // Get all photos
  galleryState.photos = Array.from(document.querySelectorAll('[data-gallery] img'));
  
  if (galleryState.photos.length === 0) {
    console.warn('No photos found in gallery');
    return;
  }

  // Setup event listeners
  setupEventListeners();
  
  // Initialize UI
  updateGalleryUI();
  
  // Start autoplay if enabled
  if (galleryConfig.autoplay) {
    startAutoplay();
  }

  console.log(`Gallery initialized with ${galleryState.photos.length} photos`);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Navigation buttons
  const prevBtn = document.querySelector('[data-gallery-prev]');
  const nextBtn = document.querySelector('[data-gallery-next]');
  const playBtn = document.querySelector('[data-gallery-play]');
  const pauseBtn = document.querySelector('[data-gallery-pause]');

  if (prevBtn) prevBtn.addEventListener('click', previousPhoto);
  if (nextBtn) nextBtn.addEventListener('click', nextPhoto);
  if (playBtn) playBtn.addEventListener('click', startAutoplay);
  if (pauseBtn) pauseBtn.addEventListener('click', stopAutoplay);

  // Thumbnail navigation
  const thumbnails = document.querySelectorAll('[data-gallery-thumbnail]');
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('click', () => goToPhoto(index));
  });

  // Keyboard navigation
  if (galleryConfig.enableKeyboard) {
    document.addEventListener('keydown', handleKeyboard);
  }

  // Touch navigation
  const galleryContainer = document.querySelector('[data-gallery]');
  if (galleryContainer && galleryConfig.enableTouch) {
    galleryContainer.addEventListener('touchstart', handleTouchStart, false);
    galleryContainer.addEventListener('touchend', handleTouchEnd, false);
  }

  // Lightbox functionality
  setupLightbox();
}

/**
 * Navigate to next photo
 */
function nextPhoto() {
  galleryState.currentIndex = (galleryState.currentIndex + 1) % galleryState.photos.length;
  updateGalleryUI();
  resetAutoplay();
}

/**
 * Navigate to previous photo
 */
function previousPhoto() {
  galleryState.currentIndex = (galleryState.currentIndex - 1 + galleryState.photos.length) % galleryState.photos.length;
  updateGalleryUI();
  resetAutoplay();
}

/**
 * Go to specific photo by index
 */
function goToPhoto(index) {
  if (index >= 0 && index < galleryState.photos.length) {
    galleryState.currentIndex = index;
    updateGalleryUI();
    resetAutoplay();
  }
}

/**
 * Update gallery UI
 */
function updateGalleryUI() {
  // Update main image display
  updateMainImage();
  
  // Update active thumbnail
  updateActiveThumbnail();
  
  // Update counter
  updatePhotoCounter();
  
  // Update progress bar
  updateProgressBar();
}

/**
 * Update main image display
 */
function updateMainImage() {
  const currentPhoto = galleryState.photos[galleryState.currentIndex];
  const mainImage = document.querySelector('[data-gallery-main]');

  if (mainImage && currentPhoto) {
    mainImage.style.opacity = '0';
    
    setTimeout(() => {
      mainImage.src = currentPhoto.src;
      mainImage.alt = currentPhoto.alt || `Photo ${galleryState.currentIndex + 1}`;
      mainImage.style.opacity = '1';
    }, galleryConfig.transitionDuration / 2);
  }
}

/**
 * Update active thumbnail
 */
function updateActiveThumbnail() {
  const thumbnails = document.querySelectorAll('[data-gallery-thumbnail]');
  
  thumbnails.forEach((thumb, index) => {
    thumb.classList.toggle('active', index === galleryState.currentIndex);
  });
}

/**
 * Update photo counter
 */
function updatePhotoCounter() {
  const counter = document.querySelector('[data-gallery-counter]');
  
  if (counter) {
    counter.textContent = `${galleryState.currentIndex + 1} / ${galleryState.photos.length}`;
  }
}

/**
 * Update progress bar
 */
function updateProgressBar() {
  const progressBar = document.querySelector('[data-gallery-progress]');
  
  if (progressBar) {
    const progress = ((galleryState.currentIndex + 1) / galleryState.photos.length) * 100;
    progressBar.style.width = progress + '%';
  }
}

/**
 * Start autoplay
 */
function startAutoplay() {
  if (galleryState.isPlaying) return;
  
  galleryState.isPlaying = true;
  
  const playBtn = document.querySelector('[data-gallery-play]');
  const pauseBtn = document.querySelector('[data-gallery-pause]');
  
  if (playBtn) playBtn.style.display = 'none';
  if (pauseBtn) pauseBtn.style.display = 'inline-block';

  galleryState.autoplayInterval = setInterval(() => {
    nextPhoto();
  }, galleryConfig.autoplayInterval);
}

/**
 * Stop autoplay
 */
function stopAutoplay() {
  galleryState.isPlaying = false;
  clearInterval(galleryState.autoplayInterval);
  
  const playBtn = document.querySelector('[data-gallery-play]');
  const pauseBtn = document.querySelector('[data-gallery-pause]');
  
  if (playBtn) playBtn.style.display = 'inline-block';
  if (pauseBtn) pauseBtn.style.display = 'none';
}

/**
 * Reset autoplay timer
 */
function resetAutoplay() {
  if (galleryState.isPlaying) {
    stopAutoplay();
    startAutoplay();
  }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboard(event) {
  switch(event.key) {
    case 'ArrowLeft':
      previousPhoto();
      event.preventDefault();
      break;
    case 'ArrowRight':
      nextPhoto();
      event.preventDefault();
      break;
    case ' ':
      event.preventDefault();
      if (galleryState.isPlaying) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
      break;
  }
}

/**
 * Handle touch start
 */
function handleTouchStart(event) {
  galleryState.touchStartX = event.changedTouches[0].screenX;
}

/**
 * Handle touch end
 */
function handleTouchEnd(event) {
  galleryState.touchEndX = event.changedTouches[0].screenX;
  detectSwipe();
}

/**
 * Detect swipe direction
 */
function detectSwipe() {
  const swipeThreshold = 50;
  const diff = galleryState.touchStartX - galleryState.touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextPhoto();
    } else {
      previousPhoto();
    }
  }
}

/**
 * Setup lightbox functionality
 */
function setupLightbox() {
  const photos = document.querySelectorAll('[data-gallery] img');
  
  photos.forEach((photo, index) => {
    photo.style.cursor = 'pointer';
    photo.addEventListener('click', () => openLightbox(index));
  });

  // Create lightbox modal if it doesn't exist
  if (!document.querySelector('[data-lightbox]')) {
    createLightboxModal();
  }

  // Close lightbox on background click
  const lightbox = document.querySelector('[data-lightbox]');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Close button
    const closeBtn = lightbox.querySelector('[data-lightbox-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    // Next/prev buttons in lightbox
    const lightboxPrev = lightbox.querySelector('[data-lightbox-prev]');
    const lightboxNext = lightbox.querySelector('[data-lightbox-next]');
    
    if (lightboxPrev) lightboxPrev.addEventListener('click', previousPhoto);
    if (lightboxNext) lightboxNext.addEventListener('click', nextPhoto);

    // Keyboard navigation in lightbox
    document.addEventListener('keydown', (e) => {
      if (lightbox.style.display !== 'none') {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') previousPhoto();
        if (e.key === 'ArrowRight') nextPhoto();
      }
    });
  }
}

/**
 * Create lightbox modal element
 */
function createLightboxModal() {
  const lightbox = document.createElement('div');
  lightbox.setAttribute('data-lightbox', '');
  lightbox.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    justify-content: center;
    align-items: center;
  `;

  lightbox.innerHTML = `
    <button data-lightbox-close style="position: absolute; top: 20px; right: 20px; background: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; font-size: 18px;">✕</button>
    <button data-lightbox-prev style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); background: white; border: none; padding: 15px; cursor: pointer; border-radius: 4px; font-size: 20px;">❮</button>
    <img data-lightbox-image style="max-width: 90%; max-height: 90%; object-fit: contain;" />
    <button data-lightbox-next style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); background: white; border: none; padding: 15px; cursor: pointer; border-radius: 4px; font-size: 20px;">❯</button>
  `;

  document.body.appendChild(lightbox);
}

/**
 * Open lightbox
 */
function openLightbox(index) {
  goToPhoto(index);
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = lightbox.querySelector('[data-lightbox-image]');

  if (galleryState.photos[index]) {
    lightboxImage.src = galleryState.photos[index].src;
    lightboxImage.alt = galleryState.photos[index].alt || `Photo ${index + 1}`;
  }

  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Close lightbox
 */
function closeLightbox() {
  const lightbox = document.querySelector('[data-lightbox]');
  lightbox.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/**
 * Add smooth transitions
 */
function addGalleryTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    [data-gallery-main] {
      transition: opacity ${galleryConfig.transitionDuration}ms ease-in-out;
    }

    [data-gallery-thumbnail].active {
      border: 3px solid #ff6b9d;
      transform: scale(1.05);
    }

    [data-gallery-progress] {
      transition: width 300ms ease-in-out;
    }

    [data-gallery] img {
      transition: transform 200ms ease-in-out;
    }

    [data-gallery] img:hover {
      transform: scale(1.02);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addGalleryTransitions();
    initGallery();
  });
} else {
  addGalleryTransitions();
  initGallery();
}

// Export functions for external use
window.gallery = {
  next: nextPhoto,
  prev: previousPhoto,
  goTo: goToPhoto,
  play: startAutoplay,
  pause: stopAutoplay,
  getCurrentIndex: () => galleryState.currentIndex,
  getPhotoCount: () => galleryState.photos.length,
  isPlaying: () => galleryState.isPlaying
};
