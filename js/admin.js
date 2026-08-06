/**
 * THE FLORA BAKERY - ADMIN SUITE CONTROLLER
 * High-performance, Apple-grade interface manager
 * Handles Authentication, Real-time CRUD, Inventory Steppers, WhatsApp Order Dispatch & Command Palette
 */

(function() {
  'use strict';

  const AdminApp = {
    currentView: 'dashboard',
    editingProductId: null,

    init() {
      this.checkAuth();
      this.bindEvents();
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

      // Sidebar Navigation
      document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const view = item.getAttribute('data-view');
          if (view) this.switchView(view);
        });
      });

      // Mobile Menu Toggle
      const mobileToggle = document.getElementById('mobileMenuToggle');
      const sidebar = document.getElementById('adminSidebar');
      if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
          sidebar.classList.toggle('mobile-open');
        });
      }

      // Profile Dropdown / Logout
      const profileBtn = document.getElementById('adminProfileBtn');
      if (profileBtn) {
        profileBtn.addEventListener('click', () => {
          if (confirm('Do you want to log out of the Admin Suite?')) {
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

      // Refresh Analytics Button
      const btnRefreshAnalytics = document.getElementById('btnRefreshAnalytics');
      if (btnRefreshAnalytics) {
        btnRefreshAnalytics.addEventListener('click', () => {
          this.renderDashboard();
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

      // Order Filters
      const orderSearch = document.getElementById('orderSearchInput');
      const orderStatus = document.getElementById('orderStatusFilter');
      if (orderSearch) orderSearch.addEventListener('input', () => this.renderOrdersTable());
      if (orderStatus) orderStatus.addEventListener('change', () => this.renderOrdersTable());

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
            whatsapp: document.getElementById('setWhatsApp').value,
            freeShippingThreshold: Number(document.getElementById('setFreeShipping').value) || 999,
            address: document.getElementById('setAddress').value
          };
          FloraDB.saveSettings(newSettings);
          this.showToast('Bakery settings saved successfully.', 'success');
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
                this.showToast('📤 Database restored from backup!', 'success');
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
          if (confirm('Reset entire store to initial demo products and orders?')) {
            FloraDB.resetToDefaults();
            this.showToast('Store reset to clean demo data.', 'info');
            this.loadAllData();
          }
        });
      }

      // Command Palette Trigger
      const globalSearchTrigger = document.getElementById('globalSearchTrigger');
      if (globalSearchTrigger) {
        globalSearchTrigger.addEventListener('click', () => this.openCommandPalette());
      }
    },

    // =========================================================================
    // 3. KEYBOARD SHORTCUTS & COMMAND PALETTE (Apple ⌘K)
    // =========================================================================
    setupKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        // ⌘K or Ctrl+K -> Command Palette
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggleCommandPalette();
        }

        // Escape -> Close drawers & modals
        if (e.key === 'Escape') {
          this.closeProductDrawer();
          this.closeCommandPalette();
          document.getElementById('discountModal')?.classList.remove('active');
          document.getElementById('discountModalOverlay')?.classList.remove('active');
        }

        // N key (when not typing in an input) -> New Product
        if (e.key.toLowerCase() === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          e.preventDefault();
          this.openProductDrawer();
        }
      });

      const paletteInput = document.getElementById('paletteInput');
      if (paletteInput) {
        paletteInput.addEventListener('input', (e) => {
          this.renderPaletteResults(e.target.value);
        });
      }
    },

    toggleCommandPalette() {
      const palette = document.getElementById('commandPalette');
      if (palette.classList.contains('active')) {
        this.closeCommandPalette();
      } else {
        this.openCommandPalette();
      }
    },

    openCommandPalette() {
      const palette = document.getElementById('commandPalette');
      const input = document.getElementById('paletteInput');
      palette.classList.add('active');
      input.value = '';
      input.focus();
      this.renderPaletteResults('');
    },

    closeCommandPalette() {
      document.getElementById('commandPalette').classList.remove('active');
    },

    renderPaletteResults(query) {
      const container = document.getElementById('paletteResults');
      const q = query.toLowerCase().trim();
      const products = FloraDB.getProducts();

      const items = [
        { label: '📊 Go to Dashboard', action: () => this.switchView('dashboard'), type: 'Navigation' },
        { label: '🎂 Go to Products Catalog', action: () => this.switchView('products'), type: 'Navigation' },
        { label: '📋 Go to Inventory Radar', action: () => this.switchView('inventory'), type: 'Navigation' },
        { label: '🛍️ Go to Orders Pipeline', action: () => this.switchView('orders'), type: 'Navigation' },
        { label: '🏷️ Go to Discounts & Coupons', action: () => this.switchView('discounts'), type: 'Navigation' },
        { label: '💌 Go to Custom Inquiries', action: () => this.switchView('inquiries'), type: 'Navigation' },
        { label: '➕ Add New Floral Product', action: () => this.openProductDrawer(), type: 'Action' },
        { label: '📦 Batch Restock Catalog (+10 units)', action: () => { products.forEach(p => FloraDB.adjustStock(p.id, 10)); this.showToast('Batch restocked!', 'success'); }, type: 'Action' },
        { label: '🌸 Open Customer Storefront (New Tab)', action: () => window.open('index.html', '_blank'), type: 'External' }
      ];

      // Add product matches
      products.forEach(p => {
        items.push({
          label: `Edit Bake: ${p.name} (₹${p.price})`,
          action: () => this.openProductDrawer(p.id),
          type: `Product &bull; ${p.categoryLabel}`
        });
      });

      const filtered = q ? items.filter(i => i.label.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) : items;

      if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--cocoa-muted); font-size: 0.9rem;">No results found for "${query}"</div>`;
        return;
      }

      container.innerHTML = filtered.map((item, idx) => `
        <div class="palette-item" data-idx="${idx}">
          <span style="font-weight: 500;">${item.label}</span>
          <span style="margin-left: auto; font-size: 0.75rem; color: var(--cocoa-muted);">${item.type}</span>
        </div>
      `).join('');

      container.querySelectorAll('.palette-item').forEach((elem, index) => {
        elem.addEventListener('click', () => {
          this.closeCommandPalette();
          filtered[index].action();
        });
      });
    },

    // =========================================================================
    // 4. VIEW ROUTING & REAL-TIME SYNC
    // =========================================================================
    switchView(viewName) {
      this.currentView = viewName;

      // Update sidebar active link
      document.querySelectorAll('.sidebar-menu .nav-item').forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update view section
      document.querySelectorAll('.view-section').forEach(sec => {
        sec.classList.remove('active');
      });
      const activeSection = document.getElementById(`view-${viewName}`);
      if (activeSection) {
        activeSection.classList.add('active');
      }

      // Close mobile sidebar if open
      document.getElementById('adminSidebar')?.classList.remove('mobile-open');

      // Refresh view data
      if (viewName === 'dashboard') this.renderDashboard();
      if (viewName === 'products') this.renderProductsTable();
      if (viewName === 'inventory') this.renderInventoryTable();
      if (viewName === 'orders') this.renderOrdersTable();
      if (viewName === 'discounts') this.renderDiscountsTable();
      if (viewName === 'inquiries') this.renderInquiriesTable();
      if (viewName === 'settings') this.renderSettingsForm();
    },

    listenToDataChanges() {
      window.addEventListener('flora:data-changed', () => {
        this.loadAllData();
      });
    },

    loadAllData() {
      this.updateSidebarBadges();
      if (this.currentView === 'dashboard') this.renderDashboard();
      if (this.currentView === 'products') this.renderProductsTable();
      if (this.currentView === 'inventory') this.renderInventoryTable();
      if (this.currentView === 'orders') this.renderOrdersTable();
      if (this.currentView === 'discounts') this.renderDiscountsTable();
      if (this.currentView === 'inquiries') this.renderInquiriesTable();
    },

    updateSidebarBadges() {
      const analytics = FloraDB.getAnalytics();
      const prodBadge = document.getElementById('sidebarProductCount');
      const lowStockBadge = document.getElementById('sidebarLowStockBadge');
      const ordersBadge = document.getElementById('sidebarOrdersBadge');
      const inqBadge = document.getElementById('sidebarInqBadge');

      if (prodBadge) prodBadge.textContent = analytics.totalProducts;
      if (ordersBadge) ordersBadge.textContent = analytics.totalOrders;
      if (inqBadge) inqBadge.textContent = analytics.inquiriesCount;

      if (lowStockBadge) {
        if (analytics.lowStockCount > 0) {
          lowStockBadge.textContent = `${analytics.lowStockCount} low`;
          lowStockBadge.style.display = 'inline-block';
        } else {
          lowStockBadge.style.display = 'none';
        }
      }
    },

    // =========================================================================
    // 5. DASHBOARD MODULE
    // =========================================================================
    renderDashboard() {
      const analytics = FloraDB.getAnalytics();

      document.getElementById('kpiRevenue').textContent = `₹${analytics.totalRevenue.toLocaleString('en-IN')}`;
      document.getElementById('kpiOrdersCount').textContent = analytics.totalOrders;
      document.getElementById('kpiActiveOrdersTag').textContent = `${analytics.activeOrdersCount} active`;
      document.getElementById('kpiAOV').textContent = `₹${analytics.aov.toLocaleString('en-IN')}`;
      document.getElementById('kpiLowStockCount').textContent = analytics.lowStockCount;

      const stockSubtext = document.getElementById('kpiLowStockSubtext');
      if (analytics.lowStockCount > 0) {
        stockSubtext.innerHTML = `<span style="color: var(--danger); font-weight: 700;">⚠️ ${analytics.lowStockCount} items need baking restock</span>`;
      } else {
        stockSubtext.innerHTML = `<span style="color: var(--success); font-weight: 600;">✓ All items healthy</span>`;
      }

      // Recent Orders Table
      const tbody = document.getElementById('dashboardRecentOrdersBody');
      if (!tbody) return;

      const recentOrders = analytics.recentOrders;
      if (recentOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 28px; color: var(--cocoa-muted);">No orders in the bakery queue.</td></tr>`;
        return;
      }

      tbody.innerHTML = recentOrders.map(order => {
        const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
        return `
          <tr>
            <td><strong>${order.id}</strong></td>
            <td>
              <div style="font-weight: 600;">${order.customerName}</div>
              <div style="font-size: 0.75rem; color: var(--cocoa-muted);">${order.phone}</div>
            </td>
            <td style="max-width: 260px; font-size: 0.82rem; color: var(--cocoa-muted);" title="${itemsSummary}">
              ${itemsSummary.length > 40 ? itemsSummary.substring(0, 40) + '...' : itemsSummary}
            </td>
            <td><strong>₹${order.total}</strong></td>
            <td>
              <span class="status-pill status-${order.status}">${order.status}</span>
            </td>
            <td style="font-size: 0.8rem;">${order.paymentStatus}</td>
            <td>
              <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="AdminApp.openWhatsAppNotify('${order.id}')">
                📱 WhatsApp
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    // =========================================================================
    // 6. PRODUCTS CATALOG MODULE
    // =========================================================================
    renderProductsTable() {
      const search = document.getElementById('productSearchInput')?.value || '';
      const category = document.getElementById('productCategoryFilter')?.value || 'all';
      const status = document.getElementById('productStatusFilter')?.value || 'all';

      const products = FloraDB.getProducts({
        search,
        category: category !== 'all' ? category : undefined,
        status: status !== 'all' ? status : undefined
      });

      const countText = document.getElementById('productCounterText');
      if (countText) countText.textContent = `Showing ${products.length} products`;

      const tbody = document.getElementById('productsTableBody');
      if (!tbody) return;

      if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 32px; color: var(--cocoa-muted);">No products match your criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => `
        <tr>
          <td>
            <div class="table-product-cell">
              <div class="table-product-thumb">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='images/cat-cakes.jpg'">
              </div>
              <div class="table-product-info">
                <span class="table-product-name">${p.name}</span>
                <span class="table-product-sku">SKU: ${p.sku} &bull; ${p.unit}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="category-chip">${p.categoryLabel || p.category}</span>
          </td>
          <td>
            <strong>₹${p.price}</strong>
            ${p.comparePrice ? `<div style="font-size: 0.72rem; text-decoration: line-through; color: var(--cocoa-light);">₹${p.comparePrice}</div>` : ''}
          </td>
          <td>
            <div class="stock-stepper">
              <button class="stock-stepper-btn" onclick="AdminApp.adjustStockQuick(${p.id}, -1)">-</button>
              <span class="stock-stepper-val ${p.stock <= 5 ? 'trend-warn' : ''}">${p.stock}</span>
              <button class="stock-stepper-btn" onclick="AdminApp.adjustStockQuick(${p.id}, 1)">+</button>
            </div>
          </td>
          <td>
            ${p.eggless ? `<span style="color: #059669; font-weight: 600; font-size: 0.78rem;">🟢 100% Veg</span>` : '<span style="color: var(--cocoa-muted); font-size: 0.78rem;">Regular</span>'}
          </td>
          <td>
            <span style="font-size: 0.75rem; background: var(--rose-light); color: var(--rose-hover); padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${p.badge || 'None'}
            </span>
          </td>
          <td>
            <span class="status-pill status-${p.stock > 0 ? 'instock' : 'outofstock'}">
              ${p.stock > 0 ? 'Active' : 'Out of Stock'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" title="Edit Product" onclick="AdminApp.openProductDrawer(${p.id})">✏️</button>
              <button class="action-icon-btn" title="Duplicate" onclick="AdminApp.duplicateProduct(${p.id})">📋</button>
              <button class="action-icon-btn danger" title="Delete" onclick="AdminApp.deleteProduct(${p.id})">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    openProductDrawer(productId = null) {
      this.editingProductId = productId;
      const drawer = document.getElementById('productDrawer');
      const overlay = document.getElementById('productDrawerOverlay');
      const title = document.getElementById('drawerTitle');
      const form = document.getElementById('productForm');

      form.reset();

      if (productId) {
        const p = FloraDB.getProductById(productId);
        if (p) {
          title.textContent = `Edit Bake: ${p.name}`;
          document.getElementById('prodId').value = p.id;
          document.getElementById('prodName').value = p.name;
          document.getElementById('prodCategory').value = p.category;
          document.getElementById('prodCategoryLabel').value = p.categoryLabel || '';
          document.getElementById('prodPrice').value = p.price;
          document.getElementById('prodComparePrice').value = p.comparePrice || '';
          document.getElementById('prodStock').value = p.stock;
          document.getElementById('prodUnit').value = p.unit || '';
          document.getElementById('prodBadge').value = p.badge || '';
          document.getElementById('prodSku').value = p.sku || '';
          document.getElementById('prodImage').value = p.image || 'images/cat-cakes.jpg';
          document.getElementById('prodDesc').value = p.description || '';
          document.getElementById('prodEggless').checked = p.eggless !== undefined ? p.eggless : true;
        }
      } else {
        title.textContent = 'Add New Floral Bake';
        document.getElementById('prodId').value = '';
        document.getElementById('prodCategory').value = 'cakes';
        document.getElementById('prodStock').value = '10';
        document.getElementById('prodEggless').checked = true;
      }

      drawer.classList.add('active');
      overlay.classList.add('active');
    },

    closeProductDrawer() {
      document.getElementById('productDrawer')?.classList.remove('active');
      document.getElementById('productDrawerOverlay')?.classList.remove('active');
      this.editingProductId = null;
    },

    saveProductFromDrawer() {
      const name = document.getElementById('prodName').value.trim();
      const price = Number(document.getElementById('prodPrice').value);
      const stock = Number(document.getElementById('prodStock').value);
      const category = document.getElementById('prodCategory').value;

      if (!name || !price) {
        this.showToast('Please provide product title and price.', 'error');
        return;
      }

      const productData = {
        id: this.editingProductId,
        name,
        category,
        categoryLabel: document.getElementById('prodCategoryLabel').value.trim() || undefined,
        price,
        comparePrice: Number(document.getElementById('prodComparePrice').value) || null,
        stock: Math.max(0, stock),
        unit: document.getElementById('prodUnit').value.trim() || 'Per serving',
        badge: document.getElementById('prodBadge').value.trim() || 'New',
        sku: document.getElementById('prodSku').value.trim() || undefined,
        image: document.getElementById('prodImage').value,
        description: document.getElementById('prodDesc').value.trim(),
        eggless: document.getElementById('prodEggless').checked
      };

      FloraDB.saveProduct(productData);
      this.closeProductDrawer();
      this.showToast(`✨ Product "${name}" saved to catalog!`, 'success');
      this.renderProductsTable();
      this.updateSidebarBadges();
    },

    duplicateProduct(id) {
      const clone = FloraDB.duplicateProduct(id);
      if (clone) {
        this.showToast(`📋 Duplicated: ${clone.name}`, 'info');
        this.renderProductsTable();
      }
    },

    deleteProduct(id) {
      const p = FloraDB.getProductById(id);
      if (!p) return;
      if (confirm(`Are you sure you want to remove "${p.name}" from your catalog?`)) {
        FloraDB.deleteProduct(id);
        this.showToast(`🗑️ Removed "${p.name}"`, 'info');
        this.renderProductsTable();
        this.updateSidebarBadges();
      }
    },

    adjustStockQuick(id, delta) {
      const newStock = FloraDB.adjustStock(id, delta);
      this.renderProductsTable();
      this.updateSidebarBadges();
    },

    // =========================================================================
    // 7. INVENTORY MODULE
    // =========================================================================
    renderInventoryTable() {
      const search = document.getElementById('inventorySearchInput')?.value || '';
      const filter = document.getElementById('inventoryStockFilter')?.value || 'all';

      let products = FloraDB.getProducts({ search });

      if (filter === 'low') {
        products = products.filter(p => p.stock > 0 && p.stock <= 5);
      } else if (filter === 'out') {
        products = products.filter(p => p.stock === 0);
      }

      const tbody = document.getElementById('inventoryTableBody');
      if (!tbody) return;

      if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 28px; color: var(--cocoa-muted);">No inventory records match this view.</td></tr>`;
        return;
      }

      tbody.innerHTML = products.map(p => {
        let statusClass = 'status-instock';
        let statusText = 'In Stock';
        if (p.stock === 0) {
          statusClass = 'status-outofstock';
          statusText = 'Out of Stock';
        } else if (p.stock <= 5) {
          statusClass = 'status-lowstock';
          statusText = `Low (${p.stock} left)`;
        }

        return `
          <tr>
            <td>
              <div class="table-product-cell">
                <div class="table-product-thumb">
                  <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="table-product-info">
                  <span class="table-product-name">${p.name}</span>
                  <span class="table-product-sku">${p.categoryLabel}</span>
                </div>
              </div>
            </td>
            <td><code>${p.sku}</code></td>
            <td>
              <strong style="font-size: 1.1rem; color: ${p.stock <= 5 ? 'var(--danger)' : 'var(--cocoa-dark)'};">
                ${p.stock} units
              </strong>
            </td>
            <td>
              <div class="stock-stepper">
                <button class="stock-stepper-btn" onclick="AdminApp.adjustInventoryStock(${p.id}, -1)">-</button>
                <span class="stock-stepper-val">${p.stock}</span>
                <button class="stock-stepper-btn" onclick="AdminApp.adjustInventoryStock(${p.id}, 1)">+</button>
              </div>
            </td>
            <td>
              <span class="status-pill ${statusClass}">${statusText}</span>
            </td>
            <td style="font-size: 0.8rem; color: var(--cocoa-muted);">${p.unit}</td>
          </tr>
        `;
      }).join('');
    },

    adjustInventoryStock(id, delta) {
      FloraDB.adjustStock(id, delta);
      this.renderInventoryTable();
      this.updateSidebarBadges();
    },

    // =========================================================================
    // 8. ORDERS & LOGISTICS MODULE
    // =========================================================================
    renderOrdersTable() {
      const search = document.getElementById('orderSearchInput')?.value || '';
      const status = document.getElementById('orderStatusFilter')?.value || 'all';

      const orders = FloraDB.getOrders({
        search,
        status: status !== 'all' ? status : undefined
      });

      const tbody = document.getElementById('ordersTableBody');
      if (!tbody) return;

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--cocoa-muted);">No orders matching this filter.</td></tr>`;
        return;
      }

      tbody.innerHTML = orders.map(o => {
        const itemsList = o.items.map(i => `&bull; ${i.qty}x ${i.name}`).join('<br>');
        return `
          <tr>
            <td>
              <div style="font-weight: 700; font-size: 0.95rem;">${o.id}</div>
              <div style="font-size: 0.75rem; color: var(--cocoa-muted);">${o.date}</div>
            </td>
            <td>
              <div style="font-weight: 600;">${o.customerName}</div>
              <div style="font-size: 0.8rem; color: var(--cocoa-text);">📞 ${o.phone}</div>
              <div style="font-size: 0.75rem; color: var(--cocoa-muted); max-width: 220px;">📍 ${o.address}</div>
            </td>
            <td style="font-size: 0.82rem; line-height: 1.4;">
              ${itemsList}
              ${o.notes ? `<div style="font-size: 0.72rem; color: var(--rose-hover); margin-top: 4px; font-style: italic;">📝 "${o.notes}"</div>` : ''}
            </td>
            <td>
              <div style="font-weight: 800; font-size: 1rem;">₹${o.total}</div>
              <div style="font-size: 0.72rem; color: var(--cocoa-muted);">${o.paymentStatus}</div>
            </td>
            <td>
              <select class="select-filter" style="font-size: 0.78rem; font-weight: 600;" onchange="AdminApp.changeOrderStatus('${o.id}', this.value)">
                <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ Pending</option>
                <option value="baking" ${o.status === 'baking' ? 'selected' : ''}>👩‍🍳 Baking</option>
                <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>🚚 Out for Delivery</option>
                <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ Delivered</option>
                <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ Cancelled</option>
              </select>
            </td>
            <td>
              <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 12px; display: flex; align-items: center; gap: 4px;" onclick="AdminApp.openWhatsAppNotify('${o.id}')">
                <span>💬</span> Ping Client
              </button>
            </td>
          </tr>
        `;
      }).join('');
    },

    changeOrderStatus(orderId, newStatus) {
      FloraDB.updateOrderStatus(orderId, newStatus);
      this.showToast(`Order ${orderId} updated to "${newStatus}"`, 'success');
      this.updateSidebarBadges();
    },

    openWhatsAppNotify(orderId) {
      const orders = FloraDB.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const cleanPhone = (order.phone || '').replace(/\D/g, '');
      const phoneToUse = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone || '917083517862';

      let statusMsg = '';
      if (order.status === 'baking') {
        statusMsg = '👩‍🍳 Your bespoke floral bakes are now fresh in the oven!';
      } else if (order.status === 'shipped') {
        statusMsg = '🚚 Your order is out for refrigerated doorstep delivery across Nashik!';
      } else if (order.status === 'delivered') {
        statusMsg = '🌸 Your order has been delivered! We hope you love the floral craftsmanship.';
      } else {
        statusMsg = '🌸 We have received your order and our patisserie team is preparing it.';
      }

      const text = `Hello ${order.customerName}! 🌸\n\nUpdate from *The Flora Bakery Nashik* regarding Order *#${order.id}*:\n\n${statusMsg}\n\n*Items:* ${order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}\n*Total:* ₹${order.total}\n\nThank you for blooming with us! ✨`;

      const url = `https://api.whatsapp.com/send?phone=${phoneToUse}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    },

    // =========================================================================
    // 9. DISCOUNTS MODULE
    // =========================================================================
    renderDiscountsTable() {
      const discounts = FloraDB.getDiscounts();
      const tbody = document.getElementById('discountsTableBody');
      if (!tbody) return;

      tbody.innerHTML = discounts.map(d => `
        <tr>
          <td>
            <strong style="font-size: 1rem; color: var(--rose-hover); letter-spacing: 0.05em;">${d.code}</strong>
          </td>
          <td>
            <strong>${d.type === 'percent' ? `${d.value}% Off` : `₹${d.value} Flat Off`}</strong>
          </td>
          <td>₹${d.minOrder}</td>
          <td style="font-size: 0.85rem; color: var(--cocoa-muted);">${d.description}</td>
          <td><strong>${d.usageCount || 0} times</strong></td>
          <td>
            <span class="status-pill status-${d.active ? 'instock' : 'outofstock'}">
              ${d.active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-icon-btn" title="Copy Code" onclick="AdminApp.copyCoupon('${d.code}')">📋</button>
              <button class="action-icon-btn danger" title="Delete" onclick="AdminApp.deleteCoupon('${d.code}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    },

    copyCoupon(code) {
      navigator.clipboard.writeText(code);
      this.showToast(`📋 Copied code "${code}" to clipboard!`, 'info');
    },

    deleteCoupon(code) {
      if (confirm(`Delete coupon "${code}"?`)) {
        FloraDB.deleteDiscount(code);
        this.showToast(`Coupon "${code}" deleted.`, 'info');
        this.renderDiscountsTable();
      }
    },

    // =========================================================================
    // 10. CUSTOM CAKE INQUIRIES
    // =========================================================================
    renderInquiriesTable() {
      const inquiries = FloraDB.getInquiries();
      const tbody = document.getElementById('inquiriesTableBody');
      if (!tbody) return;

      tbody.innerHTML = inquiries.map(inq => `
        <tr>
          <td><strong>${inq.id}</strong><br><span style="font-size: 0.72rem; color: var(--cocoa-muted);">${inq.date}</span></td>
          <td>
            <div style="font-weight: 600;">${inq.customerName}</div>
            <div style="font-size: 0.8rem; color: var(--cocoa-text);">📞 ${inq.phone}</div>
          </td>
          <td>
            <strong>${inq.occasion}</strong>
            <div style="font-size: 0.75rem; color: var(--cocoa-muted);">Date: ${inq.requiredDate}</div>
          </td>
          <td>
            <div>${inq.flavor}</div>
            <div style="font-size: 0.75rem; color: var(--cocoa-muted);">${inq.size}</div>
          </td>
          <td>
            <div style="font-size: 0.82rem;">Palette: ${inq.palette}</div>
            ${inq.message ? `<div style="font-size: 0.75rem; color: var(--rose-hover);">Cake Text: "${inq.message}"</div>` : ''}
          </td>
          <td>
            <span class="status-pill status-${inq.status === 'new' ? 'pending' : 'delivered'}">${inq.status}</span>
          </td>
          <td>
            <button class="btn-secondary" style="font-size: 0.78rem; padding: 6px 10px;" onclick="AdminApp.respondToInquiry('${inq.id}')">
              💬 Consult on WA
            </button>
          </td>
        </tr>
      `).join('');
    },

    respondToInquiry(inqId) {
      const inq = FloraDB.getInquiries().find(i => i.id === inqId);
      if (!inq) return;

      FloraDB.updateInquiryStatus(inqId, 'contacted');
      this.renderInquiriesTable();

      const phone = inq.phone.replace(/\D/g, '');
      const cleanPhone = phone.length === 10 ? `91${phone}` : phone || '917083517862';

      const text = `Hello ${inq.customerName}! 🌸\n\nThank you for reaching out to *The Flora Bakery Nashik* for your custom cake consultation (*${inq.occasion}* - ${inq.size}).\n\nWe would love to craft this bespoke *${inq.flavor}* design for you! When would you like to discuss the final sketch and details? ✨`;

      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
    },

    // =========================================================================
    // 11. SETTINGS & PROFILE
    // =========================================================================
    renderSettingsForm() {
      const settings = FloraDB.getSettings();
      document.getElementById('setStoreName').value = settings.storeName || '';
      document.getElementById('setWhatsApp').value = settings.whatsapp || '';
      document.getElementById('setFreeShipping').value = settings.freeShippingThreshold || 999;
      document.getElementById('setAddress').value = settings.address || '';
    },

    // =========================================================================
    // 12. TOAST ENGINE
    // =========================================================================
    showToast(message, type = 'info') {
      const container = document.getElementById('adminToastContainer');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `admin-toast ${type}`;
      
      const icons = {
        success: '✓',
        error: '✕',
        info: '🌸'
      };

      toast.innerHTML = `
        <span style="font-weight: bold; font-size: 1.1rem;">${icons[type] || '🌸'}</span>
        <span style="font-size: 0.88rem; font-weight: 500;">${message}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  };

  // Expose globally and boot
  window.AdminApp = AdminApp;
  document.addEventListener('DOMContentLoaded', () => AdminApp.init());

})();
