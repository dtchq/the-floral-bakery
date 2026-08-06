/**
 * THE FLORA BAKERY - UNIFIED DATA ENGINE (FloraDB)
 * High-performance, reactive state manager connecting Public Storefront & Admin Portal
 * Features: Automatic localStorage persistence, cross-tab real-time sync, full CRUD & Analytics
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'flora_products_v1',
    ORDERS: 'flora_orders_v1',
    DISCOUNTS: 'flora_discounts_v1',
    INQUIRIES: 'flora_inquiries_v1',
    SETTINGS: 'flora_settings_v1',
    AUTH: 'flora_admin_auth_v1'
  };

  // Initial Seed Data
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

  const DEFAULT_ORDERS = [
    {
      id: "FB-1048",
      customerName: "Priyanka Kulkarni",
      phone: "9823019283",
      address: "Gangapur Road, Near Navshya Ganpati, Nashik",
      items: [
        { name: "Blush Rose & Lychee Chiffon Cake", qty: 1, price: 1299 }
      ],
      subtotal: 1299,
      discount: 130,
      total: 1169,
      status: "baking",
      paymentStatus: "Paid Online",
      date: "Today, 11:20 AM",
      timeAgo: "25 mins ago",
      notes: "Please write 'Happy 25th Mom & Dad' in rose gold cursive."
    },
    {
      id: "FB-1047",
      customerName: "Rohit Deshmukh",
      phone: "9822451092",
      address: "College Road, Behind BYK College, Nashik",
      items: [
        { name: "The Royal Flora + Cake Gifting Hamper", qty: 1, price: 2499 }
      ],
      subtotal: 2499,
      discount: 0,
      total: 2499,
      status: "shipped",
      paymentStatus: "Paid Online",
      date: "Today, 09:45 AM",
      timeAgo: "2 hours ago",
      notes: "Anniversary surprise. Please deliver with luxury satin ribbon."
    },
    {
      id: "FB-1046",
      customerName: "Snehal Sharma",
      phone: "9422781903",
      address: "Mahatma Nagar, Opp Water Tank, Nashik",
      items: [
        { name: "French Lavender Berry Choux Pastries", qty: 2, price: 449 },
        { name: "Honey Chamomile Bloom Muffins", qty: 1, price: 399 }
      ],
      subtotal: 1297,
      discount: 100,
      total: 1197,
      status: "delivered",
      paymentStatus: "Cash on Delivery",
      date: "Yesterday, 04:30 PM",
      timeAgo: "1 day ago",
      notes: "High tea gathering box."
    },
    {
      id: "FB-1045",
      customerName: "Aditya Patil",
      phone: "9175392019",
      address: "Indira Nagar, Near Jogging Track, Nashik",
      items: [
        { name: "Victorian Vintage Lambeth Heart Cake", qty: 1, price: 1599 }
      ],
      subtotal: 1599,
      discount: 160,
      total: 1439,
      status: "delivered",
      paymentStatus: "Paid Online",
      date: "05 Aug 2026, 06:15 PM",
      timeAgo: "2 days ago",
      notes: "Birthday cake with pastel ribbon border."
    }
  ];

  const DEFAULT_DISCOUNTS = [
    {
      code: "FLORA10",
      type: "percent",
      value: 10,
      minOrder: 500,
      description: "10% off on all floral bakes for VIP Bloom Club",
      usageCount: 42,
      active: true,
      expiryDate: "2026-12-31"
    },
    {
      code: "BLOOM20",
      type: "percent",
      value: 20,
      minOrder: 1500,
      description: "20% off on celebration orders above ₹1,500",
      usageCount: 18,
      active: true,
      expiryDate: "2026-09-30"
    },
    {
      code: "NASHIKLOVE",
      type: "fixed",
      value: 150,
      minOrder: 999,
      description: "Flat ₹150 off on orders above ₹999",
      usageCount: 29,
      active: true,
      expiryDate: "2026-10-15"
    }
  ];

  const DEFAULT_INQUIRIES = [
    {
      id: "INQ-801",
      customerName: "Ananya Mehta",
      phone: "9823901234",
      occasion: "Engagement Celebration",
      size: "2.0 kg",
      flavor: "Rose Lychee & Pistachio",
      palette: "Dusty Rose, Champagne & Buttercup",
      message: "Ananya & Siddharth 💍",
      requiredDate: "2026-08-15",
      notes: "Looking for a 2-tier textured buttercream design with real English tea roses inspired by Pinterest reference.",
      status: "new",
      date: "Today, 10:15 AM"
    },
    {
      id: "INQ-800",
      customerName: "Dr. Mihir Joshi",
      phone: "9890123456",
      occasion: "50th Golden Birthday",
      size: "1.5 kg",
      flavor: "Belgian Chocolate Truffle",
      palette: "Vintage Lambeth Ivory & Gold",
      message: "Golden 50 Mihir 🎉",
      requiredDate: "2026-08-18",
      notes: "Must be 100% Eggless pure veg. Delivery to Ashoka Marg.",
      status: "contacted",
      date: "Yesterday, 02:40 PM"
    }
  ];

  const DEFAULT_SETTINGS = {
    storeName: "The Flora Bakery",
    tagline: "Handcrafted Floral Patisserie & Custom Aesthetic Cakes",
    phone: "070835 17862",
    whatsapp: "917083517862",
    address: "Ibadat Villa, Plot No. 41, Sai Nath Nagar, Nashik, Maharashtra 422006",
    freeShippingThreshold: 999,
    currencySymbol: "₹",
    lowStockThreshold: 5,
    taxRate: 0,
    isOpenForOrders: true,
    operatingHours: "09:00 AM - 10:00 PM Daily"
  };

  class FloraDatabase {
    constructor() {
      this.init();
      this.setupCrossTabSync();
    }

    init() {
      if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
        this.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        this.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISCOUNTS)) {
        this.set(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
      }
      if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
        this.set(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      }
    }

    get(key, fallback = []) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } catch (e) {
        console.error("FloraDB read error:", e);
        return fallback;
      }
    }

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        this.broadcastChange(key, value);
      } catch (e) {
        console.error("FloraDB write error:", e);
      }
    }

    broadcastChange(key, data) {
      const event = new CustomEvent('flora:data-changed', {
        detail: { key, data, timestamp: Date.now() }
      });
      window.dispatchEvent(event);
    }

    setupCrossTabSync() {
      window.addEventListener('storage', (e) => {
        if (Object.values(STORAGE_KEYS).includes(e.key)) {
          this.broadcastChange(e.key, this.get(e.key));
        }
      });
    }

    // Products API
    getProducts(options = {}) {
      let products = this.get(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      
      if (options.category && options.category !== 'all') {
        products = products.filter(p => p.category === options.category);
      }
      if (options.status) {
        products = products.filter(p => p.status === options.status);
      }
      if (options.search) {
        const q = options.search.toLowerCase().trim();
        products = products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
        );
      }
      if (options.onlyInStock) {
        products = products.filter(p => p.stock > 0);
      }
      return products;
    }

    getProductById(id) {
      const products = this.getProducts();
      return products.find(p => p.id === Number(id)) || null;
    }

    saveProduct(productData) {
      const products = this.getProducts();
      const numId = Number(productData.id);

      if (numId) {
        const index = products.findIndex(p => p.id === numId);
        if (index !== -1) {
          products[index] = {
            ...products[index],
            ...productData,
            id: numId,
            price: Number(productData.price) || 0,
            stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 0,
            comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
            updatedAt: new Date().toISOString()
          };
          this.set(STORAGE_KEYS.PRODUCTS, products);
          return products[index];
        }
      }

      const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = {
        ...productData,
        id: newId,
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 10,
        comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
        rating: productData.rating || 5.0,
        reviews: productData.reviews || 1,
        badge: productData.badge || "New",
        eggless: productData.eggless !== undefined ? productData.eggless : true,
        sku: productData.sku || `FB-ITM-${String(newId).padStart(3, '0')}`,
        status: productData.status || "active",
        createdAt: new Date().toISOString().split('T')[0]
      };

      products.unshift(newProduct);
      this.set(STORAGE_KEYS.PRODUCTS, products);
      return newProduct;
    }

    deleteProduct(id) {
      const products = this.getProducts();
      const filtered = products.filter(p => p.id !== Number(id));
      this.set(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }

    duplicateProduct(id) {
      const target = this.getProductById(id);
      if (!target) return null;

      const clone = {
        ...target,
        id: null,
        name: `${target.name} (Copy)`,
        sku: `${target.sku}-COPY`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      return this.saveProduct(clone);
    }

    updateStock(id, newStock) {
      const products = this.getProducts();
      const item = products.find(p => p.id === Number(id));
      if (item) {
        item.stock = Math.max(0, Number(newStock));
        this.set(STORAGE_KEYS.PRODUCTS, products);
        return item.stock;
      }
      return null;
    }

    adjustStock(id, delta) {
      const products = this.getProducts();
      const item = products.find(p => p.id === Number(id));
      if (item) {
        item.stock = Math.max(0, item.stock + delta);
        this.set(STORAGE_KEYS.PRODUCTS, products);
        return item.stock;
      }
      return null;
    }

    // Orders API
    getOrders(options = {}) {
      let orders = this.get(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      if (options.status && options.status !== 'all') {
        orders = orders.filter(o => o.status === options.status);
      }
      if (options.search) {
        const q = options.search.toLowerCase().trim();
        orders = orders.filter(o => 
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.address.toLowerCase().includes(q)
        );
      }
      return orders;
    }

    addOrder(orderData) {
      const orders = this.getOrders();
      const nextNum = 1040 + orders.length + 1;
      const newOrder = {
        id: `FB-${nextNum}`,
        customerName: orderData.customerName || "Website Shopper",
        phone: orderData.phone || "070835 17862",
        address: orderData.address || "Nashik, Maharashtra",
        items: orderData.items || [],
        subtotal: Number(orderData.subtotal) || 0,
        discount: Number(orderData.discount) || 0,
        total: Number(orderData.total) || 0,
        status: "pending",
        paymentStatus: orderData.paymentStatus || "WhatsApp Order / COD",
        date: "Today, Just now",
        timeAgo: "Few seconds ago",
        notes: orderData.notes || "Placed via website instant checkout."
      };

      if (Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          if (item.id) {
            this.adjustStock(item.id, -(item.qty || 1));
          }
        });
      }

      orders.unshift(newOrder);
      this.set(STORAGE_KEYS.ORDERS, orders);
      return newOrder;
    }

    updateOrderStatus(orderId, newStatus) {
      const orders = this.getOrders();
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
        this.set(STORAGE_KEYS.ORDERS, orders);
        return order;
      }
      return null;
    }

    // Discounts API
    getDiscounts() {
      return this.get(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
    }

    saveDiscount(discountData) {
      const discounts = this.getDiscounts();
      const upperCode = (discountData.code || '').trim().toUpperCase();
      if (!upperCode) return null;

      const existingIndex = discounts.findIndex(d => d.code === upperCode);
      const newEntry = {
        code: upperCode,
        type: discountData.type || 'percent',
        value: Number(discountData.value) || 10,
        minOrder: Number(discountData.minOrder) || 0,
        description: discountData.description || `Special ${discountData.value}% discount`,
        usageCount: discountData.usageCount || 0,
        active: discountData.active !== undefined ? discountData.active : true,
        expiryDate: discountData.expiryDate || "2026-12-31"
      };

      if (existingIndex !== -1) {
        discounts[existingIndex] = newEntry;
      } else {
        discounts.unshift(newEntry);
      }

      this.set(STORAGE_KEYS.DISCOUNTS, discounts);
      return newEntry;
    }

    deleteDiscount(code) {
      const discounts = this.getDiscounts();
      const filtered = discounts.filter(d => d.code !== code.toUpperCase());
      this.set(STORAGE_KEYS.DISCOUNTS, filtered);
      return true;
    }

    validateDiscount(code, cartSubtotal) {
      if (!code) return { valid: false, message: "Please enter a promo code." };
      const discounts = this.getDiscounts();
      const match = discounts.find(d => d.code.toUpperCase() === code.trim().toUpperCase());

      if (!match) {
        return { valid: false, message: "Invalid coupon code." };
      }
      if (!match.active) {
        return { valid: false, message: "This coupon is no longer active." };
      }
      if (match.minOrder && cartSubtotal < match.minOrder) {
        return { valid: false, message: `Minimum order value for ${match.code} is ₹${match.minOrder}.` };
      }

      let discountAmount = 0;
      if (match.type === 'percent') {
        discountAmount = Math.round((cartSubtotal * match.value) / 100);
      } else {
        discountAmount = Math.min(cartSubtotal, match.value);
      }

      return {
        valid: true,
        discount: match,
        amount: discountAmount,
        discountPercent: match.type === 'percent' ? match.value / 100 : discountAmount / Math.max(1, cartSubtotal),
        message: `🌸 Coupon "${match.code}" applied! You saved ₹${discountAmount}.`
      };
    }

    // Inquiries API
    getInquiries() {
      return this.get(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
    }

    addInquiry(inqData) {
      const inquiries = this.getInquiries();
      const nextId = `INQ-${800 + inquiries.length + 1}`;
      const newInq = {
        id: nextId,
        customerName: inqData.customerName || "Custom Cake Client",
        phone: inqData.phone || "070835 17862",
        occasion: inqData.occasion || "Celebration",
        size: inqData.size || "1.0 kg",
        flavor: inqData.flavor || "Signature Rose Chiffon",
        palette: inqData.palette || "Pastel Floral",
        message: inqData.message || "None",
        requiredDate: inqData.requiredDate || "Upcoming",
        notes: inqData.notes || "None",
        status: "new",
        date: "Today, Just now"
      };

      inquiries.unshift(newInq);
      this.set(STORAGE_KEYS.INQUIRIES, inquiries);
      return newInq;
    }

    updateInquiryStatus(id, newStatus) {
      const inquiries = this.getInquiries();
      const inq = inquiries.find(i => i.id === id);
      if (inq) {
        inq.status = newStatus;
        this.set(STORAGE_KEYS.INQUIRIES, inquiries);
        return inq;
      }
      return null;
    }

    // Settings API
    getSettings() {
      return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }

    saveSettings(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      this.set(STORAGE_KEYS.SETTINGS, updated);
      return updated;
    }

    // Analytics Engine
    getAnalytics() {
      const products = this.getProducts();
      const orders = this.getOrders();
      const inquiries = this.getInquiries();

      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const activeOrdersCount = orders.filter(o => ['pending', 'baking', 'shipped'].includes(o.status)).length;
      const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
      const aov = orders.length > 0 ? Math.round(totalRevenue / Math.max(1, orders.length)) : 0;

      const lowStockProducts = products.filter(p => p.stock <= 5);
      const outOfStockProducts = products.filter(p => p.stock === 0);

      const categoryCounts = {
        cakes: products.filter(p => p.category === 'cakes').length,
        pastries: products.filter(p => p.category === 'pastries').length,
        muffins: products.filter(p => p.category === 'muffins').length,
        combos: products.filter(p => p.category === 'combos').length
      };

      return {
        totalRevenue,
        totalOrders: orders.length,
        activeOrdersCount,
        completedOrdersCount,
        aov,
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockProducts,
        inquiriesCount: inquiries.filter(i => i.status === 'new').length,
        categoryCounts,
        recentOrders: orders.slice(0, 5)
      };
    }

    // Backup & Restore
    exportJSON() {
      const payload = {
        products: this.getProducts(),
        orders: this.getOrders(),
        discounts: this.getDiscounts(),
        inquiries: this.getInquiries(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString(),
        version: "1.0"
      };
      return JSON.stringify(payload, null, 2);
    }

    importJSON(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.products) this.set(STORAGE_KEYS.PRODUCTS, parsed.products);
        if (parsed.orders) this.set(STORAGE_KEYS.ORDERS, parsed.orders);
        if (parsed.discounts) this.set(STORAGE_KEYS.DISCOUNTS, parsed.discounts);
        if (parsed.inquiries) this.set(STORAGE_KEYS.INQUIRIES, parsed.inquiries);
        if (parsed.settings) this.set(STORAGE_KEYS.SETTINGS, parsed.settings);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    resetToDefaults() {
      this.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      this.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      this.set(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
      this.set(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      return true;
    }
  }

  window.FloraDB = new FloraDatabase();

})(window);
