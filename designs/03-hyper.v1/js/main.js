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

  // ── 7. QuickView Modal (Shop Our Offers) ───────────────────────
  const qv = document.getElementById('quickview');
  if (qv) {
    const body = document.body;
    const qvMainImg   = document.getElementById('qv-main-img');
    const qvThumbs    = document.getElementById('qv-thumbs');
    const qvName      = document.getElementById('qv-name');
    const qvVendor    = document.getElementById('qv-vendor');
    const qvType      = document.getElementById('qv-type');
    const qvPrice     = document.getElementById('qv-price');
    const qvOriginal  = document.getElementById('qv-original');
    const qvDesc      = document.getElementById('qv-desc');
    const qvStockTxt  = document.getElementById('qv-stock-text');
    const qvStockBar  = document.getElementById('qv-stock-bar');
    const qvColorName = document.getElementById('qv-color-name');
    const qvColors    = document.getElementById('qv-colors');
    const qvSizeName  = document.getElementById('qv-size-name');
    const qvSizes     = document.getElementById('qv-sizes');
    const qvQty       = document.getElementById('qv-qty');

    const openQuickView = (card) => {
      const d = card.dataset;
      const images = [d.image, d.imageAlt].filter(Boolean);
      qvName.textContent = d.name || '';
      qvVendor.textContent = d.vendor || '';
      qvType.textContent = d.category || '';
      qvPrice.textContent = '$' + (d.price || '');
      if (d.original) {
        qvOriginal.textContent = '$' + d.original;
        qvOriginal.style.display = '';
      } else {
        qvOriginal.style.display = 'none';
      }
      qvDesc.textContent = d.desc || '';

      const stock = parseInt(d.stock || '40', 10);
      qvStockTxt.innerHTML = 'Hurry up, only <strong>' + stock + '</strong> items left in stock!';
      qvStockBar.style.width = Math.max(10, Math.min(95, Math.round(stock / 1.5))) + '%';

      qvMainImg.src = images[0] || '';
      qvMainImg.alt = d.name || '';
      qvThumbs.innerHTML = '';
      images.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quickview__thumb' + (i === 0 ? ' active' : '');
        btn.innerHTML = '<img src="' + src + '" alt="">';
        btn.addEventListener('click', () => {
          qvThumbs.querySelectorAll('.quickview__thumb').forEach(t => t.classList.remove('active'));
          btn.classList.add('active');
          qvMainImg.src = src;
        });
        qvThumbs.appendChild(btn);
      });

      let colors = [];
      try { colors = JSON.parse(d.colors || '[]'); } catch (_) {}
      qvColors.innerHTML = '';
      qvColorName.textContent = colors[0] ? colors[0].name : '';
      colors.forEach((c, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quickview__color-swatch' + (i === 0 ? ' active' : '');
        btn.style.background = c.hex;
        btn.setAttribute('aria-label', c.name);
        btn.addEventListener('click', () => {
          qvColors.querySelectorAll('.quickview__color-swatch').forEach(s => s.classList.remove('active'));
          btn.classList.add('active');
          qvColorName.textContent = c.name;
        });
        qvColors.appendChild(btn);
      });

      let sizes = [];
      try { sizes = JSON.parse(d.sizes || '[]'); } catch (_) {}
      qvSizes.innerHTML = '';
      const defaultSize = sizes.includes('M') ? 'M' : sizes[0];
      qvSizeName.textContent = defaultSize || '';
      sizes.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quickview__size-btn' + (s === defaultSize ? ' active' : '');
        btn.textContent = s;
        btn.addEventListener('click', () => {
          qvSizes.querySelectorAll('.quickview__size-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          qvSizeName.textContent = s;
        });
        qvSizes.appendChild(btn);
      });

      qvQty.textContent = '1';

      qv.classList.add('active');
      qv.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';
    };

    const closeQuickView = () => {
      qv.classList.remove('active');
      qv.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
    };

    document.querySelectorAll('.offer-card__choose').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.offer-card');
        if (card) openQuickView(card);
      });
    });

    qv.querySelectorAll('[data-qv-close]').forEach(el => {
      el.addEventListener('click', closeQuickView);
    });

    qv.querySelectorAll('[data-qv-qty]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.qvQty, 10);
        const current = parseInt(qvQty.textContent, 10) || 1;
        qvQty.textContent = Math.max(1, current + delta);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && qv.classList.contains('active')) closeQuickView();
    });
  }

  // ── 8. Design Control Bar ──────────────────────────────────────
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
