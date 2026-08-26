/**
 * SKYTOP TRAVEL & TOURS - CONSOLIDATED HOME PAGE JAVASCRIPT
 * Handles Navigation, Mobile Drawer, Sliders, Carousels, Form Submissions, and Accessibility
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================================
     1. NAVIGATION & MOBILE DRAWER TOGGLE
     ========================================================================= */
  async function loadIncludes() {
    const includes = document.querySelectorAll('[data-include]');
    for (const el of includes) {
      const file = el.getAttribute('data-include');
      if (file) {
        try {
          const resp = await fetch(file);
          if (resp.ok) {
            el.innerHTML = await resp.text();
          }
        } catch (e) {
          console.warn('Could not load include file:', file, e);
        }
      }
    }
    initNavigation();
  }

  function initNavigation() {
    // Event Delegation for Navigation Drawer (Guarantees click handling)
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('#mobileMenuToggle');
      const closeBtn = e.target.closest('#drawerClose');
      const backdrop = e.target.closest('#backdropOverlay');

      const drawer = document.getElementById('mobileNavDrawer');
      const backdropOverlay = document.getElementById('backdropOverlay');

      if (toggleBtn) {
        e.preventDefault();
        if (drawer) drawer.classList.add('open');
        if (backdropOverlay) backdropOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      } else if (closeBtn || backdrop) {
        e.preventDefault();
        if (drawer) drawer.classList.remove('open');
        if (backdropOverlay) backdropOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });

    // Active Navigation Link Highlighting
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-nav-links a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.toLowerCase() || '';
      if ((currentPath.includes('about.html') && href.includes('about.html')) ||
          (currentPath.includes('destinations.html') && href.includes('destinations.html')) ||
          (currentPath.includes('book.html') && href.includes('book.html')) ||
          ((currentPath.endsWith('/') || currentPath.includes('index.html')) && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  loadIncludes();

  /* =========================================================================
     2. SEARCH & NEWSLETTER FORMS
     ========================================================================= */
  const heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const destination = document.getElementById('searchDestination')?.value || 'All';
      const category = document.getElementById('searchCategory')?.value || 'All';
      const duration = document.getElementById('searchDuration')?.value || 'Any';
      alert(`Searching tours for Destination: ${destination}, Category: ${category}, Duration: ${duration}`);
    });
  }

  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      if (emailInput && emailInput.value) {
        alert(`Thank you for subscribing to Skytop Newsletter with ${emailInput.value}!`);
        emailInput.value = '';
      }
    });
  }

  /* =========================================================================
     3. HELPER FUNCTIONS FOR CAROUSELS
     ========================================================================= */
  function getCircularDiff(idx, activeIdx, total) {
    let diff = (idx - activeIdx) % total;
    if (diff < -Math.floor(total / 2)) {
      diff += total;
    } else if (diff > Math.floor(total / 2)) {
      diff -= total;
    }
    return diff;
  }

  /* =========================================================================
     4. HERO SECTION IMAGE SLIDER & CONTENT ANIMATOR
     ========================================================================= */
  function initHeroSlider() {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection) return;

    const slides = Array.from(heroSection.querySelectorAll('.hero-slide'));
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    const dotsContainer = document.getElementById('heroSliderDots');

    if (slides.length === 0) return;

    let activeIndex = 0;
    let timer = null;
    const intervalTime = 5000;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `hero-dot-btn ${idx === activeIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetTimer();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.hero-dot-btn');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
        dot.setAttribute('aria-selected', idx === activeIndex ? 'true' : 'false');
      });
    }

    function goToSlide(targetIdx) {
      activeIndex = (targetIdx + slides.length) % slides.length;

      slides.forEach((slide, idx) => {
        const isActive = idx === activeIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');

        if (isActive) {
          const content = slide.querySelector('.hero-content');
          if (content) {
            content.style.animation = 'none';
            void content.offsetWidth;
            content.style.animation = 'heroContentFadeIn 0.8s ease-out forwards';
          }
        }
      });

      updateDots();
    }

    function nextSlide() {
      goToSlide(activeIndex + 1);
    }

    function prevSlide() {
      goToSlide(activeIndex - 1);
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(nextSlide, intervalTime);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetTimer();
      });
    }

    heroSection.addEventListener('mouseenter', stopTimer);
    heroSection.addEventListener('mouseleave', startTimer);

    heroSection.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        resetTimer();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        resetTimer();
      }
    });

    let touchStartX = 0;
    heroSection.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    heroSection.addEventListener('touchend', (e) => {
      const diffX = touchStartX - e.changedTouches[0].clientX;
      if (diffX > 50) {
        nextSlide();
        resetTimer();
      } else if (diffX < -50) {
        prevSlide();
        resetTimer();
      }
    }, { passive: true });

    goToSlide(0);
    startTimer();
  }

  initHeroSlider();

  /* =========================================================================
     5. TOUR CATEGORIES OWL CAROUSEL
     ========================================================================= */
  const categoriesCarousel = document.getElementById('categoriesCarousel');
  const categoriesDotsContainer = document.getElementById('categoriesDots');
  const categoriesPrevBtn = document.getElementById('categoriesPrev');
  const categoriesNextBtn = document.getElementById('categoriesNext');

  if (categoriesCarousel) {
    const cards = Array.from(categoriesCarousel.querySelectorAll('.owl-item-card'));
    const totalCards = cards.length;
    let activeIndex = 2;

    if (categoriesDotsContainer && totalCards > 0) {
      categoriesDotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `owl-dot-btn ${idx === activeIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => setActiveSlide(idx));
        categoriesDotsContainer.appendChild(dot);
      });
    }

    function updateDots(idx) {
      if (!categoriesDotsContainer) return;
      const dots = categoriesDotsContainer.querySelectorAll('.owl-dot-btn');
      dots.forEach((dot, dIdx) => {
        dot.classList.toggle('active', dIdx === idx);
      });
    }

    function setActiveSlide(idx) {
      activeIndex = (idx + totalCards) % totalCards;
      
      cards.forEach((card, cardIdx) => {
        const diff = getCircularDiff(cardIdx, activeIndex, totalCards);

        if (diff === -2) {
          card.setAttribute('data-arc', 'left-2');
        } else if (diff === -1) {
          card.setAttribute('data-arc', 'left-1');
        } else if (diff === 0) {
          card.setAttribute('data-arc', 'center');
        } else if (diff === 1) {
          card.setAttribute('data-arc', 'right-1');
        } else if (diff === 2) {
          card.setAttribute('data-arc', 'right-2');
        } else if (diff < -2) {
          card.setAttribute('data-arc', 'left-2');
        } else {
          card.setAttribute('data-arc', 'right-2');
        }
      });

      updateDots(activeIndex);
    }

    if (categoriesPrevBtn) {
      categoriesPrevBtn.addEventListener('click', () => {
        setActiveSlide(activeIndex - 1);
      });
    }

    if (categoriesNextBtn) {
      categoriesNextBtn.addEventListener('click', () => {
        setActiveSlide(activeIndex + 1);
      });
    }

    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        setActiveSlide(idx);
      });
    });

    let startX = 0;
    let isDragging = false;

    categoriesCarousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    categoriesCarousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      if (diffX > 40) {
        setActiveSlide(activeIndex + 1);
      } else if (diffX < -40) {
        setActiveSlide(activeIndex - 1);
      }
    }, { passive: true });

    setActiveSlide(activeIndex);
  }

  /* =========================================================================
     6. TOP DESTINATION 3D COVERFLOW OWL CAROUSEL
     ========================================================================= */
  const destinationsCarousel = document.getElementById('destinationsCarousel');
  const destinationTabsContainer = document.getElementById('destinationTabs');

  if (destinationsCarousel) {
    const coverCards = Array.from(destinationsCarousel.querySelectorAll('.coverflow-card'));
    const totalCoverCards = coverCards.length;
    let coverActiveIdx = 0;

    function updateCoverflow(idx) {
      coverActiveIdx = (idx + totalCoverCards) % totalCoverCards;

      coverCards.forEach((card, cIdx) => {
        const diff = getCircularDiff(cIdx, coverActiveIdx, totalCoverCards);

        if (diff === -2) {
          card.setAttribute('data-pos', 'left-2');
        } else if (diff === -1) {
          card.setAttribute('data-pos', 'left-1');
        } else if (diff === 0) {
          card.setAttribute('data-pos', 'center');
        } else if (diff === 1) {
          card.setAttribute('data-pos', 'right-1');
        } else if (diff === 2) {
          card.setAttribute('data-pos', 'right-2');
        } else if (diff < -2) {
          card.setAttribute('data-pos', 'left-2');
        } else {
          card.setAttribute('data-pos', 'right-2');
        }
      });

      if (destinationTabsContainer) {
        const tabs = destinationTabsContainer.querySelectorAll('.tab-btn');
        tabs.forEach((tab, tIdx) => {
          tab.classList.toggle('active', tIdx === coverActiveIdx);
        });
      }
    }

    if (destinationTabsContainer) {
      const tabs = destinationTabsContainer.querySelectorAll('.tab-btn');
      tabs.forEach((tab, tIdx) => {
        tab.addEventListener('click', () => {
          updateCoverflow(tIdx);
        });
      });
    }

    coverCards.forEach((card, cIdx) => {
      card.addEventListener('click', () => {
        updateCoverflow(cIdx);
      });
    });

    let dragStartX = 0;
    let isCoverDragging = false;

    destinationsCarousel.addEventListener('mousedown', (e) => {
      dragStartX = e.clientX;
      isCoverDragging = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isCoverDragging) return;
      isCoverDragging = false;
      const diffX = dragStartX - e.clientX;
      if (diffX > 40) {
        updateCoverflow(coverActiveIdx + 1);
      } else if (diffX < -40) {
        updateCoverflow(coverActiveIdx - 1);
      }
    });

    destinationsCarousel.addEventListener('touchstart', (e) => {
      dragStartX = e.touches[0].clientX;
      isCoverDragging = true;
    }, { passive: true });

    destinationsCarousel.addEventListener('touchend', (e) => {
      if (!isCoverDragging) return;
      isCoverDragging = false;
      const diffX = dragStartX - e.changedTouches[0].clientX;
      if (diffX > 40) {
        updateCoverflow(coverActiveIdx + 1);
      } else if (diffX < -40) {
        updateCoverflow(coverActiveIdx - 1);
      }
    }, { passive: true });

    updateCoverflow(coverActiveIdx);
  }

  /* =========================================================================
     7. POPULAR TOURS MOBILE "SEE MORE" TOGGLE
     ========================================================================= */
  const popularToursSeeMoreBtn = document.getElementById('popularToursSeeMoreBtn');
  const popularToursCarousel = document.getElementById('popularToursCarousel');

  if (popularToursSeeMoreBtn && popularToursCarousel) {
    popularToursSeeMoreBtn.addEventListener('click', () => {
      const isExpanded = popularToursCarousel.classList.toggle('expanded');
      if (isExpanded) {
        popularToursSeeMoreBtn.innerHTML = 'Show Less &uarr;';
      } else {
        popularToursSeeMoreBtn.innerHTML = 'See More &rarr;';
      }
    });
  }

  /* =========================================================================
     8. TOUR GUIDE SELECTION TOGGLE
     ========================================================================= */
  const guideCardBoxes = document.querySelectorAll('.guide-card-box');
  guideCardBoxes.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.social-dot')) return;
      const inner = card.querySelector('.guide-info-inner');
      if (!inner) return;
      const wasActive = inner.classList.contains('active-guide');
      document.querySelectorAll('.guide-info-inner').forEach(el => el.classList.remove('active-guide'));
      if (!wasActive) {
        inner.classList.add('active-guide');
      }
    });
  });

});
