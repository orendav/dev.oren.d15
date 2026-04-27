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

  // ── 2. Customizer Tabs ──────────────────────────────────────────
  const customizerTabs = document.querySelectorAll('.customizer__tab');
  const customizerPanels = {
    product:     document.getElementById('panel-product'),
    textart:     document.getElementById('panel-textart'),
    easywizard:  document.getElementById('panel-easywizard')
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

  // ── 3. Quantity Selector ────────────────────────────────────────
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

  // ── 4. Product Carousel Tab Filters ─────────────────────────────
  document.querySelectorAll('.product-carousel__tabs').forEach(tabGroup => {
    const tabs = tabGroup.querySelectorAll('.product-carousel__tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });

  // ── 5. Countdown Timer ──────────────────────────────────────────
  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');

  if (cdDays && cdHours && cdMins && cdSecs) {
    // Set end date to 3 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(0, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMins.textContent = '00';
        cdSecs.textContent = '00';
        return;
      }

      const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs  = Math.floor((diff % (1000 * 60)) / 1000);

      cdDays.textContent  = String(days).padStart(2, '0');
      cdHours.textContent = String(hours).padStart(2, '0');
      cdMins.textContent  = String(mins).padStart(2, '0');
      cdSecs.textContent  = String(secs).padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ── 6. Design Control Bar ───────────────────────────────────────
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
    'dm-sans':   "'DM Sans', sans-serif",
    'inter':     "'Inter', sans-serif",
    'poppins':   "'Poppins', sans-serif",
    'jakarta':   "'Plus Jakarta Sans', sans-serif",
    'outfit':    "'Outfit', sans-serif",
    'playfair':  "'Playfair Display', serif"
  };

  if (fontSelect) {
    const savedFont = localStorage.getItem('wbt-font-02');
    if (savedFont && fontMap[savedFont]) {
      document.documentElement.style.setProperty('--font-primary', fontMap[savedFont]);
      fontSelect.value = savedFont;
    }

    fontSelect.addEventListener('change', () => {
      const key = fontSelect.value;
      if (fontMap[key]) {
        document.documentElement.style.setProperty('--font-primary', fontMap[key]);
        localStorage.setItem('wbt-font-02', key);
      }
    });
  }

  // Theme switcher
  const themeSelect = document.querySelector('#theme-select');

  if (themeSelect) {
    const savedTheme = localStorage.getItem('wbt-theme-02');
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
      localStorage.setItem('wbt-theme-02', val);
    });
  }

});
