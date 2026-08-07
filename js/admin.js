/**
 * THE FLORA BAKERY - ADMIN SUITE CONTROLLER
 * High-performance, Apple-grade interface manager
 * Handles Authentication, Real-time CRUD, Categories Module, Live Notification Bell,
 * Automated Email Receipt CRM, Customers CRM, Deep Analytics, Printable Slips & WhatsApp Logistics Dispatch
 */

(function() {
  'use strict';

  const AdminApp = {
    currentView: 'dashboard',
    editingProductId: null,
    editingCategoryId: null,
    activeWhatsAppOrderId: null,

    init() {
      this.checkAuth();
      this.bindEvents();
      this.setupImageUploader();
      this.setupKeyboardShortcuts();
      this.listenToDataChanges();
    },

    // =========================================================================
    // 1. AUTHENTICATION & SESSION
    // =========================================================================
    checkAuth() {
      const isAuth = sessionStorage.getItem('flora_admin_session') === 'active';
      const authScreen = document.getElementById('authScreen');
      const adminApp = document.getElementById('adminApp');

      if (isAuth) {
        authScreen.style.display = 'none';
        adminApp.style.display = 'flex';
        this.loadAllData();
      } else {
        authScreen.style.display = 'flex';
        adminApp.style.display = 'none';
      }
    },

    login(email, password) {
      if (email.trim().toLowerCase() === 'admin@theflorabakery.com' && password === 'floral2026') {
        sessionStorage.setItem('flora_admin_session', 'active');
        this.showToast('🌸 Welcome back to Flora Studio Admin!', 'success');
        this.checkAuth();
      } else {
        this.showToast('Invalid credentials. Use demo: admin@theflorabakery.com / floral2026', 'error');
      }
    },

    logout() {
      sessionStorage.removeItem('flora_admin_session');
      this.showToast('Signed out successfully.', 'info');
      this.checkAuth();
    },

    // =========================================================================
    // 2. EVENT BINDINGS
    // =========================================================================
    bindEvents() {
      // Login Form
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('loginEmail').value;
          const pass = document.getElementById('loginPass').value;
          this.login(email, pass);
        });
      }

      // Quick Demo 1-Click Login
      const quickDemoBtn = document.getElementById('quickDemoLoginBtn');
      if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', () => {
          document.getElementById('loginEmail').value = 'admin@theflorabakery.com';
          document.getElementById('loginPass').value = 'floral2026';
          this.login('admin@theflorabakery.com', 'floral2026');
        });
      }

      // Desktop Sidebar Navigation
      document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const view = item.getAttribute('data-view');
          if (view) {
            this.switchView(view);
            this.closeMobileSidebar();
          }
        });
      });

      // Mobile Bottom Navigation Tabs
      document.querySelectorAll('.admin-mobile-nav .mobile-nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const view = tab.getAttribute('data-view');
          if (view) {
            this.switchView(view);
          }
        });
      });

      // Mobile "More" Tab -> Opens Sidebar Drawer
      const mobileMoreBtn = document.getElementById('mobileMoreBtn');
      if (mobileMoreBtn) {
        mobileMoreBtn.addEventListener('click', () => {
          this.openMobileSidebar();
        });
      }

      // Mobile Menu Toggle Button (Header)
      const mobileToggle = document.getElementById('mobileMenuToggle');
      if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
          this.toggleMobileSidebar();
        });
      }

      // Mobile Sidebar Close Button & Backdrop
      const sidebarCloseMobileBtn = document.getElementById('sidebarCloseMobileBtn');
      const sidebarBackdrop = document.getElementById('sidebarBackdrop');
      if (sidebarCloseMobileBtn) sidebarCloseMobileBtn.addEventListener('click', () => this.closeMobileSidebar());
      if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => this.closeMobileSidebar());

      // Profile Dropdown / Logout
      const profileBtn = document.getElementById('adminProfileBtn');
      if (profileBtn) {
        profileBtn.addEventListener('click', () => {
          if (confirm('Do you want to log out of the Admin Studio?')) {
            this.logout();
          }
        });
      }

      // Header New Product Button
      const btnHeaderNewProduct = document.getElementById('btnHeaderNewProduct');
      if (btnHeaderNewProduct) {
        btnHeaderNewProduct.addEventListener('click', () => this.openProductDrawer());
      }

      const btnAddNewProduct = document.getElementById('btnAddNewProduct');
      if (btnAddNewProduct) {
        btnAddNewProduct.addEventListener('click', () => this.openProductDrawer());
      }

      // Add Category Button
      const btnAddNewCategory = document.getElementById('btnAddNewCategory');
      if (btnAddNewCategory) {
        btnAddNewCategory.addEventListener('click', () => this.openCategoryDrawer());
      }

      // Notifications Bell Button & Dropdown Toggle
      const btnHeaderNotif = document.getElementById('btnHeaderNotif');
      const notifDropdownMenu = document.getElementById('notifDropdownMenu');
      const btnMarkAllNotifsRead = document.getElementById('btnMarkAllNotifsRead');

      if (btnHeaderNotif && notifDropdownMenu) {
        btnHeaderNotif.addEventListener('click', (e) => {
          e.stopPropagation();
          notifDropdownMenu.classList.toggle('active');
        });

        // Close when clicked outside
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.notif-wrapper')) {
            notifDropdownMenu.classList.remove('active');
          }
        });
      }

      if (btnMarkAllNotifsRead) {
        btnMarkAllNotifsRead.addEventListener('click', () => {
          FloraDB.markAllNotificationsRead();
          this.renderNotifications();
          this.showToast('All notifications marked as read.', 'info');
        });
      }

      // Refresh Analytics Button
      const btnRefresh = document.getElementById('btnRefreshAnalytics');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
          this.loadAllData();
          this.showToast('🔄 Real-time metrics refreshed!', 'info');
        });
      }

      // Drawer Close Handlers (Product)
      const drawerCloseBtn = document.getElementById('drawerCloseBtn');
      const drawerCancelBtn = document.getElementById('drawerCancelBtn');
      const drawerOverlay = document.getElementById('drawerOverlay');

      if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => this.closeProductDrawer());
      if (drawerCancelBtn) drawerCancelBtn.addEventListener('click', () => this.closeProductDrawer());
      if (drawerOverlay) drawerOverlay.addEventListener('click', () => this.closeProductDrawer());

      // Product Form Save
      const drawerSaveBtn = document.getElementById('drawerSaveBtn');
      if (drawerSaveBtn) {
        drawerSaveBtn.addEventListener('click', () => this.saveProduct());
      }

      // Category Drawer Controls
      const categoryDrawerCloseBtn = document.getElementById('categoryDrawerCloseBtn');
      const categoryDrawerCancelBtn = document.getElementById('categoryDrawerCancelBtn');
      const categoryDrawerOverlay = document.getElementById('categoryDrawerOverlay');
      const categoryDrawerSaveBtn = document.getElementById('categoryDrawerSaveBtn');

      if (categoryDrawerCloseBtn) categoryDrawerCloseBtn.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerCancelBtn) categoryDrawerCancelBtn.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerOverlay) categoryDrawerOverlay.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerSaveBtn) categoryDrawerSaveBtn.addEventListener('click', () => this.saveCategory());

      // Product Filters
      const prodSearch = document.getElementById('productSearchInput');
      const prodCat = document.getElementById('productCategoryFilter');
      const prodStatus = document.getElementById('productStatusFilter');
      if (prodSearch) prodSearch.addEventListener('input', () => this.renderProductsTable());
      if (prodCat) prodCat.addEventListener('change', () => this.renderProductsTable());
      if (prodStatus) prodStatus.addEventListener('change', () => this.renderProductsTable());

      // Inventory Controls
      const invSearch = document.getElementById('inventorySearchInput');
      const invStock = document.getElementById('inventoryStockFilter');
      const btnRestockAll = document.getElementById('btnRestockAll');
      if (invSearch) invSearch.addEventListener('input', () => this.renderInventoryTable());
      if (invStock) invStock.addEventListener('change', () => this.renderInventoryTable());
      if (btnRestockAll) {
        btnRestockAll.addEventListener('click', () => {
          if (confirm('Add +10 units to every product in the catalog?')) {
            const products = FloraDB.getProducts();
            products.forEach(p => FloraDB.adjustStock(p.id, 10));
            this.showToast('📦 Batch restocked! Added +10 units to all products.', 'success');
          }
        });
      }

      // Order Filters & Clear Orders Button
      const orderSearch = document.getElementById('orderSearchInput');
      const orderStatus = document.getElementById('orderStatusFilter');
      const btnClearOrdersBtn = document.getElementById('btnClearOrdersBtn');
      if (orderSearch) orderSearch.addEventListener('input', () => this.renderOrdersTable());
      if (orderStatus) orderStatus.addEventListener('change', () => this.renderOrdersTable());
      if (btnClearOrdersBtn) {
        btnClearOrdersBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to clear all orders and reset count to 0?')) {
            FloraDB.clearAllOrders();
            this.renderOrdersTable();
            this.renderDashboard();
            this.showToast('🗑️ All orders cleared. Count reset to 0.', 'info');
          }
        });
      }

      // Customer Filter
      const custSearch = document.getElementById('customerSearchInput');
      if (custSearch) custSearch.addEventListener('input', () => this.renderCustomersTable());

      // CSV Export Handlers
      const btnExportProductsCSV = document.getElementById('btnExportProductsCSV');
      if (btnExportProductsCSV) {
        btnExportProductsCSV.addEventListener('click', () => this.downloadCSV(FloraDB.exportProductsCSV(), 'flora-products.csv'));
      }

      const btnExportOrdersCSV = document.getElementById('btnExportOrdersCSV');
      if (btnExportOrdersCSV) {
        btnExportOrdersCSV.addEventListener('click', () => this.downloadCSV(FloraDB.exportOrdersCSV(), 'flora-orders.csv'));
      }

      const btnExportCustomersCSV = document.getElementById('btnExportCustomersCSV');
      if (btnExportCustomersCSV) {
        btnExportCustomersCSV.addEventListener('click', () => {
          const custs = FloraDB.getCustomers();
          let csv = "Name,Phone,Address,OrdersCount,TotalSpent,Tier\n";
          custs.forEach(c => {
            csv += `"${c.name}","${c.phone||''}","${(c.address||'').replace(/"/g, '""')}","${c.ordersCount}","${c.totalSpent}","${c.tag}"\n`;
          });
          this.downloadCSV(csv, 'flora-customers.csv');
        });
      }

      // Invoice Modal Close Handlers
      const btnCloseInvoice = document.getElementById('btnCloseInvoice');
      const invoiceModalOverlay = document.getElementById('invoiceModalOverlay');
      if (btnCloseInvoice) {
        btnCloseInvoice.addEventListener('click', () => this.closeInvoice());
      }
      if (invoiceModalOverlay) {
        invoiceModalOverlay.addEventListener('click', () => this.closeInvoice());
      }

      // WhatsApp Logistics Modal Handlers
      const btnCloseWhatsAppModal = document.getElementById('btnCloseWhatsAppModal');
      const btnCancelWhatsApp = document.getElementById('btnCancelWhatsApp');
      const whatsappModalOverlay = document.getElementById('whatsappModalOverlay');
      const btnSendWhatsAppAction = document.getElementById('btnSendWhatsAppAction');

      if (btnCloseWhatsAppModal) btnCloseWhatsAppModal.addEventListener('click', () => this.closeWhatsAppModal());
      if (btnCancelWhatsApp) btnCancelWhatsApp.addEventListener('click', () => this.closeWhatsAppModal());
      if (whatsappModalOverlay) whatsappModalOverlay.addEventListener('click', () => this.closeWhatsAppModal());
      if (btnSendWhatsAppAction) btnSendWhatsAppAction.addEventListener('click', () => this.dispatchWhatsAppMessage());

      // Admin Email Confirmation Modal Handlers
      const btnCloseAdminEmailModal = document.getElementById('btnCloseAdminEmailModal');
      const btnCloseAdminEmailModalBtn = document.getElementById('btnCloseAdminEmailModalBtn');
      const adminEmailModalOverlay = document.getElementById('adminEmailModalOverlay');

      if (btnCloseAdminEmailModal) btnCloseAdminEmailModal.addEventListener('click', () => this.closeAdminEmailModal());
      if (btnCloseAdminEmailModalBtn) btnCloseAdminEmailModalBtn.addEventListener('click', () => this.closeAdminEmailModal());
      if (adminEmailModalOverlay) adminEmailModalOverlay.addEventListener('click', () => this.closeAdminEmailModal());

      // Discount Modal Controls
      const btnCreateDiscount = document.getElementById('btnCreateDiscount');
      const discountModal = document.getElementById('discountModal');
      const discountModalOverlay = document.getElementById('discountModalOverlay');
      const btnCancelDiscount = document.getElementById('btnCancelDiscount');
      const createDiscountForm = document.getElementById('createDiscountForm');

      if (btnCreateDiscount) {
        btnCreateDiscount.addEventListener('click', () => {
          discountModal.classList.add('active');
          discountModalOverlay.classList.add('active');
        });
      }
      if (btnCancelDiscount) {
        btnCancelDiscount.addEventListener('click', () => {
          discountModal.classList.remove('active');
          discountModalOverlay.classList.remove('active');
        });
      }
      if (discountModalOverlay) {
        discountModalOverlay.addEventListener('click', () => {
          discountModal.classList.remove('active');
          discountModalOverlay.classList.remove('active');
        });
      }
      if (createDiscountForm) {
        createDiscountForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const code = document.getElementById('discCode').value;
          const type = document.getElementById('discType').value;
          const value = Number(document.getElementById('discValue').value);
          const minOrder = Number(document.getElementById('discMin').value) || 0;
          const desc = document.getElementById('discDesc').value;

          FloraDB.saveDiscount({ code, type, value, minOrder, description: desc, active: true });
          discountModal.classList.remove('active');
          discountModalOverlay.classList.remove('active');
          createDiscountForm.reset();
          this.showToast(`✨ Coupon "${code.toUpperCase()}" created and active!`, 'success');
          this.renderDiscountsTable();
        });
      }

      // Settings Form
      const settingsForm = document.getElementById('settingsForm');
      if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const newSettings = {
            storeName: document.getElementById('setStoreName').value,
            announcementText: document.getElementById('setAnnouncement').value,
            storeNotice: document.getElementById('setStoreNotice').value,
            whatsapp: document.getElementById('setWhatsApp').value,
            freeShippingThreshold: Number(document.getElementById('setFreeShipping').value) || 999,
            address: document.getElementById('setAddress').value
          };
          FloraDB.saveSettings(newSettings);
          this.showToast('✨ Store settings & announcement bar updated live!', 'success');
        });
      }

      // Backup & Restore
      const btnExportJSON = document.getElementById('btnExportJSON');
      if (btnExportJSON) {
        btnExportJSON.addEventListener('click', () => {
          const json = FloraDB.exportJSON();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `flora-bakery-backup-${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          this.showToast('📥 Backup downloaded successfully!', 'success');
        });
      }

      const importFileInput = document.getElementById('importFileInput');
      if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const res = FloraDB.importJSON(event.target.result);
              if (res.success) {
                this.showToast('📤 Store database successfully restored!', 'success');
                this.loadAllData();
              } else {
                this.showToast(`Import failed: ${res.error}`, 'error');
              }
            };
            reader.readAsText(file);
          }
        });
      }

      const btnResetDefaults = document.getElementById('btnResetDefaults');
      if (btnResetDefaults) {
        btnResetDefaults.addEventListener('click', () => {
          if (confirm('Reset store catalog to clean default items with 0 orders?')) {
            FloraDB.resetToDefaults();
            this.showToast('🔄 Store reset to clean state.', 'info');
            this.loadAllData();
          }
        });
      }
    },

    // =========================================================================
    // 3. IMAGE UPLOAD & ASSET MANAGER
    // =========================================================================
    setupImageUploader() {
      const dropZone = document.getElementById('imageDropZone');
      const fileInput = document.getElementById('prodImageFileInput');
      const removeBtn = document.getElementById('btnRemovePreview');

      if (!dropZone || !fileInput) return;

      dropZone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && !e.target.closest('#btnRemovePreview')) {
          fileInput.click();
        }
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.processUploadedImage(file);
        }
      });

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--rose-primary)';
        dropZone.style.background = 'rgba(232, 105, 138, 0.15)';
      });

      dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '';
        dropZone.style.background = '';
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '';
        dropZone.style.background = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.processUploadedImage(e.dataTransfer.files[0]);
        }
      });

      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setImagePreview('images/cat-cakes.jpg');
          this.showToast('Photo removed. Reset to default preset.', 'info');
        });
      }

      document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          const imgPath = chip.getAttribute('data-img');
          if (imgPath) {
            document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            this.setImagePreview(imgPath);
          }
        });
      });
    },

    processUploadedImage(file) {
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file (JPG, PNG, WebP)', 'error');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Image is larger than 5MB. Compressing...', 'info');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        this.setImagePreview(base64Data);
        this.showToast('📸 Custom product photo loaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    },

    setImagePreview(src) {
      const previewImg = document.getElementById('uploadedImgPreview');
      const hiddenInput = document.getElementById('prodImageValue');
      const emptyState = document.getElementById('uploaderEmptyState');
      const activeState = document.getElementById('uploaderActivePreview');

      if (hiddenInput) hiddenInput.value = src;
      if (previewImg) previewImg.src = src;

      if (src && src.length > 0) {
        if (emptyState) emptyState.style.display = 'none';
        if (activeState) activeState.style.display = 'block';
      } else {
        if (emptyState) emptyState.style.display = 'block';
        if (activeState) activeState.style.display = 'none';
      }
    },

    // =========================================================================
    // 4. MOBILE SIDEBAR DRAWER CONTROLS
    // =========================================================================
    openMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    },

    toggleMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      if (sidebar && sidebar.classList.contains('active')) {
        this.closeMobileSidebar();
      } else {
        this.openMobileSidebar();
      }
    },

    // =========================================================================
    // 5. VIEW SWITCHER & TAB MANAGEMENT
    // =========================================================================
    switchView(viewName) {
      this.currentView = viewName;

      // Update Desktop Nav Active State
      document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // Update Mobile Nav Active State
      document.querySelectorAll('.admin-mobile-nav .mobile-nav-tab').forEach(tab => {
        if (tab.getAttribute('data-view') === viewName) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });

      // Show Selected Section
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
      });

      const targetSec = document.getElementById(`view-${viewName}`);
      if (targetSec) {
        targetSec.classList.add('active');
      }

      // Scroll to top
      const content = document.querySelector('.admin-content');
      if (content) content.scrollTop = 0;

      // Trigger Specific Render
      if (viewName === 'dashboard') this.renderDashboard();
      if (viewName === 'products') this.renderProductsTable();
      if (viewName === 'categories') this.renderCategoriesView();
      if (viewName === 'inventory') this.renderInventoryTable();
      if (viewName === 'orders') this.renderOrdersTable();
      if (viewName === 'customers') this.renderCustomersTable();
      if (viewName === 'analytics') this.renderAnalyticsView();
      if (viewName === 'discounts') this.renderDiscountsTable();
      if (viewName === 'inquiries') this.renderInquiriesTable();
      if (viewName === 'settings') this.renderSettingsView();
    },

    loadAllData() {
      this.populateCategoryDropdowns();
      this.renderDashboard();
      this.renderProductsTable();
      this.renderCategoriesView();
      this.renderInventoryTable();
      this.renderOrdersTable();
      this.renderCustomersTable();
      this.renderAnalyticsView();
      this.renderDiscountsTable();
      this.renderInquiriesTable();
      this.renderSettingsView();
      this.renderNotifications();
      this.updateSidebarCounters();
    },

    playNotificationSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } catch (e) {
        // AudioContext silent fail
      }
    },

    listenToDataChanges() {
      // 1. Custom event listener (within same tab or triggered manually)
      window.addEventListener('flora:data-changed', () => {
        this.loadAllData();
      });

      // 2. Storage event listener (cross-tab sync)
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('flora_')) {
          this.loadAllData();
        }
      });

      // 3. BroadcastChannel (instant modern cross-window sync)
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('flora_sync_channel');
        channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_ORDER') {
            this.showToast(`🎉 New Order #${event.data.orderId} received from ${event.data.customerName || 'Customer'}!`, 'success');
            this.playNotificationSound();
          }
          this.loadAllData();
        };
      }

      // 4. Reactive Heartbeat Polling (every 2.5s) to guarantee zero desync
      let lastOrderCount = (FloraDB.getOrders() || []).length;
      let lastInqCount = (FloraDB.getInquiries() || []).length;
      setInterval(() => {
        const currentOrders = (FloraDB.getOrders() || []).length;
        const currentInqs = (FloraDB.getInquiries() || []).length;
        if (currentOrders !== lastOrderCount || currentInqs !== lastInqCount) {
          if (currentOrders > lastOrderCount) {
            this.showToast(`🛍️ New Order arrived! Pipeline updated.`, 'success');
            this.playNotificationSound();
          }
          lastOrderCount = currentOrders;
          lastInqCount = currentInqs;
          this.loadAllData();
        }
      }, 2500);
    },

    updateSidebarCounters() {
      const products = FloraDB.getProducts();
      const categories = FloraDB.getCategories();
      const analytics = FloraDB.getAnalytics();
      const orders = FloraDB.getOrders();
      const inqs = FloraDB.getInquiries();

      const prodCountEl = document.getElementById('sidebarProductCount');
      if (prodCountEl) prodCountEl.textContent = products.length;

      const catCountEl = document.getElementById('sidebarCategoryCount');
      if (catCountEl) catCountEl.textContent = categories.length;

      const lowStockBadge = document.getElementById('sidebarLowStockBadge');
      if (lowStockBadge) {
        if (analytics.lowStockCount > 0) {
          lowStockBadge.textContent = analytics.lowStockCount;
          lowStockBadge.style.display = 'inline-block';
        } else {
          lowStockBadge.style.display = 'none';
        }
      }

      const ordersBadge = document.getElementById('sidebarOrdersBadge');
      if (ordersBadge) ordersBadge.textContent = orders.length;

      const mobileOrdersBadge = document.getElementById('mobileOrdersBadge');
      if (mobileOrdersBadge) {
        if (orders.length > 0) {
          mobileOrdersBadge.textContent = orders.length;
          mobileOrdersBadge.style.display = 'inline-block';
        } else {
          mobileOrdersBadge.style.display = 'none';
        }
      }

      const inqBadge = document.getElementById('sidebarInqBadge');
      if (inqBadge) {
        if (inqs.length > 0) {
          inqBadge.textContent = inqs.length;
          inqBadge.style.display = 'inline-block';
        } else {
          inqBadge.style.display = 'none';
        }
      }
    },

    // =========================================================================
    // 6. LIVE NOTIFICATIONS BELL & DROPDOWN PANEL
    // =========================================================================
    renderNotifications() {
      const notifs = FloraDB.getNotifications();
      const unreadCount = notifs.filter(n => !n.read).length;

      const badgeCountEl = document.getElementById('notifBadgeCount');
      const unreadBadgeEl = document.getElementById('notifUnreadBadge');
      const listContainer = document.getElementById('notifDropdownList');

      if (badgeCountEl) {
        if (unreadCount > 0) {
          badgeCountEl.textContent = unreadCount;
          badgeCountEl.style.display = 'flex';
        } else {
          badgeCountEl.style.display = 'none';
        }
      }

      if (unreadBadgeEl) {
        unreadBadgeEl.textContent = `${unreadCount} New`;
      }

      if (!listContainer) return;

      if (notifs.length === 0) {
        listContainer.innerHTML = `
          <div style="text-align:center; padding: 28px 16px; color:var(--cocoa-muted);">
            <div style="font-size: 2rem; margin-bottom: 6px;">🔔</div>
            <strong style="font-size:0.88rem; color:var(--cocoa-dark);">No Activity Yet</strong>
            <p style="font-size:0.78rem; margin:4px 0 0;">New customer orders & bespoke cake requests will ping here live.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = notifs.map(n => {
        let iconClass = 'notif-icon-order';
        let iconSymbol = '🛍️';
        if (n.type === 'inquiry') {
          iconClass = 'notif-icon-inquiry';
          iconSymbol = '🎂';
        } else if (n.type === 'stock') {
          iconClass = 'notif-icon-stock';
          iconSymbol = '⚠️';
        }

        return `
          <div class="notif-item ${n.read ? '' : 'unread'}" onclick="AdminApp.handleNotifClick('${n.id}', '${n.linkView || 'orders'}')">
            <div class="notif-icon-circle ${iconClass}">
              ${iconSymbol}
            </div>
            <div class="notif-content">
              <div class="notif-title">${this.escapeHTML(n.title)}</div>
              <div class="notif-desc">${this.escapeHTML(n.message)}</div>
              <div class="notif-time">${n.timeAgo || 'Just now'}</div>
            </div>
          </div>
        `;
      }).join('');
    },

    handleNotifClick(notifId, targetView) {
      FloraDB.markNotificationRead(notifId);
      this.renderNotifications();
      const notifMenu = document.getElementById('notifDropdownMenu');
      if (notifMenu) notifMenu.classList.remove('active');
      if (targetView) this.switchView(targetView);
    },

    // =========================================================================
    // 7. DASHBOARD VIEW
    // =========================================================================
    renderDashboard() {
      const stats = FloraDB.getAnalytics();

      const kpiRev = document.getElementById('kpiRevenue');
      const kpiOrders = document.getElementById('kpiOrdersCount');
      const kpiAOV = document.getElementById('kpiAOV');
      const kpiLow = document.getElementById('kpiLowStockCount');
      const kpiActive = document.getElementById('kpiActiveOrdersTag');
      const kpiLowSub = document.getElementById('kpiLowStockSubtext');

      if (kpiRev) kpiRev.textContent = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
      if (kpiOrders) kpiOrders.textContent = stats.totalOrders;
      if (kpiAOV) kpiAOV.textContent = `₹${stats.aov.toLocaleString('en-IN')}`;
      if (kpiLow) kpiLow.textContent = stats.lowStockCount;
      if (kpiActive) kpiActive.textContent = `${stats.activeOrdersCount} active`;

      if (kpiLowSub) {
        if (stats.lowStockCount > 0) {
          kpiLowSub.innerHTML = `<span style="color: var(--danger);">⚠️ ${stats.lowStockCount} items need baking/restock</span>`;
        } else {
          kpiLowSub.innerHTML = `<span>All catalog items healthy</span>`;
        }
      }

      // Render Recent Orders Table
      const recentBody = document.getElementById('dashboardRecentOrdersBody');
      if (recentBody) {
        if (stats.recentOrders.length === 0) {
          recentBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center; padding: 36px 16px; color: var(--cocoa-muted);">
                <div style="font-size: 1.8rem; margin-bottom: 8px;">🌸</div>
                <strong style="display: block; color: var(--cocoa-dark); margin-bottom: 4px;">No customer orders logged yet</strong>
                <span style="font-size: 0.84rem;">Orders placed via storefront checkout will appear here in real time.</span>
              </td>
            </tr>
          `;
        } else {
          recentBody.innerHTML = stats.recentOrders.map(o => `
            <tr>
              <td><strong>#${o.id}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.date || o.timeAgo || 'Recent'}</span></td>
              <td><strong>${this.escapeHTML(o.customerName)}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.phone}</span></td>
              <td>${Array.isArray(o.items) ? o.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Custom Bake'}</td>
              <td><strong>₹${(o.total || 0).toLocaleString('en-IN')}</strong></td>
              <td><span class="status-pill status-${o.status}">${this.formatStatus(o.status)}</span></td>
              <td><span class="badge-cod">💵 COD</span></td>
              <td>
                <div class="table-actions">
                  <button class="action-icon-btn" onclick="AdminApp.openInvoice('${o.id}')" title="Print Kitchen Slip">🖨️</button>
                  <button class="btn-whatsapp-pill" onclick="AdminApp.openWhatsAppModal('${o.id}', '${o.status}')" title="Dispatch Status Update">
                    <i class="fab fa-whatsapp"></i> Dispatch
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
        }
      }

      this.updateSidebarCounters();
    },

    // =========================================================================
    // 8. CATEGORIES / COLLECTIONS MODULE
    // =========================================================================
    populateCategoryDropdowns() {
      const categories = FloraDB.getCategories();
      
      // 1. In Product Drawer
      const prodCategory = document.getElementById('prodCategory');
      if (prodCategory) {
        prodCategory.innerHTML = categories.map(c => `
          <option value="${c.slug}">${c.icon || '🌸'} ${this.escapeHTML(c.name)}</option>
        `).join('');
      }

      // 2. In Product Catalog Filter
      const productCategoryFilter = document.getElementById('productCategoryFilter');
      if (productCategoryFilter) {
        const currentVal = productCategoryFilter.value;
        productCategoryFilter.innerHTML = `<option value="all">All Categories</option>` + categories.map(c => `
          <option value="${c.slug}">${c.icon || '🌸'} ${this.escapeHTML(c.name)}</option>
        `).join('');
        if (currentVal) productCategoryFilter.value = currentVal;
      }
    },

    renderCategoriesView() {
      this.renderCategoryCards();
      this.renderCategoriesTable();
    },

    renderCategoryCards() {
      const categories = FloraDB.getCategories();
      const container = document.getElementById('categoryCardsContainer');
      if (!container) return;

      container.innerHTML = categories.map(c => `
        <div class="category-admin-card">
          <div class="category-card-cover">
            <img src="${c.image || 'images/cat-cakes.jpg'}" alt="${this.escapeHTML(c.name)}" onerror="this.src='images/cat-cakes.jpg'">
            <div class="category-card-icon-badge">${c.icon || '🌸'}</div>
            <div class="category-card-count-badge">${c.productCount || 0} bakes</div>
          </div>
          <div class="category-card-body">
            <h3 class="category-card-title">${this.escapeHTML(c.name)}</h3>
            <span class="category-card-sub">${this.escapeHTML(c.categoryLabel || c.name)}</span>
            <p class="category-card-desc">${this.escapeHTML(c.description || 'Artisanal patisserie collection')}</p>
            <div class="category-card-footer">
              <span class="status-pill status-${c.status || 'active'}">${c.status === 'active' ? '● Active' : '○ Draft'}</span>
              <div class="table-actions">
                <button class="action-icon-btn" onclick="AdminApp.openEditCategory('${c.id}')">✏️ Edit</button>
                <button class="action-icon-btn" style="color: var(--danger);" onclick="AdminApp.deleteCategory('${c.id}')">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    },

    renderCategoriesTable() {
      const categories = FloraDB.getCategories();
      const tbody = document.getElementById('categoriesTableBody');
      const counter = document.getElementById('categoryCounterText');

      if (counter) counter.textContent = `Showing ${categories.length} category collections`;
      if (!tbody) return;

      tbody.innerHTML = categories.map(c => `
        <tr>
          <td>
            <div class="table-prod-cell">
              <img src="${c.image || 'images/cat-cakes.jpg'}" alt="${this.escapeHTML(c.name)}" class="table-prod-img" onerror="this.src='images/cat-cakes.jpg'">
              <div>
                <strong>${c.icon || '🌸'} ${this.escapeHTML(c.name)}</strong><br>
                <span style="font-size:0.75rem; color:var(--cocoa-muted);">${this.escapeHTML(c.categoryLabel || '')}</span>
              </div>
            </div>
          </td>
          <td><code>${c.slug}</code></td>
          <td><span style="font-size:0.82rem; color:var(--cocoa-muted);">${this.escapeHTML(c.description || '-')}</span></td>
          <td><strong>${c.productCount || 0} bakes</strong></td>
          <td><span class="status-pill status-${c.status || 'active'}">${c.status === 'active' ? 'Active' : 'Draft'}</span></td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" onclick="AdminApp.openEditCategory('${c.id}')">✏️ Edit</button>
              <button class="action-icon-btn" style="color: var(--danger);" onclick="AdminApp.deleteCategory('${c.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openCategoryDrawer() {
      this.editingCategoryId = null;
      document.getElementById('categoryDrawerTitle').textContent = 'Add New Category Collection';
      document.getElementById('categoryForm').reset();
      document.getElementById('catId').value = '';

      document.getElementById('categoryDrawer').classList.add('active');
      document.getElementById('categoryDrawerOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    openEditCategory(categoryId) {
      const c = FloraDB.getCategoryById(categoryId);
      if (!c) return;

      this.editingCategoryId = categoryId;
      document.getElementById('categoryDrawerTitle').textContent = `Edit Collection: ${c.name}`;
      document.getElementById('catId').value = c.id;
      document.getElementById('catName').value = c.name;
      document.getElementById('catSlug').value = c.slug;
      document.getElementById('catIcon').value = c.icon || '🌸';
      document.getElementById('catLabel').value = c.categoryLabel || '';
      document.getElementById('catDesc').value = c.description || '';
      document.getElementById('catImage').value = c.image || 'images/cat-cakes.jpg';
      document.getElementById('catOrder').value = c.order || 1;
      document.getElementById('catStatus').value = c.status || 'active';

      document.getElementById('categoryDrawer').classList.add('active');
      document.getElementById('categoryDrawerOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeCategoryDrawer() {
      document.getElementById('categoryDrawer').classList.remove('active');
      document.getElementById('categoryDrawerOverlay').classList.remove('active');
      document.body.style.overflow = '';
      this.editingCategoryId = null;
    },

    saveCategory() {
      const name = document.getElementById('catName').value.trim();
      const slug = document.getElementById('catSlug').value.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const icon = document.getElementById('catIcon').value.trim() || '🌸';
      const categoryLabel = document.getElementById('catLabel').value.trim();
      const description = document.getElementById('catDesc').value.trim();
      const image = document.getElementById('catImage').value;
      const order = Number(document.getElementById('catOrder').value) || 1;
      const status = document.getElementById('catStatus').value;

      if (!name || !slug) {
        this.showToast('Please fill in Category Name and Slug!', 'error');
        return;
      }

      FloraDB.saveCategory({
        id: this.editingCategoryId,
        name,
        slug,
        icon,
        categoryLabel,
        description,
        image,
        order,
        status
      });

      this.closeCategoryDrawer();
      this.showToast(`✨ Category "${name}" saved and live!`, 'success');
      this.populateCategoryDropdowns();
      this.renderCategoriesView();
    },

    deleteCategory(categoryId) {
      if (confirm('Are you sure you want to delete this category collection?')) {
        FloraDB.deleteCategory(categoryId);
        this.showToast('Category deleted.', 'info');
        this.populateCategoryDropdowns();
        this.renderCategoriesView();
      }
    },

    // =========================================================================
    // 9. PRODUCTS CATALOG & DRAWER CRUD
    // =========================================================================
    renderProductsTable() {
      const search = (document.getElementById('productSearchInput')?.value || '').trim();
      const category = document.getElementById('productCategoryFilter')?.value || 'all';
      const status = document.getElementById('productStatusFilter')?.value || 'all';

      const products = FloraDB.getProducts({ search, category, status });
      const tbody = document.getElementById('productsTableBody');
      const counter = document.getElementById('productCounterText');

      if (counter) counter.textContent = `Showing ${products.length} products`;
      if (!tbody) return;

      tbody.innerHTML = products.map(p => `
        <tr>
          <td>
            <div class="table-prod-cell">
              <img src="${p.image}" alt="${this.escapeHTML(p.name)}" class="table-prod-img" onerror="this.src='images/cat-cakes.jpg'">
              <div>
                <strong>${this.escapeHTML(p.name)}</strong><br>
                <span style="font-size:0.75rem; color:var(--cocoa-muted);">${p.sku || 'SKU-FLORA'}</span>
              </div>
            </div>
          </td>
          <td>${p.categoryLabel || p.category}</td>
          <td><strong>₹${p.price}</strong></td>
          <td>
            <span style="font-weight:700; color: ${p.stock <= 3 ? 'var(--danger)' : 'var(--text-dark)'};">
              ${p.stock} units
            </span>
          </td>
          <td><span class="diet-veg">100% Pure Veg</span></td>
          <td>${p.badge ? `<span class="product-tag-badge">${p.badge}</span>` : '-'}</td>
          <td><span class="status-pill status-${p.status || 'active'}">${p.status === 'active' ? 'Active' : 'Draft'}</span></td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" onclick="AdminApp.openEditProduct(${p.id})">✏️ Edit</button>
              <button class="action-icon-btn" style="color: var(--danger);" onclick="AdminApp.deleteProduct(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openProductDrawer() {
      this.editingProductId = null;
      document.getElementById('drawerTitle').textContent = 'Add Signature Bake';
      document.getElementById('productForm').reset();
      document.getElementById('prodId').value = '';
      this.setImagePreview('images/cat-cakes.jpg');

      document.getElementById('productDrawer').classList.add('active');
      document.getElementById('drawerOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    openEditProduct(productId) {
      const p = FloraDB.getProductById(productId);
      if (!p) return;

      this.editingProductId = productId;
      document.getElementById('drawerTitle').textContent = `Edit Bake: ${p.name}`;
      document.getElementById('prodId').value = p.id;
      document.getElementById('prodName').value = p.name;
      document.getElementById('prodCategory').value = p.category;
      document.getElementById('prodPrice').value = p.price;
      document.getElementById('prodComparePrice').value = p.comparePrice || '';
      document.getElementById('prodStock').value = p.stock;
      document.getElementById('prodUnit').value = p.unit || '0.5 kg';
      document.getElementById('prodBadge').value = p.badge || '';
      document.getElementById('prodStatus').value = p.status || 'active';
      document.getElementById('prodDesc').value = p.description || '';

      this.setImagePreview(p.image || 'images/cat-cakes.jpg');

      document.getElementById('productDrawer').classList.add('active');
      document.getElementById('drawerOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeProductDrawer() {
      document.getElementById('productDrawer').classList.remove('active');
      document.getElementById('drawerOverlay').classList.remove('active');
      document.body.style.overflow = '';
      this.editingProductId = null;
    },

    saveProduct() {
      const name = document.getElementById('prodName').value.trim();
      const category = document.getElementById('prodCategory').value;
      const price = Number(document.getElementById('prodPrice').value);
      const comparePrice = Number(document.getElementById('prodComparePrice').value) || null;
      const stock = Number(document.getElementById('prodStock').value);
      const unit = document.getElementById('prodUnit').value.trim() || '0.5 kg';
      const badge = document.getElementById('prodBadge').value.trim();
      const status = document.getElementById('prodStatus').value;
      const description = document.getElementById('prodDesc').value.trim();
      const image = document.getElementById('prodImageValue').value || 'images/cat-cakes.jpg';

      if (!name || !price) {
        this.showToast('Please fill in Name and Price!', 'error');
        return;
      }

      FloraDB.saveProduct({
        id: this.editingProductId,
        name,
        category,
        price,
        comparePrice,
        stock,
        unit,
        badge,
        status,
        description,
        image,
        eggless: true
      });

      this.closeProductDrawer();
      this.showToast(`✨ Bake "${name}" saved and synced to storefront!`, 'success');
      this.renderProductsTable();
      this.renderDashboard();
    },

    deleteProduct(productId) {
      if (confirm('Are you sure you want to delete this signature bake?')) {
        FloraDB.deleteProduct(productId);
        this.showToast('Bake removed from catalog.', 'info');
        this.renderProductsTable();
        this.renderDashboard();
      }
    },

    // =========================================================================
    // 10. INVENTORY RADAR
    // =========================================================================
    renderInventoryTable() {
      const search = (document.getElementById('inventorySearchInput')?.value || '').trim();
      const filter = document.getElementById('inventoryStockFilter')?.value || 'all';

      let products = FloraDB.getProducts({ search });
      if (filter === 'low') products = products.filter(p => p.stock > 0 && p.stock <= 3);
      if (filter === 'out') products = products.filter(p => p.stock <= 0);

      const tbody = document.getElementById('inventoryTableBody');
      if (!tbody) return;

      tbody.innerHTML = products.map(p => `
        <tr>
          <td>
            <div class="table-prod-cell">
              <img src="${p.image}" alt="${this.escapeHTML(p.name)}" class="table-prod-img">
              <strong>${this.escapeHTML(p.name)}</strong>
            </div>
          </td>
          <td>${p.sku || 'SKU-FLORA'}</td>
          <td><strong>${p.stock} units</strong></td>
          <td>
            <div class="stock-adjust-group">
              <button class="btn-stock-adjust" onclick="AdminApp.adjustStock(${p.id}, -1)">-1</button>
              <button class="btn-stock-adjust" onclick="AdminApp.adjustStock(${p.id}, 1)">+1</button>
              <button class="btn-stock-adjust" onclick="AdminApp.adjustStock(${p.id}, 5)">+5</button>
            </div>
          </td>
          <td>
            ${p.stock <= 0 
              ? '<span class="status-pill status-out">Sold Out (0)</span>' 
              : p.stock <= 3 
                ? '<span class="status-pill status-low">Low Stock</span>' 
                : '<span class="status-pill status-active">Optimal</span>'}
          </td>
          <td>${p.unit || '0.5 kg'}</td>
        </tr>
      `).join('');
    },

    adjustStock(productId, delta) {
      FloraDB.adjustStock(productId, delta);
      this.renderInventoryTable();
      this.renderDashboard();
    },

    // =========================================================================
    // 11. ORDERS PIPELINE & LIVE LOGISTICS DISPATCH
    // =========================================================================
    renderOrdersTable() {
      const search = (document.getElementById('orderSearchInput')?.value || '').trim();
      const status = document.getElementById('orderStatusFilter')?.value || 'all';

      const orders = FloraDB.getOrders({ search, status });
      const tbody = document.getElementById('ordersTableBody');
      if (!tbody) return;

      if (orders.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 48px 16px; color: var(--cocoa-muted);">
              <div style="font-size: 2.2rem; margin-bottom: 8px;">🛍️</div>
              <h3 style="font-size: 1.1rem; color: var(--cocoa-dark); margin-bottom: 6px;">Zero Orders in Queue</h3>
              <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto 14px;">
                Your bakery order pipeline is clean. When customers place orders via the storefront on-site checkout, they will instantly appear here with email receipts & notification alerts.
              </p>
              <a href="index.html" target="_blank" class="btn-primary btn-touch">🌸 Open Storefront to Test Order</a>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = orders.map(o => `
        <tr>
          <td>
            <strong>#${o.id}</strong><br>
            <span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.date || o.timeAgo || 'Recent'}</span>
          </td>
          <td>
            <strong>${this.escapeHTML(o.customerName)}</strong><br>
            <span style="font-size:0.78rem; color:var(--cocoa-muted);">📞 ${o.phone}</span><br>
            <span style="font-size:0.75rem; color:var(--rose-deep);">${this.escapeHTML(o.email || '')}</span><br>
            <span style="font-size:0.75rem; color:var(--cocoa-light);">${this.escapeHTML(o.address || 'Nashik')}</span>
            ${o.deliveryDate ? `<div style="font-size:0.74rem; font-weight:700; color:#059669; margin-top:2px;">📅 ${o.deliveryDate} (${o.timeSlot || 'Afternoon'})</div>` : ''}
          </td>
          <td>
            <div style="font-size:0.85rem;">
              ${Array.isArray(o.items) ? o.items.map(i => `<div>&bull; ${i.name} <strong>x${i.qty}</strong></div>`).join('') : 'Custom Order'}
            </div>
            ${o.cakeMessage ? `<div style="font-size:0.74rem; color:var(--rose-deep); font-weight:700; margin-top:3px;">Cake Msg: "${this.escapeHTML(o.cakeMessage)}"</div>` : ''}
            ${o.notes ? `<div style="font-size:0.74rem; color:var(--cocoa-muted); margin-top:2px;">Notes: "${this.escapeHTML(o.notes)}"</div>` : ''}
          </td>
          <td>
            <strong>₹${(o.total || 0).toLocaleString('en-IN')}</strong><br>
            <span class="badge-cod" style="margin-top:4px;">💵 COD</span>
          </td>
          <td>
            <select class="select-filter" style="padding: 6px 10px; font-size: 0.8rem;" onchange="AdminApp.changeOrderStatus('${o.id}', this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="baking" ${o.status === 'baking' ? 'selected' : ''}>👩‍🍳 Baking in Oven</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>🚚 Out for Delivery</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
            </select>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" onclick="AdminApp.openInvoice('${o.id}')" title="Print Kitchen Slip">🖨️ Slip</button>
              <button class="action-icon-btn" onclick="AdminApp.openAdminEmailPreview('${o.id}')" title="View Customer Email Receipt">✉️ Email</button>
              <button class="btn-whatsapp-pill" onclick="AdminApp.openWhatsAppModal('${o.id}', '${o.status}')" title="Dispatch Status Update via WhatsApp">
                <i class="fab fa-whatsapp"></i> WA
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    changeOrderStatus(orderId, newStatus) {
      FloraDB.updateOrderStatus(orderId, newStatus);
      this.showToast(`Order #${orderId} status updated to "${this.formatStatus(newStatus)}"`, 'success');
      this.renderDashboard();
      this.renderOrdersTable();

      // Offer 1-click prompt to dispatch status via WhatsApp
      setTimeout(() => {
        if (confirm(`Would you like to send a real-time WhatsApp status update to the customer for "${this.formatStatus(newStatus)}"?`)) {
          this.openWhatsAppModal(orderId, newStatus);
        }
      }, 300);
    },

    // =========================================================================
    // 12. WHATSAPP LOGISTICS STATUS DISPATCHER
    // =========================================================================
    openWhatsAppModal(orderId, templateType = 'baking') {
      const order = FloraDB.getOrderById(orderId);
      if (!order) return;

      this.activeWhatsAppOrderId = orderId;

      const modal = document.getElementById('whatsappModal');
      const overlay = document.getElementById('whatsappModalOverlay');
      const phoneInput = document.getElementById('waRecipientPhone');
      const select = document.getElementById('waTemplateSelect');

      if (!modal) return;

      if (phoneInput) phoneInput.value = `${order.customerName} (${order.phone})`;
      if (select) select.value = templateType || 'baking';

      this.handleWATemplateChange(templateType || 'baking');

      if (overlay) overlay.classList.add('active');
      modal.classList.add('active');
    },

    closeWhatsAppModal() {
      const modal = document.getElementById('whatsappModal');
      const overlay = document.getElementById('whatsappModalOverlay');
      if (modal) modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      this.activeWhatsAppOrderId = null;
    },

    handleWATemplateChange(templateType) {
      const order = FloraDB.getOrderById(this.activeWhatsAppOrderId);
      if (!order) return;

      const textarea = document.getElementById('waMessageText');
      if (!textarea) return;

      let msg = "";

      if (templateType === 'baking') {
        msg = `🌸 *The Flora Bakery, Nashik* - Baking in Progress! 👩‍🍳\n\nHello *${order.customerName}*,\n\nGreat news! Our pastry chef has started handcrafting your order *#${order.id}* using 100% pure butter and fresh edible blooms.\n\n📅 *Scheduled Delivery:* ${order.deliveryDate || 'Today'} (${order.timeSlot || 'Afternoon Slot'})\n📍 *Delivery To:* ${order.address}\n\nWe will notify you once your bake heads out for chilled doorstep delivery! ✨`;
      } else if (templateType === 'shipped') {
        msg = `🚚 *The Flora Bakery, Nashik* - Out for Chilled Delivery! 🌸\n\nHello *${order.customerName}*,\n\nYour order *#${order.id}* is safely packed in our specialized chilled box and is out for delivery with our courier partner in Nashik!\n\n💵 *Payment Mode:* Cash on Delivery (COD)\n💰 *Total Amount Due:* ₹${(order.total || 0).toLocaleString('en-IN')}\n📍 *Destination:* ${order.address}\n\nPlease keep the exact cash ready or you can pay via UPI on delivery. Thank you! 🍰`;
      } else if (templateType === 'delivered') {
        msg = `💖 *The Flora Bakery, Nashik* - Delivered with Love! 🌸\n\nHello *${order.customerName}*,\n\nYour fresh artisanal bakes (Order *#${order.id}*) have been delivered!\n\n❄️ *Chef's Storage Tip:* For the best taste & floral freshness, refrigerate at 4°C - 6°C and consume within 24-48 hours.\n\nWe hope you love every bite! Feel free to tag us on Instagram *@theflorabakery*. 🍰✨`;
      } else {
        msg = `🌸 *The Flora Bakery, Nashik* - Order Update\n\nHello *${order.customerName}*,\n\nRegarding your order *#${order.id}*:\n\nThank you for choosing The Flora Bakery! ✨`;
      }

      textarea.value = msg;
    },

    dispatchWhatsAppMessage() {
      const order = FloraDB.getOrderById(this.activeWhatsAppOrderId);
      if (!order) return;

      const textarea = document.getElementById('waMessageText');
      const text = textarea ? textarea.value : '';

      const cleanPhone = (order.phone || '').replace(/\D/g, '');
      const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      this.closeWhatsAppModal();
      this.showToast(`🚀 Opening WhatsApp to dispatch update to ${order.customerName}...`, 'success');

      window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`, '_blank');
    },

    // =========================================================================
    // 13. PRINTABLE KITCHEN INVOICE & SLIP GENERATOR
    // =========================================================================
    openInvoice(orderId) {
      const o = FloraDB.getOrderById(orderId);
      if (!o) return;

      const modal = document.getElementById('invoiceModal');
      const overlay = document.getElementById('invoiceModalOverlay');
      const content = document.getElementById('invoicePrintContent');

      if (!modal || !content) return;

      content.innerHTML = `
        <div class="invoice-header">
          <div>
            <div class="invoice-brand-title">🌸 THE FLORA BAKERY</div>
            <div style="font-size: 0.78rem; color: #666;">Ibadat Villa, Sai Nath Nagar, Nashik &bull; 070835 17862</div>
          </div>
          <div style="text-align: right;">
            <div class="invoice-order-num">KITCHEN SLIP #${o.id}</div>
            <div style="font-size: 0.78rem; color: #666;">Date: ${o.date || new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div class="invoice-details-grid">
          <div>
            <strong>Deliver To:</strong><br>
            <span>${this.escapeHTML(o.customerName)}</span><br>
            <span>📞 ${o.phone}</span><br>
            <span>✉️ ${this.escapeHTML(o.email || '')}</span><br>
            <span>📍 ${this.escapeHTML(o.address)}</span>
            ${o.deliveryDate ? `<div style="font-weight:700; color:#059669; margin-top:4px;">Delivery: ${o.deliveryDate} (${o.timeSlot || 'Afternoon'})</div>` : ''}
          </div>
          <div style="text-align: right;">
            <strong>Status:</strong> <span class="status-pill status-${o.status}">${this.formatStatus(o.status)}</span><br>
            <strong style="margin-top: 4px; display: inline-block;">Payment:</strong> Cash on Delivery (COD)<br>
            <span style="color:#059669; font-weight:700;">Collect ₹${(o.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>Bake Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Rate</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${Array.isArray(o.items) && o.items.length > 0 ? o.items.map(i => `
              <tr>
                <td><strong>${this.escapeHTML(i.name)}</strong></td>
                <td style="text-align: center;">${i.qty}</td>
                <td style="text-align: right;">₹${i.price}</td>
                <td style="text-align: right;">₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="4">Custom Celebration Bake</td>
              </tr>
            `}
          </tbody>
        </table>

        ${o.cakeMessage ? `
          <div class="invoice-note-box" style="border-left:3px solid #D44E72; margin-bottom:8px;">
            <strong>🎂 Message on Cake:</strong> "${this.escapeHTML(o.cakeMessage)}"
          </div>
        ` : ''}

        ${o.notes ? `
          <div class="invoice-note-box">
            <strong>👩‍🍳 Special Baker Notes:</strong> ${this.escapeHTML(o.notes)}
          </div>
        ` : ''}

        <div class="invoice-total-row">
          <span>Subtotal: ₹${o.subtotal || o.total}</span>
          ${o.discount ? `<span style="color: #D44E72;">Discount: -₹${o.discount}</span>` : ''}
          <span style="color: #3E2723;">Grand Total (COD): ₹${(o.total || 0).toLocaleString('en-IN')}</span>
        </div>
      `;

      if (overlay) overlay.classList.add('active');
      modal.classList.add('active');
    },

    closeInvoice() {
      const modal = document.getElementById('invoiceModal');
      const overlay = document.getElementById('invoiceModalOverlay');
      if (modal) modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    },

    // =========================================================================
    // 14. ADMIN EMAIL RECEIPT PREVIEW (CRM)
    // =========================================================================
    openAdminEmailPreview(orderId) {
      const order = FloraDB.getOrderById(orderId);
      if (!order) return;

      const modal = document.getElementById('adminEmailModal');
      const overlay = document.getElementById('adminEmailModalOverlay');
      const meta = document.getElementById('adminEmailModalMeta');
      const body = document.getElementById('adminEmailModalBody');

      if (!modal) return;

      if (meta) {
        meta.innerHTML = `
          <div><strong>To:</strong> ${this.escapeHTML(order.customerName)} &lt;${this.escapeHTML(order.email || 'N/A')}&gt;</div>
          <div><strong>Dispatched:</strong> ${order.date || 'Today'} &bull; <strong>Status:</strong> Delivered to Mailbox</div>
        `;
      }

      if (body && typeof FloraDB.generateEmailHTML === 'function') {
        body.innerHTML = FloraDB.generateEmailHTML(order);
      }

      if (overlay) overlay.classList.add('active');
      modal.classList.add('active');
    },

    closeAdminEmailModal() {
      const modal = document.getElementById('adminEmailModal');
      const overlay = document.getElementById('adminEmailModalOverlay');
      if (modal) modal.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    },

    // =========================================================================
    // 15. CUSTOMERS DIRECTORY & CRM
    // =========================================================================
    renderCustomersTable() {
      const search = (document.getElementById('customerSearchInput')?.value || '').trim();
      const customers = FloraDB.getCustomers({ search });
      const tbody = document.getElementById('customersTableBody');
      if (!tbody) return;

      if (customers.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding: 40px 16px; color: var(--cocoa-muted);">
              No customers logged yet. As customers order or submit custom cake consultations, their profiles and Lifetime Value (LTV) will track automatically here.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = customers.map(c => `
        <tr>
          <td><strong>${this.escapeHTML(c.name)}</strong></td>
          <td>📞 ${c.phone || 'N/A'}</td>
          <td><span style="font-size:0.82rem; color:var(--cocoa-muted);">${this.escapeHTML(c.address || 'Nashik')}</span></td>
          <td><strong>${c.ordersCount}</strong></td>
          <td><strong>₹${(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
          <td>
            <span class="status-pill ${c.tag === 'VIP Patron' ? 'tag-vip' : c.tag === 'Repeat Client' ? 'tag-repeat' : 'tag-first'}">
              ${c.tag}
            </span>
          </td>
          <td>
            <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppCustomer('${encodeURIComponent(c.phone)}', '${encodeURIComponent(c.name)}')">
              <span>💬 WhatsApp</span>
            </button>
          </td>
        </tr>
      `).join('');
    },

    openWhatsAppCustomer(phone, name) {
      const cleanPhone = decodeURIComponent(phone).replace(/\D/g, '');
      const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const msg = `🌸 *The Flora Bakery, Nashik*%0A%0AHello *${name}*,%0AThank you for being a valued patron of The Flora Bakery! Let us know if you would like to explore our fresh floral bakes today! ✨`;
      window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
    },

    // =========================================================================
    // 16. ANALYTICS & REPORTS
    // =========================================================================
    renderAnalyticsView() {
      const stats = FloraDB.getAnalytics();

      const topBody = document.getElementById('topSellingTableBody');
      if (topBody) {
        if (stats.topSelling.length === 0) {
          topBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:24px; color:var(--cocoa-muted);">No sales data available yet.</td></tr>`;
        } else {
          topBody.innerHTML = stats.topSelling.map((item, idx) => `
            <tr>
              <td><strong>#${idx + 1}</strong> ${this.escapeHTML(item.name)}</td>
              <td>${item.units} units</td>
              <td><strong>₹${item.revenue.toLocaleString('en-IN')}</strong></td>
            </tr>
          `).join('');
        }
      }

      const shareContainer = document.getElementById('categoryShareBars');
      if (shareContainer) {
        const categories = FloraDB.getCategories();
        shareContainer.innerHTML = categories.map(c => {
          const count = c.productCount || 0;
          const pct = stats.totalProducts > 0 ? Math.round((count / stats.totalProducts) * 100) : 25;
          return `
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                <strong>${c.icon || '🌸'} ${this.escapeHTML(c.name)}</strong>
                <span>${count} bakes (${pct}%)</span>
              </div>
              <div style="height: 8px; background: var(--admin-surface-subtle); border-radius: 4px; overflow:hidden;">
                <div style="height: 100%; width: ${pct}%; background: var(--rose-primary); border-radius: 4px;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    },

    downloadCSV(csvContent, fileName) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast(`📥 Exported ${fileName}!`, 'success');
    },

    // =========================================================================
    // 17. DISCOUNTS & COUPONS
    // =========================================================================
    renderDiscountsTable() {
      const discounts = FloraDB.getDiscounts();
      const tbody = document.getElementById('discountsTableBody');
      if (!tbody) return;

      tbody.innerHTML = discounts.map(d => `
        <tr>
          <td><strong style="letter-spacing:0.05em;">${d.code}</strong></td>
          <td>${d.type === 'percent' ? `<strong>${d.value}% OFF</strong>` : `<strong>₹${d.value} Flat OFF</strong>`}</td>
          <td>₹${d.minOrder}</td>
          <td>${this.escapeHTML(d.description || '')}</td>
          <td>${d.usageCount || 0} times</td>
          <td><span class="status-pill ${d.active ? 'status-active' : 'status-draft'}">${d.active ? 'Active' : 'Disabled'}</span></td>
          <td>
            <button class="action-icon-btn" style="color:var(--danger);" onclick="AdminApp.deleteDiscount('${d.code}')">🗑️ Delete</button>
          </td>
        </tr>
      `).join('');
    },

    deleteDiscount(code) {
      FloraDB.deleteDiscount(code);
      this.showToast(`Coupon ${code} removed.`, 'info');
      this.renderDiscountsTable();
    },

    // =========================================================================
    // 18. CUSTOM CAKE INQUIRIES
    // =========================================================================
    renderInquiriesTable() {
      const inqs = FloraDB.getInquiries();
      const tbody = document.getElementById('inquiriesTableBody');
      if (!tbody) return;

      if (inqs.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding: 40px 16px; color: var(--cocoa-muted);">
              Zero custom inquiries logged. Custom cake builder submissions from the storefront appear here.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = inqs.map(i => `
        <tr>
          <td><strong>#${i.id}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${i.date || 'Recent'}</span></td>
          <td><strong>${this.escapeHTML(i.customerName)}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${i.phone}</span></td>
          <td>${this.escapeHTML(i.occasion || 'Celebration')} &bull; ${i.size || '1.0 kg'}</td>
          <td>${this.escapeHTML(i.flavor || 'Floral Chiffon')} &bull; ${this.escapeHTML(i.palette || 'Blush')}</td>
          <td>${i.requiredDate || 'TBD'}</td>
          <td><span class="status-pill status-${i.status || 'new'}">${this.formatStatus(i.status || 'new')}</span></td>
          <td>
            <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppCustomer('${encodeURIComponent(i.phone)}', '${encodeURIComponent(i.customerName)}')">
              <span>💬 Quote</span>
            </button>
          </td>
        </tr>
      `).join('');
    },

    // =========================================================================
    // 19. SETTINGS & MARKETING
    // =========================================================================
    renderSettingsView() {
      const s = FloraDB.getSettings();
      const setStoreName = document.getElementById('setStoreName');
      const setAnnouncement = document.getElementById('setAnnouncement');
      const setStoreNotice = document.getElementById('setStoreNotice');
      const setWhatsApp = document.getElementById('setWhatsApp');
      const setFreeShipping = document.getElementById('setFreeShipping');
      const setAddress = document.getElementById('setAddress');

      if (setStoreName) setStoreName.value = s.storeName || 'The Flora Bakery';
      if (setAnnouncement) setAnnouncement.value = s.announcementText || '';
      if (setStoreNotice) setStoreNotice.value = s.storeNotice || '';
      if (setWhatsApp) setWhatsApp.value = s.whatsapp || '917083517862';
      if (setFreeShipping) setFreeShipping.value = s.freeShippingThreshold || 999;
      if (setAddress) setAddress.value = s.address || 'Ibadat Villa, Sai Nath Nagar, Nashik';
    },

    // =========================================================================
    // 20. COMMAND PALETTE (⌘K / CTRL+K)
    // =========================================================================
    setupKeyboardShortcuts() {
      const palette = document.getElementById('commandPalette');
      const input = document.getElementById('paletteInput');
      const trigger = document.getElementById('globalSearchTrigger');

      const openPalette = () => {
        if (palette) {
          palette.classList.add('active');
          if (input) {
            input.value = '';
            input.focus();
            this.renderPaletteResults('');
          }
        }
      };

      const closePalette = () => {
        if (palette) palette.classList.remove('active');
      };

      if (trigger) trigger.addEventListener('click', openPalette);

      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          if (palette && palette.classList.contains('active')) closePalette();
          else openPalette();
        }
        if (e.key === 'Escape' && palette && palette.classList.contains('active')) {
          closePalette();
        }
      });

      if (palette) {
        palette.addEventListener('click', (e) => {
          if (e.target === palette) closePalette();
        });
      }

      if (input) {
        input.addEventListener('input', (e) => {
          this.renderPaletteResults(e.target.value);
        });
      }
    },

    renderPaletteResults(query) {
      const resultsBox = document.getElementById('paletteResults');
      if (!resultsBox) return;

      const q = query.toLowerCase().trim();
      const products = FloraDB.getProducts();
      const categories = FloraDB.getCategories();

      const defaultCommands = [
        { icon: '📊', label: 'Go to Dashboard', action: () => this.switchView('dashboard') },
        { icon: '🎂', label: 'View Products Catalog', action: () => this.switchView('products') },
        { icon: '🌸', label: 'Category Collections Studio', action: () => this.switchView('categories') },
        { icon: '➕', label: 'Add New Signature Bake', action: () => this.openProductDrawer() },
        { icon: '📁', label: 'Create New Category Collection', action: () => this.openCategoryDrawer() },
        { icon: '📋', label: 'Stock & Inventory Radar', action: () => this.switchView('inventory') },
        { icon: '🛍️', label: 'Customer Orders Pipeline', action: () => this.switchView('orders') },
        { icon: '👥', label: 'Customer Directory & CRM', action: () => this.switchView('customers') },
        { icon: '📈', label: 'Analytics & Sales Reports', action: () => this.switchView('analytics') },
        { icon: '🏷️', label: 'Discounts & Promo Engine', action: () => this.switchView('discounts') },
        { icon: '💌', label: 'Custom Cake Consultations', action: () => this.switchView('inquiries') },
        { icon: '⚙️', label: 'Store Settings & Marketing', action: () => this.switchView('settings') },
        { icon: '🌸', label: 'Open Public Storefront', action: () => window.open('index.html', '_blank') }
      ];

      let filteredCommands = defaultCommands.filter(c => c.label.toLowerCase().includes(q));

      let matchedProducts = [];
      let matchedCategories = [];
      if (q) {
        matchedProducts = products.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
        matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q));
      }

      let html = '';

      if (filteredCommands.length > 0) {
        html += `<div style="font-size: 0.7rem; font-weight:700; color:var(--cocoa-light); text-transform:uppercase; padding: 6px 12px;">Navigation & Commands</div>`;
        html += filteredCommands.map((cmd, idx) => `
          <div class="palette-item" data-cmd-idx="${idx}">
            <span>${cmd.icon}</span>
            <span>${cmd.label}</span>
          </div>
        `).join('');
      }

      if (matchedCategories.length > 0) {
        html += `<div style="font-size: 0.7rem; font-weight:700; color:var(--cocoa-light); text-transform:uppercase; padding: 10px 12px 6px;">Matching Categories (${matchedCategories.length})</div>`;
        html += matchedCategories.map(c => `
          <div class="palette-item" data-cat-id="${c.id}">
            <span>${c.icon || '🌸'}</span>
            <span>${this.escapeHTML(c.name)}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--cocoa-muted);">${c.productCount || 0} items</span>
          </div>
        `).join('');
      }

      if (matchedProducts.length > 0) {
        html += `<div style="font-size: 0.7rem; font-weight:700; color:var(--cocoa-light); text-transform:uppercase; padding: 10px 12px 6px;">Matching Products (${matchedProducts.length})</div>`;
        html += matchedProducts.map(p => `
          <div class="palette-item" data-prod-id="${p.id}">
            <img src="${p.image || 'images/cat-cakes.jpg'}" style="width:22px; height:22px; border-radius:4px; object-fit:cover;">
            <span>${this.escapeHTML(p.name)}</span>
            <span style="margin-left:auto; font-size:0.75rem; color:var(--cocoa-muted);">₹${p.price} &bull; Stock: ${p.stock}</span>
          </div>
        `).join('');
      }

      if (!html) {
        html = `<div style="text-align:center; padding: 24px; color:var(--cocoa-muted); font-size:0.88rem;">No matching commands or bakes for "${this.escapeHTML(q)}"</div>`;
      }

      resultsBox.innerHTML = html;

      resultsBox.querySelectorAll('[data-cmd-idx]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = Number(el.getAttribute('data-cmd-idx'));
          filteredCommands[idx].action();
          document.getElementById('commandPalette').classList.remove('active');
        });
      });

      resultsBox.querySelectorAll('[data-cat-id]').forEach(el => {
        el.addEventListener('click', () => {
          const cid = el.getAttribute('data-cat-id');
          this.switchView('categories');
          document.getElementById('commandPalette').classList.remove('active');
        });
      });

      resultsBox.querySelectorAll('[data-prod-id]').forEach(el => {
        el.addEventListener('click', () => {
          const pid = Number(el.getAttribute('data-prod-id'));
          this.openEditProduct(pid);
          document.getElementById('commandPalette').classList.remove('active');
        });
      });
    },

    // =========================================================================
    // 21. UTILITIES & TOAST ENGINE
    // =========================================================================
    showToast(message, type = 'success') {
      const container = document.getElementById('adminToastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `admin-toast ${type}`;
      toast.innerHTML = `
        <span>${type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✨'}</span>
        <span>${this.escapeHTML(message)}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    },

    formatStatus(status) {
      const map = {
        pending: 'Pending',
        baking: 'Baking in Oven',
        shipped: 'Out for Delivery',
        delivered: 'Delivered',
        active: 'Active',
        draft: 'Draft',
        new: 'New Lead'
      };
      return map[status] || status;
    },

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // Expose and Init
  window.AdminApp = AdminApp;
  document.addEventListener('DOMContentLoaded', () => AdminApp.init());

})();
