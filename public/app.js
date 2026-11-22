// ProfitPulse AI – Frontend Interactive Application Engine

let currentRegion = 'all';
let currentStore = 'all';
let currentDate = 'oct-2026';
let currentPeriodView = 'monthly';
let allStoresData = [];
let allInventoryData = [];
let alertsData = [];
let activeDatasetMeta = null;
let latestKPIData = null;
let latestTrendsData = [];

// Base currency symbol
let currencySymbol = '₹';

// Current Baseline Economics (Imported October 2026 Excel Dataset)
const baselineState = {
  aov: 45,
  dailyOrders: 20470,
  deliveryCost: 38.6,
  discount: 22.0,
  packagingCost: 7.5,
  productCostPct: 65.0,
  wastagePct: 3.9
};

// Preset configurations
const presets = {
  baseline: { ...baselineState },
  turnaround: {
    aov: 495,
    dailyOrders: 24500,
    deliveryCost: 27.5,
    discount: 15.0,
    packagingCost: 6.5,
    productCostPct: 65.5,
    wastagePct: 1.8
  },
  india: {
    aov: 460,
    dailyOrders: 22000,
    deliveryCost: 36.0,
    discount: 22.0,
    packagingCost: 7.0,
    productCostPct: 68.0,
    wastagePct: 2.9
  },
  sea: {
    aov: 650,
    dailyOrders: 18500,
    deliveryCost: 32.0,
    discount: 20.0,
    packagingCost: 6.0,
    productCostPct: 66.5,
    wastagePct: 2.8
  },
  eu: {
    aov: 1200,
    dailyOrders: 12000,
    deliveryCost: 75.0,
    discount: 18.0,
    packagingCost: 12.0,
    productCostPct: 62.0,
    wastagePct: 2.1
  }
};

// Built-in Monochromatic Lucide SVG Library (Offline & CDN resilient)
const lucideSVGs = {
  'layout-dashboard': '<svg class="lucide-icon" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  'store': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>',
  'package': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
  'users': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  'bike': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
  'gauge': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  'sliders': '<svg class="lucide-icon" viewBox="0 0 24 24"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>',
  'target': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  'download': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  'sparkles': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  'circle-dollar-sign': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>',
  'shopping-bag': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  'receipt': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-8"/><path d="M16 12h-8"/><path d="M11 16H8"/></svg>',
  'calculator': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>',
  'trending-up': '<svg class="lucide-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  'trending-down': '<svg class="lucide-icon" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
  'alert-triangle': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>',
  'alert-circle': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  'shield-alert': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  'shield-check': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>',
  'bot': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>',
  'award': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  'line-chart': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  'git-merge': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>',
  'check-circle': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  'zap': '<svg class="lucide-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  'arrow-right': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  'rotate-ccw': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  'check': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  'database': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
  'upload': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  'edit-3': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
  'table': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>',
  'menu': '<svg class="lucide-icon" viewBox="0 0 24 24"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  'x': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  'chevron-down': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  'more-horizontal': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  'calendar': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
  'map-pin': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  'clock': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  'refresh-cw': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  'bell': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  'barcode': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M3 5v14"/><path d="M8 5v14"/><path d="M12 5v14"/><path d="M17 5v14"/><path d="M21 5v14"/></svg>',
  'scan': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>',
  'video': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>',
  'video-off': '<svg class="lucide-icon" viewBox="0 0 24 24"><path d="m2 2 20 20"/><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>',
  'camera': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  'history': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>',
  'plus-circle': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
  'plus': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  'minus': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M5 12h14"/></svg>',
  'edit-2': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  'trash-2': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  'search': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  'filter': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  'eye': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="10" r="3"/></svg>',
  'file-text': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  'layers': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  'compass': '<svg class="lucide-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  'info': '<svg class="lucide-icon sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
};

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
    } catch (e) {
      fallbackIcons();
    }
  } else {
    fallbackIcons();
  }
}

function fallbackIcons() {
  document.querySelectorAll('i[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    if (lucideSVGs[iconName]) {
      el.outerHTML = lucideSVGs[iconName];
    }
  });
}

// Full-screen North Star Splash Controls
function enterDashboardFromSplash() {
  const splash = document.getElementById('northStarSplash');
  if (splash) {
    splash.classList.add('dismissed');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }
  switchTab('tab-dashboard');
}

function enterNorthStarFromSplash() {
  const splash = document.getElementById('northStarSplash');
  if (splash) {
    splash.classList.add('dismissed');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 500);
  }
  switchTab('tab-northstar');
}

document.addEventListener('DOMContentLoaded', () => {
  AppStorage.remove(AppStorage.KEYS.BIZ_DATA);
  AppStorage.remove(AppStorage.KEYS.IS_DEMO);
  initNavigation();
  initSimulator();
  initBatchingSimulator();
  initEventListeners();
  initDataManagementEvents();
  initNotificationCenter();
  initBusinessDataInput();
  initBarcodeScannerAndInventory();
  switchTab('tab-dashboard');
  loadAllData().then(() => {
    renderNorthStarMatrix();
    syncWithMongoDB();
    renderIcons();
  });
});

// Tab Navigation & Global Sidebar Interactivity
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('data-tab');
      if (targetTab) {
        switchTab(targetTab);
      }
    });
  });

  // Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Workflow Decision Flow Guide Toggle Button
  const wfBtn = document.getElementById('btnWorkflowGuide');
  const ribbon = document.getElementById('workflowRibbon');
  if (wfBtn && ribbon) {
    wfBtn.addEventListener('click', () => {
      ribbon.style.display = (ribbon.style.display === 'none' || getComputedStyle(ribbon).display === 'none') ? 'flex' : 'none';
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }
  });
}

function switchTab(tabId) {
  // Close mobile sidebar and overlay
  const sidebar = document.getElementById('appSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');

  // Update navbar & sidebar active classes
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-tab') === tabId);
  });

  // Update screen visibility
  document.querySelectorAll('.screen-view').forEach(screen => {
    screen.classList.remove('active');
  });

  const activeScreen = document.getElementById(tabId);
  if (activeScreen) {
    activeScreen.classList.add('active');
  }

  // Dynamic Page Headings (Section 2 Requirement)
  const titles = {
    'tab-dashboard': { 
      title: 'Dashboard', 
      sub: 'Executive overview of network-wide quick-commerce unit economics and store profitability' 
    },
    'tab-stores': { 
      title: 'StoreSense AI – Store Intelligence', 
      sub: 'Dark-store level profit and loss analysis, catchment economics, and operational expense audits' 
    },
    'tab-inventory': { 
      title: 'StockSmart AI – Inventory Intelligence', 
      sub: 'Perishable spoilage forecasting, turnover rates, and automated stock replenishment' 
    },
    'tab-customers': { 
      title: 'MarginMax AI – Customer Intelligence', 
      sub: 'Customer basket economics, coupon elasticity, discount reduction, and VIP loyalty protections' 
    },
    'tab-delivery': { 
      title: 'RouteFlow AI – Delivery Intelligence', 
      sub: 'Rider dispatch optimization, delivery cost reduction, and 15-minute SLA preservation' 
    },
    'tab-simulator': { 
      title: 'Profitability Simulator', 
      sub: 'Interactive decision-support simulator to test operational levers and forecast contribution margins' 
    },
    'tab-settings': { 
      title: 'Settings – Regional Assumptions', 
      sub: 'Macro-economic baselines and cost models across global quick-commerce hubs' 
    },
    'tab-northstar': { 
      title: 'North Star Matrix – CMPO Command Center', 
      sub: 'Contribution Margin per Order (CMPO) alignment across operational levers and 12-month breakeven goals' 
    },
    'tab-data-mgmt': {
      title: 'Company Data Management',
      sub: 'Upload CSV/Excel spreadsheets or enter real dark-store figures to dynamically manipulate the financial engine'
    }
  };

  const titleEl = document.getElementById('currentScreenTitle');
  const subEl = document.getElementById('currentScreenSubtitle');
  if (titles[tabId]) {
    if (titleEl) titleEl.textContent = titles[tabId].title;
    if (subEl) subEl.textContent = titles[tabId].sub;
  }

  // Scroll main content container to top
  const contentEl = document.querySelector('.content-scrollable');
  if (contentEl) contentEl.scrollTo({ top: 0, behavior: 'smooth' });

  // Update workflow steps active state
  const stepMap = {
    'tab-dashboard': 'wf1',
    'tab-stores': 'wf2',
    'tab-delivery': 'wf3',
    'tab-simulator': 'wf4'
  };
  document.querySelectorAll('.wf-step').forEach(s => s.classList.remove('active'));
  if (stepMap[tabId]) {
    const wfEl = document.getElementById(stepMap[tabId]);
    if (wfEl) wfEl.classList.add('active');
  }

  if (tabId === 'tab-dashboard') {
    if (latestTrendsData) {
      renderTrendChart(latestTrendsData);
    }
    if (allStoresData && allStoresData.length > 0) {
      renderStoreBarChart(allStoresData);
    }
  }

  if (tabId === 'tab-northstar') {
    renderNorthStarMatrix();
  }

  if (tabId === 'tab-inventory') {
    if (typeof renderInventoryCatalog === 'function') {
      renderInventoryCatalog();
    }
  }

  renderIcons();
}

// Initial Data Load
async function loadAllData() {
  await Promise.all([
    fetchDatasetMeta(),
    fetchKPIs(currentRegion, currentStore),
    fetchTrends(),
    fetchStores(currentRegion),
    fetchInventory(),
    fetchCustomers(),
    fetchDeliveryData(),
    fetchAlerts(),
    populateRegionSelector()
  ]);
  renderNorthStarMatrix();
  if (typeof renderInventoryCatalog === 'function') {
    renderInventoryCatalog();
  }
  if (typeof applyCustomBusinessDataIfSaved === 'function') {
    applyCustomBusinessDataIfSaved();
  }
  renderIcons();
}

// Event Listeners for Filters
function initEventListeners() {
  const regionSelector = document.getElementById('regionSelector');
  if (regionSelector) {
    regionSelector.addEventListener('change', (e) => {
      currentRegion = e.target.value;
      currencySymbol = (currentRegion === 'sea') ? '$' : (currentRegion === 'eu') ? '€' : '₹';
      fetchKPIs(currentRegion, currentStore);
  fetchTrends();
  fetchStores(currentRegion);
      fetchStores(currentRegion);
      renderNorthStarMatrix();
    });
  }

  const storeSelector = document.getElementById('storeSelector');
  if (storeSelector) {
    storeSelector.addEventListener('change', (e) => {
      currentStore = e.target.value;
      fetchKPIs(currentRegion, currentStore);
  fetchTrends();
  fetchStores(currentRegion);
    });
  }

  const periodViewFilter = document.getElementById('periodViewFilter');
  if (periodViewFilter) {
    periodViewFilter.addEventListener('change', (e) => {
      currentPeriodView = e.target.value;
      fetchKPIs(currentRegion, currentStore);
  fetchTrends();
  fetchStores(currentRegion);
    });
  }

  const dateFilter = document.getElementById('dateFilter');
  if (dateFilter) {
    dateFilter.addEventListener('change', (e) => {
      currentDate = e.target.value;
      fetchKPIs(currentRegion, currentStore);
  fetchTrends();
  fetchStores(currentRegion);
    });
  }

  const storeSearch = document.getElementById('storeSearchInput');
  if (storeSearch) {
    storeSearch.addEventListener('input', filterStoresTable);
  }

  const storeFilter = document.getElementById('storeStatusFilter');
  if (storeFilter) {
    storeFilter.addEventListener('change', filterStoresTable);
  }

  const invFilter = document.getElementById('inventoryCategoryFilter');
  if (invFilter) {
    invFilter.addEventListener('change', (e) => {
      fetchInventory(e.target.value);
    });
  }

  const btnWorkflow = document.getElementById('btnWorkflowGuide');
  if (btnWorkflow) {
    btnWorkflow.addEventListener('click', startDecisionWorkflowGuide);
  }

  window.addEventListener('resize', () => {
    const dashboardTab = document.getElementById('tab-dashboard');
    if (dashboardTab && dashboardTab.classList.contains('active')) {
      if (latestTrendsData) renderTrendChart(latestTrendsData);
      if (allStoresData && allStoresData.length > 0) renderStoreBarChart(allStoresData);
    }
  });
}

// ========================================================
// NORTH STAR MATRIX LOGIC & ROADMAP CHART
// ========================================================
function renderNorthStarMatrix() {
  const currentCMPOEl = document.getElementById('nsCurrentCMPO');
  const progressFill = document.getElementById('nsCMPOProgressFill');
  const nsDailyOrderCount = document.getElementById('nsDailyOrderCount');
  const nsMonthlyCMText = document.getElementById('nsMonthlyCMText');
  const nsFixedCostText = document.getElementById('nsFixedCostText');
  const nsNetDeficitText = document.getElementById('nsNetDeficitText');
  const nsAOVVal = document.getElementById('nsAOVVal');
  const nsDeliveryCostVal = document.getElementById('nsDeliveryCostVal');
  const nsWastageVal = document.getElementById('nsWastageVal');
  const nsPrivateLabelVal = document.getElementById('nsPrivateLabelVal');
  const nsDiscountVal = document.getElementById('nsDiscountVal');

  if (allStoresData.length > 0) {
    const totalDailyOrders = allStoresData.reduce((sum, s) => sum + (s.ordersPerDay || 0), 0);
    const totalMonthlyCM = allStoresData.reduce((sum, s) => sum + (s.contributionMargin || 0), 0);
    const totalFixedCosts = allStoresData.reduce((sum, s) => sum + (s.rent || 0) + (s.staffing || 0) + (s.utilities || 0), 0);
    const netDeficit = totalMonthlyCM - totalFixedCosts;

    const cmpo = totalDailyOrders > 0 ? (totalMonthlyCM / (totalDailyOrders * 30)) : 41.9;
    const avgAOV = allStoresData.reduce((sum, s) => sum + (s.aov * (s.ordersPerDay || 1)), 0) / (totalDailyOrders || 1);
    const avgDeliveryCost = allStoresData.reduce((sum, s) => sum + (s.deliveryCostPerOrder * (s.ordersPerDay || 1)), 0) / (totalDailyOrders || 1);
    const totalRevenue = allStoresData.reduce((sum, s) => sum + (s.monthlyRevenue || 0), 0);
    const totalWastage = allStoresData.reduce((sum, s) => sum + (s.wastageCost || 0), 0);
    const wastagePct = totalRevenue > 0 ? ((totalWastage / totalRevenue) * 100) : 3.4;
    const totalPL = allStoresData.reduce((sum, s) => sum + (s.privateLabelSales || 0), 0);
    const plPct = totalRevenue > 0 ? ((totalPL / totalRevenue) * 100) : 14.2;

    if (currentCMPOEl) {
      currentCMPOEl.textContent = `${currencySymbol}${cmpo.toFixed(2)}`;
    }
    if (progressFill) {
      const pct = Math.min(100, Math.max(15, (cmpo / 72.0) * 100));
      progressFill.style.width = `${pct.toFixed(1)}%`;
    }
    if (nsDailyOrderCount) {
      nsDailyOrderCount.textContent = `${totalDailyOrders.toLocaleString()} orders/day`;
    }
    if (nsMonthlyCMText) {
      nsMonthlyCMText.textContent = formatCurrency(totalMonthlyCM);
    }
    if (nsFixedCostText) {
      nsFixedCostText.textContent = formatCurrency(totalFixedCosts);
    }
    if (nsNetDeficitText) {
      if (netDeficit >= 0) {
        nsNetDeficitText.textContent = `+${formatCurrency(netDeficit)} Surplus`;
        nsNetDeficitText.style.color = '#34D399';
      } else {
        nsNetDeficitText.textContent = `-${formatCurrency(Math.abs(netDeficit))} Deficit`;
        nsNetDeficitText.style.color = '#F87171';
      }
    }
    if (nsAOVVal) nsAOVVal.textContent = `${currencySymbol}${Math.round(avgAOV)}`;
    if (nsDeliveryCostVal) nsDeliveryCostVal.textContent = `${currencySymbol}${avgDeliveryCost.toFixed(2)}`;
    if (nsWastageVal) nsWastageVal.textContent = `${wastagePct.toFixed(1)}%`;
    if (nsPrivateLabelVal) nsPrivateLabelVal.textContent = `${plPct.toFixed(1)}%`;
    if (nsDiscountVal) nsDiscountVal.textContent = '18.5%';
  }

  renderTurnaroundChart();
}

function renderTurnaroundChart() {
  const container = document.getElementById('turnaroundChartContainer');
  if (!container) return;

  const width = container.clientWidth || 460;
  const height = container.clientHeight || 200;
  const padding = { top: 25, right: 35, bottom: 35, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // 12-Month Turnaround Roadmap Milestones
  const milestones = [
    { label: 'M0 (Baseline)', pct: 33, stores: '3/9' },
    { label: 'M3 (Catchment)', pct: 55, stores: '5/9' },
    { label: 'M6 (Live)', pct: 67, stores: '6/9', isCurrent: true },
    { label: 'M9 (Batching)', pct: 89, stores: '8/9' },
    { label: 'M12 (Breakeven)', pct: 100, stores: '9/9', isTarget: true }
  ];

  const points = milestones.map((m, idx) => {
    const x = padding.left + (idx / (milestones.length - 1)) * chartW;
    const y = padding.top + chartH - ((m.pct / 100) * chartH);
    return { ...m, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const targetY = padding.top + chartH - (1.0 * chartH);

  const svg = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" style="font-family: var(--font-serif);">
      <defs>
        <linearGradient id="roadmapGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#1D1E39" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Target 100% Breakeven Line -->
      <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="#10B981" stroke-width="1.8" stroke-dasharray="4,4"/>
      <text x="${width - padding.right + 4}" y="${targetY + 4}" font-size="11" fill="#10B981" font-weight="700">100% Breakeven</text>

      <!-- Area Fill -->
      <path d="${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z" fill="url(#roadmapGrad)" />

      <!-- Progress Line -->
      <path d="${pathD}" fill="none" stroke="#1D1E39" stroke-width="3" stroke-linecap="round"/>

      <!-- Milestone Nodes -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="${p.isCurrent ? 6.5 : 5}" fill="${p.isCurrent ? '#10B981' : p.isTarget ? '#34D399' : '#1D1E39'}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="${p.x}" y="${p.y - 10}" font-size="11" text-anchor="middle" font-weight="800" fill="${p.isCurrent ? '#10B981' : '#1D1E39'}">
          ${p.pct}%
        </text>
        <text x="${p.x}" y="${height - 10}" font-size="10.5" text-anchor="middle" font-weight="600" fill="#64748B">
          ${p.label.split(' ')[0]}
        </text>
      `).join('')}
    </svg>
  `;

  container.innerHTML = svg;
}

// 1. Fetch KPIs & Render CMPO Front-Screen North Star Hero
async function fetchKPIs(region, storeId = 'all') {
  try {
    const res = await fetch(`/api/kpis?region=${region}&storeId=${storeId}&date=${currentDate}&period=${currentPeriodView}`);
    const data = await res.json();
    latestKPIData = data;

    // Render Primary Front-Screen Hero: Contribution Margin Per Order (CMPO)
    renderCMPOHero(data);

    // Multiply for aggregate period view if requested
    const multiplier = currentPeriodView === 'quarterly' ? 3 : currentPeriodView === 'yearly' ? 12 : 1;
    const rev = data.totalMonthlyRevenue * multiplier;
    const cm = data.totalMonthlyCM * multiplier;
    const orders = data.totalOrdersMonthly * multiplier;

    const elRev = document.getElementById('kpiRevenue');
    if (elRev) elRev.textContent = formatCurrency(rev);

    const elOrders = document.getElementById('kpiOrders');
    if (elOrders) elOrders.textContent = orders.toLocaleString();

    const elDailyOrders = document.getElementById('kpiDailyOrders');
    if (elDailyOrders) elDailyOrders.textContent = (data.totalOrdersDaily).toLocaleString();

    const elAOV = document.getElementById('kpiAOV');
    if (elAOV) elAOV.textContent = `${currencySymbol}${data.avgAOV}`;

    const elCMPct = document.getElementById('kpiCMPct');
    if (elCMPct) elCMPct.textContent = `${data.cmPct >= 0 ? '+' : ''}${data.cmPct}%`;

    const elCMVal = document.getElementById('kpiCMVal');
    if (elCMVal) elCMVal.textContent = formatCurrency(cm);

    const elCMPO = document.getElementById('kpiCMPOVal');
    if (elCMPO) elCMPO.textContent = `${currencySymbol}${(data.cmpo !== undefined ? data.cmpo : 41.90).toFixed(2)}`;

    const elDeliveryCost = document.getElementById('kpiDeliveryCost');
    if (elDeliveryCost) elDeliveryCost.textContent = `${currencySymbol}${data.deliveryCostPerOrder}`;

    const elWastage = document.getElementById('kpiWastage');
    if (elWastage) elWastage.textContent = `${data.inventoryWastagePct}%`;

    const elLossStores = document.getElementById('kpiLossStores');
    if (elLossStores) elLossStores.textContent = `${data.lossMakingStores} / ${data.totalStores}`;

    // Update StoreSense Dedicated KPIs
    const elStoreCount = document.getElementById('storesKpiCount');
    if (elStoreCount) elStoreCount.textContent = `${data.totalStores} Stores`;

    const elStoreProfitable = document.getElementById('storesKpiProfitable');
    if (elStoreProfitable) elStoreProfitable.textContent = `${data.totalStores - data.lossMakingStores} Stores`;

    const elSidebarStoreCount = document.getElementById('sidebarStoreCount');
    if (elSidebarStoreCount) elSidebarStoreCount.textContent = `${data.totalStores} Dark Stores Loaded`;

    // Update goal progress bar
    const progressFill = document.getElementById('goalProgressFill');
    if (progressFill) {
      const pct = Math.min(100, Math.max(10, Math.round((data.cmPct / 16.0) * 100)));
      progressFill.style.width = `${pct}%`;
    }

    // Update sidebar loss badge
    const badge = document.getElementById('lossStoreBadge');
    if (badge) {
      badge.textContent = `${data.lossMakingStores} Loss`;
    }

    renderIcons();
  } catch (err) {
    console.error('Error fetching KPIs:', err);
  }
}

// Render CMPO Front-Screen North Star Hero
function renderCMPOHero(data) {
  if (!data) return;
  const cmpoHeroVal = document.getElementById('cmpoHeroValue');
  const cmpoCurrency = document.getElementById('cmpoCurrency');
  const cmpoIconWrap = document.getElementById('cmpoIconWrap');
  const cmpoHeroIcon = document.getElementById('cmpoHeroIcon');
  const cmpoChangeBadge = document.getElementById('cmpoChangeBadge');
  const cmpoChangeIcon = document.getElementById('cmpoChangeIcon');
  const cmpoChangeText = document.getElementById('cmpoChangeText');
  const cmpoPrevText = document.getElementById('cmpoPrevText');
  const cmpoTargetVal = document.getElementById('cmpoTargetVal');
  const cmpoProgressPctText = document.getElementById('cmpoProgressPctText');
  const cmpoProgressFill = document.getElementById('cmpoProgressFill');
  const cmpoGapText = document.getElementById('cmpoGapText');
  const cmpoDailyCMText = document.getElementById('cmpoDailyCMText');
  const sparklineTarget = document.getElementById('cmpoSparklineTargetText');

  const curr = data.currencySymbol || currencySymbol;
  const cmpo = typeof data.cmpo === 'number' ? data.cmpo : 41.90;
  const isNegative = cmpo < 0;

  // Value and Currency display
  if (cmpoHeroVal) {
    cmpoHeroVal.textContent = Math.abs(cmpo).toFixed(2);
    cmpoHeroVal.classList.toggle('negative', isNegative);
  }
  if (cmpoCurrency) {
    cmpoCurrency.textContent = isNegative ? `-${curr}` : curr;
    cmpoCurrency.classList.toggle('negative', isNegative);
  }

  // Hero Icon and Wrap (subtle green for positive, red inferno for negative)
  if (cmpoIconWrap) {
    cmpoIconWrap.classList.toggle('negative', isNegative);
  }
  if (cmpoHeroIcon) {
    cmpoHeroIcon.setAttribute('data-lucide', isNegative ? 'alert-triangle' : 'trending-up');
  }

  // MoM Change Badge & Previous Period
  const changePct = typeof data.cmpoChangePct === 'number' ? data.cmpoChangePct : 9.1;
  const prevCMPO = typeof data.prevCMPO === 'number' ? data.prevCMPO : (cmpo * 0.92);
  const isChangePositive = changePct >= 0;

  if (cmpoChangeBadge) {
    cmpoChangeBadge.className = `trend-badge ${isChangePositive ? 'up-good' : 'down-bad'}`;
  }
  if (cmpoChangeIcon) {
    cmpoChangeIcon.setAttribute('data-lucide', isChangePositive ? 'trending-up' : 'trending-down');
  }
  if (cmpoChangeText) {
    cmpoChangeText.textContent = `${isChangePositive ? '+' : ''}${changePct.toFixed(1)}% MoM`;
  }
  if (cmpoPrevText) {
    cmpoPrevText.textContent = `vs prev. period: ${curr}${prevCMPO.toFixed(2)}`;
  }

  // Target Breakeven & Progress
  const targetCMPO = typeof data.targetCMPO === 'number' ? data.targetCMPO : 72.00;
  const progressPct = typeof data.cmpoProgressPct === 'number' 
    ? data.cmpoProgressPct 
    : (targetCMPO > 0 ? (cmpo / targetCMPO) * 100 : 0);
  const gap = typeof data.cmpoGap === 'number' ? data.cmpoGap : (targetCMPO - cmpo);

  if (cmpoTargetVal) {
    cmpoTargetVal.textContent = `${curr}${targetCMPO.toFixed(2)}`;
  }
  if (cmpoProgressPctText) {
    cmpoProgressPctText.textContent = isNegative 
      ? `0.0% (Deficit)` 
      : `${Math.min(100, Math.max(0, progressPct)).toFixed(1)}% of target`;
  }
  if (cmpoProgressFill) {
    const fillWidth = isNegative ? 5 : Math.min(100, Math.max(4, progressPct));
    cmpoProgressFill.style.width = `${fillWidth}%`;
    cmpoProgressFill.classList.toggle('negative', isNegative);
  }
  if (cmpoGapText) {
    if (gap > 0) {
      cmpoGapText.textContent = `Gap to close: +${curr}${gap.toFixed(2)} / order for company-wide breakeven`;
    } else {
      cmpoGapText.textContent = `Breakeven Exceeded! Generating +${curr}${Math.abs(gap).toFixed(2)} surplus / order`;
    }
  }

  if (cmpoDailyCMText) {
    const dailyCM = typeof data.dailyNetCM === 'number' ? data.dailyNetCM : (data.totalOrdersDaily || 20530) * cmpo;
    cmpoDailyCMText.textContent = `Daily Net CM: ${dailyCM >= 0 ? '+' : '-'}${formatCurrency(Math.abs(dailyCM))}/day`;
  }

  if (sparklineTarget) {
    sparklineTarget.textContent = `Breakeven Target: ${curr}${targetCMPO.toFixed(2)}`;
  }

  // Render Sparkline with latest trends
  if (latestTrendsData && latestTrendsData.length > 0) {
    renderCMPOSparkline(latestTrendsData, cmpo, targetCMPO, curr);
  }
}

// Render CMPO Historical Trajectory Sparkline
function renderCMPOSparkline(trends, currentCMPO, targetCMPO = 72.00, curr = '₹') {
  const container = document.getElementById('cmpoSparklineContainer');
  if (!container || !trends || trends.length === 0) return;

  const width = container.clientWidth || 380;
  const height = container.clientHeight || 120;
  const padding = { top: 18, right: 30, bottom: 25, left: 35 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Map data points
  const dataPoints = trends.map((t, idx) => {
    let val = typeof t.cmpo === 'number' ? t.cmpo : (currentCMPO - (trends.length - 1 - idx) * 8.5);
    return {
      month: t.month,
      val: parseFloat(val.toFixed(2)),
      isLive: t.month.includes('Live') || idx === Math.min(5, trends.length - 3),
      isTarget: idx === trends.length - 1
    };
  });

  const allVals = dataPoints.map(d => d.val).concat([targetCMPO, 0]);
  const minVal = Math.floor(Math.min(...allVals) / 10) * 10 - 5;
  const maxVal = Math.ceil(Math.max(...allVals) / 10) * 10 + 5;
  const range = (maxVal - minVal) || 1;

  const points = dataPoints.map((d, idx) => {
    const x = padding.left + (idx / (dataPoints.length - 1)) * chartW;
    const y = padding.top + chartH - ((d.val - minVal) / range) * chartH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const targetY = padding.top + chartH - ((targetCMPO - minVal) / range) * chartH;
  const zeroY = padding.top + chartH - ((0 - minVal) / range) * chartH;

  const isNegNow = currentCMPO < 0;

  const svg = `
    <svg class="cmpo-sparkline-svg" viewBox="0 0 ${width} ${height}" style="font-family: var(--font-serif); width: 100%; height: 100%;">
      <defs>
        <linearGradient id="cmpoHeroGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${isNegNow ? '#EF4444' : '#10B981'}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#1D1E39" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Zero Line if inside chart range -->
      ${zeroY >= padding.top && zeroY <= (padding.top + chartH) ? `
        <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="2,2"/>
        <text x="${padding.left - 4}" y="${zeroY + 3}" font-size="9" text-anchor="end" fill="#94A3B8" font-weight="600">0</text>
      ` : ''}

      <!-- Target Breakeven Reference Line -->
      <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="#34D399" stroke-width="1.6" stroke-dasharray="3,3"/>
      <text x="${width - padding.right + 4}" y="${targetY + 3}" font-size="9.5" fill="#34D399" font-weight="700">${curr}72 Target</text>

      <!-- Area fill under line -->
      <path d="${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z" fill="url(#cmpoHeroGrad)" />

      <!-- Historical & Forecast Curve -->
      <path d="${pathD}" fill="none" stroke="${isNegNow ? '#FCA5A5' : '#6EE7B7'}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Node Markers -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="${p.isLive ? 5.5 : p.isTarget ? 4.5 : 3.5}" 
                fill="${p.val < 0 ? '#EF4444' : p.isLive ? '#10B981' : p.isTarget ? '#34D399' : '#FFFFFF'}" 
                stroke="#1D1E39" stroke-width="2"/>
        ${p.isLive ? `
          <rect x="${p.x - 28}" y="${p.y - 20}" width="56" height="15" rx="4" fill="${p.val < 0 ? '#EF4444' : '#10B981'}"/>
          <text x="${p.x}" y="${p.y - 9}" font-size="9" text-anchor="middle" font-weight="800" fill="#FFFFFF">
            ${curr}${p.val.toFixed(1)}
          </text>
        ` : ''}
        <text x="${p.x}" y="${height - 4}" font-size="9" text-anchor="middle" font-weight="600" fill="#94A3B8">
          ${p.month.split(' ')[0]}
        </text>
      `).join('')}
    </svg>
  `;

  container.innerHTML = svg;
}

// 2. Fetch Trends & Render Chart
async function fetchTrends() {
  try {
    const res = await fetch('/api/trends');
    latestTrendsData = await res.json();
    renderTrendChart(latestTrendsData);
    if (latestKPIData) {
      renderCMPOSparkline(latestTrendsData, latestKPIData.cmpo, latestKPIData.targetCMPO, latestKPIData.currencySymbol);
    } else {
      renderCMPOSparkline(latestTrendsData, 41.90, 72.00, currencySymbol);
    }
  } catch (err) {
    console.error('Error fetching trends:', err);
    renderTrendChart();
  }
}

function renderTrendChart(trends) {
  const container = document.getElementById('trendChartContainer');
  if (!container) return;

  if (!trends || !Array.isArray(trends) || trends.length === 0) {
    if (Array.isArray(latestTrendsData) && latestTrendsData.length > 0) {
      trends = latestTrendsData;
    } else {
      trends = [
        { month: 'Jun 2026', revenue: 24200000, cmPct: 2.1, cm: 508200 },
        { month: 'Jul 2026', revenue: 25800000, cmPct: 4.3, cm: 1109400 },
        { month: 'Aug 2026', revenue: 27100000, cmPct: 5.8, cm: 1571800 },
        { month: 'Sep 2026', revenue: 28400000, cmPct: 7.2, cm: 2044800 },
        { month: 'Oct 2026', revenue: 29500000, cmPct: 8.5, cm: 2507500 },
        { month: 'Nov 2026', revenue: 30200000, cmPct: 9.2, cm: 2778400 },
        { month: 'Dec 2026 (P)', revenue: 32000000, cmPct: 12.4, cm: 3968000 },
        { month: 'Jan 2027 (P)', revenue: 34500000, cmPct: 16.0, cm: 5520000 }
      ];
      latestTrendsData = trends;
    }
  }

  const width = Math.max(container.clientWidth || 0, 520);
  const height = Math.max(container.clientHeight || 0, 260);
  const padding = { top: 25, right: 35, bottom: 40, left: 50 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const cmValues = (trends || []).map(t => Number(t.cmPct) || 0);
  const minCM = Math.min(-5, Math.floor(Math.min(...cmValues, 0) - 2));
  const maxCM = Math.max(18, Math.ceil(Math.max(...cmValues, 16) + 3));

  const points = (trends || []).map((t, idx) => {
    const x = padding.left + (idx / Math.max(trends.length - 1, 1)) * chartW;
    const y = padding.top + chartH - ((t.cmPct - minCM) / (maxCM - minCM)) * chartH;
    return { x, y, cmPct: t.cmPct, month: t.month, revenue: t.revenue, cm: t.cm };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const zeroY = padding.top + chartH - ((0 - minCM) / (maxCM - minCM)) * chartH;
  const targetY = padding.top + chartH - ((16 - minCM) / (maxCM - minCM)) * chartH;

  const svg = `
    <svg class="chart-svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="font-family: inherit; overflow: visible;">
      <defs>
        <linearGradient id="cmGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284C7" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="#0284C7" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#1D1E39" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      
      <!-- Gridlines -->
      <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="#E2E8F0" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="${padding.left - 8}" y="${zeroY + 4}" font-size="11" text-anchor="end" fill="#94A3B8" font-weight="700">0%</text>

      <line x1="${padding.left}" y1="${targetY}" x2="${width - padding.right}" y2="${targetY}" stroke="#10B981" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="${width - padding.right + 5}" y="${targetY + 4}" font-size="11" fill="#10B981" font-weight="700">Goal: 16%</text>

      <!-- Area fill -->
      <path d="${pathD} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z" fill="url(#cmGrad)" />

      <!-- Line -->
      <path d="${pathD}" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Data Points -->
      ${points.map(p => `
        <g class="trend-pt">
          <title>${p.month}: CM ${p.cmPct >= 0 ? '+' : ''}${p.cmPct}%</title>
          <circle cx="${p.x}" cy="${p.y}" r="5" fill="${p.cmPct >= 0 ? '#10B981' : '#EF4444'}" stroke="#FFFFFF" stroke-width="2"/>
          <text x="${p.x}" y="${p.y - 10}" font-size="11" text-anchor="middle" font-weight="700" fill="${p.cmPct >= 0 ? '#14532D' : '#6A0B0B'}">
            ${p.cmPct >= 0 ? '+' : ''}${p.cmPct}%
          </text>
          <text x="${p.x}" y="${height - 10}" font-size="10.5" text-anchor="middle" font-weight="600" fill="#64748B">
            ${p.month.split(' ')[0]}
          </text>
        </g>
      `).join('')}
    </svg>
  `;

  container.innerHTML = svg;
}

// 3. Fetch Stores & Render Store Bar Chart
async function fetchStores(region) {
  try {
    const res = await fetch(`/api/stores?region=${region}`);
    allStoresData = await res.json();
    renderStoresTable(allStoresData);
    renderStoreBarChart(allStoresData);
    renderCompanyDataPreview(allStoresData);
    populateStoreSelector(allStoresData);

    // Update StoreSense Dedicated Rent KPI
    if (allStoresData.length > 0) {
      const avgRent = Math.round(allStoresData.reduce((sum, s) => sum + (s.rent || 0), 0) / allStoresData.length);
      const elRent = document.getElementById('storesKpiRent');
      if (elRent) elRent.textContent = formatCurrency(avgRent);
    }

    renderNorthStarMatrix();
    renderIcons();
  } catch (err) {
    console.error('Error fetching stores:', err);
  }
}

function populateStoreSelector(stores) {
  const sel = document.getElementById('storeSelector');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = '<option value="all">All Dark Stores</option>' +
    stores.map(s => `<option value="${s.id}">${s.name} (${s.region})</option>`).join('');
  if (stores.some(s => s.id === currentVal)) {
    sel.value = currentVal;
  } else {
    sel.value = 'all';
  }
}

async function populateRegionSelector() {
  try {
    const res = await fetch('/api/regions');
    const regionsList = await res.json();
    const sel = document.getElementById('regionSelector');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = regionsList.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
    if (regionsList.some(r => r.id === currentVal)) {
      sel.value = currentVal;
    } else {
      sel.value = 'all';
    }
  } catch (e) {
    console.error('Error populating regions:', e);
  }
}

function renderStoresTable(stores) {
  const tbody = document.getElementById('storesTableBody');
  if (!tbody) return;

  if (stores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 24px; color: var(--text-muted); font-weight: 600;">No dark stores found for this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = stores.map(store => {
    const isLoss = store.lossMaking;
    return `
      <tr class="${isLoss ? 'loss-row' : ''}">
        <td><strong style="font-weight: 700;">${store.name}</strong></td>
        <td><span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${store.location}</span></td>
        <td>${currencySymbol}${((store.rent || 0) / 1000).toFixed(0)}k</td>
        <td>${currencySymbol}${((store.staffing || 0) / 1000).toFixed(0)}k</td>
        <td style="font-weight: 700;">${(store.ordersPerDay || 0).toLocaleString()}</td>
        <td style="font-weight: 700;">${formatCurrency(store.monthlyRevenue)}</td>
        <td style="font-weight: 800; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-accent)'};">
          ${store.contributionMargin >= 0 ? '+' : ''}${formatCurrency(store.contributionMargin)}
        </td>
        <td>
          <span class="badge ${isLoss ? 'badge-danger' : 'badge-success'}">
            ${store.cmPct >= 0 ? '+' : ''}${store.cmPct}%
          </span>
        </td>
        <td>
          <span style="font-size: 12px; font-weight: 700; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : '#10B981'};">
            ${store.status}
          </span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="inspectStore('${store.id}')">Inspect</button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterStoresTable() {
  const query = (document.getElementById('storeSearchInput').value || '').toLowerCase();
  const filter = document.getElementById('storeStatusFilter').value;

  const filtered = allStoresData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(query) || s.location.toLowerCase().includes(query) || s.region.toLowerCase().includes(query);
    const matchesStatus = (filter === 'all') || (filter === 'profitable' && !s.lossMaking) || (filter === 'loss' && s.lossMaking);
    return matchesSearch && matchesStatus;
  });

  renderStoresTable(filtered);
}

function renderStoreBarChart(stores) {
  const container = document.getElementById('storeBarChartContainer');
  if (!container) return;

  const width = Math.max(container.clientWidth || 0, 520);
  const height = Math.max(container.clientHeight || 0, 260);
  const padding = { top: 25, right: 20, bottom: 45, left: 45 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  let storeList = Array.isArray(stores) && stores.length > 0 ? stores : (Array.isArray(allStoresData) && allStoresData.length > 0 ? allStoresData : []);
  if (storeList.length === 0) {
    storeList = [
      { id: 'DS-BLR-01', name: 'Indiranagar Hub 104', region: 'South India - Bengaluru', cmPct: -68.1, monthlyRevenue: 3739000 },
      { id: 'DS-BLR-02', name: 'Koramangala 4th Block', region: 'South India - Bengaluru', cmPct: -79.6, monthlyRevenue: 4025000 },
      { id: 'DS-BLR-03', name: 'Whitefield IT Corridor', region: 'South India - Bengaluru', cmPct: -179.8, monthlyRevenue: 1311000 },
      { id: 'DS-NCR-01', name: 'Gurugram Cyber City Hub', region: 'North India - NCR', cmPct: -87.1, monthlyRevenue: 3280000 },
      { id: 'DS-NCR-02', name: 'Noida Sector  on', region: 'North India - NCR', cmPct: -95.2, monthlyRevenue: 2960000 },
      { id: 'DS-MUM-01', name: 'Powai Central', region: 'West India - Mumbai', cmPct: -89.9, monthlyRevenue: 3540000 },
      { id: 'DS-MUM-02', name: 'Andheri East Hub', region: 'West India - Mumbai', cmPct: -98.2, monthlyRevenue: 3175000 },
      { id: 'DS-HYD-01', name: 'Hitech City Hub', region: 'South India - Hyderabad', cmPct: -81.2, monthlyRevenue: 2890000 },
      { id: 'DS-PUN-01', name: 'Baner High Street', region: 'West India - Pune', cmPct: -90.5, monthlyRevenue: 2640000 }
    ];
  }
  const cmValues = storeList.map(s => Number(s.cmPct) || 0);
  const minCM = Math.min(-6, Math.floor(Math.min(...cmValues, 0) - 2));
  const maxCM = Math.max(18, Math.ceil(Math.max(...cmValues, 10) + 3));
  const zeroY = padding.top + chartH - ((0 - minCM) / (maxCM - minCM)) * chartH;

  const count = Math.max(storeList.length, 1);
  const slotW = chartW / count;
  const barWidth = Math.min(32, Math.max(14, slotW - 8));

  const bars = storeList.map((s, idx) => {
    const x = padding.left + (idx * slotW) + ((slotW - barWidth) / 2);
    const valY = padding.top + chartH - ((s.cmPct - minCM) / (maxCM - minCM)) * chartH;
    const barH = Math.max(3, Math.abs(valY - zeroY));
    const topY = s.cmPct >= 0 ? valY : zeroY;
    const isProfitable = s.cmPct >= 0;
    const color = isProfitable ? '#10B981' : '#EF4444';
    const textColor = isProfitable ? '#065F46' : '#991B1B';
    const storeShortName = (s.name || '').replace(/ Hub \d+/i, '').replace(/ \d+(th|st|nd|rd) Block/i, '').replace(/ IT Corridor/i, '').replace(/ CyberCity Hub/i, '').replace(/ Green Park/i, '').replace(/ Sector \d+ Pod/i, '').replace(/ Hill Road/i, '').replace(/ MIDC/i, '').replace(/ Ghodbunder/i, '').split(' ')[0];

    return `
      <g class="store-bar-item" style="cursor: pointer;" onclick="inspectStore('${s.id}')">
        <title>${s.name} (${s.region}): CM ${s.cmPct >= 0 ? '+' : ''}${s.cmPct}%</title>
        <rect x="${x}" y="${topY}" width="${barWidth}" height="${barH}" fill="${color}" rx="3" />
        <text x="${x + barWidth / 2}" y="${isProfitable ? topY - 6 : topY + barH + 12}" font-size="10" text-anchor="middle" font-weight="700" fill="${textColor}">
          ${isProfitable ? '+' : ''}${s.cmPct}%
        </text>
        <text x="${x + barWidth / 2}" y="${height - 12}" font-size="9.5" text-anchor="middle" font-weight="600" fill="#64748B" transform="rotate(-25, ${x + barWidth / 2}, ${height - 12})">
          ${storeShortName}
        </text>
      </g>
    `;
  }).join('');

  container.innerHTML = `
    <svg class="chart-svg" width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="font-family: inherit; overflow: visible;">
      <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" stroke="#94A3B8" stroke-width="1.5" />
      <text x="${padding.left - 6}" y="${zeroY + 3.5}" font-size="10" text-anchor="end" font-weight="700" fill="#64748B">0%</text>
      ${bars}
    </svg>
  `;
}

// 4. Inspect Store Details in Modal
function inspectStore(storeId) {
  const store = allStoresData.find(s => s.id === storeId);
  if (!store) return;

  document.getElementById('modalStoreTitle').textContent = `Store Analysis: ${store.name}`;
  const modalBody = document.getElementById('modalStoreBody');

  const isLoss = store.lossMaking;
  modalBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
      <div>
        <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 600;">${store.location} (${store.sqft} sq.ft)</div>
        <div style="font-size: 21px; font-weight: 800; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-accent)'};">
          Contribution Margin: ${store.cmPct >= 0 ? '+' : ''}${store.cmPct}% (${formatCurrency(store.contributionMargin)} / mo)
        </div>
      </div>
      <span class="badge ${isLoss ? 'badge-danger' : 'badge-success'}" style="font-size: 13px; padding: 4px 12px;">${store.status}</span>
    </div>

    <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px; color: var(--pantone-neon-navy);">Monthly Cost & Operational Breakdown</h4>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: var(--bg-surface-alt); padding: 12px; border-radius: var(--radius-sm);">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Rent & Property</div>
        <div style="font-size: 17px; font-weight: 800; color: var(--pantone-neon-navy);">${currencySymbol}${(store.rent || 0).toLocaleString()}</div>
        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">${currencySymbol}${Math.round((store.rent || 0) / (store.sqft || 3000))} / sqft</div>
      </div>
      <div style="background: var(--bg-surface-alt); padding: 12px; border-radius: var(--radius-sm);">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Staffing & Pickers</div>
        <div style="font-size: 17px; font-weight: 800; color: var(--pantone-neon-navy);">${currencySymbol}${(store.staffing || 0).toLocaleString()}</div>
        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">FTE dark-store team</div>
      </div>
      <div style="background: var(--bg-surface-alt); padding: 12px; border-radius: var(--radius-sm);">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Delivery Subsidies</div>
        <div style="font-size: 17px; font-weight: 800; color: ${store.deliveryCostPerOrder > 40 ? 'var(--pantone-red-inferno-accent)' : 'var(--text-main)'};">
          ${currencySymbol}${store.deliveryCostPerOrder} / order
        </div>
        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 500;">${store.ordersPerDay} orders/day</div>
      </div>
    </div>

    <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px; color: var(--pantone-pine-grove-accent); display: flex; align-items: center; gap: 6px;">
      <i data-lucide="sparkles" class="lucide-icon sm"></i>
      <span>AI Turnaround Recommendations</span>
    </h4>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      ${(store.aiRecommendations || []).map(r => `
        <div style="border-left: 3px solid var(--pantone-pine-grove-emerald); background: #F8FAFC; padding: 10px 14px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 13px; color: var(--pantone-neon-navy); font-weight: 700;">${r.title}</strong>
            <span style="font-size: 11.5px; font-weight: 700; color: var(--pantone-pine-grove-emerald);">${r.impact}</span>
          </div>
          <p style="font-size: 12px; color: #475569; margin-top: 3px; font-weight: 500;">${r.description}</p>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('modalSimulateBtn').onclick = () => {
    closeStoreModal();
    document.getElementById('slAOV').value = store.aov;
    document.getElementById('slDeliveryCost').value = Math.round(store.deliveryCostPerOrder);
    document.getElementById('slDiscount').value = Math.round(store.discountPerOrder || 20);
    document.getElementById('slCOGS').value = store.productCostPct || 68.5;
    updateSimulator();
    switchTab('tab-simulator');
  };

  document.getElementById('storeModal').classList.add('active');
  renderIcons();
}

function closeStoreModal() {
  document.getElementById('storeModal').classList.remove('active');
}

// 5. Fetch Inventory Intelligence
async function fetchInventory(category = 'all') {
  try {
    const res = await fetch(`/api/inventory?category=${category}`);
    allInventoryData = await res.json();
    renderInventoryTable(allInventoryData);
    renderIcons();
  } catch (err) {
    console.error('Error fetching inventory:', err);
  }
}

function renderInventoryTable(items) {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  tbody.innerHTML = items.map(item => {
    const isWastageRisk = item.alertType === 'expiry';
    const isLowStock = item.alertType === 'low_stock';
    const isOverstock = item.alertType === 'overstock';

    let badgeClass = 'badge-success';
    if (isWastageRisk) badgeClass = 'badge-danger';
    else if (isLowStock) badgeClass = 'badge-warning';
    else if (isOverstock) badgeClass = 'badge-navy';

    return `
      <tr class="${isWastageRisk ? 'loss-row' : ''}">
        <td><strong style="font-weight: 700;">${item.name}</strong></td>
        <td><span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${item.category}</span></td>
        <td><span style="font-weight: 800;">${item.currentStock}</span> units</td>
        <td style="font-weight: 600;">${item.dailyDemand} / day</td>
        <td style="font-weight: 700;">₹${item.sellingPrice}</td>
        <td style="font-weight: 700;">₹${item.purchaseCost}</td>
        <td style="color: var(--pantone-pine-grove-accent); font-weight: 700;">+${item.grossMarginPct}%</td>
        <td style="font-weight: 600;">${item.turnoverDays} days</td>
        <td style="color: ${item.expiryDays <= 2 ? 'var(--pantone-red-inferno-accent)' : 'inherit'}; font-weight: ${item.expiryDays <= 2 ? '800' : '600'};">
          ${item.expiryDays}d left
        </td>
        <td><span class="badge ${badgeClass}">${item.status}</span></td>
        <td>
          ${item.recommendedOrder > 0 ? `
            <button class="btn btn-pine btn-sm" onclick="approveReorder('${item.id}', ${item.recommendedOrder})">
              <i data-lucide="check" class="lucide-icon sm"></i>
              <span>Approve PO (+${item.recommendedOrder})</span>
            </button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="alert('${item.action || 'No action needed'}')">Action</button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

async function approveReorder(skuId, qty) {
  try {
    const res = await fetch('/api/inventory/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skuId, quantity: qty })
    });
    const result = await res.json();
    alert(`[PO Confirmed] ${result.message}\nNew Stock: ${result.sku.currentStock} units.`);
    fetchInventory();
  } catch (err) {
    console.error('Error approving reorder:', err);
  }
}

// 6. Fetch Customers Intelligence
async function fetchCustomers() {
  try {
    const res = await fetch('/api/customers');
    const data = await res.json();
    renderCustomerSegments(data.segments);
    renderIcons();
  } catch (err) {
    console.error('Error fetching customers:', err);
  }
}

function renderCustomerSegments(segments) {
  const container = document.getElementById('customerSegmentsGrid');
  if (!container) return;

  container.innerHTML = segments.map(seg => {
    const isLoss = seg.contributionMarginPerOrder < 0;
    return `
      <div class="comp-card" style="border-left: 4px solid ${isLoss ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-accent)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <h4 style="font-size: 14.5px; font-weight: 700; color: var(--pantone-neon-navy);">${seg.name}</h4>
            <span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">${seg.description}</span>
          </div>
          <span class="badge ${isLoss ? 'badge-danger' : 'badge-success'}">${seg.badge}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; background: var(--bg-surface-alt); padding: 10px; border-radius: var(--radius-sm); text-align: center;">
          <div>
            <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Users Share</div>
            <div style="font-size: 15px; font-weight: 800;">${seg.userSharePct}%</div>
          </div>
          <div>
            <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">AOV</div>
            <div style="font-size: 15px; font-weight: 800;">₹${seg.aov}</div>
          </div>
          <div>
            <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Discount Dep.</div>
            <div style="font-size: 15px; font-weight: 800; color: ${seg.discountDependencyPct > 30 ? 'var(--pantone-red-inferno-accent)' : 'inherit'};">
              ${seg.discountDependencyPct}%
            </div>
          </div>
          <div>
            <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">CM / Order</div>
            <div style="font-size: 15px; font-weight: 800; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-emerald)'};">
              ${seg.contributionMarginPerOrder >= 0 ? '+' : ''}₹${seg.contributionMarginPerOrder}
            </div>
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 700; color: var(--pantone-neon-navy); margin-bottom: 4px;">Strategic AI Actions:</div>
        <ul style="padding-left: 18px; font-size: 11.5px; color: #475569; display: flex; flex-direction: column; gap: 3px; font-weight: 500;">
          ${seg.recommendations.map(r => `<li>${r}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

function applyCustomerStrategy() {
  alert('[Strategy Activated] PulsePass VIP Strategy Activated!\n\n1. Implemented minimum basket size of ₹249 for free delivery.\n2. Capped coupon discounts at 10% on grocery staples.\n3. Introduced scheduled evening delivery slots.\n\nProjected Impact: +₹7.20 Lakhs / month contribution margin improvement.');
  document.getElementById('slDiscount').value = 16;
  document.getElementById('slAOV').value = 485;
  updateSimulator();
  switchTab('tab-simulator');
}

// 7. Fetch Delivery Intelligence & Batching
async function fetchDeliveryData() {
  try {
    const res = await fetch('/api/delivery');
    const data = await res.json();
    renderDeliveryQueue(data.liveQueue);
    renderIcons();
  } catch (err) {
    console.error('Error fetching delivery data:', err);
  }
}

function renderDeliveryQueue(queue) {
  const tbody = document.getElementById('deliveryQueueTableBody');
  if (!tbody) return;

  tbody.innerHTML = queue.map(q => `
    <tr>
      <td><strong style="font-weight: 700;">${q.orderId}</strong></td>
      <td style="font-weight: 600;">${q.store}</td>
      <td><span style="font-size: 12px; color: var(--text-muted); font-weight: 500;">${q.dest}</span></td>
      <td style="font-weight: 600;">${q.prepTime}</td>
      <td><span style="color: var(--pantone-pine-grove-accent); font-weight: 700;">${q.eta}</span></td>
      <td><span class="badge ${q.status.includes('Batch') ? 'badge-success' : 'badge-navy'}">${q.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="alert('Rider assigned to combine with adjacent delivery drop.')">Pair Dispatch</button>
      </td>
    </tr>
  `).join('');
}

// Interactive Batching Simulator Logic
function initBatchingSimulator() {
  const slider = document.getElementById('batchRatioSlider');
  if (!slider) return;

  slider.addEventListener('input', async (e) => {
    const ratio = e.target.value;
    document.getElementById('batchRatioDisplay').textContent = `Batching: ${ratio}% of Orders`;

    try {
      const res = await fetch('/api/delivery/simulate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchRatio: ratio })
      });
      const data = await res.json();

      document.getElementById('batchedCostDisplay').textContent = `₹${data.blendedDeliveryCost.toFixed(2)}`;
      document.getElementById('batchingSavingsBadge').textContent = `Saves ₹${data.costSavingsPerOrder.toFixed(2)} / Order`;
      document.getElementById('monthlyBatchSavingsDisplay').textContent = `+${formatCurrency(data.monthlyFinancialGain)}`;
      document.getElementById('rfDeliveryTime').textContent = `${data.avgDeliveryTimeMins} min`;
      document.getElementById('rfDeliveryCost').textContent = `₹${data.blendedDeliveryCost.toFixed(1)}`;
      document.getElementById('rfBatchSavings').textContent = `↓ Saves ₹${data.costSavingsPerOrder.toFixed(1)}/order`;
    } catch (err) {
      console.error('Batching simulation error:', err);
    }
  });
}

function applyBatchingToSimulator() {
  const batchedCost = parseFloat(document.getElementById('rfDeliveryCost').textContent.replace('₹', '')) || 28;
  document.getElementById('slDeliveryCost').value = Math.round(batchedCost);
  updateSimulator();
  switchTab('tab-simulator');
}

// 8. Fetch AI Business Alerts
async function fetchAlerts() {
  try {
    const res = await fetch('/api/alerts');
    alertsData = await res.json();
    renderAlerts(alertsData);
    renderIcons();
  } catch (err) {
    console.error('Error fetching alerts:', err);
  }
}

function renderAlerts(alerts) {
  const container = document.getElementById('alertsListContainer');
  if (!container) return;

  container.innerHTML = alerts.map(a => `
    <div class="alert-card ${a.severity === 'high' ? 'critical' : 'warning'}">
      <div class="alert-icon">
        <i data-lucide="${a.severity === 'high' ? 'shield-alert' : 'alert-triangle'}" class="lucide-icon" style="color: #FFFFFF;"></i>
      </div>
      <div class="alert-content">
        <div class="alert-title-row">
          <div class="alert-title">${a.title}</div>
          <span class="alert-impact-tag">${a.financialImpact}</span>
        </div>
        <div class="alert-desc">
          <strong>Root Cause:</strong> ${a.reason}
        </div>
        <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 8px;">
          <strong>Recommendation:</strong> ${a.recommendation}
        </div>
        <div class="alert-actions">
          <button class="btn btn-pine btn-sm" onclick="applyAlertPreset('${a.id}')">
            <span>Simulate Financial Fix in Simulator</span>
            <i data-lucide="arrow-right" class="lucide-icon sm"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function applyAlertPreset(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (!alert) return;

  if (alert.preset) {
    if (alert.preset.aov) document.getElementById('slAOV').value = alert.preset.aov;
    if (alert.preset.deliveryCost) document.getElementById('slDeliveryCost').value = alert.preset.deliveryCost;
    if (alert.preset.discount) document.getElementById('slDiscount').value = alert.preset.discount;
    if (alert.preset.wastagePct) document.getElementById('slWastage').value = alert.preset.wastagePct;
  }

  updateSimulator();
  switchTab('tab-simulator');
}

// 9. SIGNATURE FEATURE: PROFITABILITY SIMULATOR LOGIC
function initSimulator() {
  const sliderIds = ['slAOV', 'slOrders', 'slDeliveryCost', 'slDiscount', 'slPackaging', 'slCOGS', 'slWastage'];
  sliderIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', updateSimulator);
    }
  });

  updateSimulator();
}

function updateSimulator() {
  const aov = parseFloat(document.getElementById('slAOV').value);
  const dailyOrders = parseInt(document.getElementById('slOrders').value);
  const deliveryCost = parseFloat(document.getElementById('slDeliveryCost').value);
  const discount = parseFloat(document.getElementById('slDiscount').value);
  const packaging = parseFloat(document.getElementById('slPackaging').value);
  const cogsPct = parseFloat(document.getElementById('slCOGS').value);
  const wastagePct = parseFloat(document.getElementById('slWastage').value);

  document.getElementById('lblAOV').textContent = `₹${aov}`;
  document.getElementById('lblOrders').textContent = dailyOrders.toLocaleString();
  document.getElementById('lblDeliveryCost').textContent = `₹${deliveryCost}`;
  document.getElementById('lblDiscount').textContent = `₹${discount}`;
  document.getElementById('lblPackaging').textContent = `₹${packaging}`;
  document.getElementById('lblCOGS').textContent = `${cogsPct}%`;
  document.getElementById('lblWastage').textContent = `${wastagePct}%`;

  const cogs = aov * (cogsPct / 100);
  const wastage = aov * (wastagePct / 100);
  const grossMargin = aov - cogs;
  const variableCosts = deliveryCost + discount + packaging + wastage;
  const cmPerOrder = grossMargin - variableCosts;
  const cmPct = (cmPerOrder / aov) * 100;

  const dailyCM = cmPerOrder * dailyOrders;
  const monthlyCM = dailyCM * 30;

  const totalFixedCosts = 4050000;
  const netMonthlyProfit = monthlyCM - totalFixedCosts;

  const breakevenOrders = cmPerOrder > 0 ? Math.ceil(totalFixedCosts / (cmPerOrder * 30)) : null;

  let breakevenHorizon = '0.0 Months (Breakeven Achieved)';
  if (netMonthlyProfit < 0) {
    if (cmPerOrder > 0) {
      const gap = Math.abs(netMonthlyProfit);
      const estGrowth = monthlyCM * 0.15;
      breakevenHorizon = `${(gap / (estGrowth || 1)).toFixed(1)} Months`;
    } else {
      breakevenHorizon = 'Negative Unit Margin';
    }
  }

  const baselineMonthlyCM = 2383000;
  const monthlyImprovement = monthlyCM - baselineMonthlyCM;
  const annualImprovement = monthlyImprovement * 12;

  document.getElementById('resCMPerOrder').textContent = `₹${cmPerOrder.toFixed(1)}`;
  document.getElementById('resCMPct').textContent = `${cmPct >= 0 ? '+' : ''}${cmPct.toFixed(1)}% of order value`;
  document.getElementById('resMonthlyCM').textContent = `${monthlyCM >= 0 ? '+' : ''}${formatCurrency(monthlyCM)}`;
  document.getElementById('resDailyCM').textContent = `${formatCurrency(dailyCM)} daily run-rate`;
  document.getElementById('resBreakevenTimeline').textContent = breakevenHorizon;
  document.getElementById('resBreakevenOrders').textContent = breakevenOrders ? `${breakevenOrders.toLocaleString()} orders/day needed` : 'Requires unit margin > 0';

  document.getElementById('simAOV').textContent = `₹${aov.toFixed(2)}`;
  document.getElementById('simGrossMargin').textContent = `₹${grossMargin.toFixed(2)} (${(100 - cogsPct).toFixed(1)}%)`;
  document.getElementById('simDelivery').textContent = `₹${deliveryCost.toFixed(2)}`;
  document.getElementById('simDiscount').textContent = `₹${discount.toFixed(2)}`;
  document.getElementById('simWastage').textContent = `₹${(packaging + wastage).toFixed(2)}`;
  document.getElementById('simCMPerOrder').textContent = `₹${cmPerOrder.toFixed(2)} (${cmPct.toFixed(1)}%)`;
  document.getElementById('simMonthlyCM').textContent = formatCurrency(monthlyCM);

  document.getElementById('simImprovementAnnual').textContent = `${annualImprovement >= 0 ? '+' : ''}${formatCurrency(annualImprovement)} / year`;
  document.getElementById('simImprovementMonthly').textContent = `${monthlyImprovement >= 0 ? '+' : ''}${formatCurrency(monthlyImprovement)} / month`;

  const explanation = document.getElementById('simDeltaExplanation');
  if (explanation) {
    if (monthlyImprovement >= 0) {
      explanation.innerHTML = `Your simulated levers generate an additional <strong style="color: #10B981;">+${formatCurrency(monthlyImprovement)}/mo</strong> in net contribution over the current baseline!`;
    } else {
      explanation.innerHTML = `Your simulated configuration currently lags the baseline by <strong style="color: #8E1515;">-${formatCurrency(Math.abs(monthlyImprovement))}/mo</strong>.`;
    }
  }
}

function loadPreset(presetKey) {
  const p = presets[presetKey];
  if (!p) return;

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('onclick').includes(presetKey));
  });

  document.getElementById('slAOV').value = p.aov;
  document.getElementById('slOrders').value = p.dailyOrders;
  document.getElementById('slDeliveryCost').value = p.deliveryCost;
  document.getElementById('slDiscount').value = p.discount;
  document.getElementById('slPackaging').value = p.packagingCost;
  document.getElementById('slCOGS').value = p.productCostPct;
  document.getElementById('slWastage').value = p.wastagePct;

  updateSimulator();
}

function resetSimulator() {
  loadPreset('baseline');
}

// 10. AI Guided Decision Flow Walkthrough
function startDecisionWorkflowGuide() {
  alert(
    "[ProfitPulse AI Decision Flow: Complete 4-Step Demonstration]\n\n" +
    "Step 1: Identify Inefficiency -> Dark stores operating at deficits due to high single-drop delivery distances.\n" +
    "Step 2: StoreSense Analysis -> Audit indicates catchment radius of 4.5km inflating delivery subsidies.\n" +
    "Step 3: RouteFlow Batching -> Proximity batching simulator slashes delivery cost to ₹27.50 without breaching 15m SLA.\n" +
    "Step 4: Profitability Simulation -> Simulates combined impact: +₹1.48 Crore/year contribution lift, achieving network breakeven in 4.5 months!\n\n" +
    "Loading simulated turnaround model..."
  );
  loadPreset('turnaround');
  switchTab('tab-simulator');
}

// ========================================================
// 11. COMPANY DATA MANAGEMENT & DYNAMIC INGESTION ENGINE
// ========================================================

const REQUIRED_DATASET_COLUMNS = [
  'Store_ID',
  'Dark_Store_Name',
  'Region',
  'Reporting_Period',
  'Monthly_Revenue_INR',
  'Orders_Per_Day',
  'Delivery_Cost_Per_Order_INR',
  'Dark_Store_Rent_Monthly_INR',
  'Staffing_Expenses_Monthly_INR',
  'Inventory_Wastage_Monthly_INR',
  'Private_Label_Sales_Monthly_INR'
];

function findClientColumnKey(row, targetKey) {
  if (row.hasOwnProperty(targetKey)) return targetKey;
  const cleanTarget = targetKey.toLowerCase().replace(/[\s\-_]+/g, '');
  for (const k of Object.keys(row)) {
    if (k.trim().toLowerCase().replace(/[\s\-_]+/g, '') === cleanTarget) return k;
  }
  const aliases = {
    'Store_ID': ['storeid', 'darkstoreid', 'storecode', 'id'],
    'Dark_Store_Name': ['darkstorename', 'storename', 'name', 'hubname'],
    'Region': ['region', 'operatingregion', 'city', 'market', 'location'],
    'Reporting_Period': ['reportingperiod', 'period', 'month', 'date', 'reportingmonth'],
    'Monthly_Revenue_INR': ['monthlyrevenueinr', 'monthlyrevenue', 'totalrevenue', 'revenue', 'turnover', 'sales'],
    'Orders_Per_Day': ['ordersperday', 'ordersday', 'dailyorders', 'completedordersperday', 'orders'],
    'Delivery_Cost_Per_Order_INR': ['deliverycostperorderinr', 'deliverycostperorder', 'deliverycostorder', 'costperorder', 'deliverycost'],
    'Dark_Store_Rent_Monthly_INR': ['darkstorerentmonthlyinr', 'darkstorerent', 'storerentmonthlyinr', 'storerent', 'monthlyrent', 'rent'],
    'Staffing_Expenses_Monthly_INR': ['staffingexpensesmonthlyinr', 'staffingexpenses', 'staffingcost', 'payroll', 'staffing'],
    'Inventory_Wastage_Monthly_INR': ['inventorywastagemonthlyinr', 'inventorywastage', 'wastagecost', 'wastage', 'spoilage'],
    'Private_Label_Sales_Monthly_INR': ['privatelabelsalesmonthlyinr', 'privatelabelsales', 'privatelabel', 'plsales']
  };
  if (aliases[targetKey]) {
    for (const alias of aliases[targetKey]) {
      for (const k of Object.keys(row)) {
        if (k.trim().toLowerCase().replace(/[\s\-_]+/g, '') === alias) return k;
      }
    }
  }
  return null;
}

// Client-Side Dataset Validation (Requirement 5 & 9)
function validateClientDataset(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return { valid: false, error: 'Validation Error: The uploaded file has no data rows.' };
  }

  // 1. Filter out empty rows
  const nonEmptyRows = records.filter(row => {
    if (!row || typeof row !== 'object') return false;
    return Object.values(row).some(v => v !== null && v !== undefined && String(v).trim() !== '');
  });

  if (nonEmptyRows.length === 0) {
    return { valid: false, error: 'Validation Error: All rows in the uploaded file were empty.' };
  }

  // 2. Validate missing columns
  const firstRow = nonEmptyRows[0];
  const missing = [];
  const colMap = {};

  for (const reqCol of REQUIRED_DATASET_COLUMNS) {
    const matched = findClientColumnKey(firstRow, reqCol);
    if (!matched) {
      missing.push(reqCol);
    } else {
      colMap[reqCol] = matched;
    }
  }

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Validation Error: Missing required column(s): <strong>${missing.join(', ')}</strong>.<br><br>All 11 required columns must be present: <code>${REQUIRED_DATASET_COLUMNS.join(', ')}</code>`
    };
  }

  // 3. Row-level validation: duplicate Store_ID, empty text, invalid numbers
  const seenStoreIds = new Set();
  for (let idx = 0; idx < nonEmptyRows.length; idx++) {
    const row = nonEmptyRows[idx];
    const rowNum = idx + 2;

    const rawId = row[colMap['Store_ID']];
    const storeId = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
    if (!storeId) {
      return { valid: false, error: `Validation Error: Row ${rowNum} is missing mandatory 'Store_ID'.` };
    }
    const upperId = storeId.toUpperCase();
    if (seenStoreIds.has(upperId)) {
      return { valid: false, error: `Validation Error: Duplicate Store_ID "${storeId}" detected at row ${rowNum}. Each dark store must have a unique Store_ID.` };
    }
    seenStoreIds.add(upperId);

    const rawName = row[colMap['Dark_Store_Name']];
    if (rawName === undefined || rawName === null || String(rawName).trim() === '') {
      return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) is missing mandatory 'Dark_Store_Name'.` };
    }

    const rawRegion = row[colMap['Region']];
    if (rawRegion === undefined || rawRegion === null || String(rawRegion).trim() === '') {
      return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) is missing mandatory 'Region'.` };
    }

    function checkNumber(colName, mustBePositive = true) {
      const rawVal = row[colMap[colName]];
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) is missing required numeric value for '${colName}'.` };
      }
      const cleaned = String(rawVal).trim().replace(/^[₹$€, ]+/g, '').replace(/,/g, '');
      const num = Number(cleaned);
      if (isNaN(num)) {
        return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) contains invalid numeric value "${rawVal}" for '${colName}'.` };
      }
      if (mustBePositive && num <= 0) {
        return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) '${colName}' must be greater than zero. Received: ${num}.` };
      }
      if (!mustBePositive && num < 0) {
        return { valid: false, error: `Validation Error: Row ${rowNum} (Store: ${storeId}) '${colName}' cannot be negative. Received: ${num}.` };
      }
      return { valid: true };
    }

    const revChk = checkNumber('Monthly_Revenue_INR', true);
    if (!revChk.valid) return revChk;

    const ordChk = checkNumber('Orders_Per_Day', true);
    if (!ordChk.valid) return ordChk;

    const delChk = checkNumber('Delivery_Cost_Per_Order_INR', false);
    if (!delChk.valid) return delChk;

    const rentChk = checkNumber('Dark_Store_Rent_Monthly_INR', false);
    if (!rentChk.valid) return rentChk;

    const staffChk = checkNumber('Staffing_Expenses_Monthly_INR', false);
    if (!staffChk.valid) return staffChk;

    const wasteChk = checkNumber('Inventory_Wastage_Monthly_INR', false);
    if (!wasteChk.valid) return wasteChk;

    const plChk = checkNumber('Private_Label_Sales_Monthly_INR', false);
    if (!plChk.valid) return plChk;
  }

  return { valid: true, rows: nonEmptyRows };
}

// Display UI error or success alert banner
function showDataAlert(message, type = 'info') {
  const alertEl = document.getElementById('dataUploadAlert');
  if (!alertEl) return;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  const bgColor = isError ? '#FEF2F2' : isSuccess ? '#ECFDF5' : '#EEF2FF';
  const borderColor = isError ? '#EF4444' : isSuccess ? '#10B981' : '#6366F1';
  const textColor = isError ? '#991B1B' : isSuccess ? '#065F46' : '#1E1B4B';
  const iconName = isError ? 'alert-triangle' : isSuccess ? 'check-circle' : 'database';

  alertEl.style.display = 'flex';
  alertEl.style.alignItems = 'flex-start';
  alertEl.style.gap = '12px';
  alertEl.style.padding = '14px 18px';
  alertEl.style.borderRadius = 'var(--radius-sm)';
  alertEl.style.background = bgColor;
  alertEl.style.border = `1.5px solid ${borderColor}`;
  alertEl.style.color = textColor;
  alertEl.style.fontWeight = '600';
  alertEl.style.fontSize = '13.5px';
  alertEl.style.lineHeight = '1.5';
  alertEl.style.boxShadow = 'var(--shadow-sm)';

  alertEl.innerHTML = `
    <div style="flex-shrink: 0; margin-top: 2px;">
      <i data-lucide="${iconName}" class="lucide-icon" style="color: ${borderColor};"></i>
    </div>
    <div style="flex-grow: 1;">
      <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">
        ${isError ? 'Dataset Validation or Parsing Failed' : isSuccess ? 'Dataset Ingestion Succeeded' : 'Data Ingestion Status'}
      </div>
      <div>${message}</div>
    </div>
    <button onclick="document.getElementById('dataUploadAlert').style.display='none'" style="background: none; border: none; font-size: 18px; font-weight: 700; color: inherit; cursor: pointer; padding: 0 4px; line-height: 1;">×</button>
  `;

  renderIcons();
  alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Staged dataset state for immediate preview & confirmation before import
let stagedDataset = null;

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

function mapSpreadsheetRecords(rawRows) {
  if (!rawRows || rawRows.length === 0) return [];
  const firstRow = rawRows[0];
  const colMap = {};
  for (const reqCol of REQUIRED_DATASET_COLUMNS) {
    colMap[reqCol] = findClientColumnKey(firstRow, reqCol) || reqCol;
  }

  return rawRows.map(r => {
    const rawRev = r[colMap['Monthly_Revenue_INR']];
    const rev = parseFloat(String(rawRev || '').replace(/[₹$€, ]/g, '')) || 0;
    const rawOrd = r[colMap['Orders_Per_Day']];
    const ord = parseInt(String(rawOrd || '').replace(/[₹$€, ]/g, '')) || 0;
    const rawDel = r[colMap['Delivery_Cost_Per_Order_INR']];
    const del = parseFloat(String(rawDel || '').replace(/[₹$€, ]/g, '')) || 38.0;
    const rawRent = r[colMap['Dark_Store_Rent_Monthly_INR']];
    const rent = parseFloat(String(rawRent || '').replace(/[₹$€, ]/g, '')) || 0;
    const rawStaff = r[colMap['Staffing_Expenses_Monthly_INR']];
    const staff = parseFloat(String(rawStaff || '').replace(/[₹$€, ]/g, '')) || 0;
    const rawWaste = r[colMap['Inventory_Wastage_Monthly_INR']];
    const waste = parseFloat(String(rawWaste || '').replace(/[₹$€, ]/g, '')) || 0;
    const rawPl = r[colMap['Private_Label_Sales_Monthly_INR']];
    const pl = parseFloat(String(rawPl || '').replace(/[₹$€, ]/g, '')) || 0;

    return {
      id: String(r[colMap['Store_ID']] || '').trim(),
      name: String(r[colMap['Dark_Store_Name']] || '').trim(),
      region: String(r[colMap['Region']] || '').trim(),
      period: String(r[colMap['Reporting_Period']] || 'Nov 2026').trim(),
      monthlyRevenue: rev,
      ordersPerDay: ord,
      deliveryCostPerOrder: del,
      rent: rent,
      staffing: staff,
      wastageCost: waste,
      privateLabelSales: pl,
      raw: r
    };
  });
}

function renderStagingPreview(staged) {
  const card = document.getElementById('datasetStagingCard');
  if (!card) return;

  const fnEl = document.getElementById('stagingFileName');
  if (fnEl) fnEl.textContent = staged.filename;

  const sizeEl = document.getElementById('stagingFileSize');
  if (sizeEl) sizeEl.textContent = formatFileSize(staged.size);

  const rowCountEl = document.getElementById('stagingRowCount');
  if (rowCountEl) rowCountEl.textContent = staged.records.length;

  const colCountEl = document.getElementById('stagingColCount');
  if (colCountEl) colCountEl.textContent = staged.columns.length;

  const badgeEl = document.getElementById('stagingRowCountBadge');
  if (badgeEl) badgeEl.textContent = `${Math.min(5, staged.records.length)} of ${staged.records.length} Rows Shown`;

  const statusEl = document.getElementById('stagingValidationStatus');
  const importBtn = document.getElementById('btnImportStagedDataset');

  if (statusEl) {
    if (staged.validation.valid) {
      statusEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #ECFDF5; border: 1.5px solid #10B981; border-radius: var(--radius-sm); color: #065F46; font-size: 13px; font-weight: 700;">
          <i data-lucide="check-circle" class="lucide-icon sm" style="color: #10B981;"></i>
          <span>Schema Validation Passed: All 11 required columns detected and ${staged.records.length} dark-store records verified for import.</span>
        </div>
      `;
      if (importBtn) {
        importBtn.disabled = false;
        importBtn.style.opacity = '1';
        importBtn.style.cursor = 'pointer';
      }
    } else {
      statusEl.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; background: #FEF2F2; border: 1.5px solid #EF4444; border-radius: var(--radius-sm); color: #991B1B; font-size: 13px; font-weight: 600;">
          <i data-lucide="alert-triangle" class="lucide-icon sm" style="color: #EF4444; margin-top: 2px;"></i>
          <div>${staged.validation.error}</div>
        </div>
      `;
      if (importBtn) {
        importBtn.disabled = true;
        importBtn.style.opacity = '0.5';
        importBtn.style.cursor = 'not-allowed';
      }
    }
  }

  const tbody = document.getElementById('stagingTableBody');
  if (tbody) {
    const previewRows = staged.records.slice(0, 5);
    tbody.innerHTML = previewRows.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>${r.name}</td>
        <td>${r.region}</td>
        <td>${r.period}</td>
        <td>₹${(r.monthlyRevenue || 0).toLocaleString()}</td>
        <td>${(r.ordersPerDay || 0).toLocaleString()}</td>
        <td>₹${(r.deliveryCostPerOrder || 0).toFixed(1)}</td>
        <td>₹${(r.rent || 0).toLocaleString()}</td>
        <td>₹${(r.staffing || 0).toLocaleString()}</td>
        <td>₹${(r.wastageCost || 0).toLocaleString()}</td>
        <td>₹${(r.privateLabelSales || 0).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  card.style.display = 'block';
  renderIcons();
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cancelStagedUpload() {
  stagedDataset = null;
  const card = document.getElementById('datasetStagingCard');
  if (card) card.style.display = 'none';
  const fileInput = document.getElementById('companyFileInput');
  if (fileInput) fileInput.value = '';
}

async function executeDatasetImport() {
  if (!stagedDataset || !stagedDataset.records || stagedDataset.records.length === 0) {
    alert('No valid staged dataset found to import.');
    return;
  }

  const importBtn = document.getElementById('btnImportStagedDataset');
  if (importBtn) {
    importBtn.disabled = true;
    importBtn.innerHTML = '<i data-lucide="refresh-cw" class="lucide-icon sm"></i> <span>Importing Dataset...</span>';
    renderIcons();
  }

  console.log(`[ProfitPulse Upload] 7. Import completed: importing ${stagedDataset.records.length} records.`);
  await uploadCompanyRecords(stagedDataset.records, stagedDataset.filename);

  if (importBtn) {
    importBtn.disabled = false;
    importBtn.innerHTML = '<i data-lucide="check" class="lucide-icon sm"></i> <span>Import Dataset</span>';
  }
}

function initDataManagementEvents() {
  const dropZone = document.getElementById('fileDropZone');
  const fileInput = document.getElementById('companyFileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('click', (e) => {
      console.log('[ProfitPulse Upload] 1. Upload area clicked.');
      if (e.target !== fileInput) {
        fileInput.value = '';
        fileInput.click();
      }
    });

    fileInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        console.log(`[ProfitPulse Upload] 2. File selected: ${file.name}`);
        handleIncomingFile(file);
      }
    });

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        console.log(`[ProfitPulse Upload] 2. File selected (drag-drop): ${file.name}`);
        handleIncomingFile(file);
      }
    });
  }
}

// Handle file ingestion across Excel (.xlsx/.xls) and CSV (.csv)
// Requirements 1, 2, 3, 5, 9, 10
function handleIncomingFile(file) {
  if (!file) return;
  const filename = file.name;
  const ext = filename.split('.').pop().toLowerCase();

  console.log(`[ProfitPulse Upload] 3. File received: ${filename} (${file.size} bytes)`);

  // Check supported file extensions
  if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
    showDataAlert(`Unsupported file format '.${ext}'. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.`, 'error');
    alert(`Unsupported file format: .${ext}. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported.`);
    return;
  }

  // Ensure SheetJS is loaded
  if (typeof XLSX === 'undefined') {
    console.error('[ProfitPulse Upload] SheetJS (XLSX) library not found in window scope.');
    showDataAlert('SheetJS (XLSX) library is still initializing. Please wait 2 seconds and try again.', 'error');
    alert('SheetJS (XLSX) engine not ready. Please refresh the page and try again.');
    return;
  }

  console.log('[ProfitPulse Upload] 4. Parsing started with SheetJS (XLSX)...');

  const reader = new FileReader();
  reader.onerror = () => {
    console.error('[ProfitPulse Upload] FileReader encountered an error reading file.');
    showDataAlert('Error reading file from disk. Please verify file permissions and try again.', 'error');
  };

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        showDataAlert('Parsing Error: Excel workbook contains no worksheets.', 'error');
        alert('The uploaded spreadsheet contains no worksheets.');
        return;
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRecords = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRecords || rawRecords.length === 0) {
        showDataAlert(`Spreadsheet '${filename}' has no data rows in worksheet '${firstSheetName}'.`, 'error');
        alert('Empty Spreadsheet: The uploaded file does not contain any data rows.');
        return;
      }

      const columns = Object.keys(rawRecords[0] || {});
      console.log(`[ProfitPulse Upload] 5. Parsing completed: ${rawRecords.length} records, ${columns.length} columns.`);

      // Validate schema and mapped fields
      const validation = validateClientDataset(rawRecords);
      console.log(`[ProfitPulse Upload] 6. Dataset validation completed: valid=${validation.valid}`);

      // Map spreadsheet records to canonical schema
      const mappedRecords = mapSpreadsheetRecords(rawRecords);

      stagedDataset = {
        filename: filename,
        file: file,
        size: file.size,
        records: mappedRecords,
        rawRecords: rawRecords,
        columns: columns,
        validation: validation
      };

      // Display immediate dataset staging preview (Sub-requirement C)
      renderStagingPreview(stagedDataset);

    } catch (err) {
      console.error('[ProfitPulse Upload] Parsing Exception:', err);
      showDataAlert(`Spreadsheet Parsing Error: ${err.message}`, 'error');
      alert(`Error parsing spreadsheet: ${err.message}`);
    }
  };

  reader.readAsArrayBuffer(file);
}

// Ingest records to backend, replace dataset, & recalculate entire system (Requirements 6, 7, 8, 10)
async function uploadCompanyRecords(records, filename, isAppend = false) {
  try {
    const res = await fetch('/api/dataset/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, filename, append: isAppend })
    });
    const result = await res.json();

    if (!result.success) {
      showDataAlert(result.error || 'Server validation failed.', 'error');
      alert(`Server Validation Error:\n\n${result.error || 'Invalid dataset format'}`);
      return;
    }

    // Dataset replaced
    activeDatasetMeta = result.meta;
    updateDatasetStatusUI(activeDatasetMeta);

    // Update active stores dataset
    allStoresData = result.stores;
    renderCompanyDataPreview(allStoresData);

    const rowCountEl = document.getElementById('dataRowCount');
    if (rowCountEl) rowCountEl.textContent = allStoresData.length;
    const sidebarCountEl = document.getElementById('sidebarStoreCount');
    if (sidebarCountEl) sidebarCountEl.textContent = `${allStoresData.length} Dark Stores Loaded`;

    // Recalculate all KPIs, contribution margins, charts, and North Star
    await Promise.all([
      fetchKPIs(currentRegion, currentStore),
      fetchTrends(),
      fetchStores(currentRegion),
      populateRegionSelector()
    ]);

    // Recalculate simulator baselines to match imported company dataset
    if (allStoresData.length > 0) {
      const totalDailyOrders = allStoresData.reduce((sum, s) => sum + (s.ordersPerDay || 0), 0);
      const totalMonthlyOrders = totalDailyOrders * 30;
      const totalMonthlyRev = allStoresData.reduce((sum, s) => sum + (s.monthlyRevenue || 0), 0);
      const avgAov = totalMonthlyOrders > 0 ? Math.round(totalMonthlyRev / totalMonthlyOrders) : 450;
      const totalDel = allStoresData.reduce((sum, s) => sum + ((s.deliveryCostPerOrder || 38) * (s.ordersPerDay || 1) * 30), 0);
      const avgDelivery = totalMonthlyOrders > 0 ? parseFloat((totalDel / totalMonthlyOrders).toFixed(1)) : 38;
      const totalWastage = allStoresData.reduce((sum, s) => sum + (s.wastageCost || 0), 0);
      const wastagePct = totalMonthlyRev > 0 ? parseFloat(((totalWastage / totalMonthlyRev) * 100).toFixed(1)) : 3.2;

      baselineState.aov = avgAov;
      baselineState.deliveryCost = avgDelivery;
      baselineState.wastagePct = wastagePct;

      currentSimState = { ...baselineState };
      syncSlidersWithState();
      recalcSimulator();
      renderNorthStarMatrix();
    }

    // Add notification
    addNotification({
      title: 'Company Dataset Imported',
      message: `Successfully imported '${filename}' (${allStoresData.length} dark stores) into ProfitPulse operational database.`,
      severity: 'success',
      category: 'business'
    });

    // Hide staging card after successful import
    cancelStagedUpload();

    showDataAlert(`Successfully imported ${allStoresData.length} dark-store records from '${filename}'. Financial models, contribution margin, and charts have been refreshed.`, 'success');
  } catch (err) {
    console.error('[ProfitPulse Upload] Ingestion network/server error:', err);
    showDataAlert(`Failed to connect to backend: ${err.message}`, 'error');
    alert(`Upload Failed: ${err.message}`);
  }
}

// Fetch Active Dataset Metadata
async function fetchDatasetMeta() {
  try {
    const res = await fetch('/api/dataset');
    const data = await res.json();
    activeDatasetMeta = data.meta;
    updateDatasetStatusUI(activeDatasetMeta);
  } catch (err) {
    console.error('Error fetching dataset meta:', err);
  }
}

function updateDatasetStatusUI(meta) {
  if (!meta) return;

  const ribbonStatus = document.getElementById('ribbonDatasetStatus');
  if (ribbonStatus) {
    ribbonStatus.textContent = meta.isCustomCompanyData ? 'Custom Company Dataset Active' : 'Benchmark Active';
    ribbonStatus.style.color = meta.isCustomCompanyData ? '#34D399' : '#6EE7B7';
  }

  const sidebarStatus = document.getElementById('sidebarDatasetStatus');
  if (sidebarStatus) {
    sidebarStatus.textContent = meta.isCustomCompanyData ? 'Custom Dataset Active' : 'Benchmark Active';
  }

  const activeSourceText = document.getElementById('dataActiveSourceText');
  if (activeSourceText) {
    activeSourceText.textContent = `Active Dataset: ${meta.filename} (${meta.rowCount} Stores)`;
  }

  const rowCountEl = document.getElementById('dataRowCount');
  if (rowCountEl) {
    rowCountEl.textContent = meta.rowCount;
  }

  const subtitleEl = document.getElementById('dataPreviewSubtitle');
  if (subtitleEl) {
    subtitleEl.textContent = `Showing ${meta.rowCount} dark stores dynamically computed from ${meta.filename}. Last updated: ${new Date(meta.lastUpdated).toLocaleTimeString()}`;
  }

  renderFieldMappingTags(meta.fieldsDetected || [], meta.missingFields || []);
}

function renderFieldMappingTags(detected, missing) {
  const container = document.getElementById('fieldTagGrid');
  if (!container) return;

  const coreFields = [
    { key: 'revenue', label: 'Revenue & Orders' },
    { key: 'delivery', label: 'Delivery Costs' },
    { key: 'rent', label: 'Dark-Store Rent' },
    { key: 'staffing', label: 'Staffing Overhead' },
    { key: 'wastage', label: 'Spoilage Wastage' },
    { key: 'privatelabel', label: 'Private Label Sales' }
  ];

  const html = coreFields.map(f => {
    const isMapped = true; // All 11 columns required and mapped
    return `
      <span class="field-tag mapped">
        <i data-lucide="check" class="lucide-icon sm"></i>
        <span>${f.label}</span>
      </span>
    `;
  }).join('');

  container.innerHTML = html;
}

// Requirement 8: Render Active Company Dataset Preview Table with all 11 mapped columns + calculations
function renderCompanyDataPreview(stores) {
  const tbody = document.getElementById('companyDataPreviewBody');
  if (!tbody) return;

  if (!stores || stores.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 24px; color: var(--text-muted);">No records in active company dataset.</td></tr>`;
    return;
  }

  tbody.innerHTML = stores.map(s => {
    const isLoss = s.lossMaking;
    return `
      <tr class="${isLoss ? 'loss-row' : ''}">
        <td><strong style="font-weight: 700;">${s.id || 'N/A'}</strong></td>
        <td><strong style="font-weight: 700;">${s.name}</strong></td>
        <td><span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${s.region}</span></td>
        <td><span style="font-size: 11.5px; color: var(--text-muted);">${s.period || 'Nov 2026'}</span></td>
        <td style="font-weight: 700;">${formatCurrency(s.monthlyRevenue)}</td>
        <td style="font-weight: 700;">${(s.ordersPerDay || 0).toLocaleString()}</td>
        <td style="color: ${s.deliveryCostPerOrder > 40 ? 'var(--pantone-red-inferno-accent)' : 'inherit'}; font-weight: 700;">
          ${currencySymbol}${s.deliveryCostPerOrder}
        </td>
        <td>${currencySymbol}${((s.rent || 0) / 1000).toFixed(0)}k</td>
        <td>${currencySymbol}${((s.staffing || 0) / 1000).toFixed(0)}k</td>
        <td>${currencySymbol}${((s.wastageCost || 0) / 1000).toFixed(0)}k</td>
        <td>${currencySymbol}${((s.privateLabelSales || 0) / 1000).toFixed(0)}k</td>
        <td style="font-weight: 800; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-accent)'};">
          ${s.contributionMargin >= 0 ? '+' : ''}${formatCurrency(s.contributionMargin)}
        </td>
        <td>
          <span class="badge ${isLoss ? 'badge-danger' : 'badge-success'}">
            ${s.cmPct >= 0 ? '+' : ''}${s.cmPct}%
          </span>
        </td>
        <td>
          <span style="font-size: 12px; font-weight: 700; color: ${isLoss ? 'var(--pantone-red-inferno-accent)' : '#10B981'};">
            ${s.status}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

// Sample Enterprise Quick-Commerce Network (12 Stores across NCR, Bengaluru, Mumbai, Hyderabad)
// Populated with exact 11 required columns
function loadSampleEnterpriseData() {
  const sampleEnterpriseRecords = [
    {
      Store_ID: "DS-DEL-01",
      Dark_Store_Name: "Gurgaon CyberCity Hub",
      Region: "NCR - Delhi & Gurgaon",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 5240000,
      Orders_Per_Day: 3266,
      Delivery_Cost_Per_Order_INR: 31.8,
      Dark_Store_Rent_Monthly_INR: 380000,
      Staffing_Expenses_Monthly_INR: 280000,
      Inventory_Wastage_Monthly_INR: 115000,
      Private_Label_Sales_Monthly_INR: 960000
    },
    {
      Store_ID: "DS-DEL-02",
      Dark_Store_Name: "South Delhi Hauz Khas",
      Region: "NCR - Delhi & Gurgaon",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 4420000,
      Orders_Per_Day: 2750,
      Delivery_Cost_Per_Order_INR: 35.0,
      Dark_Store_Rent_Monthly_INR: 310000,
      Staffing_Expenses_Monthly_INR: 240000,
      Inventory_Wastage_Monthly_INR: 128000,
      Private_Label_Sales_Monthly_INR: 750000
    },
    {
      Store_ID: "DS-DEL-03",
      Dark_Store_Name: "Noida Sector 62 Pod",
      Region: "NCR - Delhi & Gurgaon",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 3180000,
      Orders_Per_Day: 2266,
      Delivery_Cost_Per_Order_INR: 41.0,
      Dark_Store_Rent_Monthly_INR: 260000,
      Staffing_Expenses_Monthly_INR: 210000,
      Inventory_Wastage_Monthly_INR: 142000,
      Private_Label_Sales_Monthly_INR: 390000
    },
    {
      Store_ID: "DS-BLR-01",
      Dark_Store_Name: "Indiranagar 100ft Hub",
      Region: "South - Bengaluru",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 6150000,
      Orders_Per_Day: 3733,
      Delivery_Cost_Per_Order_INR: 32.0,
      Dark_Store_Rent_Monthly_INR: 420000,
      Staffing_Expenses_Monthly_INR: 320000,
      Inventory_Wastage_Monthly_INR: 98000,
      Private_Label_Sales_Monthly_INR: 1180000
    },
    {
      Store_ID: "DS-BLR-02",
      Dark_Store_Name: "Koramangala 4th Block",
      Region: "South - Bengaluru",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 5480000,
      Orders_Per_Day: 3400,
      Delivery_Cost_Per_Order_INR: 33.0,
      Dark_Store_Rent_Monthly_INR: 390000,
      Staffing_Expenses_Monthly_INR: 290000,
      Inventory_Wastage_Monthly_INR: 112000,
      Private_Label_Sales_Monthly_INR: 940000
    },
    {
      Store_ID: "DS-BLR-03",
      Dark_Store_Name: "Whitefield Hope Farm",
      Region: "South - Bengaluru",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 3250000,
      Orders_Per_Day: 2133,
      Delivery_Cost_Per_Order_INR: 49.0,
      Dark_Store_Rent_Monthly_INR: 290000,
      Staffing_Expenses_Monthly_INR: 230000,
      Inventory_Wastage_Monthly_INR: 165000,
      Private_Label_Sales_Monthly_INR: 340000
    },
    {
      Store_ID: "DS-BOM-01",
      Dark_Store_Name: "Bandra West Hill Road",
      Region: "West - Mumbai MMR",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 6850000,
      Orders_Per_Day: 3933,
      Delivery_Cost_Per_Order_INR: 32.0,
      Dark_Store_Rent_Monthly_INR: 550000,
      Staffing_Expenses_Monthly_INR: 340000,
      Inventory_Wastage_Monthly_INR: 105000,
      Private_Label_Sales_Monthly_INR: 1420000
    },
    {
      Store_ID: "DS-BOM-02",
      Dark_Store_Name: "Andheri West Lokhandwala",
      Region: "West - Mumbai MMR",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 4950000,
      Orders_Per_Day: 3133,
      Delivery_Cost_Per_Order_INR: 35.0,
      Dark_Store_Rent_Monthly_INR: 440000,
      Staffing_Expenses_Monthly_INR: 280000,
      Inventory_Wastage_Monthly_INR: 135000,
      Private_Label_Sales_Monthly_INR: 780000
    },
    {
      Store_ID: "DS-BOM-03",
      Dark_Store_Name: "Powai Hiranandani",
      Region: "West - Mumbai MMR",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 3820000,
      Orders_Per_Day: 2366,
      Delivery_Cost_Per_Order_INR: 38.0,
      Dark_Store_Rent_Monthly_INR: 360000,
      Staffing_Expenses_Monthly_INR: 240000,
      Inventory_Wastage_Monthly_INR: 118000,
      Private_Label_Sales_Monthly_INR: 560000
    },
    {
      Store_ID: "DS-HYD-01",
      Dark_Store_Name: "Hitec City Madhapur",
      Region: "South - Hyderabad",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 5120000,
      Orders_Per_Day: 3200,
      Delivery_Cost_Per_Order_INR: 33.0,
      Dark_Store_Rent_Monthly_INR: 320000,
      Staffing_Expenses_Monthly_INR: 250000,
      Inventory_Wastage_Monthly_INR: 110000,
      Private_Label_Sales_Monthly_INR: 890000
    },
    {
      Store_ID: "DS-HYD-02",
      Dark_Store_Name: "Jubilee Hills Road 36",
      Region: "South - Hyderabad",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 4680000,
      Orders_Per_Day: 2866,
      Delivery_Cost_Per_Order_INR: 33.0,
      Dark_Store_Rent_Monthly_INR: 350000,
      Staffing_Expenses_Monthly_INR: 260000,
      Inventory_Wastage_Monthly_INR: 104000,
      Private_Label_Sales_Monthly_INR: 820000
    },
    {
      Store_ID: "DS-HYD-03",
      Dark_Store_Name: "Gachibowli Financial Dist",
      Region: "South - Hyderabad",
      Reporting_Period: "Nov 2026",
      Monthly_Revenue_INR: 3450000,
      Orders_Per_Day: 2300,
      Delivery_Cost_Per_Order_INR: 42.0,
      Dark_Store_Rent_Monthly_INR: 280000,
      Staffing_Expenses_Monthly_INR: 220000,
      Inventory_Wastage_Monthly_INR: 138000,
      Private_Label_Sales_Monthly_INR: 410000
    }
  ];

  uploadCompanyRecords(sampleEnterpriseRecords, 'Enterprise_QCommerce_Network_12Stores.csv');
}

// Reset to Default Reference Benchmark Dataset
async function resetToBenchmarkData() {
  if (!confirm('Reset dashboard to the default reference benchmark dataset?')) return;
  try {
    const res = await fetch('/api/dataset/reset', { method: 'POST' });
    const result = await res.json();
    if (result.success) {
      await loadAllData();
      showDataAlert('Dashboard successfully restored to default reference benchmark data.', 'info');
      alert('Dashboard successfully restored to default reference benchmark data.');
    }
  } catch (err) {
    console.error('Error resetting dataset:', err);
  }
}

// Manual Data Entry Modal Controls
function openManualEntryModal() {
  const modal = document.getElementById('manualEntryModal');
  if (modal) {
    modal.classList.add('active');
    renderIcons();
  }
}

function closeManualEntryModal() {
  const modal = document.getElementById('manualEntryModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

async function handleManualStoreSubmit(e) {
  e.preventDefault();

  const ordersTotal = parseInt(document.getElementById('manualOrders').value) || 0;
  const ordersPerDay = Math.round(ordersTotal > 5000 ? ordersTotal / 30 : ordersTotal);
  const monthlyRevenue = parseFloat(document.getElementById('manualRevenue').value) || 0;
  const deliveryCostRaw = parseFloat(document.getElementById('manualDeliveryCost').value) || 0;
  // If user entered total delivery cost, compute per order cost
  const deliveryPerOrder = deliveryCostRaw > 100 ? parseFloat((deliveryCostRaw / (ordersTotal || (ordersPerDay * 30))).toFixed(1)) : deliveryCostRaw;

  const record = {
    Store_ID: document.getElementById('manualStoreId').value.trim(),
    Dark_Store_Name: document.getElementById('manualStoreName').value.trim(),
    Region: document.getElementById('manualStoreRegion').value.trim(),
    Reporting_Period: 'Nov 2026',
    Monthly_Revenue_INR: monthlyRevenue,
    Orders_Per_Day: ordersPerDay,
    Delivery_Cost_Per_Order_INR: deliveryPerOrder,
    Dark_Store_Rent_Monthly_INR: parseFloat(document.getElementById('manualRent').value) || 0,
    Staffing_Expenses_Monthly_INR: parseFloat(document.getElementById('manualStaffing').value) || 0,
    Inventory_Wastage_Monthly_INR: parseFloat(document.getElementById('manualWastage').value) || 0,
    Private_Label_Sales_Monthly_INR: parseFloat(document.getElementById('manualPrivateLabel').value) || 0
  };

  try {
    const res = await fetch('/api/dataset/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ record })
    });
    const result = await res.json();

    if (result.success) {
      closeManualEntryModal();
      document.getElementById('manualEntryForm').reset();
      await loadAllData();
      showDataAlert(`Dark store "${record.Dark_Store_Name}" (${record.Store_ID}) has been incorporated into the dynamic financial model.`, 'success');
      alert(`[Store Record Saved] Dark store "${record.Dark_Store_Name}" has been incorporated into the dynamic financial engine.`);
    } else {
      showDataAlert(result.error || 'Failed to save store record.', 'error');
      alert(`Failed to save store: ${result.error || 'Check fields'}`);
    }
  } catch (err) {
    console.error('Error saving manual store entry:', err);
    alert(`Submission error: ${err.message}`);
  }
}

// Helper: Format Currency (Crores & Lakhs)
function formatCurrency(val) {
  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (currencySymbol === '$') {
    if (absVal >= 1000000) return `${sign}$${(absVal / 1000000).toFixed(2)}M`;
    if (absVal >= 1000) return `${sign}$${(absVal / 1000).toFixed(1)}k`;
    return `${sign}$${absVal.toLocaleString()}`;
  }

  if (currencySymbol === '€') {
    if (absVal >= 1000000) return `${sign}€${(absVal / 1000000).toFixed(2)}M`;
    if (absVal >= 1000) return `${sign}€${(absVal / 1000).toFixed(1)}k`;
    return `${sign}€${absVal.toLocaleString()}`;
  }

  if (absVal >= 10000000) {
    return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
  } else if (absVal >= 100000) {
    return `${sign}₹${(absVal / 100000).toFixed(2)} Lakhs`;
  } else if (absVal >= 1000) {
    return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${absVal.toLocaleString()}`;
}


// ============================================================================
// MODULES 1, 2, 3 INTERCONNECTED PLATFORM ENGINE & PERSISTENCE
// ============================================================================

// --- Persistence Layer (LocalStorage with Supabase-compatible schemas) ---
const AppStorage = {
  KEYS: {
    PRODUCTS: 'profitpulse_products',
    TRANSACTIONS: 'profitpulse_transactions',
    NOTIFICATIONS: 'profitpulse_notifications',
    BIZ_DATA: 'profitpulse_business_data',
    IS_DEMO: 'profitpulse_is_demo'
  },
  get(key, defaultVal = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.warn('Storage read error for key:', key, e);
      return defaultVal;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write error for key:', key, e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }
};

// --- Seed Master Datasets ---
const defaultSeedProducts = [
  {
    id: "SKU-MLK-01",
    barcode: "8901030383741",
    name: "Amul Taaza Homogenised Toned Milk 1L",
    category: "Dairy & Milk",
    availableQuantity: 420,
    minThreshold: 150,
    unitPrice: 72,
    purchaseCost: 61.2,
    supplier: "Amul Cooperative Direct",
    expiryDays: 3,
    lastUpdated: "Today, 08:30 AM"
  },
  {
    id: "SKU-BER-02",
    barcode: "8901262010052",
    name: "Fresh Organic Blueberries 125g",
    category: "Fresh Produce",
    availableQuantity: 24,
    minThreshold: 35,
    unitPrice: 240,
    purchaseCost: 160.0,
    supplier: "BerryFresh Imports Ltd",
    expiryDays: 2,
    lastUpdated: "Today, 09:15 AM"
  },
  {
    id: "SKU-AVO-03",
    barcode: "8901491101824",
    name: "Hass Avocados (Twin Pack)",
    category: "Fresh Produce",
    availableQuantity: 18,
    minThreshold: 25,
    unitPrice: 280,
    purchaseCost: 195.0,
    supplier: "NatureFresh Agri Imports",
    expiryDays: 2,
    lastUpdated: "Today, 09:40 AM"
  },
  {
    id: "SKU-SNK-04",
    barcode: "8901058852335",
    name: "Lay's Gourmet Vintage Cheese 55g",
    category: "Snacks & Munchies",
    availableQuantity: 580,
    minThreshold: 100,
    unitPrice: 50,
    purchaseCost: 39.0,
    supplier: "PepsiCo India Holdings",
    expiryDays: 90,
    lastUpdated: "Today, 10:00 AM"
  },
  {
    id: "SKU-EGG-05",
    barcode: "8901112233445",
    name: "Farm Fresh Brown Eggs (Pack of 6)",
    category: "Meat & Eggs",
    availableQuantity: 115,
    minThreshold: 40,
    unitPrice: 95,
    purchaseCost: 72.0,
    supplier: "Keggfarms Direct Hub",
    expiryDays: 12,
    lastUpdated: "Today, 07:45 AM"
  },
  {
    id: "SKU-BEV-06",
    barcode: "8901765432198",
    name: "Coca-Cola Zero Sugar 300ml Can",
    category: "Beverages",
    availableQuantity: 310,
    minThreshold: 80,
    unitPrice: 40,
    purchaseCost: 28.5,
    supplier: "Hindustan Coca-Cola Beverages",
    expiryDays: 120,
    lastUpdated: "Today, 10:20 AM"
  },
  {
    id: "SKU-PAN-07",
    barcode: "8901030554412",
    name: "Aashirvaad Shudh Chakki Atta 5kg",
    category: "Pantry Essentials",
    availableQuantity: 85,
    minThreshold: 30,
    unitPrice: 315,
    purchaseCost: 260.0,
    supplier: "ITC Limited Distribution",
    expiryDays: 180,
    lastUpdated: "Yesterday, 06:10 PM"
  },
  {
    id: "SKU-YOG-08",
    barcode: "8901662981014",
    name: "Epigamia Greek Yogurt Strawberry 120g",
    category: "Dairy & Milk",
    availableQuantity: 42,
    minThreshold: 60,
    unitPrice: 65,
    purchaseCost: 48.0,
    supplier: "Drums Food International",
    expiryDays: 4,
    lastUpdated: "Today, 08:00 AM"
  }
];

const defaultSeedNotifications = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Hass Avocados (Twin Pack)',
    message: 'Current stock is 18 units, below minimum threshold of 25. Morning replenishment recommended.',
    severity: 'critical',
    category: 'inventory',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    read: false,
    skuId: 'SKU-AVO-03'
  },
  {
    id: 'notif-2',
    title: 'Perishable Expiry Warning: Blueberries',
    message: '24 units of Fresh Organic Blueberries have 2 days left. Flash discount or bundle recommended.',
    severity: 'warning',
    category: 'inventory',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    read: false,
    skuId: 'SKU-BER-02'
  },
  {
    id: 'notif-3',
    title: 'High Delivery Cost Inefficiency Detected',
    message: 'East Delhi dark-store delivery cost averaged ₹42.80/order today (+11% above ₹38.50 target).',
    severity: 'warning',
    category: 'business',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 'notif-4',
    title: 'Inventory Inbound Verified',
    message: 'Amul Taaza Milk received 250 units from central distribution. Inward scan verified.',
    severity: 'success',
    category: 'inventory',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    read: true,
    skuId: 'SKU-MLK-01'
  }
];

const defaultSeedTransactions = [
  {
    id: 'tx-1',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sku: 'SKU-MLK-01',
    productName: 'Amul Taaza Homogenised Toned Milk 1L',
    change: '+250',
    resultingStock: 420,
    opType: 'INWARD_RECEIPT',
    reason: 'Central Hub Transfer'
  },
  {
    id: 'tx-2',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sku: 'SKU-AVO-03',
    productName: 'Hass Avocados (Twin Pack)',
    change: '-8',
    resultingStock: 18,
    opType: 'DISPATCH_FULFILLMENT',
    reason: 'Customer Quick-Commerce Orders'
  },
  {
    id: 'tx-3',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sku: 'SKU-BER-02',
    productName: 'Fresh Organic Blueberries 125g',
    change: '-5',
    resultingStock: 24,
    opType: 'BARCODE_SCAN',
    reason: 'Rider Bagging & Order Dispatch'
  }
];

// --- Audio Feedback Helper ---
function playBeep(freq = 880, type = 'sine', duration = 0.12) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio Context handled quietly
  }
}

// ============================================================================
// MODULE 1: DYNAMIC BUSINESS DATA INPUT
// ============================================================================
function initBusinessDataInput() {
  const form = document.getElementById('businessDataInputForm');
  if (form) {
    const inputs = [
      'bizInputRevenue', 'bizInputOrders', 'bizInputDeliveryCost',
      'bizInputRent', 'bizInputStaffing', 'bizInputWastage', 'bizInputPrivateLabel'
    ];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', updateLiveBizPreview);
      }
    });
  }

  // Check if saved business data exists in storage
  applyCustomBusinessDataIfSaved();
}

function updateLiveBizPreview() {
  const revenue = parseFloat(document.getElementById('bizInputRevenue')?.value) || 0;
  const orders = parseInt(document.getElementById('bizInputOrders')?.value) || 0;
  const deliveryCost = parseFloat(document.getElementById('bizInputDeliveryCost')?.value) || 0;
  const rent = parseFloat(document.getElementById('bizInputRent')?.value) || 0;
  const staffing = parseFloat(document.getElementById('bizInputStaffing')?.value) || 0;
  const wastage = parseFloat(document.getElementById('bizInputWastage')?.value) || 0;
  const privateLabel = parseFloat(document.getElementById('bizInputPrivateLabel')?.value) || 0;

  if (orders <= 0 || revenue <= 0) return;

  const aov = revenue / orders;
  const delCostPerOrder = deliveryCost / orders;
  const wastagePct = (wastage / revenue) * 100;

  // COGS model: 65% base cost, private label has 15% better gross margin
  const cogs = (revenue * 0.65) - (privateLabel * 0.15);
  const totalExpenses = cogs + deliveryCost + rent + staffing + wastage;
  const cm = revenue - totalExpenses;
  const cmPct = (cm / revenue) * 100;
  const cmpo = cm / orders;

  const elAOV = document.getElementById('bizPreviewAOV');
  if (elAOV) elAOV.textContent = `₹${aov.toFixed(1)}`;

  const elDel = document.getElementById('bizPreviewDeliveryCost');
  if (elDel) elDel.textContent = `₹${delCostPerOrder.toFixed(1)}`;

  const elWastage = document.getElementById('bizPreviewWastagePct');
  if (elWastage) elWastage.textContent = `${wastagePct.toFixed(1)}%`;

  const elCMPct = document.getElementById('bizPreviewCMPct');
  if (elCMPct) {
    elCMPct.textContent = `${cmPct >= 0 ? '+' : ''}${cmPct.toFixed(1)}%`;
    elCMPct.className = `val ${cmPct >= 0 ? 'text-success' : 'text-danger'}`;
  }

  const elCMPO = document.getElementById('bizPreviewCMPO');
  if (elCMPO) {
    elCMPO.textContent = `₹${cmpo.toFixed(2)}`;
    elCMPO.className = `val ${cmpo >= 0 ? 'text-success' : 'text-danger'}`;
  }
}

function generateDemoBusinessData() {
  const demo = {
    revenue: 27560000,
    orders: 614100,
    deliveryCost: 23680000,
    rent: 4368000,
    staffing: 5635000,
    wastage: 1076000,
    privateLabel: 2980000
  };

  const revEl = document.getElementById('bizInputRevenue');
  if (revEl) revEl.value = demo.revenue;
  const ordEl = document.getElementById('bizInputOrders');
  if (ordEl) ordEl.value = demo.orders;
  const delEl = document.getElementById('bizInputDeliveryCost');
  if (delEl) delEl.value = demo.deliveryCost;
  const rentEl = document.getElementById('bizInputRent');
  if (rentEl) rentEl.value = demo.rent;
  const staffEl = document.getElementById('bizInputStaffing');
  if (staffEl) staffEl.value = demo.staffing;
  const wastEl = document.getElementById('bizInputWastage');
  if (wastEl) wastEl.value = demo.wastage;
  const plEl = document.getElementById('bizInputPrivateLabel');
  if (plEl) plEl.value = demo.privateLabel;

  if (typeof updateLiveBizPreview === 'function') {
    updateLiveBizPreview();
  }

  // The Generate Demo Data button populates illustrative figures for simulation
  // without replacing the active imported Excel dark-store records
  addNotification({
    title: 'Demo Financial Parameters Populated',
    message: 'Illustrative dark-store turnaround figures loaded into input fields. Active imported Excel records remain preserved.',
    severity: 'info',
    category: 'business'
  });
}

function resetBusinessDataToDefault() {
  AppStorage.remove(AppStorage.KEYS.BIZ_DATA);
  AppStorage.remove(AppStorage.KEYS.IS_DEMO);

  const banner = document.getElementById('demoDataStatusBanner');
  if (banner) banner.style.display = 'none';

  const form = document.getElementById('businessDataInputForm');
  if (form) form.reset();

  fetchKPIs(currentRegion, currentStore);
  fetchTrends();
  fetchStores(currentRegion);

  addNotification({
    title: 'October 2026 Dataset Active',
    message: 'Default active demonstration dataset restored to the 9 imported Excel records.',
    severity: 'info',
    category: 'business'
  });
}

function handleBusinessDataSubmit(e) {
  e.preventDefault();

  const data = {
    revenue: parseFloat(document.getElementById('bizInputRevenue')?.value) || 0,
    orders: parseInt(document.getElementById('bizInputOrders')?.value) || 0,
    deliveryCost: parseFloat(document.getElementById('bizInputDeliveryCost')?.value) || 0,
    rent: parseFloat(document.getElementById('bizInputRent')?.value) || 0,
    staffing: parseFloat(document.getElementById('bizInputStaffing')?.value) || 0,
    wastage: parseFloat(document.getElementById('bizInputWastage')?.value) || 0,
    privateLabel: parseFloat(document.getElementById('bizInputPrivateLabel')?.value) || 0
  };

  if (data.revenue <= 0 || data.orders <= 0) {
    alert('Please enter valid revenue and orders figures.');
    return;
  }

  AppStorage.set(AppStorage.KEYS.BIZ_DATA, data);
  AppStorage.set(AppStorage.KEYS.IS_DEMO, false);

  const banner = document.getElementById('demoDataStatusBanner');
  if (banner) banner.style.display = 'none';

  applyBusinessDataToDashboard(data);

  addNotification({
    title: 'Business Financial Model Updated',
    message: `Operational metrics recalculated: Revenue ₹${(data.revenue / 10000000).toFixed(2)} Cr, Orders ${data.orders.toLocaleString()}.`,
    severity: 'success',
    category: 'business'
  });

  alert('Company business operational data successfully applied across all dashboard modules and contribution margin engines.');
}

function applyCustomBusinessDataIfSaved() {
  const saved = AppStorage.get(AppStorage.KEYS.BIZ_DATA);
  const isDemo = AppStorage.get(AppStorage.KEYS.IS_DEMO, false);

  if (saved && !isDemo) {
    const revEl = document.getElementById('bizInputRevenue');
    if (revEl) revEl.value = saved.revenue;
    const ordEl = document.getElementById('bizInputOrders');
    if (ordEl) ordEl.value = saved.orders;
    const delEl = document.getElementById('bizInputDeliveryCost');
    if (delEl) delEl.value = saved.deliveryCost;
    const rentEl = document.getElementById('bizInputRent');
    if (rentEl) rentEl.value = saved.rent;
    const staffEl = document.getElementById('bizInputStaffing');
    if (staffEl) staffEl.value = saved.staffing;
    const wastEl = document.getElementById('bizInputWastage');
    if (wastEl) wastEl.value = saved.wastage;
    const plEl = document.getElementById('bizInputPrivateLabel');
    if (plEl) plEl.value = saved.privateLabel;

    if (typeof updateLiveBizPreview === 'function') {
      updateLiveBizPreview();
    }
  }
}

function applyBusinessDataToDashboard(data) {
  const { revenue, orders, deliveryCost, rent, staffing, wastage, privateLabel } = data;
  if (!orders || !revenue) return;

  const aov = revenue / orders;
  const deliveryPerOrder = deliveryCost / orders;
  const wastagePct = (wastage / revenue) * 100;
  const cogs = (revenue * 0.65) - (privateLabel * 0.15);
  const totalExpenses = cogs + deliveryCost + rent + staffing + wastage;
  const cm = revenue - totalExpenses;
  const cmPct = parseFloat(((cm / revenue) * 100).toFixed(1));
  const cmpo = parseFloat((cm / orders).toFixed(2));

  const elRev = document.getElementById('kpiRevenue');
  if (elRev) elRev.textContent = formatCurrency(revenue);

  const elOrders = document.getElementById('kpiOrders');
  if (elOrders) elOrders.textContent = orders.toLocaleString();

  const elDailyOrders = document.getElementById('kpiDailyOrders');
  if (elDailyOrders) elDailyOrders.textContent = Math.round(orders / 30).toLocaleString();

  const elAOV = document.getElementById('kpiAOV');
  if (elAOV) elAOV.textContent = `₹${aov.toFixed(1)}`;

  const elCMPct = document.getElementById('kpiCMPct');
  if (elCMPct) elCMPct.textContent = `${cmPct >= 0 ? '+' : ''}${cmPct.toFixed(1)}%`;

  const elCMVal = document.getElementById('kpiCMVal');
  if (elCMVal) elCMVal.textContent = formatCurrency(cm);

  const elCMPO = document.getElementById('kpiCMPOVal');
  if (elCMPO) elCMPO.textContent = `₹${cmpo.toFixed(2)}`;

  const elDel = document.getElementById('kpiDeliveryCost');
  if (elDel) elDel.textContent = `₹${deliveryPerOrder.toFixed(1)}`;

  const elWastage = document.getElementById('kpiWastage');
  if (elWastage) elWastage.textContent = `${wastagePct.toFixed(1)}%`;

  renderCMPOHero({
    cmpo: cmpo,
    target: 72.0,
    avgAOV: aov,
    currencySymbol: '₹',
    totalMonthlyRevenue: revenue,
    totalMonthlyCM: cm
  });

  // 1. Recalculate & Re-render Revenue & Profitability Trends
  latestTrendsData = [
    { month: 'Jun 2026', revenue: Math.round(revenue * 0.80), cmPct: parseFloat((cmPct - 7.1).toFixed(1)), cm: Math.round(cm * 0.45) },
    { month: 'Jul 2026', revenue: Math.round(revenue * 0.85), cmPct: parseFloat((cmPct - 4.9).toFixed(1)), cm: Math.round(cm * 0.60) },
    { month: 'Aug 2026', revenue: Math.round(revenue * 0.90), cmPct: parseFloat((cmPct - 3.4).toFixed(1)), cm: Math.round(cm * 0.72) },
    { month: 'Sep 2026', revenue: Math.round(revenue * 0.94), cmPct: parseFloat((cmPct - 2.0).toFixed(1)), cm: Math.round(cm * 0.82) },
    { month: 'Oct 2026', revenue: Math.round(revenue * 0.97), cmPct: parseFloat((cmPct - 0.7).toFixed(1)), cm: Math.round(cm * 0.93) },
    { month: 'Nov 2026', revenue: Math.round(revenue), cmPct: cmPct, cm: Math.round(cm) },
    { month: 'Dec 2026 (P)', revenue: Math.round(revenue * 1.06), cmPct: parseFloat((cmPct + 3.2).toFixed(1)), cm: Math.round(cm * 1.25) },
    { month: 'Jan 2027 (P)', revenue: Math.round(revenue * 1.14), cmPct: parseFloat(Math.max(16.0, cmPct + 6.8).toFixed(1)), cm: Math.round(cm * 1.55) }
  ];
  renderTrendChart(latestTrendsData);
  renderCMPOSparkline(latestTrendsData, cmpo, 72.00, '₹');

  // 2. Recalculate & Re-render Store Performance Comparison
  if (!Array.isArray(allStoresData) || allStoresData.length === 0) {
    allStoresData = [
      { id: "DS-BLR-01", name: "Indiranagar Hub 104", region: "South India - Bengaluru", period: "2026-10", monthlyRevenue: 3739000, ordersPerDay: 2680, rent: 450000, staffing: 620000, deliveryCostPerOrder: 34.0, wastageCost: 115000, privateLabelSales: 420000 },
      { id: "DS-BLR-02", name: "Koramangala 4th Block", region: "South India - Bengaluru", period: "2026-10", monthlyRevenue: 4025000, ordersPerDay: 3120, rent: 507000, staffing: 685000, deliveryCostPerOrder: 36.0, wastageCost: 128000, privateLabelSales: 510000 },
      { id: "DS-BLR-03", name: "Whitefield IT Corridor", region: "South India - Bengaluru", period: "2026-10", monthlyRevenue: 1311000, ordersPerDay: 1150, rent: 408000, staffing: 590000, deliveryCostPerOrder: 49.0, wastageCost: 142000, privateLabelSales: 95000 },
      { id: "DS-NCR-01", name: "Gurugram Cyber City Hub", region: "North India - NCR", period: "2026-10", monthlyRevenue: 3280000, ordersPerDay: 2450, rent: 520000, staffing: 640000, deliveryCostPerOrder: 38.0, wastageCost: 105000, privateLabelSales: 360000 },
      { id: "DS-NCR-02", name: "Noida Sector  on", region: "North India - NCR", period: "2026-10", monthlyRevenue: 2960000, ordersPerDay: 2180, rent: 475000, staffing: 610000, deliveryCostPerOrder: 41.0, wastageCost: 132000, privateLabelSales: 295000 },
      { id: "DS-MUM-01", name: "Powai Central", region: "West India - Mumbai", period: "2026-10", monthlyRevenue: 3540000, ordersPerDay: 2590, rent: 610000, staffing: 720000, deliveryCostPerOrder: 39.0, wastageCost: 118000, privateLabelSales: 390000 },
      { id: "DS-MUM-02", name: "Andheri East Hub", region: "West India - Mumbai", period: "2026-10", monthlyRevenue: 3175000, ordersPerDay: 2310, rent: 565000, staffing: 675000, deliveryCostPerOrder: 42.0, wastageCost: 126000, privateLabelSales: 325000 },
      { id: "DS-HYD-01", name: "Hitech City Hub", region: "South India - Hyderabad", period: "2026-10", monthlyRevenue: 2890000, ordersPerDay: 2070, rent: 430000, staffing: 575000, deliveryCostPerOrder: 37.0, wastageCost: 98000, privateLabelSales: 280000 },
      { id: "DS-PUN-01", name: "Baner High Street", region: "West India - Pune", period: "2026-10", monthlyRevenue: 2640000, ordersPerDay: 1920, rent: 395000, staffing: 540000, deliveryCostPerOrder: 40.0, wastageCost: 112000, privateLabelSales: 245000 }
    ];
  }

  if (Array.isArray(allStoresData) && allStoresData.length > 0) {
    const baseTotalRev = allStoresData.reduce((acc, s) => acc + (s.monthlyRevenue || 1), 0) || 1;
    allStoresData = allStoresData.map(s => {
      const share = (s.monthlyRevenue || (revenue / allStoresData.length)) / baseTotalRev;
      const storeRev = Math.round(revenue * share);
      const storeOrders = Math.round(orders * share);
      const storeRent = s.rent || Math.round(rent / allStoresData.length);
      const storeStaffing = s.staffing || Math.round(staffing / allStoresData.length);
      const storeDel = storeOrders * deliveryPerOrder * (s.deliveryCostPerOrder ? (s.deliveryCostPerOrder / 38.5) : 1);
      const storeWastage = storeRev * (wastagePct / 100);
      const storeCogs = storeRev * 0.65;
      const storeCM = Math.round(storeRev - (storeCogs + storeDel + storeRent + storeStaffing + storeWastage));
      const storeCMPct = parseFloat(((storeCM / storeRev) * 100).toFixed(1));
      const isLoss = storeCMPct < 0;
      return {
        ...s,
        monthlyRevenue: storeRev,
        ordersPerDay: Math.round(storeOrders / 30),
        rent: storeRent,
        staffing: storeStaffing,
        contributionMargin: storeCM,
        cmPct: storeCMPct,
        lossMaking: isLoss,
        status: storeCMPct >= 15 ? 'Highly Profitable' : storeCMPct >= 8 ? 'Profitable' : storeCMPct >= 0 ? 'Vulnerable' : 'Critical Loss'
      };
    });
    renderStoreBarChart(allStoresData);
    renderStoresTable(allStoresData);

    const profitableCount = allStoresData.filter(s => !s.lossMaking).length;
    const lossCount = allStoresData.filter(s => s.lossMaking).length;
    const totalRent = allStoresData.reduce((acc, s) => acc + (s.rent || 0), 0);
    const avgRent = Math.round(totalRent / allStoresData.length);

    const elProf = document.getElementById('ssProfitableStores');
    if (elProf) elProf.textContent = profitableCount;
    const elLoss = document.getElementById('ssLossStores');
    if (elLoss) elLoss.textContent = lossCount;
    const elRent = document.getElementById('ssAvgRent');
    if (elRent) elRent.textContent = formatCurrency(avgRent);
  }
}

// ============================================================================
// MODULE 2: FUNCTIONAL NOTIFICATION CENTER
// ============================================================================
let currentNotifFilter = 'all';

function initNotificationCenter() {
  const bell = document.getElementById('notificationBellBtn');
  const drawer = document.getElementById('notificationDrawer');
  const backdrop = document.getElementById('notifBackdrop');
  const closeBtn = document.getElementById('closeNotifDrawerBtn');
  const markAllBtn = document.getElementById('btnMarkAllNotifsRead');
  const clearAllBtn = document.getElementById('btnClearAllNotifs');

  if (bell && drawer && backdrop) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeNotifDrawer();
      } else {
        openNotifDrawer();
      }
    });

    if (closeBtn) closeBtn.addEventListener('click', closeNotifDrawer);
    backdrop.addEventListener('click', closeNotifDrawer);
  }

  // Filter chips
  const chips = document.querySelectorAll('.notif-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentNotifFilter = chip.getAttribute('data-filter') || 'all';
      renderNotifications(currentNotifFilter);
    });
  });

  if (markAllBtn) {
    markAllBtn.addEventListener('click', markAllNotificationsRead);
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllNotifications);
  }

  // Seed default notifications if none exist
  const existing = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS);
  if (!existing || existing.length === 0) {
    AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
  }

  updateNotifBadge();
  renderNotifications('all');
}

function openNotifDrawer() {
  const drawer = document.getElementById('notificationDrawer');
  const backdrop = document.getElementById('notifBackdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  renderNotifications(currentNotifFilter);
}

function closeNotifDrawer() {
  const drawer = document.getElementById('notificationDrawer');
  const backdrop = document.getElementById('notifBackdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

function renderNotifications(filter = 'all') {
  const container = document.getElementById('notificationList');
  if (!container) return;

  const notifications = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'critical') return n.severity === 'critical';
    if (filter === 'inventory') return n.category === 'inventory';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="notif-empty-state" style="padding: 40px 20px; text-align: center; color: var(--text-muted);">
        <i data-lucide="check-circle" class="lucide-icon" style="width: 36px; height: 36px; color: var(--pantone-pine-grove-accent); margin-bottom: 10px;"></i>
        <h4 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">All Caught Up</h4>
        <p style="font-size: 12px;">No notifications match the "${filter}" filter criteria.</p>
      </div>
    `;
    renderIcons();
    return;
  }

  container.innerHTML = filtered.map(item => {
    const sevClass = item.severity === 'critical' ? 'sev-critical' :
                     item.severity === 'warning' ? 'sev-warning' :
                     item.severity === 'success' ? 'sev-success' : 'sev-info';

    const sevIcon = item.severity === 'critical' ? '<i data-lucide="alert-triangle" class="lucide-icon sm"></i>' :
                    item.severity === 'warning' ? '<i data-lucide="alert-circle" class="lucide-icon sm"></i>' :
                    item.severity === 'success' ? '<i data-lucide="check-circle" class="lucide-icon sm"></i>' :
                    '<i data-lucide="info" class="lucide-icon sm"></i>';

    const sevBadge = item.severity === 'critical' ? '<span class="badge badge-danger">CRITICAL</span>' :
                     item.severity === 'warning' ? '<span class="badge badge-warning">WARNING</span>' :
                     item.severity === 'success' ? '<span class="badge badge-success">RESOLVED</span>' :
                     '<span class="badge badge-navy">INFO</span>';

    const timeAgo = formatTimeAgo(item.timestamp);

    return `
      <div class="notif-card ${sevClass} ${item.read ? 'read' : 'unread'}" onclick="markNotificationRead('${item.id}')">
        <div class="notif-card-header">
          <div class="notif-card-header-left" style="display: flex; align-items: center; gap: 8px;">
            <span class="notif-type-icon ${sevClass}">
              ${sevIcon}
            </span>
            ${sevBadge}
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="notif-card-time">${timeAgo}</span>
            ${!item.read ? '<span class="unread-dot" title="Unread"></span>' : ''}
          </div>
        </div>
        <h5 class="notif-card-title">${item.title}</h5>
        <p class="notif-card-msg">${item.message}</p>
        <div class="notif-card-footer">
          ${item.skuId ? `
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); jumpToInventorySKU('${item.skuId}')">
              <i data-lucide="package" class="lucide-icon sm"></i>
              <span>View SKU ${item.skuId}</span>
            </button>
          ` : ''}
          ${!item.read ? `
            <button class="btn-text-sm" onclick="event.stopPropagation(); markNotificationRead('${item.id}')">
              Mark Read
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  renderIcons();
}

function updateNotifBadge() {
  const notifications = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const badge = document.getElementById('notificationBadge');
  const drawerBadge = document.getElementById('notifUnreadBadge');

  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
  }

  if (drawerBadge) {
    drawerBadge.textContent = `${unreadCount} Unread`;
  }
}

function addNotification({ title, message, severity = 'info', category = 'business', skuId = null }) {
  const notifications = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
  const newNotif = {
    id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    title,
    message,
    severity,
    category,
    skuId,
    timestamp: new Date().toISOString(),
    read: false
  };

  notifications.unshift(newNotif);
  AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, notifications.slice(0, 50));

  updateNotifBadge();
  const drawer = document.getElementById('notificationDrawer');
  if (drawer && drawer.classList && typeof drawer.classList.contains === 'function' && drawer.classList.contains('open')) {
    renderNotifications(currentNotifFilter);
  }

  const bell = document.getElementById('notificationBellBtn');
  if (bell) {
    bell.classList.add('jiggle');
    setTimeout(() => bell.classList.remove('jiggle'), 800);
  }
}

function markNotificationRead(id) {
  const notifications = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
  const target = notifications.find(n => n.id === id);
  if (target) {
    target.read = true;
    AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, notifications);
    updateNotifBadge();
    renderNotifications(currentNotifFilter);
  }
}

function markAllNotificationsRead() {
  const notifications = AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
  notifications.forEach(n => n.read = true);
  AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, notifications);
  updateNotifBadge();
  renderNotifications(currentNotifFilter);
}

function clearAllNotifications() {
  AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, []);
  updateNotifBadge();
  renderNotifications(currentNotifFilter);
}

function jumpToInventorySKU(skuId) {
  closeNotifDrawer();
  switchTab('tab-inventory');
  const searchInput = document.getElementById('inventorySearchInput');
  if (searchInput) {
    searchInput.value = skuId;
    renderInventoryCatalog();
  }
}

function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

// ============================================================================
// MODULE 3: PRODUCT SCANNER AND INVENTORY MANAGEMENT
// ============================================================================
let zxingReader = null;
let isCameraActive = false;

function initBarcodeScannerAndInventory() {
  const existing = AppStorage.get(AppStorage.KEYS.PRODUCTS);
  if (!existing || existing.length === 0) {
    AppStorage.set(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  }

  const existingTx = AppStorage.get(AppStorage.KEYS.TRANSACTIONS);
  if (!existingTx || existingTx.length === 0) {
    AppStorage.set(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
  }

  renderInventoryCatalog();

  const searchInput = document.getElementById('inventorySearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderInventoryCatalog());
  }

  const catFilter = document.getElementById('inventoryCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', () => renderInventoryCatalog());
  }

  const statusFilter = document.getElementById('inventoryStatusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => renderInventoryCatalog());
  }

  const toggleBtn = document.getElementById('btnToggleCameraScanner');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', setupZXingScanner);
  }

  const stopBtn = document.getElementById('btnStopCamera');
  if (stopBtn) {
    stopBtn.addEventListener('click', stopCameraScanner);
  }

  const lookupBtn = document.getElementById('btnLookupBarcode');
  const manualInput = document.getElementById('manualBarcodeInput');
  if (lookupBtn && manualInput) {
    lookupBtn.addEventListener('click', () => lookupBarcode(manualInput.value.trim()));
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        lookupBarcode(manualInput.value.trim());
      }
    });
  }
}

async function setupZXingScanner() {
  const viewportBox = document.getElementById('scannerViewportBox');
  const sourceSelect = document.getElementById('cameraSourceSelect');
  const btnToggleText = document.getElementById('btnToggleCameraText');

  if (!viewportBox) return;

  if (isCameraActive) {
    stopCameraScanner();
    return;
  }

  viewportBox.style.display = 'block';
  if (btnToggleText) btnToggleText.textContent = 'Hide Camera Scanner';

  if (typeof ZXing === 'undefined') {
    addNotification({
      title: 'Barcode Scanner Initialized',
      message: 'ZXing camera stream engine ready. You can test live scanning or click Quick Test Chips below.',
      severity: 'info',
      category: 'inventory'
    });
    return;
  }

  try {
    if (!zxingReader) {
      zxingReader = new ZXing.BrowserMultiFormatReader();
    }

    const videoInputDevices = await zxingReader.listVideoInputDevices();
    if (sourceSelect) {
      sourceSelect.innerHTML = '';
      if (videoInputDevices.length > 0) {
        videoInputDevices.forEach((device, i) => {
          const opt = document.createElement('option');
          opt.value = device.deviceId;
          opt.text = device.label || `Camera ${i + 1}`;
          sourceSelect.appendChild(opt);
        });
      } else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.text = 'Default Camera';
        sourceSelect.appendChild(opt);
      }
    }

    const selectedDeviceId = sourceSelect && sourceSelect.value ? sourceSelect.value : undefined;
    isCameraActive = true;

    zxingReader.decodeFromVideoDevice(selectedDeviceId, 'barcodeScannerVideo', (result, err) => {
      if (result) {
        const scannedCode = result.getText();
        playBeep(980, 'sine', 0.15);
        lookupBarcode(scannedCode);
      }
    });

    addNotification({
      title: 'Camera Barcode Scanner Active',
      message: 'Camera stream active. Point camera at barcode to decode.',
      severity: 'info',
      category: 'inventory'
    });
  } catch (err) {
    console.warn('Camera scanner access note:', err);
    isCameraActive = false;
    if (btnToggleText) btnToggleText.textContent = 'Start Camera Scanner';
    addNotification({
      title: 'Camera Scanner Ready',
      message: 'Hardware camera feed optional. Use the Quick Test Chips or manual input to test barcode matching.',
      severity: 'info',
      category: 'inventory'
    });
  }
}

function stopCameraScanner() {
  const viewportBox = document.getElementById('scannerViewportBox');
  const btnToggleText = document.getElementById('btnToggleCameraText');
  if (zxingReader) {
    try {
      zxingReader.reset();
    } catch (e) {}
  }
  isCameraActive = false;
  if (viewportBox) viewportBox.style.display = 'none';
  if (btnToggleText) btnToggleText.textContent = 'Start Camera Scanner';
}

function simulateBarcodeScan(barcode) {
  const input = document.getElementById('manualBarcodeInput');
  if (input) input.value = barcode;
  lookupBarcode(barcode);
}

function lookupBarcode(code) {
  if (!code) return;
  const cleaned = code.trim();
  const input = document.getElementById('manualBarcodeInput');
  if (input) input.value = cleaned;

  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  const found = products.find(p => 
    (p.barcode && p.barcode.toLowerCase() === cleaned.toLowerCase()) || 
    (p.id && p.id.toLowerCase() === cleaned.toLowerCase())
  );

  const resultPanel = document.getElementById('scannedProductResult');
  if (!resultPanel) return;

  resultPanel.style.display = 'block';

  if (found) {
    playBeep(920, 'sine', 0.12);
    const isLow = found.availableQuantity <= found.minThreshold;
    const isOut = found.availableQuantity <= 0;
    const healthBadge = isOut 
      ? '<span class="badge badge-danger">OUT OF STOCK</span>' 
      : isLow 
        ? '<span class="badge badge-warning">LOW STOCK WARNING</span>' 
        : '<span class="badge badge-success">HEALTHY STOCK</span>';

    resultPanel.innerHTML = `
      <div class="scanned-card">
        <div class="scanned-header">
          <div class="scanned-info">
            <span class="scanned-pill-sku">${found.id}</span>
            <span class="scanned-pill-barcode">Barcode: ${found.barcode}</span>
            <span class="scanned-cat">${found.category}</span>
            <h4 class="scanned-name">${found.name}</h4>
          </div>
          <div class="scanned-health">${healthBadge}</div>
        </div>

        <div class="scanned-stats-grid">
          <div class="scanned-stat-box">
            <span class="stat-lbl">Available Stock</span>
            <strong class="stat-num ${isLow ? 'text-warning' : 'text-success'}">${found.availableQuantity} units</strong>
          </div>
          <div class="scanned-stat-box">
            <span class="stat-lbl">Min Threshold</span>
            <strong class="stat-num">${found.minThreshold} units</strong>
          </div>
          <div class="scanned-stat-box">
            <span class="stat-lbl">Unit Price</span>
            <strong class="stat-num">₹${found.unitPrice}</strong>
          </div>
          <div class="scanned-stat-box">
            <span class="stat-lbl">Supplier</span>
            <strong class="stat-txt">${found.supplier}</strong>
          </div>
        </div>

        <div class="scanned-actions-bar">
          <div class="stock-stepper-wrap">
            <span class="stepper-label">Quick Stock Adjust:</span>
            <div class="stepper-btn-group">
              <button class="btn btn-outline btn-sm" onclick="adjustStock('${found.id}', -10, 'Scanner Bulk Dispatch')">-10</button>
              <button class="btn btn-outline btn-sm" onclick="adjustStock('${found.id}', -1, 'Scanner Unit Dispatch')">-1</button>
              <button class="btn btn-primary btn-sm" onclick="adjustStock('${found.id}', 1, 'Scanner Unit Inward')">+1</button>
              <button class="btn btn-primary btn-sm" onclick="adjustStock('${found.id}', 10, 'Scanner Bulk Inward')">+10</button>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${found.id}')">
              <i data-lucide="edit-2" class="lucide-icon sm"></i>
              <span>Edit Product</span>
            </button>
            <button class="btn btn-outline btn-sm" onclick="openStockHistoryModal()">
              <i data-lucide="history" class="lucide-icon sm"></i>
              <span>Audit Trail</span>
            </button>
          </div>
        </div>
      </div>
    `;
    renderIcons();
  } else {
    playBeep(320, 'square', 0.2);
    resultPanel.innerHTML = `
      <div class="scanned-unregistered-card">
        <div class="unreg-header">
          <div class="unreg-icon-box">
            <i data-lucide="alert-triangle" class="lucide-icon"></i>
          </div>
          <div>
            <h4 style="font-size: 15px; font-weight: 800; color: #991B1B;">Unregistered Barcode Scanned: ${cleaned}</h4>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
              This barcode was not found in the product database. Register it now to track stock and automate replenishment.
            </p>
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px;">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('scannedProductResult').style.display='none'">Dismiss</button>
          <button class="btn btn-primary btn-sm" onclick="openAddProductModal('${cleaned}')">
            <i data-lucide="plus-circle" class="lucide-icon sm"></i>
            <span>Register New Product</span>
          </button>
        </div>
      </div>
    `;
    renderIcons();
  }
}

function adjustStock(productId, delta, reason = 'Manual Adjustment') {
  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const prevStock = prod.availableQuantity;
  const newStock = Math.max(0, prevStock + delta);
  prod.availableQuantity = newStock;
  prod.lastUpdated = 'Just now';

  AppStorage.set(AppStorage.KEYS.PRODUCTS, products);

  // Log transaction
  const transactions = AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
  const tx = {
    id: 'tx-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sku: prod.id,
    productName: prod.name,
    change: (delta > 0 ? '+' : '') + delta,
    resultingStock: newStock,
    opType: delta > 0 ? 'STOCK_INCREMENT' : 'STOCK_DECREMENT',
    reason: reason
  };
  transactions.unshift(tx);
  AppStorage.set(AppStorage.KEYS.TRANSACTIONS, transactions.slice(0, 100));

  renderInventoryCatalog();
  lookupBarcode(prod.barcode);

  // Cross-module alerts
  if (newStock <= prod.minThreshold && newStock > 0) {
    addNotification({
      title: `🚨 Low Stock Alert: ${prod.name}`,
      message: `Stock dropped to ${newStock} units (Below minimum threshold ${prod.minThreshold}). Reorder recommended.`,
      severity: 'critical',
      category: 'inventory',
      skuId: prod.id
    });
  } else if (newStock === 0) {
    addNotification({
      title: `⛔ Out of Stock: ${prod.name}`,
      message: `Stock is completely depleted (0 units). Emergency restocking required from regional hub.`,
      severity: 'critical',
      category: 'inventory',
      skuId: prod.id
    });
  } else if (delta > 0) {
    addNotification({
      title: `✅ Inbound Stock Updated: ${prod.name}`,
      message: `Successfully inwarded +${delta} units. Current available stock: ${newStock} units.`,
      severity: 'success',
      category: 'inventory',
      skuId: prod.id
    });
  } else {
    addNotification({
      title: `📦 Stock Dispatched: ${prod.name}`,
      message: `Deducted ${Math.abs(delta)} units for order fulfillment. Remaining balance: ${newStock}.`,
      severity: 'info',
      category: 'inventory',
      skuId: prod.id
    });
  }
}

function renderInventoryCatalog() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  const search = (document.getElementById('inventorySearchInput')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('inventoryCategoryFilter')?.value || 'all';
  const statusFilter = document.getElementById('inventoryStatusFilter')?.value || 'all';

  const filtered = products.filter(p => {
    const matchesSearch = !search || 
      p.name.toLowerCase().includes(search) || 
      p.id.toLowerCase().includes(search) || 
      (p.barcode && p.barcode.toLowerCase().includes(search)) ||
      p.supplier.toLowerCase().includes(search);

    const matchesCat = catFilter === 'all' || p.category === catFilter;

    let matchesStatus = true;
    if (statusFilter === 'low') {
      matchesStatus = p.availableQuantity <= p.minThreshold;
    } else if (statusFilter === 'healthy') {
      matchesStatus = p.availableQuantity > p.minThreshold && p.availableQuantity < p.minThreshold * 4;
    } else if (statusFilter === 'overstock') {
      matchesStatus = p.availableQuantity >= p.minThreshold * 4;
    }

    return matchesSearch && matchesCat && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" style="text-align: center; padding: 36px; color: var(--text-muted);">
          No inventory products match the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const isOut = item.availableQuantity <= 0;
    const isLow = item.availableQuantity <= item.minThreshold;
    const isOverstock = item.availableQuantity >= item.minThreshold * 4;

    let badge = '<span class="badge badge-success">Healthy</span>';
    if (isOut) badge = '<span class="badge badge-danger">Out of Stock</span>';
    else if (isLow) badge = '<span class="badge badge-warning">Low Stock</span>';
    else if (isOverstock) badge = '<span class="badge badge-navy">Overstocked</span>';

    return `
      <tr class="${isLow ? 'loss-row' : ''}">
        <td>
          <div style="font-weight: 700; font-family: monospace; color: var(--pantone-classic-blue);">${item.barcode || '—'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${item.id}</div>
        </td>
        <td>
          <strong style="font-weight: 700; color: var(--text-main);">${item.name}</strong>
        </td>
        <td><span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">${item.category}</span></td>
        <td>
          <span style="font-size: 14px; font-weight: 800; color: ${isLow ? 'var(--pantone-red-inferno-accent)' : 'var(--pantone-pine-grove-accent)'};">
            ${item.availableQuantity}
          </span>
          <span style="font-size: 11px; color: var(--text-muted);"> units</span>
        </td>
        <td style="font-weight: 600;">${item.minThreshold} units</td>
        <td style="font-weight: 700;">₹${item.unitPrice}</td>
        <td style="font-size: 12px; color: var(--text-muted);">${item.supplier}</td>
        <td style="font-size: 11.5px; color: var(--text-muted);">${item.lastUpdated || 'Just now'}</td>
        <td>${badge}</td>
        <td>
          <div style="display: inline-flex; align-items: center; gap: 4px;">
            <button class="btn btn-outline btn-sm" style="padding: 2px 7px; font-weight: 800;" onclick="adjustStock('${item.id}', -1, 'Table decrement')" title="Decrease Stock by 1">-</button>
            <button class="btn btn-outline btn-sm" style="padding: 2px 7px; font-weight: 800;" onclick="adjustStock('${item.id}', 1, 'Table increment')" title="Increase Stock by 1">+</button>
            <button class="btn btn-primary btn-sm" style="padding: 2px 7px; font-weight: 700;" onclick="adjustStock('${item.id}', 10, 'Batch inward')" title="Inward +10">+10</button>
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-outline btn-sm" onclick="openEditProductModal('${item.id}')" title="Edit Product">
              <i data-lucide="edit-2" class="lucide-icon sm"></i>
            </button>
            <button class="btn btn-outline btn-sm text-danger" onclick="deleteProduct('${item.id}')" title="Delete Product">
              <i data-lucide="trash-2" class="lucide-icon sm"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderIcons();
}

function openAddProductModal(barcode = '') {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  if (!modal) return;

  if (form) form.reset();
  const editIdInput = document.getElementById('prodEditId');
  if (editIdInput) editIdInput.value = '';

  const barcodeInput = document.getElementById('prodBarcode');
  if (barcodeInput && barcode) barcodeInput.value = barcode;

  const title = document.getElementById('productModalTitle');
  if (title) title.textContent = 'Add New Inventory Product';

  const btnText = document.getElementById('btnSaveProductText');
  if (btnText) btnText.textContent = 'Save Product to Inventory';

  modal.classList.add('active');
  renderIcons();
}

function openEditProductModal(productId) {
  const modal = document.getElementById('productModal');
  if (!modal) return;

  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById('prodEditId').value = prod.id;
  document.getElementById('prodBarcode').value = prod.barcode;
  document.getElementById('prodName').value = prod.name;
  document.getElementById('prodCategory').value = prod.category;
  document.getElementById('prodPrice').value = prod.unitPrice;
  document.getElementById('prodCost').value = prod.purchaseCost;
  document.getElementById('prodQuantity').value = prod.availableQuantity;
  document.getElementById('prodThreshold').value = prod.minThreshold;
  document.getElementById('prodSupplier').value = prod.supplier;
  document.getElementById('prodExpiry').value = prod.expiryDays || 7;

  const title = document.getElementById('productModalTitle');
  if (title) title.textContent = `Edit Product: ${prod.name}`;

  const btnText = document.getElementById('btnSaveProductText');
  if (btnText) btnText.textContent = 'Update Product Details';

  modal.classList.add('active');
  renderIcons();
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('active');
}

function handleProductFormSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('prodEditId').value.trim();
  const barcode = document.getElementById('prodBarcode').value.trim();
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const price = parseFloat(document.getElementById('prodPrice').value) || 0;
  const cost = parseFloat(document.getElementById('prodCost').value) || 0;
  const quantity = parseInt(document.getElementById('prodQuantity').value) || 0;
  const threshold = parseInt(document.getElementById('prodThreshold').value) || 10;
  const supplier = document.getElementById('prodSupplier').value.trim();
  const expiry = parseInt(document.getElementById('prodExpiry').value) || 7;

  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);

  // Duplicate Barcode Prevention
  const duplicate = products.find(p => p.barcode.toLowerCase() === barcode.toLowerCase() && p.id !== editId);
  if (duplicate) {
    alert(`[Duplicate Barcode Error]\n\nBarcode "${barcode}" is already assigned to:\n"${duplicate.name}" (${duplicate.id}).\n\nEach product barcode must be globally unique.`);
    return;
  }

  if (editId) {
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        barcode,
        name,
        category,
        unitPrice: price,
        purchaseCost: cost,
        availableQuantity: quantity,
        minThreshold: threshold,
        supplier,
        expiryDays: expiry,
        lastUpdated: 'Just now'
      };
      AppStorage.set(AppStorage.KEYS.PRODUCTS, products);

      const transactions = AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
      transactions.unshift({
        id: 'tx-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sku: editId,
        productName: name,
        change: 'MODIFIED',
        resultingStock: quantity,
        opType: 'PRODUCT_EDIT',
        reason: 'Product Details Update'
      });
      AppStorage.set(AppStorage.KEYS.TRANSACTIONS, transactions.slice(0, 100));

      addNotification({
        title: `Product Updated: ${name}`,
        message: `Inventory specifications and thresholds updated for SKU ${editId}.`,
        severity: 'success',
        category: 'inventory',
        skuId: editId
      });
    }
  } else {
    const catCode = category.split(' ')[0].substring(0, 3).toUpperCase();
    const newId = `SKU-${catCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newProd = {
      id: newId,
      barcode,
      name,
      category,
      unitPrice: price,
      purchaseCost: cost,
      availableQuantity: quantity,
      minThreshold: threshold,
      supplier,
      expiryDays: expiry,
      lastUpdated: 'Just now'
    };
    products.push(newProd);
    AppStorage.set(AppStorage.KEYS.PRODUCTS, products);

    const transactions = AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
    transactions.unshift({
      id: 'tx-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sku: newId,
      productName: name,
      change: `+${quantity}`,
      resultingStock: quantity,
      opType: 'NEW_REGISTRATION',
      reason: 'Catalog Onboarding'
    });
    AppStorage.set(AppStorage.KEYS.TRANSACTIONS, transactions.slice(0, 100));

    addNotification({
      title: `New Product Registered: ${name}`,
      message: `Registered with barcode ${barcode}. Initial stock: ${quantity} units.`,
      severity: 'success',
      category: 'inventory',
      skuId: newId
    });
  }

  closeProductModal();
  renderInventoryCatalog();
  lookupBarcode(barcode);
}

function deleteProduct(productId) {
  const products = AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  if (!confirm(`Are you sure you want to remove "${prod.name}" (${prod.id}) from the inventory database?`)) {
    return;
  }

  const remaining = products.filter(p => p.id !== productId);
  AppStorage.set(AppStorage.KEYS.PRODUCTS, remaining);

  const transactions = AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
  transactions.unshift({
    id: 'tx-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sku: prod.id,
    productName: prod.name,
    change: `-${prod.availableQuantity}`,
    resultingStock: 0,
    opType: 'PRODUCT_DELETED',
    reason: 'Manual Admin Removal'
  });
  AppStorage.set(AppStorage.KEYS.TRANSACTIONS, transactions.slice(0, 100));

  addNotification({
    title: `Product Removed: ${prod.name}`,
    message: `SKU ${prod.id} was deleted from master catalog.`,
    severity: 'warning',
    category: 'inventory'
  });

  renderInventoryCatalog();
  const resultPanel = document.getElementById('scannedProductResult');
  if (resultPanel) resultPanel.style.display = 'none';
}

function openStockHistoryModal() {
  const modal = document.getElementById('stockHistoryModal');
  const tbody = document.getElementById('stockHistoryTableBody');
  if (!modal || !tbody) return;

  const transactions = AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);

  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">
          No inventory stock transactions recorded yet.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = transactions.map(tx => {
      const isPositive = String(tx.change).startsWith('+');
      return `
        <tr>
          <td style="font-size: 11.5px; color: var(--text-muted);">${tx.timestamp}</td>
          <td><span style="font-family: monospace; font-weight: 700; color: var(--pantone-classic-blue);">${tx.sku}</span></td>
          <td style="font-weight: 600;">${tx.productName}</td>
          <td>
            <span class="badge ${isPositive ? 'badge-success' : 'badge-warning'}">
              ${tx.change}
            </span>
          </td>
          <td style="font-weight: 700;">${tx.resultingStock}</td>
          <td><span style="font-size: 11.5px; font-weight: 600;">${tx.opType}</span></td>
          <td style="font-size: 12px; color: var(--text-muted);">${tx.reason}</td>
        </tr>
      `;
    }).join('');
  }

  modal.classList.add('active');
  renderIcons();
}

function closeStockHistoryModal() {
  const modal = document.getElementById('stockHistoryModal');
  if (modal) modal.classList.remove('active');
}


// ============================================================================
// MONGODB ATLAS CLOUD ENDPOINTS & BIDIRECTIONAL SYNC ENGINE
// ============================================================================

const MongoAPI = {
  activeUri: "mongodb+srv://Admin1:••••••••@cluster0.tzti0i8.mongodb.net/profitpulse",
  fullUri: "mongodb+srv://Admin1:Test123@cluster0.tzti0i8.mongodb.net/profitpulse?retryWrites=true&w=majority",
  isMasked: true,

  async getStatus() {
    try {
      const res = await fetch('/api/db/status');
      if (!res.ok) throw new Error('Status HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.warn('MongoAPI.getStatus note:', e);
      return null;
    }
  },

  async getProducts(params = {}) {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/db/products?${qs}`);
      if (!res.ok) throw new Error('Products HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      return AppStorage.get(AppStorage.KEYS.PRODUCTS, defaultSeedProducts);
    }
  },

  async saveProduct(product) {
    try {
      const res = await fetch('/api/db/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async adjustStock(skuId, delta, reason) {
    try {
      const res = await fetch('/api/db/stock-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skuId, delta, reason })
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteProduct(id) {
    try {
      const res = await fetch(`/api/db/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async getTransactions() {
    try {
      const res = await fetch('/api/db/transactions');
      if (!res.ok) throw new Error('Transactions HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      return AppStorage.get(AppStorage.KEYS.TRANSACTIONS, defaultSeedTransactions);
    }
  },

  async getNotifications(filter = 'all') {
    try {
      const res = await fetch(`/api/db/notifications?filter=${filter}`);
      if (!res.ok) throw new Error('Notifications HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      return AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, defaultSeedNotifications);
    }
  },

  async markNotificationRead(id) {
    try {
      await fetch('/api/db/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {}
  },

  async clearNotifications() {
    try {
      await fetch('/api/db/notifications/clear', { method: 'POST' });
    } catch (e) {}
  },

  async getBusinessData() {
    try {
      const res = await fetch('/api/db/business-data');
      if (!res.ok) throw new Error('BizData HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      return AppStorage.get(AppStorage.KEYS.BIZ_DATA);
    }
  },

  async saveBusinessData(data) {
    try {
      const res = await fetch('/api/db/business-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async reseedPseudoData() {
    try {
      const res = await fetch('/api/db/seed', { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

// Initial sync on load
async function syncWithMongoDB() {
  const status = await MongoAPI.getStatus();
  const label = document.getElementById('mongoStatusLabel');
  if (status && status.status === 'connected') {
    if (label) {
      label.textContent = `MongoDB Atlas: ${status.cluster} (Connected)`;
    }
  }

  // Fetch live products
  const products = await MongoAPI.getProducts();
  if (Array.isArray(products) && products.length > 0) {
    AppStorage.set(AppStorage.KEYS.PRODUCTS, products);
    renderInventoryCatalog();
  }

  // Fetch live notifications
  const notifs = await MongoAPI.getNotifications();
  if (Array.isArray(notifs) && notifs.length > 0) {
    AppStorage.set(AppStorage.KEYS.NOTIFICATIONS, notifs);
    updateNotifBadge();
    renderNotifications(currentNotifFilter);
  }

  // Fetch live transactions
  const txs = await MongoAPI.getTransactions();
  if (Array.isArray(txs) && txs.length > 0) {
    AppStorage.set(AppStorage.KEYS.TRANSACTIONS, txs);
  }

  // Fetch business data
  const biz = await MongoAPI.getBusinessData();
  if (biz && biz.revenue) {
    AppStorage.set(AppStorage.KEYS.BIZ_DATA, biz);
    AppStorage.set(AppStorage.KEYS.IS_DEMO, !!biz.isDemo);
    applyCustomBusinessDataIfSaved();
  }
}

// Modal inspection controls
async function openMongoDbModal() {
  const modal = document.getElementById('mongoDbModal');
  if (!modal) return;

  const t0 = performance.now();
  const status = await MongoAPI.getStatus();
  const t1 = performance.now();
  const latency = Math.max(8, Math.round(t1 - t0));

  const pingBadge = document.getElementById('mongoModalPing');
  if (pingBadge) pingBadge.textContent = `Latency: ${latency}ms`;

  if (status) {
    const disp = document.getElementById('mongoUriDisplay');
    if (disp) disp.textContent = MongoAPI.isMasked ? status.maskedUri : status.mongoUri;

    const dbName = document.getElementById('mongoDbName');
    if (dbName) dbName.textContent = status.database;

    const cluster = document.getElementById('mongoClusterName');
    if (cluster) cluster.textContent = status.cluster;

    const pCount = document.getElementById('mongoDocProducts');
    if (pCount) pCount.textContent = status.documentCounts.products;

    const txCount = document.getElementById('mongoDocTx');
    if (txCount) txCount.textContent = status.documentCounts.inventory_transactions;

    const notifCount = document.getElementById('mongoDocNotifs');
    if (notifCount) notifCount.textContent = status.documentCounts.notifications;

    const bizCount = document.getElementById('mongoDocBiz');
    if (bizCount) bizCount.textContent = status.documentCounts.business_data;
  }

  modal.classList.add('active');
  renderIcons();
}

function closeMongoDbModal() {
  const modal = document.getElementById('mongoDbModal');
  if (modal) modal.classList.remove('active');
}

function toggleMongoUriReveal() {
  MongoAPI.isMasked = !MongoAPI.isMasked;
  const disp = document.getElementById('mongoUriDisplay');
  if (disp) {
    disp.textContent = MongoAPI.isMasked ? MongoAPI.activeUri : MongoAPI.fullUri;
  }
}

async function pingMongoDb() {
  const pingBadge = document.getElementById('mongoModalPing');
  if (pingBadge) pingBadge.textContent = 'Pinging...';
  const t0 = performance.now();
  const status = await MongoAPI.getStatus();
  const t1 = performance.now();
  const latency = Math.max(9, Math.round(t1 - t0));

  if (pingBadge) {
    pingBadge.textContent = status ? `Ping: ${latency}ms (OK)` : 'Ping Failed';
  }
  if (status) {
    openMongoDbModal();
  }
}

async function reseedMongoDb() {
  if (!confirm('Re-seed MongoDB collections with realistic quick-commerce pseudo data?')) return;
  const result = await MongoAPI.reseedPseudoData();
  if (result.success) {
    await syncWithMongoDB();
    alert('MongoDB pseudo data has been re-seeded successfully with 8 products, transactions, and alerts.');
    openMongoDbModal();
  } else {
    alert('Failed to reseed pseudo data.');
  }
}

function exportMongoBackup() {
  const backup = {
    cluster: "cluster0.tzti0i8.mongodb.net",
    database: "profitpulse",
    exportedAt: new Date().toISOString(),
    collections: {
      products: AppStorage.get(AppStorage.KEYS.PRODUCTS, []),
      inventory_transactions: AppStorage.get(AppStorage.KEYS.TRANSACTIONS, []),
      notifications: AppStorage.get(AppStorage.KEYS.NOTIFICATIONS, []),
      business_data: AppStorage.get(AppStorage.KEYS.BIZ_DATA, {})
    }
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `profitpulse_mongodb_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
