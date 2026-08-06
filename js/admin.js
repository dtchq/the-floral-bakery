/**
 * THE FLORA BAKERY - ADMIN SUITE CONTROLLER
 * High-performance, Apple-grade interface manager
 * Handles Authentication, Real-time CRUD, Categories Module, Customers CRM, Deep Analytics, Printable Slips & WhatsApp Dispatch
 */

(function() {
  'use strict';

  const AdminApp = {
    currentView: 'dashboard',
    editingProductId: null,
    editingCategoryId: null,

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

      // Category Drawer Controls
      const categoryDrawerCloseBtn = document.getElementById('categoryDrawerCloseBtn');
      const categoryDrawerCancelBtn = document.getElementById('categoryDrawerCancelBtn');
      const categoryDrawerOverlay = document.getElementById('categoryDrawerOverlay');
      const categoryDrawerSaveBtn = document.getElementById('categoryDrawerSaveBtn');

      if (categoryDrawerCloseBtn) categoryDrawerCloseBtn.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerCancelBtn) categoryDrawerCancelBtn.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerOverlay) categoryDrawerOverlay.addEventListener('click', () => this.closeCategoryDrawer());
      if (categoryDrawerSaveBtn) categoryDrawerSaveBtn.addEventListener('click', () => this.saveCategoryFromDrawer());

      // Auto-slug generator for category name
      const catNameInput = document.getElementById('catName');
      const catSlugInput = document.getElementById('catSlug');
      if (catNameInput && catSlugInput) {
        catNameInput.addEventListener('input', () => {
          if (!this.editingCategoryId) {
            catSlugInput.value = catNameInput.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
          }
        });
      }

      // Refresh Analytics Button
      const btnRefreshAnalytics = document.getElementById('btnRefreshAnalytics');
      if (btnRefreshAnalytics) {
        btnRefreshAnalytics.addEventListener('click', () => {
          this.renderDashboard();
          this.renderAnalyticsView();
          this.showToast('Analytics refreshed with live store data.', 'info');
        });
      }

      // Product Drawer Controls
      const drawerCloseBtn = document.getElementById('drawerCloseBtn');
      const drawerCancelBtn = document.getElementById('drawerCancelBtn');
      const productDrawerOverlay = document.getElementById('productDrawerOverlay');
      if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => this.closeProductDrawer());
      if (drawerCancelBtn) drawerCancelBtn.addEventListener('click', () => this.closeProductDrawer());
      if (productDrawerOverlay) productDrawerOverlay.addEventListener('click', () => this.closeProductDrawer());

      // Product Save Form
      const drawerSaveBtn = document.getElementById('drawerSaveBtn');
      if (drawerSaveBtn) {
        drawerSaveBtn.addEventListener('click', () => this.saveProductFromDrawer());
      }

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
        this.showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Image is too large. Please choose an image under 5MB.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        this.setImagePreview(base64Data);
        this.showToast('📷 Photo uploaded and set for this bake!', 'success');
      };
      reader.readAsDataURL(file);
    },

    setImagePreview(src) {
      const promptBox = document.getElementById('uploadPrompt');
      const previewBox = document.getElementById('imagePreviewContainer');
      const previewImg = document.getElementById('imagePreviewImg');
      const hiddenInput = document.getElementById('prodImage');

      if (!hiddenInput) return;

      hiddenInput.value = src || 'images/cat-cakes.jpg';

      if (previewImg && promptBox && previewBox) {
        if (src) {
          previewImg.src = src;
          previewBox.style.display = 'block';
          promptBox.style.display = 'none';
        } else {
          previewBox.style.display = 'none';
          promptBox.style.display = 'flex';
        }
      }
    },

    // =========================================================================
    // 4. MOBILE SIDEBAR CONTROL
    // =========================================================================
    openMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('active');
    },

    closeMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      const backdrop = document.getElementById('sidebarBackdrop');
      if (sidebar) sidebar.classList.remove('mobile-open');
      if (backdrop) backdrop.classList.remove('active');
    },

    toggleMobileSidebar() {
      const sidebar = document.getElementById('adminSidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        this.closeMobileSidebar();
      } else {
        this.openMobileSidebar();
      }
    },

    // =========================================================================
    // 5. VIEW ROUTING & DATA RENDERING
    // =========================================================================
    switchView(viewName) {
      this.currentView = viewName;

      document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
      });

      document.querySelectorAll('.admin-mobile-nav .mobile-nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
      });

      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      const targetView = document.getElementById(`view-${viewName}`);
      if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

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
      this.updateSidebarCounters();
    },

    listenToDataChanges() {
      window.addEventListener('flora:data-changed', () => {
        this.loadAllData();
      });
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
    // 6. DASHBOARD VIEW
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
                <span style="font-size: 0.84rem;">Orders placed via WhatsApp checkout will appear here in real time.</span>
              </td>
            </tr>
          `;
        } else {
          recentBody.innerHTML = stats.recentOrders.map(o => `
            <tr>
              <td><strong>${o.id}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.date || o.timeAgo || 'Recent'}</span></td>
              <td><strong>${this.escapeHTML(o.customerName)}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.phone}</span></td>
              <td>${Array.isArray(o.items) ? o.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Custom Bake'}</td>
              <td><strong>₹${(o.total || 0).toLocaleString('en-IN')}</strong></td>
              <td><span class="status-pill status-${o.status}">${this.formatStatus(o.status)}</span></td>
              <td>${o.paymentStatus || 'WhatsApp Order'}</td>
              <td>
                <div class="table-actions">
                  <button class="action-icon-btn" onclick="AdminApp.openInvoice('${o.id}')" title="Print Kitchen Slip">🖨️</button>
                  <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppOrder('${o.id}')">
                    <span>📱 WA</span>
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
    // 7. CATEGORIES / COLLECTIONS MODULE (Shopify-Grade)
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

      if (counter) counter.textContent = `${categories.length} Collections`;
      if (!tbody) return;

      tbody.innerHTML = categories.map(c => `
        <tr>
          <td>
            <div class="table-product-cell">
              <img src="${c.image || 'images/cat-cakes.jpg'}" class="table-product-thumb" alt="${this.escapeHTML(c.name)}" onerror="this.src='images/cat-cakes.jpg'">
              <div>
                <strong>${c.icon || '🌸'} ${this.escapeHTML(c.name)}</strong>
                <div style="font-size: 0.75rem; color: var(--cocoa-muted);">${this.escapeHTML(c.description || '')}</div>
              </div>
            </div>
          </td>
          <td><code>${c.slug}</code></td>
          <td>${this.escapeHTML(c.categoryLabel || '—')}</td>
          <td><strong>${c.productCount || 0} products</strong></td>
          <td><span class="status-pill status-${c.status || 'active'}">${c.status === 'active' ? '● Active' : '○ Draft'}</span></td>
          <td>#${c.order || 1}</td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" onclick="AdminApp.openEditCategory('${c.id}')">✏️ Edit</button>
              <button class="action-icon-btn" style="color: var(--danger);" onclick="AdminApp.deleteCategory('${c.id}')">🗑️ Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openCategoryDrawer(cat = null) {
      this.editingCategoryId = cat ? (cat.id || cat.slug) : null;
      const drawer = document.getElementById('categoryDrawer');
      const overlay = document.getElementById('categoryDrawerOverlay');
      const title = document.getElementById('categoryDrawerTitle');

      if (!drawer || !overlay) return;

      if (cat) {
        title.textContent = `Edit Collection "${cat.name}"`;
        document.getElementById('catId').value = cat.id || cat.slug;
        document.getElementById('catName').value = cat.name;
        document.getElementById('catSlug').value = cat.slug;
        document.getElementById('catIcon').value = cat.icon || '🌸';
        document.getElementById('catLabel').value = cat.categoryLabel || '';
        document.getElementById('catDesc').value = cat.description || '';
        document.getElementById('catImage').value = cat.image || 'images/cat-cakes.jpg';
        document.getElementById('catOrder').value = cat.order || 1;
        document.getElementById('catStatus').value = cat.status || 'active';
      } else {
        title.textContent = "Add New Category Collection";
        document.getElementById('categoryForm').reset();
        document.getElementById('catId').value = '';
        document.getElementById('catIcon').value = '🌸';
        document.getElementById('catOrder').value = FloraDB.getCategories().length + 1;
      }

      overlay.classList.add('active');
      drawer.classList.add('active');
    },

    openEditCategory(id) {
      const cat = FloraDB.getCategoryById(id);
      if (cat) this.openCategoryDrawer(cat);
    },

    closeCategoryDrawer() {
      const drawer = document.getElementById('categoryDrawer');
      const overlay = document.getElementById('categoryDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      this.editingCategoryId = null;
    },

    saveCategoryFromDrawer() {
      const name = document.getElementById('catName').value.trim();
      const slug = document.getElementById('catSlug').value.trim();

      if (!name || !slug) {
        this.showToast('Please enter a category name and slug identifier.', 'error');
        return;
      }

      const catData = {
        id: this.editingCategoryId || slug,
        name: name,
        slug: slug.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        icon: document.getElementById('catIcon').value || '🌸',
        categoryLabel: document.getElementById('catLabel').value || name,
        description: document.getElementById('catDesc').value || '',
        image: document.getElementById('catImage').value || 'images/cat-cakes.jpg',
        order: Number(document.getElementById('catOrder').value) || 1,
        status: document.getElementById('catStatus').value || 'active'
      };

      FloraDB.saveCategory(catData);
      this.closeCategoryDrawer();
      this.populateCategoryDropdowns();
      this.renderCategoriesView();
      this.showToast(`✨ Collection "${name}" saved and synced live!`, 'success');
    },

    deleteCategory(id) {
      const cat = FloraDB.getCategoryById(id);
      if (!cat) return;

      if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
        FloraDB.deleteCategory(id);
        this.showToast(`Deleted category "${cat.name}".`, 'info');
        this.populateCategoryDropdowns();
        this.renderCategoriesView();
      }
    },

    // =========================================================================
    // 8. PRODUCTS CATALOG CRUD
    // =========================================================================
    renderProductsTable() {
      const search = (document.getElementById('productSearchInput')?.value || '').trim();
      const category = document.getElementById('productCategoryFilter')?.value || 'all';
      const status = document.getElementById('productStatusFilter')?.value || 'all';

      const products = FloraDB.getProducts({ search, category, status });
      const tbody = document.getElementById('productsTableBody');
      const counterEl = document.getElementById('productCounterText');

      if (counterEl) counterEl.textContent = `Showing ${products.length} products`;

      if (!tbody) return;

      if (products.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 40px; color: var(--cocoa-muted);">
              No products found matching filters. <button class="btn-primary" style="margin-left: 10px;" onclick="AdminApp.openProductDrawer()">+ Add First Bake</button>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = products.map(p => `
        <tr>
          <td>
            <div class="table-product-cell">
              <img src="${p.image || 'images/cat-cakes.jpg'}" alt="${this.escapeHTML(p.name)}" class="table-product-thumb" onerror="this.src='images/cat-cakes.jpg'">
              <div class="table-product-meta">
                <h4>${this.escapeHTML(p.name)}</h4>
                <span>SKU: ${p.sku || 'N/A'} &bull; ${p.unit || '0.5 kg'}</span>
              </div>
            </div>
          </td>
          <td><span style="font-size:0.8rem; font-weight:600; text-transform:capitalize;">${p.category}</span></td>
          <td>
            <strong>₹${p.price.toLocaleString('en-IN')}</strong>
            ${p.comparePrice ? `<br><span style="text-decoration: line-through; font-size:0.75rem; color:var(--cocoa-muted);">₹${p.comparePrice}</span>` : ''}
          </td>
          <td>
            <span style="font-weight:700; ${p.stock <= 5 ? 'color: var(--danger);' : ''}">${p.stock} units</span>
          </td>
          <td>
            ${p.eggless ? '<span class="status-pill" style="background:#D1FAE5; color:#065F46;">🟢 100% Veg</span>' : '<span class="status-pill">Contains Egg</span>'}
          </td>
          <td>
            ${p.badge ? `<span class="status-pill status-baking">${this.escapeHTML(p.badge)}</span>` : '<span style="color:var(--cocoa-light); font-size:0.75rem;">—</span>'}
          </td>
          <td>
            <span class="status-pill status-${p.status || 'active'}">${p.status === 'active' ? '● Active' : '○ Draft'}</span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" onclick="AdminApp.openEditProduct(${p.id})" title="Edit Bake">✏️ Edit</button>
              <button class="action-icon-btn" onclick="AdminApp.duplicateProduct(${p.id})" title="Duplicate">📋</button>
              <button class="action-icon-btn" style="color: var(--danger);" onclick="AdminApp.deleteProduct(${p.id})" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openProductDrawer(product = null) {
      this.editingProductId = product ? product.id : null;
      const drawer = document.getElementById('productDrawer');
      const overlay = document.getElementById('productDrawerOverlay');
      const drawerTitle = document.getElementById('drawerTitle');

      if (!drawer || !overlay) return;

      this.populateCategoryDropdowns();

      if (product) {
        drawerTitle.textContent = `Edit "${product.name}"`;
        document.getElementById('prodId').value = product.id;
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodCategory').value = product.category || 'cakes';
        document.getElementById('prodCategoryLabel').value = product.categoryLabel || '';
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodComparePrice').value = product.comparePrice || '';
        document.getElementById('prodStock').value = product.stock;
        document.getElementById('prodUnit').value = product.unit || '';
        document.getElementById('prodBadge').value = product.badge || '';
        document.getElementById('prodSku').value = product.sku || '';
        document.getElementById('prodDesc').value = product.description || '';
        document.getElementById('prodEggless').checked = product.eggless !== false;
        this.setImagePreview(product.image || 'images/cat-cakes.jpg');
      } else {
        drawerTitle.textContent = "Add New Signature Bake";
        document.getElementById('productForm').reset();
        document.getElementById('prodId').value = '';
        document.getElementById('prodEggless').checked = true;
        this.setImagePreview('images/cat-cakes.jpg');
      }

      overlay.classList.add('active');
      drawer.classList.add('active');
    },

    openEditProduct(id) {
      const product = FloraDB.getProductById(id);
      if (product) this.openProductDrawer(product);
    },

    closeProductDrawer() {
      const drawer = document.getElementById('productDrawer');
      const overlay = document.getElementById('productDrawerOverlay');
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      this.editingProductId = null;
    },

    saveProductFromDrawer() {
      const name = document.getElementById('prodName').value.trim();
      const price = Number(document.getElementById('prodPrice').value);
      const stock = Number(document.getElementById('prodStock').value);

      if (!name || isNaN(price) || price <= 0) {
        this.showToast('Please enter a valid product title and price.', 'error');
        return;
      }

      const productData = {
        id: this.editingProductId,
        name: name,
        category: document.getElementById('prodCategory').value,
        categoryLabel: document.getElementById('prodCategoryLabel').value,
        price: price,
        comparePrice: document.getElementById('prodComparePrice').value ? Number(document.getElementById('prodComparePrice').value) : null,
        stock: isNaN(stock) ? 10 : stock,
        unit: document.getElementById('prodUnit').value || '0.5 kg',
        badge: document.getElementById('prodBadge').value,
        sku: document.getElementById('prodSku').value,
        image: document.getElementById('prodImage').value || 'images/cat-cakes.jpg',
        description: document.getElementById('prodDesc').value,
        eggless: document.getElementById('prodEggless').checked,
        status: 'active'
      };

      FloraDB.saveProduct(productData);
      this.closeProductDrawer();
      this.showToast(`🎂 Bake "${name}" saved to catalog & synced live!`, 'success');
      this.renderProductsTable();
      this.renderInventoryTable();
    },

    deleteProduct(id) {
      const p = FloraDB.getProductById(id);
      if (!p) return;

      if (confirm(`Are you sure you want to delete "${p.name}" from the bakery catalog?`)) {
        FloraDB.deleteProduct(id);
        this.showToast(`Deleted "${p.name}".`, 'info');
        this.renderProductsTable();
        this.renderInventoryTable();
      }
    },

    duplicateProduct(id) {
      const clone = FloraDB.duplicateProduct(id);
      if (clone) {
        this.showToast(`📋 Duplicated bake: "${clone.name}"`, 'success');
        this.renderProductsTable();
      }
    },

    // =========================================================================
    // 9. INVENTORY RADAR
    // =========================================================================
    renderInventoryTable() {
      const search = (document.getElementById('inventorySearchInput')?.value || '').trim();
      const stockFilter = document.getElementById('inventoryStockFilter')?.value || 'all';

      let products = FloraDB.getProducts({ search });
      if (stockFilter === 'low') {
        products = products.filter(p => p.stock <= 5 && p.stock > 0);
      } else if (stockFilter === 'out') {
        products = products.filter(p => p.stock === 0);
      }

      const tbody = document.getElementById('inventoryTableBody');
      if (!tbody) return;

      if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--cocoa-muted);">No inventory records found.</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => `
        <tr>
          <td>
            <div class="table-product-cell">
              <img src="${p.image || 'images/cat-cakes.jpg'}" alt="${this.escapeHTML(p.name)}" class="table-product-thumb" onerror="this.src='images/cat-cakes.jpg'">
              <div>
                <strong>${this.escapeHTML(p.name)}</strong>
                <div style="font-size:0.75rem; color:var(--cocoa-muted); text-transform:capitalize;">${p.category}</div>
              </div>
            </div>
          </td>
          <td><code>${p.sku || 'N/A'}</code></td>
          <td>
            <span style="font-size:1.1rem; font-weight:800; ${p.stock <= 5 ? 'color:var(--danger);' : ''}">${p.stock}</span> units
          </td>
          <td>
            <div class="stock-stepper">
              <button class="stepper-btn" onclick="AdminApp.adjustStock(${p.id}, -1)">-</button>
              <span class="stepper-val">${p.stock}</span>
              <button class="stepper-btn" onclick="AdminApp.adjustStock(${p.id}, 1)">+</button>
            </div>
          </td>
          <td>
            ${p.stock === 0 ? '<span class="status-pill" style="background:#FEE2E2; color:#DC2626;">❌ Sold Out</span>' :
              p.stock <= 5 ? '<span class="status-pill" style="background:#FEF3C7; color:#B45309;">⚠️ Low Stock</span>' :
              '<span class="status-pill status-active">✓ In Stock</span>'}
          </td>
          <td><span style="font-size:0.8rem; color:var(--cocoa-muted);">${p.unit || 'Standard'}</span></td>
        </tr>
      `).join('');
    },

    adjustStock(id, delta) {
      const newStock = FloraDB.adjustStock(id, delta);
      if (newStock !== null) {
        this.renderInventoryTable();
        this.renderProductsTable();
        this.renderDashboard();
      }
    },

    // =========================================================================
    // 10. ORDERS PIPELINE, PRINTABLE SLIPS & WHATSAPP LOGISTICS
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
                Your bakery order pipeline is completely clean. When customers place orders via the storefront WhatsApp checkout, they will instantly appear here.
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
            <strong>${o.id}</strong><br>
            <span style="font-size:0.75rem; color:var(--cocoa-muted);">${o.date || o.timeAgo || 'Recent'}</span>
          </td>
          <td>
            <strong>${this.escapeHTML(o.customerName)}</strong><br>
            <span style="font-size:0.78rem; color:var(--cocoa-muted);">📞 ${o.phone}</span><br>
            <span style="font-size:0.75rem; color:var(--cocoa-light);">${this.escapeHTML(o.address)}</span>
          </td>
          <td>
            <div style="font-size:0.85rem;">
              ${Array.isArray(o.items) ? o.items.map(i => `<div>&bull; ${i.name} <strong>x${i.qty}</strong></div>`).join('') : 'Custom Order'}
            </div>
            ${o.notes ? `<div style="font-size:0.74rem; color:var(--rose-hover); margin-top:4px;">Note: "${this.escapeHTML(o.notes)}"</div>` : ''}
          </td>
          <td>
            <strong>₹${(o.total || 0).toLocaleString('en-IN')}</strong><br>
            <span style="font-size:0.72rem; color:var(--cocoa-muted);">${o.paymentStatus || 'Pending'}</span>
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
              <button class="action-icon-btn" onclick="AdminApp.openInvoice('${o.id}')" title="Print Kitchen Slip & Invoice">🖨️ Slip</button>
              <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppOrder('${o.id}')">
                <span>📱 WA</span>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    changeOrderStatus(orderId, newStatus) {
      FloraDB.updateOrderStatus(orderId, newStatus);
      this.showToast(`Order ${orderId} updated to "${this.formatStatus(newStatus)}"`, 'success');
      this.renderDashboard();
    },

    openWhatsAppOrder(orderId) {
      const orders = FloraDB.getOrders();
      const o = orders.find(ord => ord.id === orderId);
      if (!o) return;

      const cleanPhone = (o.phone || '').replace(/\D/g, '');
      const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      const itemsSummary = Array.isArray(o.items) ? o.items.map(i => `• ${i.name} (x${i.qty})`).join('%0A') : 'Handcrafted Bakery Item';
      const statusText = this.formatStatus(o.status);

      const msg = `🌸 *The Flora Bakery, Nashik* - Order Update%0A%0AHello *${encodeURIComponent(o.customerName)}*,%0AYour order *#${o.id}* status is: *${encodeURIComponent(statusText)}*%0A%0A*Order Summary:*%0A${itemsSummary}%0A%0A*Total Amount:* ₹${o.total}%0A*Delivery Location:* ${encodeURIComponent(o.address)}%0A%0AThank you for choosing The Flora Bakery! ✨`;

      window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
    },

    // =========================================================================
    // 11. PRINTABLE KITCHEN INVOICE & SLIP GENERATOR
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
            <span>📍 ${this.escapeHTML(o.address)}</span>
          </div>
          <div style="text-align: right;">
            <strong>Status:</strong> <span class="status-pill status-${o.status}">${this.formatStatus(o.status)}</span><br>
            <strong style="margin-top: 4px; display: inline-block;">Payment:</strong> ${o.paymentStatus || 'WhatsApp Order'}
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

        ${o.notes ? `
          <div class="invoice-note-box">
            <strong>👩‍🍳 Special Baker Notes:</strong> ${this.escapeHTML(o.notes)}
          </div>
        ` : ''}

        <div class="invoice-total-row">
          <span>Subtotal: ₹${o.subtotal || o.total}</span>
          ${o.discount ? `<span style="color: #D44E72;">Discount: -₹${o.discount}</span>` : ''}
          <span style="color: #3E2723;">Grand Total: ₹${(o.total || 0).toLocaleString('en-IN')}</span>
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
    // 12. CUSTOMERS DIRECTORY & CRM (Shopify-Grade)
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
    // 13. ANALYTICS & SHOPIFY REPORTS
    // =========================================================================
    renderAnalyticsView() {
      const stats = FloraDB.getAnalytics();

      // Render Top Selling Table
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

      // Render Category Revenue Share Bars
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
    // 14. DISCOUNTS & COUPONS
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
      if (confirm(`Delete coupon "${code}"?`)) {
        FloraDB.deleteDiscount(code);
        this.showToast(`Coupon "${code}" deleted.`, 'info');
        this.renderDiscountsTable();
      }
    },

    // =========================================================================
    // 15. INQUIRIES LOG
    // =========================================================================
    renderInquiriesTable() {
      const inquiries = FloraDB.getInquiries();
      const tbody = document.getElementById('inquiriesTableBody');
      if (!tbody) return;

      if (inquiries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px; color:var(--cocoa-muted);">Zero custom cake inquiries logged. Custom builder submissions will appear here.</td></tr>`;
        return;
      }

      tbody.innerHTML = inquiries.map(i => `
        <tr>
          <td><strong>${i.id}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${i.date || 'Recent'}</span></td>
          <td><strong>${this.escapeHTML(i.customerName)}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">📞 ${i.phone}</span></td>
          <td><strong>${this.escapeHTML(i.occasion)}</strong><br><span style="font-size:0.75rem; color:var(--cocoa-muted);">Date: ${i.requiredDate}</span></td>
          <td>${i.flavor}<br><span style="font-size:0.75rem; color:var(--cocoa-muted);">${i.size}</span></td>
          <td>${i.palette || 'Blush'}<br><span style="font-size:0.75rem; color:var(--rose-hover);">"${this.escapeHTML(i.message || '')}"</span></td>
          <td><span class="status-pill status-${i.status}">${i.status}</span></td>
          <td>
            <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppInquiry('${i.id}')">
              <span>💬 Consult</span>
            </button>
          </td>
        </tr>
      `).join('');
    },

    openWhatsAppInquiry(inquiryId) {
      const inquiries = FloraDB.getInquiries();
      const inq = inquiries.find(i => i.id === inquiryId);
      if (!inq) return;

      const cleanPhone = (inq.phone || '').replace(/\D/g, '');
      const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

      const msg = `🌸 *The Flora Bakery, Nashik* - Custom Cake Consultation%0A%0AHello *${encodeURIComponent(inq.customerName)}*,%0AWe received your custom cake inquiry for *${encodeURIComponent(inq.occasion)}*!%0A%0A*Flavor:* ${encodeURIComponent(inq.flavor)}%0A*Size:* ${encodeURIComponent(inq.size)}%0A*Palette:* ${encodeURIComponent(inq.palette)}%0A*Message:* "${encodeURIComponent(inq.message || '')}"%0A%0ALet's finalize your bespoke floral design and schedule delivery! 🎂✨`;

      window.open(`https://wa.me/${phoneNum}?text=${msg}`, '_blank');
    },

    // =========================================================================
    // 16. SETTINGS VIEW
    // =========================================================================
    renderSettingsView() {
      const settings = FloraDB.getSettings();
      const setStoreName = document.getElementById('setStoreName');
      const setAnnouncement = document.getElementById('setAnnouncement');
      const setStoreNotice = document.getElementById('setStoreNotice');
      const setWhatsApp = document.getElementById('setWhatsApp');
      const setFreeShipping = document.getElementById('setFreeShipping');
      const setAddress = document.getElementById('setAddress');

      if (setStoreName) setStoreName.value = settings.storeName || "The Flora Bakery";
      if (setAnnouncement) setAnnouncement.value = settings.announcementText || "";
      if (setStoreNotice) setStoreNotice.value = settings.storeNotice || "";
      if (setWhatsApp) setWhatsApp.value = settings.whatsapp || "917083517862";
      if (setFreeShipping) setFreeShipping.value = settings.freeShippingThreshold || 999;
      if (setAddress) setAddress.value = settings.address || "";
    },

    // =========================================================================
    // 17. COMMAND PALETTE (⌘K / Ctrl+K)
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
          if (palette.classList.contains('active')) closePalette();
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
    // 18. UTILITIES & TOAST ENGINE
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
