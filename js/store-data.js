/**
 * THE FLORA BAKERY - UNIFIED DATA ENGINE (FloraDB)
 * High-performance, reactive state manager connecting Public Storefront, PDP, Checkout, & Admin Studio.
 * Features: Automatic localStorage persistence, cross-tab real-time sync via BroadcastChannel & Storage Event,
 * Cloud Sync mesh, Cart Persistence with Variants, Notifications & Email Receipts.
 */

(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'flora_products_v3',
    CATEGORIES: 'flora_categories_v3',
    ORDERS: 'flora_orders_v3',
    CART: 'flora_cart_v3',
    NOTIFICATIONS: 'flora_notifications_v3',
    EMAIL_LOGS: 'flora_email_logs_v3',
    DISCOUNTS: 'flora_discounts_v3',
    INQUIRIES: 'flora_inquiries_v3',
    SETTINGS: 'flora_settings_v3',
    AUTH: 'flora_admin_auth_v3',
    CLOUD_SYNC_TIMESTAMP: 'flora_cloud_sync_ts'
  };

  // BroadcastChannel for instantaneous zero-latency cross-tab communication
  let broadcastChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('flora_sync_channel');
      broadcastChannel.onmessage = function(event) {
        if (event.data && event.data.type === 'flora:data-sync') {
          const customEvt = new CustomEvent('flora:data-changed', {
            detail: event.data.detail || {}
          });
          window.dispatchEvent(customEvt);
        }
      };
    }
  } catch (err) {
    console.warn('BroadcastChannel not supported or restricted:', err);
  }

  // Cross-tab storage event listener
  window.addEventListener('storage', function(e) {
    if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
      const customEvt = new CustomEvent('flora:data-changed', {
        detail: { key: e.key, fromStorageEvent: true, timestamp: Date.now() }
      });
      window.dispatchEvent(customEvt);
    }
  });

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

  // Initial Seed Products (Enriched with Variants, Gallery, Specs, FAQs, & Reviews)
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
      gallery: [
        "images/cat-cakes.jpg",
        "images/hero-cake.jpg",
        "images/combo-banner.jpg"
      ],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Preview video placeholder
      description: "Light-as-air vanilla chiffon sponge layered with French rosewater mascarpone cream, fresh hand-cut lychee compote, and crowned with edible organic pink garden roses and 24K pure gold leaf.",
      variants: [
        { id: "0.5kg", name: "0.5 kg (Serves 4–6)", price: 1299, comparePrice: 1499, isDefault: true },
        { id: "1.0kg", name: "1.0 kg (Serves 8–10)", price: 2399, comparePrice: 2699 },
        { id: "1.5kg", name: "1.5 kg (Serves 12–15)", price: 3499, comparePrice: 3899 },
        { id: "2.0kg", name: "2.0 kg (Serves 18–20)", price: 4499, comparePrice: 4999 }
      ],
      botanicals: [
        "Organic Damascus Rose Petals",
        "Madagascar Bourbon Vanilla",
        "French Mascarpone Cream",
        "Fresh Himalayan Lychee Compote",
        "24K Edible Gold Leaf"
      ],
      specifications: {
        "Flavour Profile": "Subtle floral rose, creamy vanilla and luscious lychee fruit",
        "Dietary Info": "100% Pure Vegetarian / Eggless Certified",
        "Shelf Life": "48 Hours (Keep chilled at 4°C - 6°C)",
        "Delivery City": "Exclusively Handcrafted & Delivered in Nashik",
        "Notice Period": "Same-day delivery available if ordered before 3:00 PM"
      },
      faqs: [
        { q: "Are the flowers on the cake completely edible?", a: "Yes! Every blossom is organically cultivated in certified botanical nurseries free from synthetic pesticides." },
        { q: "Can I add a custom name message on the cake?", a: "Yes! Enter your personalized inscription in the box above or during checkout, and our chef will pipe it onto a complimentary chocolate plaque." },
        { q: "How is the cake delivered across Nashik?", a: "We utilize temperature-controlled specialized carriers driven by dedicated delivery specialists to ensure pristine arrival." }
      ],
      reviewsList: [
        { name: "Pooja Deshmukh", rating: 5, date: "2 days ago", comment: "Ordered for my sister's birthday in College Road. The rose and lychee balance was ethereal! Hands down best floral cake in Nashik.", verified: true },
        { name: "Aditya Patil", rating: 5, date: "1 week ago", comment: "The Lambeth piping and fresh blooms looked even better in person than the photos. Everyone was mesmerized.", verified: true },
        { name: "Sneha Kulkarni", rating: 5, date: "2 weeks ago", comment: "100% eggless and extraordinarily soft! The packaging was luxurious with ribbon and a golden cake base.", verified: true }
      ],
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
      gallery: [
        "images/cat-pastries.jpg",
        "images/cat-muffins.jpg",
        "images/hero-cake.jpg"
      ],
      description: "Crisp French craquelin choux buns filled with culinary French lavender diplomat cream, fresh wild blackberry coulis, and crystallized violet petals.",
      variants: [
        { id: "box2", name: "Box of 2 pieces", price: 449, comparePrice: 499, isDefault: true },
        { id: "box4", name: "Box of 4 pieces (Save 10%)", price: 849, comparePrice: 998 },
        { id: "box6", name: "Box of 6 pieces (Save 15%)", price: 1199, comparePrice: 1497 }
      ],
      botanicals: [
        "Culinary Provence Lavender",
        "Wild Forest Blackberry Coulis",
        "French Craquelin Choux Shell",
        "Crystallized Violet Petals"
      ],
      specifications: {
        "Flavour Profile": "Crisp pastry shell with calming lavender floral notes and tart berry compote",
        "Dietary Info": "100% Pure Vegetarian / Eggless Certified",
        "Shelf Life": "24 Hours (Best enjoyed fresh on day of delivery)",
        "Delivery City": "Fresh Daily Batches in Nashik"
      },
      faqs: [
        { q: "Is the lavender flavor overwhelming?", a: "Not at all! We infuse culinary lavender lightly for a gentle, aromatic and refreshing dessert experience." }
      ],
      reviewsList: [
        { name: "Meera Sharma", rating: 5, date: "3 days ago", comment: "The craquelin crunch with the lavender cream is pure Parisian perfection in Nashik!", verified: true }
      ],
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
      gallery: [
        "images/cat-muffins.jpg",
        "images/cat-pastries.jpg",
        "images/combo-banner.jpg"
      ],
      description: "Moist bakery muffins infused with organic Egyptian chamomile tea, wild Mahabaleshwar forest honey, and finished with delicate marigold blossoms.",
      variants: [
        { id: "box4", name: "Box of 4 pieces", price: 399, comparePrice: 450, isDefault: true },
        { id: "box6", name: "Box of 6 pieces (Save 10%)", price: 569, comparePrice: 650 },
        { id: "box12", name: "Party Box of 12 (Save 18%)", price: 1099, comparePrice: 1350 }
      ],
      botanicals: [
        "Egyptian Chamomile Blossoms",
        "Raw Mahabaleshwar Honey",
        "Organic Marigold Petals",
        "Golden Wheat Flour & Cultured Butter"
      ],
      specifications: {
        "Flavour Profile": "Warm honey sweetness with soothing chamomile undertones",
        "Dietary Info": "100% Pure Vegetarian / Eggless Certified",
        "Shelf Life": "72 Hours at room temperature (Airtight container)"
      },
      faqs: [
        { q: "Can these muffins be stored at room temperature?", a: "Yes, they stay moist and fresh for up to 3 days in a cool, dry place." }
      ],
      reviewsList: [
        { name: "Rohit Jadhav", rating: 5, date: "4 days ago", comment: "My morning tea companion! Tender, aromatic, and not overly sweet.", verified: true }
      ],
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
      gallery: [
        "images/hero-cake.jpg",
        "images/cat-cakes.jpg",
        "images/combo-banner.jpg"
      ],
      description: "Intricate Victorian Lambeth piped buttercream cake with Iranian pistachio sponge, Damascus rose curd, and fresh spray garden roses.",
      variants: [
        { id: "0.5kg", name: "0.5 kg (Serves 4–6)", price: 999, comparePrice: 1199 },
        { id: "1.0kg", name: "1.0 kg (Serves 8–10)", price: 1699, comparePrice: 1899, isDefault: true },
        { id: "1.5kg", name: "1.5 kg (Serves 12–15)", price: 2499, comparePrice: 2799 },
        { id: "2.0kg", name: "2.0 kg (Serves 18–20)", price: 3299, comparePrice: 3699 }
      ],
      botanicals: [
        "Roasted Iranian Pistachios",
        "Damascus Rose Essence",
        "Victorian Royal Buttercream",
        "Fresh Garden Spray Roses"
      ],
      specifications: {
        "Flavour Profile": "Nutty pistachio richness balanced by fragrant Persian rose cream",
        "Dietary Info": "100% Pure Vegetarian / Eggless Certified",
        "Shelf Life": "48 Hours Refrigerated"
      },
      faqs: [
        { q: "Is this suitable for a wedding or milestone anniversary?", a: "Yes, this is our most popular showstopper centerpiece cake for intimate celebrations." }
      ],
      reviewsList: [
        { name: "Ananya Joshi", rating: 5, date: "Yesterday", comment: "The detail on the Lambeth piping is artwork. Everyone at the party couldn't stop taking pictures!", verified: true }
      ],
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
      gallery: ["images/cat-pastries.jpg", "images/cat-cakes.jpg"],
      description: "Buttery almond tart shell filled with Madagascar vanilla bean cream, fresh strawberries, blueberries, and candied edible pansies.",
      variants: [
        { id: "box2", name: "Box of 2 pieces", price: 549, comparePrice: 599, isDefault: true },
        { id: "box4", name: "Box of 4 pieces (Save 10%)", price: 999, comparePrice: 1198 }
      ],
      botanicals: ["Fresh Edible Pansy Petals", "Madagascar Vanilla Bean", "Almond Sablee Crust"],
      specifications: { "Dietary Info": "100% Eggless", "Shelf Life": "24 Hours Refrigerated" },
      faqs: [],
      reviewsList: [],
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
      gallery: ["images/cat-muffins.jpg", "images/combo-banner.jpg"],
      description: "Zesty Meyer lemon curd infused muffins crowned with elderflower whipped frosting and delicate lemon blossom sugar pearls.",
      variants: [
        { id: "box4", name: "Box of 4 pieces", price: 429, comparePrice: 480, isDefault: true },
        { id: "box6", name: "Box of 6 pieces", price: 619, comparePrice: 720 }
      ],
      botanicals: ["Elderflower Extract", "Meyer Lemon Zest", "Lemon Blossom Pearls"],
      specifications: { "Dietary Info": "100% Eggless", "Shelf Life": "72 Hours" },
      faqs: [],
      reviewsList: [],
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
      gallery: ["images/combo-banner.jpg", "images/hero-cake.jpg", "images/cat-cakes.jpg"],
      description: "A luxury presentation hamper containing our 0.5kg signature floral cake in a window keepsake box paired with a hand-tied bouquet of fresh garden roses and baby's breath.",
      variants: [
        { id: "standard", name: "Standard Hamper (0.5kg Cake + 10 Rose Bouquet)", price: 2499, comparePrice: 2899, isDefault: true },
        { id: "grand", name: "Grand Hamper (1.0kg Cake + 20 Rose Luxury Bouquet)", price: 3799, comparePrice: 4299 }
      ],
      botanicals: ["Hand-Tied Pink Roses", "Fresh Baby's Breath", "Gourmet Ribbon & Gold Box"],
      specifications: { "Dietary Info": "100% Eggless Cake Included", "Shelf Life": "Cake: 48 Hrs | Flowers: 4-5 Days in Water" },
      faqs: [
        { q: "Can I include a handwritten personalized message card in the hamper?", a: "Yes, every hamper includes our embossed botanical greeting card with your message handwritten in calligraphy." }
      ],
      reviewsList: [
        { name: "Dr. Vikram Ranade", rating: 5, date: "5 days ago", comment: "Sent this to my wife for our anniversary. The presentation was breathtaking and she loved both the flowers and the cake!", verified: true }
      ],
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
      gallery: ["images/hero-cake.jpg", "images/cat-cakes.jpg"],
      description: "Grand two-tier statement cake draped in pastel pink watercolor buttercream with cascading fresh garden roses, yellow buttercups, and real gold foil.",
      variants: [
        { id: "1.5kg", name: "1.5 kg Two-Tier (Serves 12–16)", price: 2899, comparePrice: 3200, isDefault: true },
        { id: "2.5kg", name: "2.5 kg Grand Two-Tier (Serves 20–25)", price: 4599, comparePrice: 5100 }
      ],
      botanicals: ["Yellow Buttercups", "Pink Spray Roses", "Gold Leaf Accents"],
      specifications: { "Dietary Info": "100% Eggless", "Shelf Life": "48 Hours" },
      faqs: [],
      reviewsList: [],
      status: "active",
      createdAt: "2026-08-03"
    }
  ];

  const DEFAULT_ORDERS = [];

  const DEFAULT_NOTIFICATIONS = [
    {
      id: "notif-init-1",
      type: "system",
      title: "🌸 Welcome to Flora Admin Studio",
      message: "Your e-commerce backend is live with real-time order synchronization.",
      time: "Just now",
      read: false
    }
  ];

  const DEFAULT_EMAIL_LOGS = [];

  const DEFAULT_DISCOUNTS = [
    { id: 1, code: "FLORA10", type: "percent", value: 10, minOrder: 499, description: "10% off on all floral bakes above ₹499", status: "active" },
    { id: 2, code: "BLOOM20", type: "percent", value: 20, minOrder: 1499, description: "20% off on luxury hampers and cakes above ₹1499", status: "active" },
    { id: 3, code: "NASHIKFREE", type: "shipping", value: 100, minOrder: 0, description: "Free doorstep delivery across Nashik", status: "active" }
  ];

  const DEFAULT_INQUIRIES = [];

  const DEFAULT_SETTINGS = {
    storeName: "The Flora Bakery",
    phone: "070835 17862",
    whatsapp: "917083517862",
    email: "thefloralbakery@gmail.com",
    address: "Sai Nath Nagar, Nashik, Maharashtra 422009",
    currency: "INR",
    currencySymbol: "₹",
    taxRate: 0,
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    openingHours: "Mon - Sun: 9:00 AM – 10:00 PM",
    enableCod: true,
    enableOnlinePayment: false,
    soundAlerts: true
  };

  // Safe Storage Helper
  const Storage = {
    get(key, defaultVal) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
      } catch(e) {
        console.error(`FloraDB Storage Error reading ${key}:`, e);
        return defaultVal;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch(e) {
        console.error(`FloraDB Storage Error writing ${key}:`, e);
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
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      Storage.set(STORAGE_KEYS.CART, []);
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
    STORAGE_KEYS,

    // Broadcast local & cross-tab changes
    broadcastChange(key, details = {}) {
      const payload = { key, timestamp: Date.now(), ...details };
      
      // Dispatch in current tab
      const event = new CustomEvent('flora:data-changed', { detail: payload });
      window.dispatchEvent(event);

      // Broadcast across all other open browser tabs
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ type: 'flora:data-sync', detail: payload });
        } catch (e) {}
      }

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
      const products = Storage.get(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      let savedProduct;

      if (productData.id) {
        const idx = products.findIndex(p => p.id === Number(productData.id));
        if (idx !== -1) {
          products[idx] = {
            ...products[idx],
            ...productData,
            id: Number(productData.id),
            price: Number(productData.price) || 0,
            comparePrice: Number(productData.comparePrice) || 0,
            stock: Number(productData.stock) || 0,
            updatedAt: new Date().toISOString()
          };
          savedProduct = products[idx];
        }
      }

      if (!savedProduct) {
        const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        savedProduct = {
          id: nextId,
          name: productData.name || "New Floral Bake",
          category: productData.category || "cakes",
          categoryLabel: productData.categoryLabel || this.getCategoryLabel(productData.category),
          price: Number(productData.price) || 999,
          comparePrice: Number(productData.comparePrice) || 1199,
          stock: Number(productData.stock) || 10,
          unit: productData.unit || "0.5 kg (Serves 4-6)",
          rating: Number(productData.rating) || 5.0,
          reviews: Number(productData.reviews) || 1,
          badge: productData.badge || "New",
          eggless: productData.eggless !== false,
          sku: productData.sku || `FB-PROD-${nextId}`,
          image: productData.image || "images/cat-cakes.jpg",
          gallery: productData.gallery || [productData.image || "images/cat-cakes.jpg"],
          description: productData.description || "Artisanal floral creation freshly crafted with organic blooms.",
          variants: productData.variants || [],
          botanicals: productData.botanicals || [],
          specifications: productData.specifications || {},
          faqs: productData.faqs || [],
          reviewsList: productData.reviewsList || [],
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
        
        if (p.stock <= 3 && delta < 0) {
          this.addNotification({
            type: 'low_stock',
            title: '⚠️ Low Stock Alert',
            message: `Only ${p.stock} units remaining for "${p.name}".`,
            productId: p.id
          });
        }
        return p.stock;
      }
      return null;
    },

    getCategoryLabel(categorySlug) {
      const cat = this.getCategoryById(categorySlug);
      if (cat) return cat.categoryLabel || cat.name;
      return "Artisanal Specialty";
    },

    // =========================================================================
    // 3. PERSISTENT CART ENGINE WITH VARIANTS & UPSELLS
    // =========================================================================
    getCart() {
      return Storage.get(STORAGE_KEYS.CART, []);
    },

    saveCart(cartItems) {
      Storage.set(STORAGE_KEYS.CART, cartItems);
      this.broadcastChange(STORAGE_KEYS.CART, { action: 'cart-updated', cart: cartItems });
    },

    addToCart(productOrId, variant = null, qty = 1, cakeMessage = '') {
      let product = typeof productOrId === 'object' ? productOrId : this.getProductById(productOrId);
      if (!product) return null;

      let cart = this.getCart();
      const variantName = variant ? variant.name : (product.variants && product.variants.length > 0 ? product.variants[0].name : product.unit);
      const unitPrice = variant ? Number(variant.price) : Number(product.price);
      const comparePrice = variant ? Number(variant.comparePrice || variant.price * 1.15) : Number(product.comparePrice || product.price);
      const cartKey = `${product.id}_${variant ? variant.id || variant.name : 'default'}`;

      const existingIndex = cart.findIndex(item => item.cartKey === cartKey);

      if (existingIndex > -1) {
        cart[existingIndex].qty += qty;
        if (cakeMessage) cart[existingIndex].cakeMessage = cakeMessage;
      } else {
        cart.push({
          cartKey: cartKey,
          id: product.id,
          name: product.name,
          category: product.category,
          categoryLabel: product.categoryLabel,
          price: unitPrice,
          comparePrice: comparePrice,
          variantName: variantName,
          cakeMessage: cakeMessage,
          image: product.image,
          eggless: product.eggless,
          qty: qty
        });
      }

      this.saveCart(cart);
      return cart;
    },

    updateCartQty(cartKeyOrId, qty) {
      let cart = this.getCart();
      const index = cart.findIndex(i => i.cartKey === cartKeyOrId || i.id === Number(cartKeyOrId));
      if (index > -1) {
        if (qty <= 0) {
          cart.splice(index, 1);
        } else {
          cart[index].qty = qty;
        }
        this.saveCart(cart);
      }
      return cart;
    },

    updateCartItemQty(cartKeyOrId, qty) {
      return this.updateCartQty(cartKeyOrId, qty);
    },

    removeFromCart(cartKeyOrId) {
      let cart = this.getCart();
      cart = cart.filter(i => i.cartKey !== cartKeyOrId && i.id !== Number(cartKeyOrId));
      this.saveCart(cart);
      return cart;
    },

    clearCart() {
      this.saveCart([]);
    },

    getCartSummary() {
      const cart = this.getCart();
      const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const totalOriginal = cart.reduce((sum, item) => sum + ((item.comparePrice || item.price) * item.qty), 0);
      const savings = Math.max(0, totalOriginal - subtotal);
      const settings = this.getSettings();
      const freeThreshold = settings.freeShippingThreshold || 999;
      const isFreeShipping = subtotal >= freeThreshold;
      const deliveryFee = subtotal === 0 ? 0 : (isFreeShipping ? 0 : (settings.standardShippingFee || 99));
      const amountNeededForFreeShipping = Math.max(0, freeThreshold - subtotal);

      return {
        items: cart,
        totalCount,
        subtotal,
        savings,
        freeThreshold,
        isFreeShipping,
        deliveryFee,
        amountNeededForFreeShipping,
        progressPercent: Math.min(100, Math.round((subtotal / freeThreshold) * 100))
      };
    },

    getCartTotals() {
      return this.getCartSummary();
    },

    // Intelligent Upsell Recommendations Engine
    getUpsellProducts(cartItems = null) {
      const currentCart = cartItems || this.getCart();
      const cartProductIds = currentCart.map(i => i.id);
      const allProducts = this.getProducts().filter(p => p.status === 'active' && p.stock > 0);

      // Filter out products already in cart, prioritize pastries, muffins, and gifting combos
      let upsells = allProducts.filter(p => !cartProductIds.includes(p.id));
      
      // Sort by popular add-ons (muffins, pastries first, then combos)
      upsells.sort((a, b) => {
        const priorityOrder = { 'pastries': 1, 'muffins': 2, 'combos': 3, 'cakes': 4 };
        return (priorityOrder[a.category] || 99) - (priorityOrder[b.category] || 99);
      });

      return upsells.slice(0, 4);
    },

    // =========================================================================
    // 4. ORDERS & DIRECT E-COMMERCE CHECKOUT
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
      const newOrderNum = 1000 + orders.length + 1;
      const orderId = `FB-${newOrderNum}`;

      const newOrder = {
        id: orderId,
        customerName: orderData.customerName || "Patron",
        phone: orderData.phone || "070835 17862",
        email: orderData.email || "patron@example.com",
        address: orderData.address || "Sai Nath Nagar, Nashik",
        locality: orderData.locality || "Nashik City",
        landmark: orderData.landmark || "",
        deliveryDate: orderData.deliveryDate || new Date().toLocaleDateString('en-IN'),
        timeSlot: orderData.timeSlot || "Afternoon (1:00 PM – 5:00 PM)",
        cakeMessage: orderData.cakeMessage || "",
        notes: orderData.notes || "",
        items: orderData.items || [],
        subtotal: Number(orderData.subtotal) || 0,
        deliveryFee: Number(orderData.deliveryFee) || 0,
        discount: Number(orderData.discount) || 0,
        discountCode: orderData.discountCode || "",
        total: Number(orderData.total) || 0,
        paymentMethod: orderData.paymentMethod || "COD",
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

      // 4. Clear Cart on successful order
      this.clearCart();

      // 5. Broadcast real-time event to storefront & admin panel
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

        this.broadcastChange(STORAGE_KEYS.ORDERS, { action: 'order-status-updated', orderId, newStatus });
        return order;
      }
      return null;
    },

    // Generates pre-filled WhatsApp Dispatch message
    getWhatsAppOrderUpdateUrl(order, stage = 'baking') {
      const cleanPhone = (order.phone || "7083517862").replace(/[^0-9]/g, '');
      const phoneNum = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone.replace(/^0/, '')}`;
      
      let message = '';
      if (stage === 'baking') {
        message = `🌸 *The Flora Bakery, Nashik*\n\nHello ${order.customerName}! ✨\nGreat news! Your artisanal order *#${order.id}* has entered our bakery kitchen. Our chef is handcrafting your floral bakes with fresh organic petals.\n\n📅 *Delivery Date:* ${order.deliveryDate}\n⏰ *Time Slot:* ${order.timeSlot}\n📍 *Destination:* ${order.address}\n\nWe will update you as soon as it leaves for delivery! 🛵`;
      } else if (stage === 'shipped') {
        message = `🌸 *The Flora Bakery, Nashik*\n\nHello ${order.customerName}! 🛵\nYour fresh floral bakes for Order *#${order.id}* are carefully packed in temperature-controlled boxes and *Out for Delivery*!\n\n💵 *Total Due (COD):* ₹${order.total.toLocaleString('en-IN')}\n📍 *Destination:* ${order.address}\n\nOur delivery specialist will reach you shortly. Enjoy your blooming treat! ✨`;
      } else if (stage === 'delivered') {
        message = `🌸 *The Flora Bakery, Nashik*\n\nHello ${order.customerName}! 🎉\nYour order *#${order.id}* has been successfully delivered.\n\nWe hope our fresh floral creations brought joy to your celebration! We would love to hear your feedback. Have a delightful day! 🌸✨`;
      }

      return `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(message)}`;
    },

    // =========================================================================
    // 5. EMAIL RECEIPT SIMULATION LOGS
    // =========================================================================
    sendOrderConfirmationEmail(order) {
      const emailLogs = Storage.get(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
      const itemsHtml = (order.items || []).map(i => `• ${i.name} (${i.variantName || i.unit || 'Standard'}) x ${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}`).join('\n');

      const emailEntry = {
        id: `email-${Date.now()}`,
        recipient: order.email || "patron@example.com",
        subject: `🌸 Order Confirmation #${order.id} - The Flora Bakery`,
        date: new Date().toLocaleString('en-IN'),
        status: 'Sent (Simulated)',
        body: `Dear ${order.customerName},\n\nThank you for choosing The Flora Bakery! Your order #${order.id} has been confirmed.\n\nORDER SUMMARY:\n${itemsHtml}\n\nSubtotal: ₹${order.subtotal}\nDelivery Fee: ₹${order.deliveryFee}\nDiscount: -₹${order.discount}\nGrand Total: ₹${order.total} (${order.paymentMethod})\n\nDelivery Scheduled: ${order.deliveryDate} during ${order.timeSlot}\nDelivery Address: ${order.address}\n\nWarm regards,\nThe Flora Bakery Team, Nashik`
      };

      emailLogs.unshift(emailEntry);
      Storage.set(STORAGE_KEYS.EMAIL_LOGS, emailLogs);
      return emailEntry;
    },

    getEmailLogs() {
      return Storage.get(STORAGE_KEYS.EMAIL_LOGS, DEFAULT_EMAIL_LOGS);
    },

    // =========================================================================
    // 6. NOTIFICATIONS ENGINE
    // =========================================================================
    getNotifications() {
      return Storage.get(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    },

    addNotification(notifData) {
      const notifs = this.getNotifications();
      const newNotif = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: notifData.type || 'info',
        title: notifData.title || 'Notification',
        message: notifData.message || '',
        orderId: notifData.orderId || null,
        time: 'Just now',
        read: false,
        createdAt: new Date().toISOString()
      };
      notifs.unshift(newNotif);
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'new-notification', notification: newNotif });
      return newNotif;
    },

    markNotificationRead(id) {
      const notifs = this.getNotifications();
      const n = notifs.find(item => item.id === id);
      if (n) {
        n.read = true;
        Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
        this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'notif-read', id });
      }
    },

    markAllNotificationsRead() {
      const notifs = this.getNotifications().map(n => ({ ...n, read: true }));
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
      this.broadcastChange(STORAGE_KEYS.NOTIFICATIONS, { action: 'all-notifs-read' });
    },

    getUnreadNotificationsCount() {
      return this.getNotifications().filter(n => !n.read).length;
    },

    // =========================================================================
    // 6B. INQUIRIES & CONTACT MESSAGES
    // =========================================================================
    getMessages() {
      return Storage.get(STORAGE_KEYS.INQUIRIES, []);
    },

    getInquiries() {
      return this.getMessages();
    },

    addMessage(inquiryData) {
      const messages = this.getMessages();
      const newInquiry = {
        id: inquiryData.id || Date.now(),
        name: inquiryData.name || "Anonymous Patron",
        phone: inquiryData.phone || "",
        email: inquiryData.email || "",
        occasion: inquiryData.occasion || "",
        subject: inquiryData.subject || "Custom Cake Inquiry",
        message: inquiryData.message || "",
        createdAt: inquiryData.createdAt || new Date().toISOString(),
        status: "unread"
      };

      messages.unshift(newInquiry);
      Storage.set(STORAGE_KEYS.INQUIRIES, messages);

      // Add Notification for Admin Dashboard
      this.addNotification({
        type: 'inquiry',
        title: '💌 New Custom Bake Inquiry',
        message: `${newInquiry.name} (${newInquiry.phone}): ${newInquiry.subject}`,
        read: false
      });

      this.broadcastChange(STORAGE_KEYS.INQUIRIES, { action: 'new-inquiry', inquiry: newInquiry });
      return newInquiry;
    },

    addInquiry(inquiryData) {
      return this.addMessage(inquiryData);
    },

    // =========================================================================
    // 7. DISCOUNTS & PROMOTIONS
    // =========================================================================
    getDiscounts() {
      return Storage.get(STORAGE_KEYS.DISCOUNTS, DEFAULT_DISCOUNTS);
    },

    applyDiscountCode(code, subtotal) {
      if (!code) return { valid: false, message: "Please enter a promo code." };
      const discounts = this.getDiscounts();
      const cleanCode = code.toUpperCase().trim();
      const discount = discounts.find(d => d.code === cleanCode && d.status === 'active');

      if (!discount) {
        return { valid: false, message: "Invalid or expired promo code." };
      }

      if (subtotal < (discount.minOrder || 0)) {
        return { valid: false, message: `Minimum order of ₹${discount.minOrder} required for code ${discount.code}.` };
      }

      let discountAmount = 0;
      if (discount.type === 'percent') {
        discountAmount = Math.round((subtotal * discount.value) / 100);
      } else if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else if (discount.type === 'shipping') {
        discountAmount = 99; // Waives standard delivery fee
      }

      return {
        valid: true,
        code: discount.code,
        discountAmount: Math.min(discountAmount, subtotal),
        discount: discount,
        message: `🌸 "${discount.code}" applied! You saved ₹${discountAmount}.`
      };
    },

    // =========================================================================
    // 8. SETTINGS & ANALYTICS
    // =========================================================================
    getSettings() {
      return Storage.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    updateSettings(newSettings) {
      const current = this.getSettings();
      const updated = { ...current, ...newSettings };
      Storage.set(STORAGE_KEYS.SETTINGS, updated);
      this.broadcastChange(STORAGE_KEYS.SETTINGS, { action: 'settings-updated', settings: updated });
      return updated;
    },

    getAnalytics() {
      const orders = this.getOrders();
      const products = this.getProducts();

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
      const lowStockCount = products.filter(p => p.stock <= 4).length;
      const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

      return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        lowStockCount,
        pendingOrdersCount
      };
    },

    // Reset store data to fresh clean slate
    resetOrdersData() {
      Storage.set(STORAGE_KEYS.ORDERS, []);
      Storage.set(STORAGE_KEYS.NOTIFICATIONS, [
        {
          id: `notif-reset-${Date.now()}`,
          type: "system",
          title: "🧹 Order History Cleared",
          message: "All orders have been reset. Database is clean and ready for fresh orders.",
          time: "Just now",
          read: false
        }
      ]);
      Storage.set(STORAGE_KEYS.EMAIL_LOGS, []);
      this.broadcastChange(STORAGE_KEYS.ORDERS, { action: 'orders-cleared' });
      return true;
    },

    // Cart count helper (used by site-layout.js)
    getCartCount() {
      return this.getCartSummary().totalCount;
    },

    // Alias for admin panel compatibility
    clearAllOrders() {
      return this.resetOrdersData();
    }
  };

  // Expose globally
  window.FloraDB = FloraDB;

})(typeof window !== 'undefined' ? window : this);
