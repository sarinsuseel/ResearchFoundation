// ASRF Research Platform - Client Scripts
function toggleMobileNav() {
  const menu = document.getElementById('mobileNavMenu');
  const btn = document.getElementById('mobileToggle');
  if (!menu || !btn) return;
  if (menu.classList.contains('open')) {
    menu.classList.remove('open');
    btn.innerHTML = '<span class="hamburger-icon">☰</span>';
  } else {
    menu.classList.add('open');
    btn.innerHTML = '<span class="hamburger-icon">✕</span>';
  }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mobileNavMenu');
  const btn = document.getElementById('mobileToggle');
  if (menu && menu.classList.contains('open')) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
      if (btn) btn.innerHTML = '<span class="hamburger-icon">☰</span>';
    }
  }
});
