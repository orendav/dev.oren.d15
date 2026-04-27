document.addEventListener('DOMContentLoaded', () => {

  // ── 0a. Banner rotator (New Arrivals) ───────────────────────────
  const rotator = document.getElementById('banner-rotator');
  if (rotator) {
    const slides = rotator.querySelectorAll('.banner-card__slide');
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }, 4500);
  }

  // ── 0. PO bar dismiss ───────────────────────────────────────────
  const poBar = document.getElementById('po-bar');
  const poClose = document.getElementById('po-bar-close');
  if (poBar && poClose) {
    if (sessionStorage.getItem('wbt-po-dismissed') === '1') {
      poBar.classList.add('is-hidden');
    }
    poClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      poBar.classList.add('is-hidden');
      sessionStorage.setItem('wbt-po-dismissed', '1');
    });
  }

  // ── 1. Sidebar Navigation ───────────────────────────────────────
  const sidebarToggle  = document.getElementById('sidebar-toggle');
  const sidebarClose   = document.getElementById('sidebar-close');
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  let sidebarLastFocus = null;

  const openSidebar = () => {
    if (!sidebar || !sidebarOverlay) return;
    sidebarLastFocus = document.activeElement;
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    sidebar.setAttribute('aria-hidden', 'false');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (sidebarClose) sidebarClose.focus();
  };

  const closeSidebar = () => {
    if (!sidebar || !sidebarOverlay) return;
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    sidebar.setAttribute('aria-hidden', 'true');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (sidebarLastFocus && typeof sidebarLastFocus.focus === 'function') sidebarLastFocus.focus();
  };

  if (sidebarToggle) sidebarToggle.addEventListener('click', openSidebar);
  if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  // Mobile mega-menu tabs keep the dense desktop mega-menu navigable in a drawer.
  document.querySelectorAll('.mobile-mega').forEach(menu => {
    const tabs = menu.querySelectorAll('.mobile-mega__tab');
    const panels = menu.querySelectorAll('.mobile-mega__panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.mobilePanel;

        tabs.forEach(item => {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        panels.forEach(panel => {
          const active = panel.dataset.mobilePanel === target;
          panel.classList.toggle('active', active);
          panel.hidden = !active;
        });
      });
    });
  });

  // GST toggle (header + sidebar instances stay in sync)
  document.querySelectorAll('.gst-toggle').forEach(group => {
    group.querySelectorAll('.gst-toggle__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.gst;
        document.querySelectorAll('.gst-toggle').forEach(g => {
          g.querySelectorAll('.gst-toggle__btn').forEach(b => {
            b.classList.toggle('active', b.dataset.gst === mode);
          });
        });
        document.documentElement.setAttribute('data-gst', mode);
      });
    });
  });

  // ── 2. Search Category Dropdown ─────────────────────────────────
  const catToggle   = document.getElementById('search-category-toggle');
  const catDropdown = document.getElementById('category-dropdown');
  const catLabel    = document.getElementById('search-category-label');

  if (catToggle && catDropdown) {
    catToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      catDropdown.classList.toggle('active');
      catToggle.setAttribute('aria-expanded', catDropdown.classList.contains('active') ? 'true' : 'false');
    });

    catToggle.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      e.stopPropagation();
      catDropdown.classList.toggle('active');
      catToggle.setAttribute('aria-expanded', catDropdown.classList.contains('active') ? 'true' : 'false');
    });

    catDropdown.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        catDropdown.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        catLabel.textContent = link.dataset.cat;
        catDropdown.classList.remove('active');
        catToggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', () => {
      catDropdown.classList.remove('active');
      catToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // ── 2b. Mega Menu Tab Switching (Shop By Category) ──────────────
  document.querySelectorAll('.mega-menu--tabs').forEach(menu => {
    const links  = menu.querySelectorAll('.mega-menu__sidebar-link');
    const panels = menu.querySelectorAll('.mega-menu__panel');
    if (!links.length || !panels.length) return;

    const activate = (cat) => {
      links.forEach(l => l.classList.toggle('active', l.dataset.cat === cat));
      panels.forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
    };

    links.forEach(link => {
      link.addEventListener('mouseenter', () => activate(link.dataset.cat));
      link.addEventListener('focus', () => activate(link.dataset.cat));
    });
  });

  // ── 2c. Mega Menu Open/Close + Backdrop ─────────────────────────
  const subnav = document.querySelector('.subnav');
  if (subnav) {
    subnav.classList.add('js-enabled');

    const backdrop = document.createElement('div');
    backdrop.className = 'mega-menu-backdrop';
    document.body.appendChild(backdrop);

    let activeItem = null;
    let closeTimer = null;

    const openItem = (item) => {
      clearTimeout(closeTimer);
      if (activeItem === item) return;
      if (activeItem) {
        activeItem.classList.remove('is-open');
        activeItem.querySelector('.subnav__link')?.setAttribute('aria-expanded', 'false');
      }
      activeItem = item;
      item.classList.add('is-open');
      item.querySelector('.subnav__link')?.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('active');
    };

    const closeMenu = () => {
      clearTimeout(closeTimer);
      if (!activeItem) return;
      activeItem.classList.remove('is-open');
      activeItem.querySelector('.subnav__link')?.setAttribute('aria-expanded', 'false');
      activeItem = null;
      backdrop.classList.remove('active');
    };

    const scheduleClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closeMenu, 120);
    };

    subnav.querySelectorAll('.subnav__item').forEach(item => {
      if (!item.querySelector('.mega-menu')) return;
      const trigger = item.querySelector('.subnav__link');
      if (trigger) {
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.addEventListener('focus', () => openItem(item));
        trigger.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          activeItem === item ? closeMenu() : openItem(item);
        });
      }
      item.addEventListener('mouseenter', () => openItem(item));
      item.addEventListener('mouseleave', scheduleClose);
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) scheduleClose();
      });
    });

    backdrop.addEventListener('mouseenter', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
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
    let qvLastFocus = null;

    const openQuickView = (card) => {
      qvLastFocus = document.activeElement;
      const d = card.dataset;
      const readName  = () => card.querySelector('.product-card__name, .offer-card__name')?.textContent.trim() || '';
      const readImg   = () => (card.querySelector('.product-card__image-wrap img, .offer-card__image img') || card.querySelector('img'))?.src || '';
      const readPriceEl = () => card.querySelector('.product-card__price--sale, .offer-card__price--sale, .product-card__price, .offer-card__price');
      const readPrice = () => {
        const el = readPriceEl();
        if (!el) return '';
        const m = el.textContent.match(/(\d+(?:\.\d+)?)/);
        return m ? m[1] : '';
      };
      const readOriginal = () => {
        const el = card.querySelector('.product-card__price--original, .offer-card__price--original');
        if (!el) return '';
        const m = el.textContent.match(/(\d+(?:\.\d+)?)/);
        return m ? m[1] : '';
      };

      const images = [d.image || readImg(), d.imageAlt].filter(Boolean);
      qvName.textContent    = d.name     || readName();
      qvVendor.textContent  = d.vendor   || 'WBT';
      qvType.textContent    = d.category || '';
      qvPrice.textContent   = '$' + (d.price || readPrice());
      const originalVal = d.original || readOriginal();
      if (originalVal) {
        qvOriginal.textContent = '$' + originalVal;
        qvOriginal.style.display = '';
      } else {
        qvOriginal.style.display = 'none';
      }
      qvDesc.textContent = d.desc || 'Premium wholesale activewear — bulk-ready, print-ready, delivered fast across Australia.';

      const stock = parseInt(d.stock || '42', 10);
      qvStockTxt.innerHTML = 'Hurry up, only <strong>' + stock + '</strong> items left in stock!';
      qvStockBar.style.width = Math.max(10, Math.min(95, Math.round(stock / 1.5))) + '%';

      qvMainImg.src = images[0] || '';
      qvMainImg.alt = d.name || '';
      qvThumbs.innerHTML = '';
      images.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quickview__thumb' + (i === 0 ? ' active' : '');
        btn.setAttribute('aria-label', 'View image ' + (i + 1));
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
      if (!colors.length) {
        colors = Array.from(card.querySelectorAll('.product-card__color-dot')).map((dot, i) => ({
          name: dot.getAttribute('aria-label') || dot.getAttribute('title') || ('Colour ' + (i + 1)),
          hex:  dot.style.background || '#1a1a1a'
        }));
      }
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
      if (!sizes.length) sizes = ['XS','S','M','L','XL','2XL','3XL'];
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
      qv.querySelector('[data-qv-close]')?.focus();
    };

    const closeQuickView = () => {
      qv.classList.remove('active');
      qv.setAttribute('aria-hidden', 'true');
      body.style.overflow = '';
      if (qvLastFocus && typeof qvLastFocus.focus === 'function') qvLastFocus.focus();
    };

    // Inline clearance card form: colour + size selects, qty -/+, ATC,
    // "Show Product Details" (which opens the quickview).
    document.querySelectorAll('.offer-card').forEach(card => {
      let colors = [];
      let sizes = [];
      try { colors = JSON.parse(card.dataset.colors || '[]'); } catch (e) {}
      try { sizes = JSON.parse(card.dataset.sizes || '[]'); } catch (e) {}

      const colorOpts = colors.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
      const sizeOpts = sizes.map(s => `<option value="${s}">${s}</option>`).join('');

      const form = document.createElement('div');
      form.className = 'offer-card__form';
      form.innerHTML = `
        <div class="offer-card__form-row">
          <select class="offer-card__select" data-role="color" aria-label="Colour">${colorOpts}</select>
          <select class="offer-card__select" data-role="size" aria-label="Size">${sizeOpts}</select>
        </div>
        <div class="offer-card__form-row">
          <div class="offer-card__qty">
            <button type="button" data-qty="-1" aria-label="Decrease quantity">&minus;</button>
            <input type="number" min="1" value="1" aria-label="Quantity">
            <button type="button" data-qty="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="offer-card__atc" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l3 12h11l2-8H6"/></svg>
            Add to Cart
          </button>
        </div>
        <button class="offer-card__details" type="button">Show Product Details &rsaquo;</button>
      `;
      card.appendChild(form);

      // qty -/+ buttons
      const qtyInput = form.querySelector('.offer-card__qty input');
      form.querySelectorAll('.offer-card__qty button').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          const delta = parseInt(btn.dataset.qty, 10);
          const next = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + delta);
          qtyInput.value = next;
        });
      });

      // ATC — no-op for prototype, just acknowledge visually
      form.querySelector('.offer-card__atc').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const btn = form.querySelector('.offer-card__atc');
        const original = btn.innerHTML;
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Added';
        btn.classList.add('is-added');
        setTimeout(() => { btn.innerHTML = original; btn.classList.remove('is-added'); }, 1500);
      });

      // Details button — open existing quickview
      form.querySelector('.offer-card__details').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        openQuickView(card);
      });

      // Stop clicks on the form from bubbling up to the card-level link/handlers
      form.addEventListener('click', e => e.stopPropagation());
    });

    document.querySelectorAll('.product-card__choose-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.product-card');
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
      if (!qv.classList.contains('active')) return;
      if (e.key === 'Escape') closeQuickView();
      if (e.key !== 'Tab') return;
      const focusable = Array.from(qv.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ── 7b. Product card colour swatch → hover swaps main image ─────
  document.querySelectorAll('.product-card').forEach(card => {
    const mainImg = card.querySelector('.product-card__image-wrap img');
    if (!mainImg) return;
    const originalSrc = mainImg.getAttribute('src');

    card.querySelectorAll('.product-card__color-dot[data-image]').forEach(dot => {
      dot.addEventListener('mouseenter', () => {
        mainImg.src = dot.dataset.image;
      });
      dot.addEventListener('mouseleave', () => {
        mainImg.src = originalSrc;
      });
    });
  });

  // Easy Bulk Order rows: colour dropdown swaps the row thumbnail. Each row
  // has data-color-images='{"Colour":"path",...}'. Falls back silently if no
  // mapping for the selected colour.
  document.querySelectorAll('.bulk-row[data-color-images]').forEach(row => {
    const thumb = row.querySelector('.bulk-row__product img');
    const select = row.querySelector('.bulk-row__colour select');
    if (!thumb || !select) return;
    let map = {};
    try { map = JSON.parse(row.dataset.colorImages || '{}'); } catch (e) { return; }
    Object.values(map).forEach(src => { const p = new Image(); p.src = src; });
    select.addEventListener('change', () => {
      const src = map[select.value];
      if (src) thumb.setAttribute('src', src);
    });
  });

  // Bundle/pack card hover rotation. Cards with data-hover-images="a,b,c"
  // swap their composite image for one of the listed product photos based
  // on mouse-X position over the image-wrap. We oversample by HOVER_ZONES so
  // small mouse movements still trigger swaps (cycles/wraps through the list
  // multiple times across the card width). mouseleave restores composite.
  const HOVER_ZONES = 6;  // ~50px per zone on a 300px-wide card
  document.querySelectorAll('[data-hover-images]').forEach(card => {
    const wrap = card.querySelector('.bundle-card__image-wrap, .pack-card__image-wrap');
    const img = wrap && wrap.querySelector('img.card-img');
    if (!wrap || !img) return;

    // v5: separator is `|` (was `,` in v4). Switched because imgix URLs contain
    // `auto=format,compress` so a comma split fragments the URL list.
    const hoverList = card.dataset.hoverImages.split('|').map(s => s.trim()).filter(Boolean);
    if (!hoverList.length) return;

    const original = img.getAttribute('src');
    let currentIdx = -1;

    hoverList.forEach(src => { const p = new Image(); p.src = src; });

    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const zone = Math.min(HOVER_ZONES - 1, Math.floor(x * HOVER_ZONES));
      const idx = zone % hoverList.length;
      if (idx !== currentIdx) {
        currentIdx = idx;
        img.setAttribute('src', hoverList[idx]);
        wrap.classList.add('is-hover');
      }
    });

    wrap.addEventListener('mouseleave', () => {
      if (currentIdx !== -1) {
        currentIdx = -1;
        img.setAttribute('src', original);
        wrap.classList.remove('is-hover');
      }
    });
  });

});
