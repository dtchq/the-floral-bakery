/**
 * THE FLORA BAKERY - UNIFIED DATA ENGINE (FloraDB)
 * High-performance, reactive state manager connecting Public Storefront & Admin Portal
 * Features: Automatic localStorage persistence, cross-tab real-time sync, full CRUD & Analytics
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'flora_products_v2',
    CATEGORIES: 'flora_categories_v2',
    ORDERS: 'flora_orders_v2',
    DISCOUNTS: 'flora_discounts_v2',
    INQUIRIES: 'flora_inquiries_v2',
    SETTINGS: 'flora_settings_v2',
    AUTH: 'flora_admin_auth_v2'
  };

  // Initial Seed Categories / Collections
  const DEFAULT_CATEGORIES = [
    {
      id: "cakes",
      name: "Floral Cakes",
      slug: "cakes",
      categoryLabel: "Signature Cake",
      description: "Artisanal chiffon & Lambeth vintage cakes crowned with edible florals",
      icon: "🎂",
      image: "images/cat-cakes.jpg",
      status: "active",
      order: 1
    },
    {
      id: "pastries",
      name: "French Pastries",
      slug: "pastries",
      categoryLabel: "Designer Pastry",
      description: "Crispy craquelin choux, lavender eclairs and fresh fruit tarts",
      icon: "🥐",
      image: "images/cat-pastries.jpg",
      status: "active",
      order: 2
    },
    {
      id: "muffins",
      name: "Artisanal Muffins",
      slug: "muffins",
      categoryLabel: "Artisanal Muffin",
      description: "Golden honey muffins with piped blossom buttercream frosting",
      icon: "🧁",
      image: "images/cat-muffins.jpg",
      status: "active",
      order: 3
    },
    {
      id: "combos",
      name: "Gifting Hampers",
      slug: "combos",
      categoryLabel: "Luxury Gift Set",
      description: "Curated floral bakes paired with hand-tied fresh garden rose bouquets",
      icon: "🎁",
      image: "images/combo-banner.jpg",
      status: "active",
      order: 4
    }
  ];

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

  // Orders initialized to clean ZERO
  const DEFAULT_ORDERS = [];

  // Inquiries initialized to clean ZERO
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
    deliveryFee: 99,
    announcementText: "🌸 FREE Refrigerator-Van Delivery on all Nashik orders over ₹999 | Code: FLORA10 for 10% OFF",
    storeNotice: "✨ Taking Pre-Orders for Bespoke Celebration Cakes",
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
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        Storage.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      }
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
    // 1. CATEGORIES & COLLECTIONS CRUD (Shopify-Grade)
    // =========================================================================
    getCategories(filter = {}) {
      let categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const products = this.getProducts();

      // Compute live product counts for each category
      categories = categories.map(c => {
        const count = products.filter(p => p.category === c.slug || p.category === c.id).length;
        return { ...c, productCount: count };
      });

      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        categories = categories.filter(c => 
          c.name.toLowerCase().includes(q) || 
          c.slug.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }

      if (filter.status && filter.status !== 'all') {
        categories = categories.filter(c => c.status === filter.status);
      }

      return categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    getCategoryById(id) {
      const categories = this.getCategories();
      return categories.find(c => c.id === id || c.slug === id) || null;
    },

    saveCategory(categoryData) {
      const categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const cleanSlug = (categoryData.slug || categoryData.name || 'category')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      const existingIdx = categories.findIndex(c => c.id === categoryData.id || c.slug === cleanSlug);

      const categoryObj = {
        id: categoryData.id || cleanSlug,
        slug: cleanSlug,
        name: categoryData.name || "New Collection",
        categoryLabel: categoryData.categoryLabel || categoryData.name || "Artisanal Category",
        description: categoryData.description || "Curated bakery specialties",
        icon: categoryData.icon || "🌸",
        image: categoryData.image || "images/cat-cakes.jpg",
        status: categoryData.status || "active",
        order: Number(categoryData.order) || categories.length + 1,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        categories[existingIdx] = categoryObj;
      } else {
        categories.push(categoryObj);
      }

      Storage.set(STORAGE_KEYS.CATEGORIES, categories);
      this.broadcastChange(STORAGE_KEYS.CATEGORIES, { action: 'save-category', category: categoryObj });
      return categoryObj;
    },

    deleteCategory(id) {
      let categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      categories = categories.filter(c => c.id !== id && c.slug !== id);
      Storage.set(STORAGE_KEYS.CATEGORIES, categories);
      this.broadcastChange(STORAGE_KEYS.CATEGORIES, { action: 'delete-category', id });
      return true;
    },

    // =========================================================================
    // 2. PRODUCTS CRUD
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

    getCategoryLabel(categorySlug) {
      const cat = this.getCategoryById(categorySlug);
      if (cat) return cat.categoryLabel || cat.name;
      return "Artisanal Specialty";
    },

    // =========================================================================
    // 3. ORDERS & LOGISTICS
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

    getOrderById(id) {
      const orders = this.getOrders();
      return orders.find(o => o.id === id) || null;
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
    // 4. CUSTOMERS DIRECTORY & CRM (Shopify-Grade)
    // =========================================================================
    getCustomers(filter = {}) {
      const orders = this.getOrders();
      const inqs = this.getInquiries();
      const map = new Map();

      orders.forEach(o => {
        const phone = (o.phone || '').trim();
        const key = phone || o.customerName;
        if (!map.has(key)) {
          map.set(key, {
            name: o.customerName,
            phone: o.phone,
            address: o.address,
            ordersCount: 0,
            totalSpent: 0,
            lastOrderDate: o.date || 'Recent',
            type: 'customer'
          });
        }
        const cust = map.get(key);
        cust.ordersCount += 1;
        cust.totalSpent += (o.total || 0);
      });

      inqs.forEach(i => {
        const phone = (i.phone || '').trim();
        const key = phone || i.customerName;
        if (!map.has(key)) {
          map.set(key, {
            name: i.customerName,
            phone: i.phone,
            address: 'Custom Inquiry Client',
            ordersCount: 0,
            totalSpent: 0,
            lastOrderDate: 'Inquiry submitted',
            type: 'inquiry_lead'
          });
        }
      });

      let customerList = Array.from(map.values()).map(c => {
        let tag = 'First-Timer';
        if (c.ordersCount >= 3 || c.totalSpent >= 4000) tag = 'VIP Patron';
        else if (c.ordersCount >= 2) tag = 'Repeat Client';
        else if (c.type === 'inquiry_lead') tag = 'Custom Cake Lead';
        return { ...c, tag };
      });

      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        customerList = customerList.filter(c => 
          c.name.toLowerCase().includes(q) || 
          (c.phone && c.phone.includes(q)) ||
          c.tag.toLowerCase().includes(q)
        );
      }

      return customerList.sort((a, b) => b.totalSpent - a.totalSpent);
    },

    // =========================================================================
    // 5. DISCOUNTS & PROMOTIONS
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
    // 6. CUSTOM CAKE INQUIRIES
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
    // 7. SETTINGS & MARKETING ANNOUNCEMENTS
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
    // 8. DEEP ANALYTICS & SHOPIFY REPORTS
    // =========================================================================
    getAnalytics() {
      const products = this.getProducts();
      const categories = this.getCategories();
      const orders = this.getOrders();
      const inquiries = this.getInquiries();
      const customers = this.getCustomers();

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const lowStockItems = products.filter(p => p.stock <= 5);
      const activeOrders = orders.filter(o => o.status === 'baking' || o.status === 'pending' || o.status === 'shipped');

      // Top selling products computation
      const salesMap = {};
      orders.forEach(o => {
        if (Array.isArray(o.items)) {
          o.items.forEach(i => {
            if (!salesMap[i.name]) salesMap[i.name] = { name: i.name, units: 0, revenue: 0 };
            salesMap[i.name].units += (i.qty || 1);
            salesMap[i.name].revenue += ((i.price || 0) * (i.qty || 1));
          });
        }
      });
      const topSelling = Object.values(salesMap).sort((a, b) => b.revenue - a.revenue);

      return {
        totalRevenue,
        totalOrders,
        aov,
        totalProducts: products.length,
        totalCategories: categories.length,
        totalCustomers: customers.length,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        activeOrdersCount: activeOrders.length,
        inquiriesCount: inquiries.length,
        recentOrders: orders.slice(0, 5),
        topSelling
      };
    },

    // =========================================================================
    // 9. CSV EXPORTS (Shopify Compatible)
    // =========================================================================
    exportProductsCSV() {
      const products = this.getProducts();
      let csv = "ID,Name,Category,Price,ComparePrice,Stock,SKU,Unit,Dietary,Status\n";
      products.forEach(p => {
        csv += `"${p.id}","${(p.name||'').replace(/"/g, '""')}","${p.category}","${p.price}","${p.comparePrice||''}","${p.stock}","${p.sku||''}","${p.unit||''}","${p.eggless ? 'Eggless/Veg' : 'Egg'}","${p.status}"\n`;
      });
      return csv;
    },

    exportOrdersCSV() {
      const orders = this.getOrders();
      let csv = "Order ID,Date,Customer,Phone,Address,Subtotal,Discount,Total,Status,Payment\n";
      orders.forEach(o => {
        csv += `"${o.id}","${o.date||''}","${(o.customerName||'').replace(/"/g, '""')}","${o.phone||''}","${(o.address||'').replace(/"/g, '""')}","${o.subtotal}","${o.discount}","${o.total}","${o.status}","${o.paymentStatus||''}"\n`;
      });
      return csv;
    },

    exportJSON() {
      const fullSnapshot = {
        version: "2.0",
        exportDate: new Date().toISOString(),
        categories: this.getCategories(),
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
        if (data.categories && Array.isArray(data.categories)) Storage.set(STORAGE_KEYS.CATEGORIES, data.categories);
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
      Storage.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
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
