/**
 * THE FLORA BAKERY - ADMIN SUITE CONTROLLER
 * High-performance, Apple-grade interface manager
 * Handles Authentication, Real-time CRUD, Product Image Uploading, Mobile Nav, Inventory Steppers & WhatsApp Dispatch
 */

(function() {
  'use strict';

  const AdminApp = {
    currentView: 'dashboard',
    editingProductId: null,

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
      const promptBox = document.getElementById('uploadPrompt');
      const previewBox = document.getElementById('imagePreviewContainer');
      const previewImg = document.getElementById('imagePreviewImg');
      const removeBtn = document.getElementById('btnRemovePreview');
      const hiddenInput = document.getElementById('prodImage');

      if (!dropZone || !fileInput) return;

      // Click dropzone triggers file selector
      dropZone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && !e.target.closest('#btnRemovePreview')) {
          fileInput.click();
        }
      });

      // Handle File Selection
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.processUploadedImage(file);
        }
      });

      // Drag & Drop Handlers
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

      // Remove Preview
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setImagePreview('images/cat-cakes.jpg');
          this.showToast('Photo removed. Reset to default preset.', 'info');
        });
      }

      // Preset Chips Click Handler
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

      // Check max size (5MB)
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

      // Update Desktop Nav Active States
      document.querySelectorAll('.sidebar-menu .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-view') === viewName);
      });

      // Update Mobile Nav Active States
      document.querySelectorAll('.admin-mobile-nav .mobile-nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
      });

      // Switch Main View Sections
      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });

      const targetView = document.getElementById(`view-${viewName}`);
      if (targetView) {
        targetView.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Re-render target data
      if (viewName === 'dashboard') this.renderDashboard();
      if (viewName === 'products') this.renderProductsTable();
      if (viewName === 'inventory') this.renderInventoryTable();
      if (viewName === 'orders') this.renderOrdersTable();
      if (viewName === 'discounts') this.renderDiscountsTable();
      if (viewName === 'inquiries') this.renderInquiriesTable();
    },

    loadAllData() {
      this.renderDashboard();
      this.renderProductsTable();
      this.renderInventoryTable();
      this.renderOrdersTable();
      this.renderDiscountsTable();
      this.renderInquiriesTable();
      this.updateSidebarCounters();
    },

    listenToDataChanges() {
      window.addEventListener('flora:data-changed', (e) => {
        this.loadAllData();
      });
    },

    updateSidebarCounters() {
      const products = FloraDB.getProducts();
      const analytics = FloraDB.getAnalytics();
      const orders = FloraDB.getOrders();
      const inqs = FloraDB.getInquiries();

      const prodCountEl = document.getElementById('sidebarProductCount');
      if (prodCountEl) prodCountEl.textContent = products.length;

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
                <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppOrder('${o.id}')">
                  <span>📱 Update</span>
                </button>
              </td>
            </tr>
          `).join('');
        }
      }

      this.updateSidebarCounters();
    },

    // =========================================================================
    // 7. PRODUCTS CATALOG CRUD
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
    // 8. INVENTORY RADAR
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
    // 9. ORDERS PIPELINE & WHATSAPP LOGISTICS
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
            <button class="whatsapp-action-btn" onclick="AdminApp.openWhatsAppOrder('${o.id}')">
              <span>📱 Notify WA</span>
            </button>
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
    // 10. DISCOUNTS & COUPONS
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
    // 11. INQUIRIES LOG
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
    // 12. COMMAND PALETTE (⌘K / Ctrl+K)
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

      const defaultCommands = [
        { icon: '📊', label: 'Go to Dashboard', action: () => this.switchView('dashboard') },
        { icon: '🎂', label: 'View Products Catalog', action: () => this.switchView('products') },
        { icon: '➕', label: 'Add New Product Bake', action: () => this.openProductDrawer() },
        { icon: '📋', label: 'Stock & Inventory Radar', action: () => this.switchView('inventory') },
        { icon: '🛍️', label: 'Customer Orders & Logistics', action: () => this.switchView('orders') },
        { icon: '🏷️', label: 'Discounts & Promo Engine', action: () => this.switchView('discounts') },
        { icon: '💌', label: 'Custom Cake Consultations', action: () => this.switchView('inquiries') },
        { icon: '⚙️', label: 'Store Settings & Backup', action: () => this.switchView('settings') },
        { icon: '🌸', label: 'Open Public Storefront', action: () => window.open('index.html', '_blank') }
      ];

      let filteredCommands = defaultCommands.filter(c => c.label.toLowerCase().includes(q));

      let matchedProducts = [];
      if (q) {
        matchedProducts = products.filter(p => p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)));
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
        html = `<div style="text-align:center; padding: 24px; color:var(--cocoa-muted); font-size:0.88rem;">No matching commands or products for "${this.escapeHTML(q)}"</div>`;
      }

      resultsBox.innerHTML = html;

      // Attach Click Listeners
      resultsBox.querySelectorAll('[data-cmd-idx]').forEach(el => {
        el.addEventListener('click', () => {
          const idx = Number(el.getAttribute('data-cmd-idx'));
          filteredCommands[idx].action();
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
    // 13. UTILITIES & TOAST ENGINE
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
        new: 'New Inquiry'
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
