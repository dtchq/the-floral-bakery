/**
 * THE FLORA BAKERY - UNIFIED DATA ENGINE (FloraDB)
 * High-performance, reactive state manager connecting Public Storefront & Admin Portal
 * Features: Automatic localStorage persistence, cross-tab real-time sync, full CRUD & Analytics
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'flora_products_v2',
    ORDERS: 'flora_orders_v2',
    DISCOUNTS: 'flora_discounts_v2',
    INQUIRIES: 'flora_inquiries_v2',
    SETTINGS: 'flora_settings_v2',
    AUTH: 'flora_admin_auth_v2'
  };

  // Initial Seed Products
  const DEFAULT_PRODUCTS = [
    {
      id: 1,
      name: "Blush Rose & Lychee Chiffon Cake",
      category: "cakes",
      categoryLabel: "Signature Cake",
      price: 1299,
      comparePrice: 1499,
      stock: 14,
      unit: "0.5 kg (Serves 4-6)",
      rating: 4.9,
      reviews: 142,
      badge: "Bestseller",
      eggless: true,
      sku: "FB-CK-001",
      image: "images/cat-cakes.jpg",
      description: "Light-as-air vanilla chiffon sponge layered with French rosewater mascarpone cream, fresh lychee compote, and crowned with edible organic pink roses and gold leaf.",
      status: "active",
      createdAt: "2026-07-15"
    },
    {
      id: 2,
      name: "French Lavender Berry Choux Pastries",
      category: "pastries",
      categoryLabel: "Designer Pastry",
      price: 449,
      comparePrice: 499,
      stock: 8,
      unit: "Box of 2 pieces",
      rating: 4.8,
      reviews: 98,
      badge: "Chef's Pick",
      eggless: true,
      sku: "FB-PS-002",
      image: "images/cat-pastries.jpg",
      description: "Crispy craquelin choux filled with infused Provence lavender crème diplomate and house-made wild blackberry coulis, finished with edible viola petals.",
      status: "active",
      createdAt: "2026-07-18"
    },
    {
      id: 3,
      name: "Honey Chamomile Bloom Muffins",
      category: "muffins",
      categoryLabel: "Artisanal Muffin",
      price: 399,
      comparePrice: 450,
      stock: 4,
      unit: "Box of 4 pieces",
      rating: 4.9,
      reviews: 86,
      badge: "Most Loved",
      eggless: true,
      sku: "FB-MF-003",
      image: "images/cat-muffins.jpg",
      description: "Golden honey sponge muffins topped with whipped chamomile buttercream piped into delicate blooming blossoms and dusted with organic yellow chamomile.",
      status: "active",
      createdAt: "2026-07-20"
    },
    {
      id: 4,
      name: "Victorian Vintage Lambeth Heart Cake",
      category: "cakes",
      categoryLabel: "Custom Aesthetic Cake",
      price: 1599,
      comparePrice: 1799,
      stock: 6,
      unit: "1.0 kg (Serves 8-10)",
      rating: 5.0,
      reviews: 215,
      badge: "Trending",
      eggless: true,
      sku: "FB-CK-004",
      image: "images/hero-cake.jpg",
      description: "Aesthetic Lambeth piped vintage heart cake with delicate frills, blush pink and buttery yellow floral garlands, and customizable celebration message.",
      status: "active",
      createdAt: "2026-07-22"
    },
    {
      id: 5,
      name: "Wildberry Mascarpone Blossom Tart",
      category: "pastries",
      categoryLabel: "French Tartlet",
      price: 549,
      comparePrice: 599,
      stock: 12,
      unit: "Box of 2 pieces",
      rating: 4.9,
      reviews: 74,
      badge: "New Release",
      eggless: true,
      sku: "FB-PS-005",
      image: "images/cat-pastries.jpg",
      description: "Buttery almond tart shell filled with Madagascar vanilla bean cream, fresh strawberries, blueberries, and candied edible pansies.",
      status: "active",
      createdAt: "2026-07-25"
    },
    {
      id: 6,
      name: "Meyer Lemon & Elderflower Muffins",
      category: "muffins",
      categoryLabel: "Artisanal Muffin",
      price: 429,
      comparePrice: 480,
      stock: 18,
      unit: "Box of 4 pieces",
      rating: 4.8,
      reviews: 63,
      badge: "Seasonal",
      eggless: true,
      sku: "FB-MF-006",
      image: "images/cat-muffins.jpg",
      description: "Zesty Meyer lemon curd infused muffins crowned with elderflower whipped frosting and delicate lemon blossom sugar pearls.",
      status: "active",
      createdAt: "2026-07-28"
    },
    {
      id: 7,
      name: "The Royal Flora + Cake Gifting Hamper",
      category: "combos",
      categoryLabel: "Luxury Gift Set",
      price: 2499,
      comparePrice: 2899,
      stock: 5,
      unit: "Cake + Fresh Flower Bouquet",
      rating: 5.0,
      reviews: 189,
      badge: "Luxury Gifting",
      eggless: true,
      sku: "FB-CB-007",
      image: "images/combo-banner.jpg",
      description: "A luxury presentation hamper containing our 0.5kg signature floral cake in a window keepsake box paired with a hand-tied bouquet of fresh garden roses and baby's breath.",
      status: "active",
      createdAt: "2026-08-01"
    },
    {
      id: 8,
      name: "Two-Tier Botanical Anniversary Cake",
      category: "cakes",
      categoryLabel: "Celebration Tier",
      price: 2899,
      comparePrice: 3200,
      stock: 3,
      unit: "1.5 kg (Serves 12-16)",
      rating: 5.0,
      reviews: 112,
      badge: "Signature",
      eggless: true,
      sku: "FB-CK-008",
      image: "images/hero-cake.jpg",
      description: "Grand two-tier statement cake draped in pastel pink watercolor buttercream with cascading fresh garden roses, yellow buttercups, and real gold foil.",
      status: "active",
      createdAt: "2026-08-03"
    }
  ];

  // Orders initialized to clean ZERO (Empty array)
  const DEFAULT_ORDERS = [];

  // Inquiries initialized to clean ZERO (Empty array)
  const DEFAULT_INQUIRIES = [];

  const DEFAULT_DISCOUNTS = [
    {
      code: "FLORA10",
      type: "percent",
      value: 10,
      minOrder: 499,
      description: "10% off on all floral cakes and pastries",
      active: true,
      usageCount: 0
    },
    {
      code: "BLOOM10",
      type: "percent",
      value: 10,
      minOrder: 499,
      description: "VIP Club 10% welcome discount",
      active: true,
      usageCount: 0
    },
    {
      code: "CELEBRATE150",
      type: "fixed",
      value: 150,
      minOrder: 1299,
      description: "Flat ₹150 off on celebration cake orders above ₹1299",
      active: true,
      usageCount: 0
    }
  ];

  const DEFAULT_SETTINGS = {
    storeName: "The Flora Bakery",
    tagline: "Handcrafted Floral Patisserie",
    location: "Nashik, Maharashtra",
    address: "Ibadat Villa, Plot No. 41, Sai Nath Nagar, Nashik, Maharashtra 422006",
    phone: "070835 17862",
    whatsapp: "917083517862",
    instagram: "the.flora.bakery",
    freeShippingThreshold: 999,
    currencySymbol: "₹",
    pureVegGuaranteed: true,
    lastBackup: new Date().toISOString()
  };

  // Safe localStorage helper
  const Storage = {
    get(key, defaultVal) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultVal;
      } catch (err) {
        console.warn(`FloraDB: Failed reading ${key}`, err);
        return defaultVal;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
        return true;
      } catch (err) {
        console.error(`FloraDB: Failed writing ${key}`, err);
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  // Central Database Interface
  const FloraDB = {
    init() {
      // Clear legacy storage if present to ensure clean zero orders
      try {
        localStorage.removeItem('flora_orders_v1');
        localStorage.removeItem('flora_inquiries_v1');
      } catch(e) {}

      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        Storage.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        Storage.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISCOUNTS)) {
        Storage.set(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
        Storage.set(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        Storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }

      // Sync across browser tabs in real time
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          this.broadcastChange(e.key, 'remote-tab-sync');
        }
      });
    },

    broadcastChange(key, detail = {}) {
      const event = new CustomEvent('flora:data-changed', {
        detail: { key, ...detail, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    },

    // =========================================================================
    // 1. PRODUCTS CRUD
    // =========================================================================
    getProducts(filter = {}) {
      let products = Storage.get(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      
      if (filter.category && filter.category !== 'all') {
        products = products.filter(p => p.category === filter.category);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        products = products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      }
      if (filter.status && filter.status !== 'all') {
        products = products.filter(p => p.status === filter.status);
      }
      if (filter.egglessOnly) {
        products = products.filter(p => p.eggless);
      }

      return products;
    },

    getProductById(id) {
      const products = this.getProducts();
      return products.find(p => p.id === Number(id)) || null;
    },

    saveProduct(productData) {
      const products = this.getProducts();
      let savedProduct;

      if (productData.id) {
        // Edit existing product
        const idx = products.findIndex(p => p.id === Number(productData.id));
        if (idx !== -1) {
          products[idx] = {
            ...products[idx],
            ...productData,
            id: Number(productData.id),
            updatedAt: new Date().toISOString()
          };
          savedProduct = products[idx];
        }
      } else {
        // Create new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        savedProduct = {
          id: newId,
          name: productData.name || "Untitled Bake",
          category: productData.category || "cakes",
          categoryLabel: productData.categoryLabel || this.getCategoryLabel(productData.category),
          price: Number(productData.price) || 999,
          comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
          stock: productData.stock !== undefined ? Number(productData.stock) : 10,
          unit: productData.unit || "0.5 kg",
          rating: 5.0,
          reviews: 1,
          badge: productData.badge || "New",
          eggless: productData.eggless !== undefined ? productData.eggless : true,
          sku: productData.sku || `FB-${(productData.category || 'CK').substring(0,2).toUpperCase()}-${String(newId).padStart(3, '0')}`,
          image: productData.image || "images/cat-cakes.jpg",
          description: productData.description || "Freshly baked handcrafted floral specialty.",
          status: productData.status || "active",
          createdAt: new Date().toISOString()
        };
        products.push(savedProduct);
      }

      Storage.set(STORAGE_KEYS.PRODUCTS, products);
      this.broadcastChange(STORAGE_KEYS.PRODUCTS, { action: 'save-product', product: savedProduct });
      return savedProduct;
    },

    deleteProduct(id) {
      let products = this.getProducts();
      const target = products.find(p => p.id === Number(id));
      products = products.filter(p => p.id !== Number(id));
      Storage.set(STORAGE_KEYS.PRODUCTS, products);
      this.broadcastChange(STORAGE_KEYS.PRODUCTS, { action: 'delete-product', id, product: target });
      return true;
    },

    adjustStock(id, delta) {
      const products = this.getProducts();
      const p = products.find(prod => prod.id === Number(id));
      if (p) {
        p.stock = Math.max(0, (p.stock || 0) + Number(delta));
        Storage.set(STORAGE_KEYS.PRODUCTS, products);
        this.broadcastChange(STORAGE_KEYS.PRODUCTS, { action: 'stock-adjusted', id, newStock: p.stock });
        return p.stock;
      }
      return null;
    },

    duplicateProduct(id) {
      const orig = this.getProductById(id);
      if (!orig) return null;

      const clone = {
        ...orig,
        id: null,
        name: `${orig.name} (Copy)`,
        sku: `${orig.sku || 'FB'}-COPY`,
        createdAt: new Date().toISOString()
      };
      return this.saveProduct(clone);
    },

    getCategoryLabel(category) {
      const labels = {
        cakes: "Signature Floral Cake",
        pastries: "Designer Pastry",
        muffins: "Artisanal Muffin",
        combos: "Luxury Gift Hamper"
      };
      return labels[category] || "Artisanal Bake";
    },

    // =========================================================================
    // 2. ORDERS & LOGISTICS
    // =========================================================================
    getOrders(filter = {}) {
      let orders = Storage.get(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);

      if (filter.status && filter.status !== 'all') {
        orders = orders.filter(o => o.status === filter.status);
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        orders = orders.filter(o => 
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.phone && o.phone.includes(q)) ||
          (o.address && o.address.toLowerCase().includes(q))
        );
      }

      return orders;
    },

    addOrder(orderData) {
      const orders = this.getOrders();
      const newOrderNum = orders.length > 0 ? 1000 + orders.length + 1 : 1001;
      const newOrder = {
        id: `FB-${newOrderNum}`,
        customerName: orderData.customerName || "Customer",
        phone: orderData.phone || "070835 17862",
        address: orderData.address || "Nashik, Maharashtra",
        items: orderData.items || [],
        subtotal: Number(orderData.subtotal) || 0,
        discount: Number(orderData.discount) || 0,
        total: Number(orderData.total) || 0,
        status: "pending",
        paymentStatus: orderData.paymentStatus || "WhatsApp Order Pending",
        date: "Just now",
        timeAgo: "1m ago",
        notes: orderData.notes || "",
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      Storage.set(STORAGE_KEYS.ORDERS, orders);

      // Decrement inventory stock for ordered items
      if (Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          this.adjustStock(item.id, -(item.qty || 1));
        });
      }

      this.broadcastChange(STORAGE_KEYS.ORDERS, { action: 'new-order', order: newOrder });
      return newOrder;
    },

    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        Storage.set(STORAGE_KEYS.ORDERS, orders);
        this.broadcastChange(STORAGE_KEYS.ORDERS, { action: 'order-status-update', orderId, status: newStatus });
        return true;
      }
      return false;
    },

    clearAllOrders() {
      Storage.set(STORAGE_KEYS.ORDERS, []);
      this.broadcastChange(STORAGE_KEYS.ORDERS, { action: 'orders-cleared' });
      return true;
    },

    // =========================================================================
    // 3. DISCOUNTS & COUPONS
    // =========================================================================
    getDiscounts() {
      return Storage.get(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
    },

    saveDiscount(discount) {
      const discounts = this.getDiscounts();
      const code = (discount.code || '').trim().toUpperCase();
      const idx = discounts.findIndex(d => d.code === code);

      const discountObj = {
        code,
        type: discount.type || 'percent',
        value: Number(discount.value) || 10,
        minOrder: Number(discount.minOrder) || 0,
        description: discount.description || `${discount.value}% off coupon`,
        active: discount.active !== undefined ? discount.active : true,
        usageCount: discount.usageCount || 0
      };

      if (idx !== -1) {
        discounts[idx] = discountObj;
      } else {
        discounts.push(discountObj);
      }

      Storage.set(STORAGE_KEYS.DISCOUNTS, discounts);
      this.broadcastChange(STORAGE_KEYS.DISCOUNTS, { action: 'save-discount', discount: discountObj });
      return discountObj;
    },

    deleteDiscount(code) {
      let discounts = this.getDiscounts();
      discounts = discounts.filter(d => d.code !== code.toUpperCase());
      Storage.set(STORAGE_KEYS.DISCOUNTS, discounts);
      this.broadcastChange(STORAGE_KEYS.DISCOUNTS, { action: 'delete-discount', code });
      return true;
    },

    validateDiscount(code, subtotal = 0) {
      const discounts = this.getDiscounts();
      const cleanCode = (code || '').trim().toUpperCase();
      const found = discounts.find(d => d.code === cleanCode && d.active);

      if (!found) {
        return { valid: false, message: `Coupon code "${cleanCode}" is not recognized.` };
      }
      if (subtotal < found.minOrder) {
        return { valid: false, message: `Coupon requires a minimum order of ₹${found.minOrder}.` };
      }

      let discountAmount = 0;
      if (found.type === 'percent') {
        discountAmount = Math.round((subtotal * found.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, found.value);
      }

      return {
        valid: true,
        discount: found,
        discountAmount,
        message: `✨ ${found.code} applied! Saved ₹${discountAmount}`
      };
    },

    // =========================================================================
    // 4. CUSTOM CAKE INQUIRIES
    // =========================================================================
    getInquiries() {
      return Storage.get(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
    },

    addInquiry(inquiryData) {
      const inquiries = this.getInquiries();
      const newInquiry = {
        id: `INQ-${100 + inquiries.length + 1}`,
        customerName: inquiryData.customerName || "Customer",
        phone: inquiryData.phone || "070835 17862",
        occasion: inquiryData.occasion || "Celebration",
        size: inquiryData.size || "1.0 kg",
        flavor: inquiryData.flavor || "Rose & Lychee Chiffon",
        palette: inquiryData.palette || "Blush Pink",
        message: inquiryData.message || "",
        requiredDate: inquiryData.requiredDate || "Upcoming",
        notes: inquiryData.notes || "",
        status: "new",
        date: "Just now",
        createdAt: new Date().toISOString()
      };

      inquiries.unshift(newInquiry);
      Storage.set(STORAGE_KEYS.INQUIRIES, inquiries);
      this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'new-inquiry', inquiry: newInquiry });
      return newInquiry;
    },

    updateInquiryStatus(inquiryId, status) {
      const inquiries = this.getInquiries();
      const inq = inquiries.find(i => i.id === inquiryId);
      if (inq) {
        inq.status = status;
        Storage.set(STORAGE_KEYS.INQUIRIES, inquiries);
        this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'inquiry-status-update', inquiryId, status });
        return true;
      }
      return false;
    },

    clearAllInquiries() {
      Storage.set(STORAGE_KEYS.INQUIRIES, []);
      this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'inquiries-cleared' });
      return true;
    },

    // =========================================================================
    // 5. SETTINGS & PROFILE
    // =========================================================================
    getSettings() {
      return Storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    saveSettings(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
      Storage.set(STORAGE_KEYS.SETTINGS, updated);
      this.broadcastChange(STORAGE_KEYS.SETTINGS, { action: 'save-settings', settings: updated });
      return updated;
    },

    // =========================================================================
    // 6. ANALYTICS & DASHBOARD METRICS
    // =========================================================================
    getAnalytics() {
      const products = this.getProducts();
      const orders = this.getOrders();
      const inquiries = this.getInquiries();

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const lowStockItems = products.filter(p => p.stock <= 5);
      const activeOrders = orders.filter(o => o.status === 'baking' || o.status === 'pending' || o.status === 'shipped');

      return {
        totalRevenue,
        totalOrders,
        aov,
        totalProducts: products.length,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        activeOrdersCount: activeOrders.length,
        inquiriesCount: inquiries.length,
        recentOrders: orders.slice(0, 5)
      };
    },

    // =========================================================================
    // 7. BACKUP, EXPORT & FACTORY RESET
    // =========================================================================
    exportJSON() {
      const fullSnapshot = {
        version: "2.0",
        exportDate: new Date().toISOString(),
        products: this.getProducts(),
        orders: this.getOrders(),
        discounts: this.getDiscounts(),
        inquiries: this.getInquiries(),
        settings: this.getSettings()
      };
      return JSON.stringify(fullSnapshot, null, 2);
    },

    importJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.products && Array.isArray(data.products)) Storage.set(STORAGE_KEYS.PRODUCTS, data.products);
        if (data.orders && Array.isArray(data.orders)) Storage.set(STORAGE_KEYS.ORDERS, data.orders);
        if (data.discounts && Array.isArray(data.discounts)) Storage.set(STORAGE_KEYS.DISCOUNTS, data.discounts);
        if (data.inquiries && Array.isArray(data.inquiries)) Storage.set(STORAGE_KEYS.INQUIRIES, data.inquiries);
        if (data.settings) Storage.set(STORAGE_KEYS.SETTINGS, data.settings);

        this.broadcastChange('all', { action: 'import-backup' });
        return { success: true };
      } catch (err) {
        console.error("FloraDB: JSON import failed", err);
        return { success: false, error: err.message };
      }
    },

    resetToDefaults() {
      Storage.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      Storage.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      Storage.set(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
      Storage.set(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      Storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.broadcastChange('all', { action: 'factory-reset' });
      return true;
    }
  };

  // Boot Database Engine
  FloraDB.init();

  // Expose to Global Scope
  window.FloraDB = FloraDB;

})(window);
