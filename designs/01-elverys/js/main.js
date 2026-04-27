document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Announcement Bar Rotation ──────────────────────────────────
  const announcementText = document.querySelector('.announcement-bar__text');
  const announcementBar  = document.querySelector('.announcement-bar');
  const announcementClose = document.querySelector('.announcement-bar__close');

  if (announcementText) {
    const messages = [
      'FREE SHIPPING on orders over $299 Australia-wide',
      'SAME DAY DISPATCH \u2014 Order before 2pm AEST',
      '15+ YEARS serving Australian businesses'
    ];
    let msgIndex = 0;

    setInterval(() => {
      announcementText.style.opacity = '0';
      setTimeout(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        announcementText.textContent = messages[msgIndex];
        announcementText.style.opacity = '1';
      }, 300);
    }, 4000);
  }

  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.style.display = 'none';
      document.body.classList.remove('has-announcement');
    });
  }

  // ── 2. Search Suggestions ─────────────────────────────────────────
  const searchInput = document.querySelector('.search__input');
  const searchSuggestions = document.querySelector('.search__suggestions');

  if (searchInput && searchSuggestions) {
    const suggestions = [
      'T-Shirts', 'Polo Shirts', 'Hoodies', 'Activewear Jackets',
      'Track Pants', 'Leggings', 'Shorts', 'Printing Services',
      'Embroidery', 'Kids Activewear', 'Quarter-Zip Tops'
    ];

    const buildList = (filtered) => {
      searchSuggestions.innerHTML = filtered
        .map(s => `<a href="#">${s}</a>`)
        .join('');
    };

    searchInput.addEventListener('focus', () => {
      const val = searchInput.value.trim().toLowerCase();
      const filtered = val
        ? suggestions.filter(s => s.toLowerCase().includes(val))
        : suggestions;
      buildList(filtered);
      searchSuggestions.classList.add('active');
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => searchSuggestions.classList.remove('active'), 200);
    });

    searchInput.addEventListener('keyup', () => {
      const val = searchInput.value.trim().toLowerCase();
      const filtered = val
        ? suggestions.filter(s => s.toLowerCase().includes(val))
        : suggestions;
      buildList(filtered);
    });

    searchSuggestions.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        searchInput.value = e.target.textContent;
        searchSuggestions.classList.remove('active');
      }
    });
  }

  // ── 3. Sticky Header ─────────────────────────────────────────────
  const header = document.querySelector('.header');

  if (header && announcementBar) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const abHeight = announcementBar.offsetHeight;
          const hHeight  = header.offsetHeight;

          if (window.scrollY > abHeight + hHeight) {
            header.classList.add('header--sticky');
            document.body.style.paddingTop = hHeight + 'px';
          } else {
            header.classList.remove('header--sticky');
            document.body.style.paddingTop = '';
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ── 4. Hero Banner Carousel ───────────────────────────────────────
  const heroSlides = document.querySelectorAll('.hero > .hero__slide');
  const heroDots   = document.querySelectorAll('.hero > .hero__dots .hero__dot');
  const hero       = document.querySelector('.hero');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let autoPlay;

    const goToSlide = (index) => {
      heroSlides.forEach(s => s.classList.remove('hero__slide--active'));
      heroDots.forEach(d => d.classList.remove('hero__dot--active'));
      heroSlides[index].classList.add('hero__slide--active');
      if (heroDots[index]) heroDots[index].classList.add('hero__dot--active');
      currentSlide = index;
    };

    const startAutoPlay = () => {
      autoPlay = setInterval(() => {
        goToSlide((currentSlide + 1) % heroSlides.length);
      }, 6000);
    };

    startAutoPlay();

    heroDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.slide, 10);
        goToSlide(idx);
      });
    });

    if (hero) {
      hero.addEventListener('mouseenter', () => clearInterval(autoPlay));
      hero.addEventListener('mouseleave', () => startAutoPlay());
    }
  }

  // ── 5. Mobile Nav Toggle ──────────────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const nav       = document.querySelector('.nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('nav--open');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!expanded));
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('nav--open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── 6. Design Control Bar ─────────────────────────────────────────
  const controlToggle = document.querySelector('.control-bar__toggle');
  const controlPanel  = document.querySelector('.control-bar__panel');

  if (controlToggle && controlPanel) {
    controlToggle.addEventListener('click', () => {
      controlPanel.classList.toggle('active');
    });
  }

  // Font switcher
  const fontSelect = document.querySelector('#font-select');
  const fontMap = {
    'system':    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    'inter':     "'Inter', sans-serif",
    'poppins':   "'Poppins', sans-serif",
    'dm-sans':   "'DM Sans', sans-serif",
    'jakarta':   "'Plus Jakarta Sans', sans-serif",
    'outfit':    "'Outfit', sans-serif",
    'playfair':  "'Playfair Display', serif"
  };

  if (fontSelect) {
    // Restore saved font on load
    const savedFont = localStorage.getItem('wbt-font');
    if (savedFont && fontMap[savedFont]) {
      document.documentElement.style.setProperty('--font-primary', fontMap[savedFont]);
      fontSelect.value = savedFont;
    }

    fontSelect.addEventListener('change', () => {
      const key = fontSelect.value;
      if (fontMap[key]) {
        document.documentElement.style.setProperty('--font-primary', fontMap[key]);
        localStorage.setItem('wbt-font', key);
      }
    });
  }

  // Theme switcher
  const themeSelect = document.querySelector('#theme-select');

  if (themeSelect) {
    // Restore saved theme on load
    const savedTheme = localStorage.getItem('wbt-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
      themeSelect.value = savedTheme;
    }

    themeSelect.addEventListener('change', () => {
      const val = themeSelect.value;
      if (val === '') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', val);
      }
      localStorage.setItem('wbt-theme', val);
    });
  }

});
