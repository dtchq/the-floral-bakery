/**
 * THE FLORA BAKERY - UNIFIED DATA ENGINE (FloraDB)
 * High-performance, reactive state manager connecting Public Storefront & Admin Portal
 * Features: Automatic localStorage persistence, cross-tab real-time sync, full CRUD, Notifications & Email Receipts
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'flora_products_v2',
    CATEGORIES: 'flora_categories_v2',
    ORDERS: 'flora_orders_v2',
    NOTIFICATIONS: 'flora_notifications_v2',
    EMAIL_LOGS: 'flora_email_logs_v2',
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
      description: "Crisp French craquelin choux buns filled with culinary lavender дипломат cream, fresh wild blackberry coulis, and crystallized violet petals.",
      status: "active",
      createdAt: "2026-07-18"
    },
    {
      id: 3,
      name: "Chamomile Honey Glazed Floral Muffins",
      category: "muffins",
      categoryLabel: "Artisanal Muffin",
      price: 399,
      comparePrice: 450,
      stock: 20,
      unit: "Box of 4 pieces",
      rating: 4.9,
      reviews: 86,
      badge: "Organic",
      eggless: true,
      sku: "FB-MF-003",
      image: "images/cat-muffins.jpg",
      description: "Moist bakery muffins infused with organic Egyptian chamomile tea, wild Mahabaleshwar forest honey, and finished with delicate marigold blossoms.",
      status: "active",
      createdAt: "2026-07-20"
    },
    {
      id: 4,
      name: "Vintage Lambeth Pistachio Rose Cake",
      category: "cakes",
      categoryLabel: "Vintage Cake",
      price: 1699,
      comparePrice: 1899,
      stock: 6,
      unit: "1.0 kg (Serves 8-10)",
      rating: 5.0,
      reviews: 118,
      badge: "Celebration",
      eggless: true,
      sku: "FB-CK-004",
      image: "images/hero-cake.jpg",
      description: "Intricate Victorian Lambeth piped buttercream cake with Iranian pistachio sponge, Damascus rose curd, and fresh spray garden roses.",
      status: "active",
      createdAt: "2026-07-22"
    },
    {
      id: 5,
      name: "Petal Symphony Vanilla Berry Tartlets",
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

  // Notifications initialized to clean ZERO
  const DEFAULT_NOTIFICATIONS = [];

  // Email Logs initialized to clean ZERO
  const DEFAULT_EMAIL_LOGS = [];

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
      description: "Flat ₹150 off on orders above ₹1,299",
      active: true,
      usageCount: 0
    }
  ];

  const DEFAULT_SETTINGS = {
    storeName: "The Flora Bakery",
    tagline: "Handcrafted with Organic Edible Flowers",
    whatsapp: "917083517862",
    phone: "070835 17862",
    email: "orders@theflorabakery.com",
    address: "Ibadat Villa, Plot No. 41, Sai Nath Nagar, Nashik, Maharashtra 422006",
    city: "Nashik",
    currency: "INR",
    currencySymbol: "₹",
    freeShippingThreshold: 999,
    standardDeliveryFee: 99,
    announcementText: "🌸 FREE Chilled Delivery across Nashik on Orders Above ₹999",
    storeNotice: "100% Pure Vegetarian & Eggless Kitchen Studio in Nashik.",
    autoAcceptOrders: true,
    operatingHours: "9:00 AM – 10:00 PM"
  };

  // Safe localStorage helper
  const Storage = {
    get(key, fallback) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
      } catch (e) {
        console.warn(`[FloraDB] Error reading key "${key}" from localStorage:`, e);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`[FloraDB] Error saving key "${key}" to localStorage:`, e);
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`[FloraDB] Error removing key "${key}" from localStorage:`, e);
      }
    }
  };

  // Initialize DB Seeds if not present
  function initDatabase() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      Storage.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      Storage.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      Storage.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMAIL_LOGS)) {
      Storage.set(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
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
  }

  initDatabase();

  // Public FloraDB Singleton
  const FloraDB = {
    broadcastChange(key, details = {}) {
      const event = new CustomEvent('flora:data-changed', {
        detail: { key, timestamp: Date.now(), ...details }
      });
      window.dispatchEvent(event);
      try {
        localStorage.setItem('flora_sync_heartbeat', Date.now().toString());
      } catch(e) {}
    },

    // =========================================================================
    // 1. CATEGORIES / COLLECTIONS CRUD
    // =========================================================================
    getCategories() {
      const categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      const products = this.getProducts();

      return categories.map(cat => {
        const count = products.filter(p => p.category === cat.slug).length;
        return { ...cat, productCount: count };
      }).sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    getCategoryById(idOrSlug) {
      const categories = this.getCategories();
      return categories.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null;
    },

    saveCategory(categoryData) {
      const categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      let savedCat;

      const slug = (categoryData.slug || categoryData.name || "category")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-');

      if (categoryData.id) {
        const idx = categories.findIndex(c => c.id === categoryData.id || c.slug === categoryData.id);
        if (idx !== -1) {
          categories[idx] = {
            ...categories[idx],
            ...categoryData,
            slug: slug,
            updatedAt: new Date().toISOString()
          };
          savedCat = categories[idx];
        }
      }

      if (!savedCat) {
        savedCat = {
          id: slug,
          name: categoryData.name || "New Collection",
          slug: slug,
          categoryLabel: categoryData.categoryLabel || categoryData.name || "Specialty",
          description: categoryData.description || "Artisanal bakery collection",
          icon: categoryData.icon || "🌸",
          image: categoryData.image || "images/cat-cakes.jpg",
          status: categoryData.status || "active",
          order: categoryData.order || categories.length + 1,
          createdAt: new Date().toISOString()
        };
        categories.push(savedCat);
      }

      Storage.set(STORAGE_KEYS.CATEGORIES, categories);
      this.broadcastChange(STORAGE_KEYS.CATEGORIES, { action: 'save-category', category: savedCat });
      return savedCat;
    },

    deleteCategory(idOrSlug) {
      let categories = Storage.get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      categories = categories.filter(c => c.id !== idOrSlug && c.slug !== idOrSlug);
      Storage.set(STORAGE_KEYS.CATEGORIES, categories);
      this.broadcastChange(STORAGE_KEYS.CATEGORIES, { action: 'delete-category', id: idOrSlug });
      return true;
    },

    // =========================================================================
    // 2. PRODUCTS CATALOG CRUD
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
        
        // Push low stock notification if stock drops to <= 3
        if (p.stock <= 3 && delta < 0) {
          this.addNotification({
            type: 'low_stock',
            title: '⚠️ Low Stock Alert',
            message: `Only ${p.stock} units remaining for "${p.name}". Consider baking another batch!`,
            productId: p.id
          });
        }

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
    // 3. ORDERS & DIRECT E-COMMERCE CHECKOUT
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
          (o.email && o.email.toLowerCase().includes(q)) ||
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
      const orderId = `FB-${newOrderNum}`;

      const newOrder = {
        id: orderId,
        customerName: orderData.customerName || "Patron",
        phone: orderData.phone || "070835 17862",
        email: orderData.email || "patron@example.com",
        address: orderData.address || "Sai Nath Nagar, Nashik",
        locality: orderData.locality || "Nashik City",
        deliveryDate: orderData.deliveryDate || new Date().toLocaleDateString('en-IN'),
        timeSlot: orderData.timeSlot || "Afternoon (1:00 PM – 5:00 PM)",
        cakeMessage: orderData.cakeMessage || "",
        notes: orderData.notes || "",
        items: orderData.items || [],
        subtotal: Number(orderData.subtotal) || 0,
        deliveryFee: Number(orderData.deliveryFee) || 0,
        discount: Number(orderData.discount) || 0,
        total: Number(orderData.total) || 0,
        paymentMethod: orderData.paymentMethod || "COD", // "COD" | "ONLINE"
        paymentStatus: orderData.paymentMethod === "COD" ? "Cash on Delivery (Pending)" : "Paid Online",
        status: "pending", // "pending" | "baking" | "shipped" | "delivered"
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        timeAgo: "Just now",
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      Storage.set(STORAGE_KEYS.ORDERS, orders);

      // 1. Decrement inventory stock for ordered items
      if (Array.isArray(orderData.items)) {
        orderData.items.forEach(item => {
          this.adjustStock(item.id, -(item.qty || 1));
        });
      }

      // 2. Add Notification for Admin Dashboard
      this.addNotification({
        type: 'new_order',
        title: '🛍️ New Order Received!',
        message: `Order #${orderId} from ${newOrder.customerName} (₹${newOrder.total.toLocaleString('en-IN')} - ${newOrder.paymentMethod})`,
        orderId: orderId,
        read: false
      });

      // 3. Generate Simulated Confirmation Email Receipt
      this.sendOrderConfirmationEmail(newOrder);

      // Broadcast real-time event to storefront & admin panel
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

        this.addNotification({
          type: 'status_update',
          title: `Status: ${newStatus.toUpperCase()}`,
          message: `Order #${orderId} (${order.customerName}) marked as "${newStatus}".`,
          orderId: orderId
        });

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
    // 4. NOTIFICATIONS SYSTEM (Shopify-Grade Bell Alert)
    // =========================================================================
    getNotifications() {
      return Storage.get(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    },

    addNotification(notif) {
      const notifs = this.getNotifications();
      const newNotif = {
        id: `notif_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        type: notif.type || 'info',
        title: notif.title || 'Notification',
        message: notif.message || '',
        orderId: notif.orderId || null,
        read: false,
        createdAt: new Date().toISOString(),
        timeAgo: 'Just now'
      };

      notifs.unshift(newNotif);
      // Keep max 40 notifications
      if (notifs.length > 40) notifs.length = 40;

      Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'new-notification', notification: newNotif });
      return newNotif;
    },

    markNotificationsRead() {
      const notifs = this.getNotifications();
      notifs.forEach(n => { n.read = true; });
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'notifications-read' });
      return true;
    },

    getUnreadNotificationsCount() {
      const notifs = this.getNotifications();
      return notifs.filter(n => !n.read).length;
    },

    clearNotifications() {
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, []);
      this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'notifications-cleared' });
      return true;
    },

    // =========================================================================
    // 5. EMAIL CONFIRMATION DISPATCHER & LOGS
    // =========================================================================
    sendOrderConfirmationEmail(order) {
      const emailLogs = Storage.get(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
      const emailRecord = {
        id: `email_${order.id}_${Date.now()}`,
        orderId: order.id,
        to: order.email || "patron@example.com",
        customerName: order.customerName,
        subject: `🌸 Order Confirmed! The Flora Bakery Order #${order.id}`,
        sentAt: new Date().toISOString(),
        status: "sent",
        htmlTemplate: this.generateEmailHTML(order)
      };

      emailLogs.unshift(emailRecord);
      if (emailLogs.length > 50) emailLogs.length = 50;

      Storage.set(STORAGE_KEYS.EMAIL_LOGS, emailLogs);
      this.broadcastChange(STORAGE_KEYS.EMAIL_LOGS, { action: 'email-sent', email: emailRecord });
      return emailRecord;
    },

    getEmailLogs() {
      return Storage.get(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
    },

    getEmailByOrderId(orderId) {
      const logs = this.getEmailLogs();
      return logs.find(e => e.orderId === orderId) || null;
    },

    generateEmailHTML(order) {
      const itemsList = Array.isArray(order.items) 
        ? order.items.map(i => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0e6e6;">
                <strong>${i.name}</strong><br>
                <span style="font-size: 12px; color: #888;">Qty: ${i.qty} &bull; ₹${i.price} each</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f0e6e6; text-align: right; font-weight: bold; color: #3E2723;">
                ₹${(i.price * i.qty).toLocaleString('en-IN')}
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="2">Artisanal Celebration Bake</td></tr>';

      return `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF6F0; border-radius: 16px; overflow: hidden; border: 1px solid #EFE8DE; color: #3E2723;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #E8698A 0%, #D44E72 100%); padding: 36px 24px; text-align: center; color: #FFFFFF;">
            <div style="font-size: 32px; margin-bottom: 8px;">🌸</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">THE FLORA BAKERY</h1>
            <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Artisanal Patisserie & Fresh Edible Blooms &bull; Nashik</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 32px 24px; background: #FFFFFF;">
            
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #D1FAE5; color: #065F46; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 999px; margin-bottom: 12px;">
                ✓ ORDER RECEIVED SUCCESSFULLY
              </div>
              <h2 style="margin: 0; font-size: 20px; color: #3E2723;">Thank You, ${order.customerName}!</h2>
              <p style="margin: 6px 0 0; font-size: 14px; color: #795548;">
                Your celebration order <strong>#${order.id}</strong> has been received by our head baker.
              </p>
            </div>

            <!-- Order Summary Card -->
            <div style="background: #FDF2F4; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #FCE8EE;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                ${itemsList}
              </table>

              <div style="margin-top: 16px; padding-top: 12px; border-top: 2px dashed #E8698A;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #795548;">
                  <span>Subtotal:</span>
                  <span>₹${(order.subtotal || order.total).toLocaleString('en-IN')}</span>
                </div>
                ${order.discount ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #E8698A; font-weight: 600;">
                    <span>Promo Discount:</span>
                    <span>-₹${order.discount.toLocaleString('en-IN')}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #795548;">
                  <span>Delivery in Nashik:</span>
                  <span>${order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE (Chilled Transit)'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 18px; font-weight: 800; color: #3E2723;">
                  <span>Grand Total:</span>
                  <span style="color: #D44E72;">₹${(order.total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style="font-size: 12px; color: #795548; margin-top: 4px; text-align: right;">
                  Payment Method: <strong>${order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}</strong>
                </div>
              </div>
            </div>

            <!-- Delivery & Fulfillment Details -->
            <div style="background: #FAF6F0; border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
              <h4 style="margin: 0 0 10px; font-size: 14px; color: #3E2723; text-transform: uppercase; letter-spacing: 0.5px;">📍 Delivery Information</h4>
              <p style="margin: 0;"><strong>Recipient:</strong> ${order.customerName} (${order.phone})</p>
              <p style="margin: 0;"><strong>Delivery Address:</strong> ${order.address}${order.locality ? `, ${order.locality}` : ''}, Nashik</p>
              <p style="margin: 0;"><strong>Scheduled Date:</strong> ${order.deliveryDate || 'Standard Delivery'}</p>
              <p style="margin: 0;"><strong>Time Slot:</strong> ${order.timeSlot || 'Afternoon Slot'}</p>
              ${order.cakeMessage ? `<p style="margin: 6px 0 0; color: #D44E72;"><strong>Cake Writing:</strong> "${order.cakeMessage}"</p>` : ''}
            </div>

            <!-- Freshness & Care Note -->
            <div style="border-left: 3px solid #F7D070; background: #FEF7E6; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 12px; color: #795548; margin-bottom: 24px;">
              <strong>🌸 Storage & Care:</strong> All our bakes are handcrafted with pure butter and edible organic pesticide-free blooms. Please refrigerate at 4°C–8°C until ready to serve.
            </div>

            <!-- Support & WhatsApp Followup -->
            <div style="text-align: center; border-top: 1px solid #EFE8DE; padding-top: 20px;">
              <p style="font-size: 13px; color: #795548; margin-bottom: 12px;">Need changes or have questions about your order?</p>
              <a href="https://wa.me/917083517862?text=Hello%20The%20Flora%20Bakery!%20I%20have%20an%20inquiry%20regarding%20my%20order%20${order.id}." style="display: inline-block; background: #25D366; color: #FFFFFF; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 999px; font-size: 14px;">
                💬 Chat with Baker on WhatsApp
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #3E2723; padding: 20px 24px; text-align: center; color: #EFE8DE; font-size: 12px;">
            <p style="margin: 0 0 6px;">The Flora Bakery Studio &bull; Ibadat Villa, Sai Nath Nagar, Nashik, Maharashtra 422006</p>
            <p style="margin: 0; color: #A1887F;">Phone: 070835 17862 &bull; 100% Pure Vegetarian / Eggless Patisserie</p>
          </div>

        </div>
      `;
    },

    // =========================================================================
    // 6. CUSTOMERS DIRECTORY & CRM (Shopify-Grade)
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
            email: o.email || 'N/A',
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
        if (o.email && o.email !== 'patron@example.com') cust.email = o.email;
      });

      inqs.forEach(i => {
        const phone = (i.phone || '').trim();
        const key = phone || i.customerName;
        if (!map.has(key)) {
          map.set(key, {
            name: i.customerName,
            phone: i.phone,
            email: i.email || 'Lead',
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
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.tag.toLowerCase().includes(q)
        );
      }

      return customerList.sort((a, b) => b.totalSpent - a.totalSpent);
    },

    // =========================================================================
    // 7. DISCOUNTS & PROMOTIONS
    // =========================================================================
    getDiscounts() {
      return Storage.get(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
    },

    saveDiscount(discountData) {
      const discounts = this.getDiscounts();
      const code = (discountData.code || "").toUpperCase().trim();
      if (!code) return null;

      const idx = discounts.findIndex(d => d.code === code);
      const discount = {
        code,
        type: discountData.type || 'percent',
        value: Number(discountData.value) || 10,
        minOrder: Number(discountData.minOrder) || 0,
        description: discountData.description || `${discountData.value}% discount`,
        active: discountData.active !== undefined ? discountData.active : true,
        usageCount: discountData.usageCount || 0
      };

      if (idx !== -1) {
        discounts[idx] = discount;
      } else {
        discounts.push(discount);
      }

      Storage.set(STORAGE_KEYS.DISCOUNTS, discounts);
      this.broadcastChange(STORAGE_KEYS.DISCOUNTS, { action: 'save-discount', discount });
      return discount;
    },

    deleteDiscount(code) {
      let discounts = this.getDiscounts();
      discounts = discounts.filter(d => d.code !== code.toUpperCase());
      Storage.set(STORAGE_KEYS.DISCOUNTS, discounts);
      this.broadcastChange(STORAGE_KEYS.DISCOUNTS, { action: 'delete-discount', code });
      return true;
    },

    applyDiscount(code, subtotal) {
      if (!code) return { valid: false, message: "Please enter a coupon code." };
      const discounts = this.getDiscounts();
      const d = discounts.find(item => item.code.toUpperCase() === code.toUpperCase().trim() && item.active);

      if (!d) {
        return { valid: false, message: "Invalid or expired promo code." };
      }

      if (subtotal < (d.minOrder || 0)) {
        return { valid: false, message: `Minimum order of ₹${d.minOrder} required for code "${d.code}".` };
      }

      let discountAmount = 0;
      if (d.type === 'percent') {
        discountAmount = Math.round((subtotal * d.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, d.value);
      }

      return {
        valid: true,
        code: d.code,
        discountAmount,
        type: d.type,
        value: d.value,
        message: `✨ "${d.code}" applied! You saved ₹${discountAmount}.`
      };
    },

    // =========================================================================
    // 8. CUSTOM CAKE INQUIRIES
    // =========================================================================
    getInquiries(filter = {}) {
      let inqs = Storage.get(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      if (filter.status && filter.status !== 'all') {
        inqs = inqs.filter(i => i.status === filter.status);
      }
      return inqs;
    },

    addInquiry(inquiryData) {
      const inqs = this.getInquiries();
      const newId = `INQ-${inqs.length > 0 ? 500 + inqs.length + 1 : 501}`;
      const newInquiry = {
        id: newId,
        customerName: inquiryData.customerName || "Customer",
        phone: inquiryData.phone || "070835 17862",
        email: inquiryData.email || "",
        occasion: inquiryData.occasion || "Celebration",
        size: inquiryData.size || "1.0 kg",
        flavor: inquiryData.flavor || "Rose Lychee Chiffon",
        palette: inquiryData.palette || "Blush Pink",
        message: inquiryData.message || "",
        requiredDate: inquiryData.requiredDate || "Upcoming",
        notes: inquiryData.notes || "",
        status: "new",
        date: new Date().toLocaleDateString('en-IN'),
        createdAt: new Date().toISOString()
      };

      inqs.unshift(newInquiry);
      Storage.set(STORAGE_KEYS.INQUIRIES, inqs);

      // Add Notification
      this.addNotification({
        type: 'inquiry',
        title: '💌 New Custom Cake Lead!',
        message: `${newInquiry.customerName} requested a consultation for ${newInquiry.occasion} (${newInquiry.size})`,
        orderId: newId
      });

      this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'new-inquiry', inquiry: newInquiry });
      return newInquiry;
    },

    updateInquiryStatus(id, newStatus) {
      const inqs = this.getInquiries();
      const inq = inqs.find(i => i.id === id);
      if (inq) {
        inq.status = newStatus;
        Storage.set(STORAGE_KEYS.INQUIRIES, inqs);
        this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'inquiry-status-update', id, status: newStatus });
        return true;
      }
      return false;
    },

    // =========================================================================
    // 9. STORE SETTINGS
    // =========================================================================
    getSettings() {
      return Storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    saveSettings(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      Storage.set(STORAGE_KEYS.SETTINGS, updated);
      this.broadcastChange(STORAGE_KEYS.SETTINGS, { action: 'save-settings', settings: updated });
      return updated;
    },

    // =========================================================================
    // 10. ANALYTICS & SHOPIFY-STYLE REPORTS
    // =========================================================================
    getAnalytics() {
      const orders = this.getOrders();
      const products = this.getProducts();

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const lowStockCount = products.filter(p => p.stock <= 5).length;
      const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'baking' || o.status === 'shipped').length;

      // Top Selling Products Calculation
      const productSalesMap = {};
      orders.forEach(o => {
        if (Array.isArray(o.items)) {
          o.items.forEach(item => {
            if (!productSalesMap[item.name]) {
              productSalesMap[item.name] = { name: item.name, units: 0, revenue: 0 };
            }
            productSalesMap[item.name].units += (item.qty || 1);
            productSalesMap[item.name].revenue += ((item.price || 0) * (item.qty || 1));
          });
        }
      });

      const topSelling = Object.values(productSalesMap).sort((a, b) => b.units - a.units).slice(0, 5);

      return {
        totalRevenue,
        totalOrders,
        aov,
        lowStockCount,
        activeOrdersCount,
        topSelling,
        totalProducts: products.length,
        recentOrders: orders.slice(0, 5)
      };
    },

    // CSV Exports
    exportProductsCSV() {
      const products = this.getProducts();
      const headers = "ID,Name,Category,Price,ComparePrice,Stock,Unit,Rating,Eggless,SKU,Status\n";
      const rows = products.map(p => 
        `"${p.id}","${p.name}","${p.category}","${p.price}","${p.comparePrice || ''}","${p.stock}","${p.unit}","${p.rating}","${p.eggless ? 'Veg' : 'Egg'}","${p.sku || ''}","${p.status}"`
      ).join("\n");
      return headers + rows;
    },

    exportOrdersCSV() {
      const orders = this.getOrders();
      const headers = "OrderID,CustomerName,Phone,Email,DeliveryDate,TimeSlot,Address,Subtotal,DeliveryFee,Discount,Total,PaymentMethod,PaymentStatus,Status,Date\n";
      const rows = orders.map(o => 
        `"${o.id}","${o.customerName}","${o.phone}","${o.email || ''}","${o.deliveryDate || ''}","${o.timeSlot || ''}","${(o.address || '').replace(/"/g, '""')}","${o.subtotal}","${o.deliveryFee || 0}","${o.discount}","${o.total}","${o.paymentMethod || 'COD'}","${o.paymentStatus}","${o.status}","${o.date}"`
      ).join("\n");
      return headers + rows;
    },

    // JSON Backup and Restore
    exportJSON() {
      const data = {
        version: "2.0",
        exportedAt: new Date().toISOString(),
        categories: this.getCategories(),
        products: this.getProducts(),
        orders: this.getOrders(),
        notifications: this.getNotifications(),
        emailLogs: this.getEmailLogs(),
        discounts: this.getDiscounts(),
        inquiries: this.getInquiries(),
        settings: this.getSettings()
      };
      return JSON.stringify(data, null, 2);
    },

    importJSON(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        if (data.categories) Storage.set(STORAGE_KEYS.CATEGORIES, data.categories);
        if (data.products) Storage.set(STORAGE_KEYS.PRODUCTS, data.products);
        if (data.orders) Storage.set(STORAGE_KEYS.ORDERS, data.orders);
        if (data.notifications) Storage.set(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
        if (data.emailLogs) Storage.set(STORAGE_KEYS.EMAIL_LOGS, data.emailLogs);
        if (data.discounts) Storage.set(STORAGE_KEYS.DISCOUNTS, data.discounts);
        if (data.inquiries) Storage.set(STORAGE_KEYS.INQUIRIES, data.inquiries);
        if (data.settings) Storage.set(STORAGE_KEYS.SETTINGS, data.settings);

        this.broadcastChange('all', { action: 'import-backup' });
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    resetToDefaults() {
      Storage.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      Storage.set(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      Storage.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
      Storage.set(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
      Storage.set(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
      Storage.set(STORAGE_KEYS.INQUIRIES, DEFAULT_INQUIRIES);
      Storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      this.broadcastChange('all', { action: 'reset-defaults' });
    }
  };

  // Expose global FloraDB
  window.FloraDB = FloraDB;

})(window);
