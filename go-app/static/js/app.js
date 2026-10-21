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

/* ==========================================================================
   Bilingual System: English & Malayalam (മലയാളം)
   ========================================================================== */
const I18N_DATA = {
  ml: {
    // Navigation & Buttons
    "Home": "ഹോം",
    "About": "ഞങ്ങളെക്കുറിച്ച്",
    "Journal": "ജേണൽ",
    "Event": "ഇവന്റുകൾ",
    "Events": "ഇവന്റുകൾ",
    "Events & Conferences": "ഇവന്റുകളും കോൺഫറൻസുകളും",
    "Blog": "ബ്ലോഗ്",
    "Blog & Insights": "ബ്ലോഗും വിവരങ്ങളും",
    "Gallery": "ഗ്യാലറി",
    "Contact Us": "ബന്ധപ്പെടുക",
    "Submit Manuscript →": "മാനുസ്ക്രിപ്റ്റ് സമർപ്പിക്കുക →",
    "Explore Journal →": "ജേണൽ കാണുക →",
    "Journal & Issues": "ജേണലും ലക്കങ്ങളും",

    // Brand & Headings
    "Analize Statistice Research Foundation": "അനലൈസ് സ്റ്റാറ്റിസ്റ്റിക്സ് റിസർച്ച് ഫൗണ്ടേഷൻ",
    "Academic Research & Scholarly Publication Platform": "അക്കാദമിക് ഗവേഷണവും പണ്ഡിതോചിതവുമായ പ്രസിദ്ധീകരണ പ്ലാറ്റ്‌ഫോം",
    "Latest Updates": "ഏറ്റവും പുതിയ വിവരങ്ങൾ",

    // Key Features Bar
    "Peer-Reviewed": "പിയർ-റിവ്യൂഡ്",
    "Double-blind rigorous evaluation": "ഡബിൾ-ബ്ലൈൻഡ് കൃത്യമായ മൂല്യനിർണ്ണയം",
    "Bi-Monthly Frequency": "ദ്വിമാസ പ്രസിദ്ധീകരണം",
    "6 issues published per year": "വർഷത്തിൽ 6 ലക്കങ്ങൾ പ്രസിദ്ധീകരിക്കുന്നു",
    "Open Access": "ഓപ്പൺ ആക്സസ്",
    "Freely accessible worldwide": "ലോകമെമ്പാടും സൗജന്യമായി ലഭ്യമാണ്",
    "Fast Track Review": "ഫാസ്റ്റ് ട്രാക്ക് റിവ്യൂ",
    "Initial decision within 3 weeks": "3 ആഴ്ചയ്ക്കുള്ളിൽ പ്രാഥമിക തീരുമാനം",

    // Section Titles
    "Current Issue & Highlights": "നിലവിലെ ലക്കവും വിശേഷങ്ങളും",
    "Our Mission & Objectives": "ഞങ്ങളുടെ ലക്ഷ്യങ്ങളും ദൗത്യവും",
    "Upcoming Academic Events": "വരാനിരിക്കുന്ന അക്കാദമിക് ഇവന്റുകൾ",
    "Recent Research Articles": "ഏറ്റവും പുതിയ ഗവേഷണ ലേഖനങ്ങൾ",
    "Latest From Our Blog": "ഞങ്ങളുടെ ബ്ലോഗ് ലേഖനങ്ങൾ",
    "Foundation Image Gallery": "ഫൗണ്ടേഷൻ ഇമേജ് ഗ്യാലറി",
    "Get in Touch with Our Team": "ഞങ്ങളുടെ ടീമുമായി ബന്ധപ്പെടുക",
    "Contact & Secretariat": "ഓഫീസും ബന്ധപ്പെടാനുള്ള വിവരങ്ങളും",

    // Direct Email Submission
    "Direct Manuscript Submission via Email": "നേരിട്ടുള്ള ഇമെയിൽ വഴി മാനുസ്ക്രിപ്റ്റ് സമർപ്പിക്കുക",
    "Submit your research paper directly to our Chief Editor / Foundation Owner for peer-review and scholarly publication.": "നിങ്ങളുടെ ഗവേഷണ പ്രബന്ധം പിയർ-റിവ്യൂവിനും പ്രസിദ്ധീകരണത്തിനുമായി ചീഫ് എഡിറ്റർ / ഫൗണ്ടേഷൻ ഡയറക്ടർക്ക് നേരിട്ട് ഇമെയിൽ ചെയ്യാം.",
    "Primary Submission Email:": "പ്രാഥമിക സമർപ്പണ ഇമെയിൽ:",
    "How Peer-Review & Email Acceptance Works": "പിയർ റിവ്യൂവും ഇമെയിൽ അംഗീകാരവും എങ്ങനെ പ്രവർത്തിക്കുന്നു",

    // Footer
    "Quick Links": "ദ്രുത ലിങ്കുകൾ",
    "Journal & Research": "ജേണലും ഗവേഷണവും",
    "Contact & Advisory": "ഓഫീസും ബന്ധപ്പെടാനുള്ള വിവരങ്ങളും",
    "Office:": "ഓഫീസ്:",
    "Email:": "ഇമെയിൽ:",
    "Hours:": "ഓഫീസ് സമയം:",
    "Mon – Fri: 10:00 AM – 5:30 PM (IST)": "തിങ്കൾ – വെള്ളി: രാവിലെ 10:00 മുതൽ വൈകിട്ട് 5:30 വരെ (IST)",
    "© 2026 Analize Statistice Research Foundation (ASRF). All rights reserved.": "© 2026 അനലൈസ് സ്റ്റാറ്റിസ്റ്റിക്സ് റിസർച്ച് ഫൗണ്ടേഷൻ (ASRF). സർവ്വ അവകാശങ്ങളും നിക്ഷിപ്തം.",
    "Open Access • Peer-Reviewed • Non-Profit Academic Platform": "ഓപ്പൺ ആക്സസ് • പിയർ-റിവ്യൂഡ് • നോൺ-പ്രോഫിറ്റ് അക്കാദമിക് പ്ലാറ്റ്‌ഫോം",

    // Contact Form
    "Send Us a Message": "ഞങ്ങൾക്ക് സന്ദേശം അയക്കുക",
    "Full Name *": "പൂർണ്ണമായ പേര് *",
    "Email Address *": "ഇമെയിൽ വിലാസം *",
    "Institution / University": "സ്ഥാപനം / സർവകലാശാല",
    "Subject *": "വിഷയം *",
    "Message *": "സന്ദേശം *"
  }
};

const TAB_MAP_ML = {
  'email-submission': '📤 ഇമെയിൽ വഴി സമർപ്പിക്കുക',
  'aim-scope': '🎯 ലക്ഷ്യവും വ്യാപ്തിയും',
  'editorial-board': '👥 എഡിറ്റോറിയൽ ബോർഡ്',
  'current-issue': '📖 നിലവിലെ ലക്കം',
  'archives': '📚 മുൻ ലക്കങ്ങൾ / ആർക്കൈവുകൾ',
  'guidelines': '📝 രചയിതാക്കൾക്കുള്ള മാർഗ്ഗനിർദ്ദേശങ്ങൾ',
  'peer-review': '🔍 പിയർ റിവ്യൂ നയം',
  'ethics': '⚖️ പ്രസിദ്ധീകരണ എത്തിക്സ്',
  'indexing': '🌐 ഇൻഡക്സിംഗ് & ഡാറ്റാബേസുകൾ',
  'downloads': '📥 ഡൗൺലോഡുകൾ & ഫോമുകൾ'
};

const TAB_MAP_EN = {
  'email-submission': '📤 Submit via Email',
  'aim-scope': '🎯 Aim & Scope',
  'editorial-board': '👥 Editorial Board',
  'current-issue': '📖 Current Issue',
  'archives': '📚 Archives & Past Issues',
  'guidelines': '📝 Author Guidelines',
  'peer-review': '🔍 Peer Review Policy',
  'ethics': '⚖️ Publication Ethics',
  'indexing': '🌐 Indexing & Databases',
  'downloads': '📥 Downloads & Forms'
};

const HERO_SLIDES_ML = [
  {
    title: 'പണ്ഡിതോചിതമായ ഗവേഷണങ്ങളും നൂതനാശയങ്ങളും',
    desc: 'സ്റ്റാറ്റിസ്റ്റിക്കൽ രീതിശാസ്ത്രങ്ങളും ഇന്റർ ഡിസിപ്ലിനറി ശാസ്ത്ര മികവും പ്രോത്സാഹിപ്പിക്കുന്ന അന്താരാഷ്ട്ര പിയർ-റിവ്യൂഡ് പ്ലാറ്റ്‌ഫോം.',
    cta1: 'ജേണൽ കാണുക →',
    cta2: 'മാനുസ്ക്രിപ്റ്റ് സമർപ്പിക്കുക'
  },
  {
    title: 'ഗ്ലോബൽ ഇൻഡക്സിംഗും ഡബിൾ-ബ്ലൈൻഡ് പിയർ റിവ്യൂവും',
    desc: 'അത്യാധുനിക സ്റ്റാറ്റിസ്റ്റിക്കൽ ഗവേഷണങ്ങളുടെ കൃത്യമായ മൂല്യനിർണ്ണയവും ആഗോള പ്രസിദ്ധീകരണവും.',
    cta1: 'പ്രസിദ്ധീകരണങ്ങൾ കാണുക →',
    cta2: 'മാർഗ്ഗനിർദ്ദേശങ്ങൾ'
  },
  {
    title: 'അക്കാദമിക് കോൺഫറൻസുകളും റിസർച്ച് സെമിനാറുകളും',
    desc: 'വിജ്ഞാനം പങ്കിടുന്നതിനായി ലോകമെമ്പാടുമുള്ള ഗവേഷകരെയും പണ്ഡിതരെയും ബന്ധിപ്പിക്കുന്നു.',
    cta1: 'വരാനിരിക്കുന്ന ഇവന്റുകൾ →',
    cta2: 'പങ്കാളിയാകുക'
  }
];

const HERO_SLIDES_EN = [
  {
    title: 'Pioneering Scholarly Research & Innovations',
    desc: 'Peer-reviewed international platform advancing statistical methodologies and interdisciplinary scientific excellence.',
    cta1: 'Explore Journal →',
    cta2: 'Submit Manuscript'
  },
  {
    title: 'Global Indexing & Double-Blind Peer Review',
    desc: 'Rigorous evaluation and global dissemination of cutting-edge statistical research and multidisciplinary studies.',
    cta1: 'View Publications →',
    cta2: 'Author Guidelines'
  },
  {
    title: 'Academic Conferences & Research Seminars',
    desc: 'Connecting researchers, faculty, and scholars worldwide to exchange transformative knowledge and academic insights.',
    cta1: 'Upcoming Events →',
    cta2: 'Collaborate With Us'
  }
];

const WORKFLOW_STEPS_ML = [
  { step: 'ഘട്ടം 1', title: 'മാനുസ്ക്രിപ്റ്റ് ഇമെയിൽ ചെയ്യുക', desc: 'നിങ്ങളുടെ പൂർണ്ണമായ വേഡ് (.doc/.docx) അല്ലെങ്കിൽ PDF പ്രബന്ധം സംഗ്രഹം, കീവേഡുകൾ എന്നിവ സഹിതം ഞങ്ങളുടെ ഔദ്യോഗിക ഇമെയിലിലേക്ക് അയക്കുക.' },
  { step: 'ഘട്ടം 2', title: 'എഡിറ്റോറിയൽ പരിശോധന', desc: 'എഡിറ്റോറിയൽ ടീം 48 മുതൽ 72 മണിക്കൂറിനുള്ളിൽ പ്ലേജിയറിസം പരിശോധനയും സ്കോപ്പ് പരിശോധനയും നടത്തുന്നു.' },
  { step: 'ഘട്ടം 3', title: 'പിയർ-റിവ്യൂ മൂല്യനിർണ്ണയം', desc: 'വിഷയ വിദഗ്ദ്ധർ പ്രബന്ധത്തിന്റെ രീതിശാസ്ത്രം, കൃത്യത, നിഗമനങ്ങൾ എന്നിവ വിശദമായി വിലയിരുത്തുന്നു.' },
  { step: 'ഘട്ടം 4', title: 'തീരുമാനവും അംഗീകാര പത്രവും', desc: 'അംഗീകാരം ലഭിച്ചുകഴിഞ്ഞാൽ, ഔദ്യോഗിക അക്‌സപ്റ്റൻസ് ലെറ്റർ ഇമെയിൽ വഴി നേരിട്ട് രചയിതാവിന് നൽകുന്നു.' }
];

const WORKFLOW_STEPS_EN = [
  { step: 'Step 1', title: 'Email Manuscript', desc: 'Send your complete Word (.doc/.docx) or PDF manuscript with abstract, keywords, and author details to our official email.' },
  { step: 'Step 2', title: 'Editorial Screening', desc: 'Editorial team performs initial plagiarism check and scope verification within 48 to 72 hours.' },
  { step: 'Step 3', title: 'Peer-Review & Evaluation', desc: 'Subject experts and peer reviewers evaluate paper methodology, mathematical rigor, and research conclusions.' },
  { step: 'Step 4', title: 'Decision & Acceptance Letter', desc: 'Once approved, formal Acceptance Letter with publication schedule is emailed directly back to the corresponding author.' }
];

function applyBilingualDictionary(lang) {
  const dict = I18N_DATA[lang] || {};

  // 1. Navigation items
  document.querySelectorAll('.nav-link, .mobile-nav-link, .nav-btn, .mobile-nav-btn').forEach(link => {
    if (!link.hasAttribute('data-en-text')) {
      link.setAttribute('data-en-text', link.innerText.trim());
    }
    const enText = link.getAttribute('data-en-text');
    if (lang === 'ml') {
      if (dict[enText]) link.innerText = dict[enText];
    } else {
      link.innerText = enText;
    }
  });

  // 2. Headings and static labels
  const selectors = [
    '.nav-title', '.nav-tagline',
    '.feature-title', '.feature-desc',
    '.footer-col-title', '.footer-col a',
    '.contact-header h1', '.contact-header p',
    '.contact-sidebar-card h3', '.contact-sidebar-card p'
  ];
  document.querySelectorAll(selectors.join(',')).forEach(el => {
    if (!el.hasAttribute('data-en-text')) {
      el.setAttribute('data-en-text', el.innerText.trim());
    }
    const enText = el.getAttribute('data-en-text');
    if (lang === 'ml') {
      if (dict[enText]) el.innerText = dict[enText];
    } else {
      el.innerText = enText;
    }
  });

  // 3. Ticker Bar
  const tickerLabel = document.querySelector('.ticker-label');
  if (tickerLabel) {
    if (lang === 'ml') {
      tickerLabel.innerHTML = '<span>📢</span> ഏറ്റവും പുതിയ വിവരങ്ങൾ';
    } else {
      tickerLabel.innerHTML = '<span>📢</span> Latest Updates';
    }
  }

  // 4. Hero Carousel
  const slides = document.querySelectorAll('.slider-slide');
  if (slides.length > 0) {
    slides.forEach((slide, idx) => {
      const data = lang === 'ml' ? HERO_SLIDES_ML[idx] : HERO_SLIDES_EN[idx];
      if (!data) return;
      const title = slide.querySelector('.slider-title');
      const desc = slide.querySelector('.slider-desc');
      const ctas = slide.querySelectorAll('.slider-cta a');
      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.desc;
      if (ctas.length >= 2) {
        ctas[0].textContent = data.cta1;
        ctas[1].textContent = data.cta2;
      }
    });
  }

  // 5. Journal 2nd Menu Bar Tabs
  document.querySelectorAll('.subnav-tab-btn').forEach(btn => {
    const tabId = btn.getAttribute('data-tab');
    if (lang === 'ml' && TAB_MAP_ML[tabId]) {
      btn.textContent = TAB_MAP_ML[tabId];
    } else if (lang === 'en' && TAB_MAP_EN[tabId]) {
      btn.textContent = TAB_MAP_EN[tabId];
    }
  });

  // 6. Direct Email Submission Buttons
  document.querySelectorAll('.btn-gmail').forEach(b => {
    b.textContent = lang === 'ml' ? '✉️ Gmail-ൽ നേരിട്ട് തുറക്കുക' : '✉️ Open Directly in Gmail';
  });
  document.querySelectorAll('.btn-mail').forEach(b => {
    b.textContent = lang === 'ml' ? '📨 ഡിഫോൾട്ട് ഇമെയിൽ ആപ്പ്' : '📨 Default Email App';
  });
  document.querySelectorAll('.btn-copy').forEach(b => {
    b.textContent = lang === 'ml' ? '📋 ഇമെയിൽ പകർത്തുക' : '📋 Copy Email';
  });

  // 7. Workflow Step Cards
  const workflowCards = document.querySelectorAll('.workflow-step-card');
  if (workflowCards.length >= 4) {
    workflowCards.forEach((card, idx) => {
      const s = lang === 'ml' ? WORKFLOW_STEPS_ML[idx] : WORKFLOW_STEPS_EN[idx];
      if (!s) return;
      const num = card.querySelector('.workflow-step-num');
      const title = card.querySelector('.workflow-step-title');
      const desc = card.querySelector('.workflow-step-desc');
      if (num) num.textContent = s.step;
      if (title) title.textContent = s.title;
      if (desc) desc.textContent = s.desc;
    });
  }

  // 8. Contact Form Labels
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.querySelectorAll('label').forEach(lbl => {
      if (!lbl.hasAttribute('data-en-text')) {
        lbl.setAttribute('data-en-text', lbl.innerText.trim());
      }
      const en = lbl.getAttribute('data-en-text');
      if (lang === 'ml' && dict[en]) {
        lbl.innerText = dict[en];
      } else if (lang === 'en') {
        lbl.innerText = en;
      }
    });
    const subBtn = contactForm.querySelector('button[type="submit"]');
    if (subBtn) {
      subBtn.textContent = lang === 'ml' ? 'സന്ദേശം അയക്കുക ✈️' : 'Send Message ✈️';
    }
  }

  // 9. Footer copyright
  const footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom) {
    const ps = footerBottom.querySelectorAll('p');
    if (ps.length >= 2) {
      if (lang === 'ml') {
        ps[0].textContent = '© 2026 അനലൈസ് സ്റ്റാറ്റിസ്റ്റിക്സ് റിസർച്ച് ഫൗണ്ടേഷൻ (ASRF). സർവ്വ അവകാശങ്ങളും നിക്ഷിപ്തം.';
        ps[1].textContent = 'ഓപ്പൺ ആക്സസ് • പിയർ-റിവ്യൂഡ് • നോൺ-പ്രോഫിറ്റ് അക്കാദമിക് പ്ലാറ്റ്‌ഫോം';
      } else {
        ps[0].textContent = '© 2026 Analize Statistice Research Foundation (ASRF). All rights reserved.';
        ps[1].textContent = 'Open Access • Peer-Reviewed • Non-Profit Academic Platform';
      }
    }
  }
}

function syncGoogleTranslate(lang) {
  const cookieVal = lang === 'ml' ? '/en/ml' : '/en/en';
  document.cookie = 'googtrans=' + cookieVal + '; path=/';
  document.cookie = 'googtrans=' + cookieVal + '; path=/; domain=' + window.location.hostname;

  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = lang;
    combo.dispatchEvent(new Event('change'));
  }
}

function setLanguage(lang) {
  if (lang !== 'ml' && lang !== 'en') lang = 'en';
  localStorage.setItem('asrf_site_lang', lang);
  document.documentElement.lang = lang;

  // Update active state on buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply native dictionary
  applyBilingualDictionary(lang);

  // Sync Google Translate
  syncGoogleTranslate(lang);
}

// Inject switchers into navbar and mobile menu if not present
function ensureLanguageSwitchers() {
  // Desktop navbar
  const navLinks = document.querySelector('.nav-links');
  if (navLinks && !navLinks.querySelector('.lang-switcher')) {
    const sw = document.createElement('div');
    sw.className = 'lang-switcher';
    sw.innerHTML = `
      <button type="button" class="lang-btn active" data-lang="en" onclick="setLanguage('en')">EN</button>
      <span class="lang-divider">|</span>
      <button type="button" class="lang-btn" data-lang="ml" onclick="setLanguage('ml')">മലയാളം</button>
    `;
    navLinks.appendChild(sw);
  }

  // Mobile drawer
  const mobileMenu = document.getElementById('mobileNavMenu');
  if (mobileMenu && !mobileMenu.querySelector('.mobile-lang-box')) {
    const box = document.createElement('div');
    box.className = 'mobile-lang-box';
    box.innerHTML = `
      <span class="mobile-lang-label">🌐 ഭാഷ / Language</span>
      <div class="lang-switcher">
        <button type="button" class="lang-btn active" data-lang="en" onclick="setLanguage('en')">English</button>
        <span class="lang-divider">|</span>
        <button type="button" class="lang-btn" data-lang="ml" onclick="setLanguage('ml')">മലയാളം</button>
      </div>
    `;
    mobileMenu.insertBefore(box, mobileMenu.firstChild);
  }
}

// Setup Google Translate engine asynchronously
function setupGoogleTranslate() {
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ml',
      autoDisplay: false
    }, 'google_translate_element');
    
    // Check saved lang after init
    const saved = localStorage.getItem('asrf_site_lang');
    if (saved === 'ml') {
      setTimeout(() => syncGoogleTranslate('ml'), 400);
    }
  };

  if (!document.getElementById('google-translate-script')) {
    const s = document.createElement('script');
    s.id = 'google-translate-script';
    s.type = 'text/javascript';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', function() {
  ensureLanguageSwitchers();
  setupGoogleTranslate();

  const savedLang = localStorage.getItem('asrf_site_lang') || 'en';
  setLanguage(savedLang);
});


