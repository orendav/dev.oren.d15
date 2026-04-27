document.addEventListener('DOMContentLoaded', () => {

  // ── 1. Sidebar Navigation ───────────────────────────────────────
  const sidebarToggle  = document.getElementById('sidebar-toggle');
  const sidebarClose   = document.getElementById('sidebar-close');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  const openSidebar = () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // ── 2. Search Category Dropdown ─────────────────────────────────
  const catToggle   = document.getElementById('search-category-toggle');
  const catDropdown = document.getElementById('category-dropdown');
  const catLabel    = document.getElementById('search-category-label');

  if (catToggle && catDropdown) {
    catToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      catDropdown.classList.toggle('active');
    });

    catDropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        catDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        catLabel.textContent = link.dataset.cat;
        catDropdown.classList.remove('active');
      });
    });

    document.addEventListener('click', () => {
      catDropdown.classList.remove('active');
    });
  }

  // ── 3. Hero Carousel ────────────────────────────────────────────
  const heroSlides = document.querySelectorAll('.hero__slide');
  const heroDots   = document.querySelectorAll('.hero__dot');

  if (heroSlides.length > 0) {
    let currentSlide = 0;
    let autoPlay;

    const goToSlide = (index) => {
      heroSlides.forEach(s => s.classList.remove('active'));
      heroDots.forEach(d => d.classList.remove('active'));
      heroSlides[index].classList.add('active');
      if (heroDots[index]) heroDots[index].classList.add('active');
      currentSlide = index;
    };

    const startAutoPlay = () => {
      autoPlay = setInterval(() => {
        goToSlide((currentSlide + 1) % heroSlides.length);
      }, 5000);
    };

    startAutoPlay();

    heroDots.forEach(dot => {
      dot.addEventListener('click', () => {
        clearInterval(autoPlay);
        goToSlide(parseInt(dot.dataset.slide, 10));
        startAutoPlay();
      });
    });
  }

  // ── 4. Featured Product Thumbnails ──────────────────────────────
  const thumbs   = document.querySelectorAll('.featured-product__thumb');
  const mainImg  = document.getElementById('featured-main-img');

  if (thumbs.length && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mainImg.src = thumb.querySelector('img').src;
      });
    });
  }

  // ── 5. Customizer Tabs ──────────────────────────────────────────
  const customizerTabs = document.querySelectorAll('.customizer__tab');
  const customizerPanels = {
    product:    document.getElementById('panel-product'),
    textart:    document.getElementById('panel-textart'),
    easywizard: document.getElementById('panel-easywizard')
  };

  customizerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      customizerTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      Object.values(customizerPanels).forEach(p => { if (p) p.classList.remove('active'); });
      if (customizerPanels[target]) customizerPanels[target].classList.add('active');
    });
  });

  // ── 6. Quantity Selector ────────────────────────────────────────
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus  = document.getElementById('qty-plus');
  const qtyValue = document.getElementById('qty-value');

  if (qtyMinus && qtyPlus && qtyValue) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent, 10);
      if (val > 1) qtyValue.textContent = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyValue.textContent, 10);
      qtyValue.textContent = val + 1;
    });
  }

  // ── 7. Design Control Bar ──────────────────────────────────────
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
    'system':   "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    'dm-sans':  "'DM Sans', sans-serif",
    'inter':    "'Inter', sans-serif",
    'poppins':  "'Poppins', sans-serif",
    'jakarta':  "'Plus Jakarta Sans', sans-serif",
    'outfit':   "'Outfit', sans-serif",
    'playfair': "'Playfair Display', serif"
  };

  if (fontSelect) {
    const savedFont = localStorage.getItem('wbt-font-03');
    if (savedFont && fontMap[savedFont]) {
      document.documentElement.style.setProperty('--font-primary', fontMap[savedFont]);
      fontSelect.value = savedFont;
    }

    fontSelect.addEventListener('change', () => {
      const key = fontSelect.value;
      if (fontMap[key]) {
        document.documentElement.style.setProperty('--font-primary', fontMap[key]);
        localStorage.setItem('wbt-font-03', key);
      }
    });
  }

  // Theme switcher
  const themeSelect = document.querySelector('#theme-select');

  if (themeSelect) {
    const savedTheme = localStorage.getItem('wbt-theme-03');
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
      localStorage.setItem('wbt-theme-03', val);
    });
  }

});
