// ASRF Research Platform - Client Scripts
function toggleMobileNav(e) {
  if (!e && window.event) e = window.event;
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const menu = document.getElementById('mobileNavMenu');
  const btn = document.getElementById('mobileToggle');
  if (!menu || !btn) return;

  const isOpen = menu.classList.toggle('open');
  const icon = btn.querySelector('.hamburger-icon');
  if (icon) {
    icon.textContent = isOpen ? '✕' : '☰';
  } else {
    btn.textContent = isOpen ? '✕' : '☰';
  }
}

// Close mobile menu when clicking outside (safe from DOM detachment)
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileNavMenu');
  const btn = document.getElementById('mobileToggle');
  if (!menu || !menu.classList.contains('open')) return;

  // Ignore clicks on toggle button or inside drawer
  if (e.target.closest && (e.target.closest('#mobileToggle') || e.target.closest('#mobileNavMenu'))) {
    return;
  }

  menu.classList.remove('open');
  if (btn) {
    const icon = btn.querySelector('.hamburger-icon');
    if (icon) {
      icon.textContent = '☰';
    } else {
      btn.textContent = '☰';
    }
  }
});

/* ── Hero Carousel Slider ── */
let currentSlide = 0;
let slideInterval = null;

function initHeroSlider() {
  const track = document.getElementById('heroSliderTrack');
  const slides = document.querySelectorAll('.slider-slide');
  const dotsContainer = document.getElementById('heroSliderDots');
  if (!track || slides.length === 0) return;

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (idx === 0 ? ' active' : '');
      dot.onclick = () => goToSlide(idx);
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(n) {
    currentSlide = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSlide);
    });
  }

  window.prevSlide = function() {
    goToSlide(currentSlide - 1);
    resetAutoSlide();
  };

  window.nextSlide = function() {
    goToSlide(currentSlide + 1);
    resetAutoSlide();
  };

  function startAutoSlide() {
    slideInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
  }

  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  const container = document.querySelector('.slider-container');
  if (container) {
    container.addEventListener('mouseenter', () => clearInterval(slideInterval));
    container.addEventListener('mouseleave', () => startAutoSlide());

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) {
          window.nextSlide();
        } else {
          window.prevSlide();
        }
      }
    }
  }

  startAutoSlide();
}

/* ── Journal 2nd Menu Bar / Secondary Sub-Nav Tabs ── */
function switchJournalTab(tabId) {
  // Update subnav buttons
  const buttons = document.querySelectorAll('.subnav-tab-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update panels
  const panels = document.querySelectorAll('.journal-tab-panel');
  panels.forEach(panel => {
    if (panel.id === 'tab-' + tabId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Update hash
  if (history.replaceState) {
    history.replaceState(null, null, '#' + tabId);
  }
}

// On load for Journal tab hash
window.addEventListener('DOMContentLoaded', function() {
  initHeroSlider();

  if (window.location.pathname.includes('/journal')) {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      switchJournalTab(hash);
    }
  }
});

/* ── Gallery Filter ── */
function filterGallery(category, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const items = document.querySelectorAll('.gallery-card');
  items.forEach(item => {
    const cat = item.getAttribute('data-category');
    if (category === 'all' || cat === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

/* ── Contact Form (Mock / Dummy submit) ── */
function handleContactSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById('contactNotice');
  if (alertBox) {
    alertBox.style.display = 'block';
    alertBox.className = 'alert alert-success';
    alertBox.innerHTML = '<strong>Thank you!</strong> Your message has been received. Our editorial and foundation team will respond to your registered email shortly.';
  }
  e.target.reset();
}

/* ── Copy to Clipboard Helper ── */
function copyToClipboard(text, btn) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.borderColor = '#16a34a';
      btn.style.color = '#16a34a';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
    });
  } else {
    prompt('Copy email address:', text);
  }
}

