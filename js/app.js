/**
 * THE FLORA BAKERY - E-COMMERCE & INTERACTIVE LOGIC
 * High-Converting CRO Features, Cart Drawer, Modals, Filter Tabs & WhatsApp Checkout
 */

// Product Catalog Data
const PRODUCTS = [
  {
    id: 1,
    name: "Blush Rose & Lychee Chiffon Cake",
    category: "cakes",
    categoryLabel: "Signature Cake",
    price: 1299,
    unit: "0.5 kg (Serves 4-6)",
    rating: 4.9,
    reviews: 142,
    badge: "Bestseller",
    eggless: true,
    image: "images/cat-cakes.jpg",
    description: "Light-as-air vanilla chiffon sponge layered with French rosewater mascarpone cream, fresh lychee compote, and crowned with edible organic pink roses and gold leaf."
  },
  {
    id: 2,
    name: "French Lavender Berry Choux Pastries",
    category: "pastries",
    categoryLabel: "Designer Pastry",
    price: 449,
    unit: "Box of 2 pieces",
    rating: 4.8,
    reviews: 98,
    badge: "Chef's Pick",
    eggless: true,
    image: "images/cat-pastries.jpg",
    description: "Crispy craquelin choux filled with infused Provence lavender crème diplomate and house-made wild blackberry coulis, finished with edible viola petals."
  },
  {
    id: 3,
    name: "Honey Chamomile Bloom Muffins",
    category: "muffins",
    categoryLabel: "Artisanal Muffin",
    price: 399,
    unit: "Box of 4 pieces",
    rating: 4.9,
    reviews: 86,
    badge: "Most Loved",
    eggless: true,
    image: "images/cat-muffins.jpg",
    description: "Golden honey sponge muffins topped with whipped chamomile buttercream piped into delicate blooming blossoms and dusted with organic yellow chamomile."
  },
  {
    id: 4,
    name: "Victorian Vintage Lambeth Heart Cake",
    category: "cakes",
    categoryLabel: "Custom Aesthetic Cake",
    price: 1599,
    unit: "1.0 kg (Serves 8-10)",
    rating: 5.0,
    reviews: 215,
    badge: "Trending",
    eggless: true,
    image: "images/hero-cake.jpg",
    description: "Aesthetic Lambeth piped vintage heart cake with delicate frills, blush pink and buttery yellow floral garlands, and customizable celebration message."
  },
  {
    id: 5,
    name: "Wildberry Mascarpone Blossom Tart",
    category: "pastries",
    categoryLabel: "French Tartlet",
    price: 549,
    unit: "Box of 2 pieces",
    rating: 4.9,
    reviews: 74,
    badge: "New Release",
    eggless: true,
    image: "images/cat-pastries.jpg",
    description: "Buttery almond tart shell filled with Madagascar vanilla bean cream, fresh strawberries, blueberries, and candied edible pansies."
  },
  {
    id: 6,
    name: "Meyer Lemon & Elderflower Muffins",
    category: "muffins",
    categoryLabel: "Artisanal Muffin",
    price: 429,
    unit: "Box of 4 pieces",
    rating: 4.8,
    reviews: 63,
    badge: "Seasonal",
    eggless: true,
    image: "images/cat-muffins.jpg",
    description: "Zesty Meyer lemon curd infused muffins crowned with elderflower whipped frosting and delicate lemon blossom sugar pearls."
  },
  {
    id: 7,
    name: "The Royal Flora + Cake Gifting Hamper",
    category: "combos",
    categoryLabel: "Luxury Gift Set",
    price: 2499,
    unit: "Cake + Fresh Flower Bouquet",
    rating: 5.0,
    reviews: 189,
    badge: "Luxury Gifting",
    eggless: true,
    image: "images/combo-banner.jpg",
    description: "A luxury presentation hamper containing our 0.5kg signature floral cake in a window keepsake box paired with a hand-tied bouquet of fresh garden roses and baby's breath."
  },
  {
    id: 8,
    name: "Two-Tier Botanical Anniversary Cake",
    category: "cakes",
    categoryLabel: "Celebration Tier",
    price: 2899,
    unit: "1.5 kg (Serves 12-16)",
    rating: 5.0,
    reviews: 112,
    badge: "Signature",
    eggless: true,
    image: "images/hero-cake.jpg",
    description: "Grand two-tier statement cake draped in pastel pink watercolor buttercream with cascading fresh garden roses, yellow buttercups, and real gold foil."
  }
];

// Shopping Cart State
let cart = [
  { id: 1, name: "Blush Rose & Lychee Chiffon Cake", price: 1299, qty: 1, image: "images/cat-cakes.jpg" }
];
let appliedDiscount = 0;
const FREE_SHIPPING_THRESHOLD = 999;

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts("all");
  updateCartUI();
  setupStickyHeader();
  setupAnnouncements();
  setupEventListeners();
});

// Render Products Grid
function renderProducts(filterCategory = "all") {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const filtered = filterCategory === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === filterCategory);

  grid.innerHTML = filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-thumb-holder">
        <img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">
        <span class="product-tag-badge">${product.badge}</span>
        ${product.eggless ? '<span class="product-tag-badge eggless-badge"><span class="eggless-dot"></span> 100% Eggless</span>' : ''}
        <button class="product-quickview-btn" onclick="openQuickView(${product.id})">
          <i class="fas fa-eye"></i> Quick View
        </button>
      </div>
      <div class="product-info">
        <span class="product-category-meta">${product.categoryLabel}</span>
        <h4 class="product-name">${product.name}</h4>
        <p class="product-flavor-note">${product.description}</p>
        <div class="product-rating">
          <span class="star"><i class="fas fa-star"></i></span>
          <span>${product.rating}</span>
          <span class="reviews-count">(${product.reviews} reviews)</span>
        </div>
        <div class="product-pricing-action">
          <div class="price-box">
            <span class="price-current">₹${product.price}</span>
            <span class="price-unit">${product.unit}</span>
          </div>
          <button class="add-to-cart-btn" onclick="addToCart(${product.id})" title="Add to cart" aria-label="Add ${product.name} to cart">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter Tab Switcher
function filterProducts(category, btnElement) {
  document.querySelectorAll(".filter-tab-btn").forEach(btn => btn.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  renderProducts(category);
}

// Add Item to Cart
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    });
  }

  updateCartUI();
  showToast(`🌸 "${product.name}" added to your cart!`);
  openCartDrawer();
}

// Update Cart Drawer UI
function updateCartUI() {
  const cartItemsContainer = document.getElementById("cartItemsBody");
  const cartBadge = document.getElementById("cartCountBadge");
  const subtotalEl = document.getElementById("cartSubtotal");
  const grandTotalEl = document.getElementById("cartGrandTotal");
  const progressFill = document.getElementById("freeShippingFill");
  const progressText = document.getElementById("freeShippingText");

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartBadge) cartBadge.textContent = totalItems;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discountAmount = subtotal * appliedDiscount;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Free shipping calculation
  if (progressFill && progressText) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressFill.style.width = "100%";
      progressFill.style.background = "#2E7D32";
      progressText.innerHTML = `🎉 You unlocked <strong>FREE Nashik Delivery</strong>!`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      progressFill.style.width = `${pct}%`;
      progressFill.style.background = "var(--rose-deep)";
      progressText.innerHTML = `Add <strong>₹${remaining}</strong> more for <strong>FREE Delivery</strong> in Nashik`;
    }
  }

  // Render items
  if (cartItemsContainer) {
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div style="text-align:center; padding: 40px 10px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px; color: var(--pink-blush);">🌸</div>
          <p style="font-weight:700; color: var(--text-cocoa); font-size:1.1rem; margin-bottom:6px;">Your cart is blooming empty</p>
          <p style="font-size:0.88rem; margin-bottom: 20px;">Treat yourself to handcrafted floral baked happiness.</p>
          <button class="btn btn-primary btn-sm" onclick="closeCartDrawer(); window.location.href='#bestsellers';">Explore Cakes</button>
        </div>
      `;
    } else {
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">₹${item.price}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
              <span style="font-weight:700; font-size:0.9rem; min-width:20px; text-align:center;">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
              <button style="margin-left:auto; background:none; color:#C62828; font-size:0.85rem; font-weight:600;" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash-alt"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

// Change Quantity
function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  updateCartUI();
}

// Remove from Cart
function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
  showToast("Item removed from cart");
}

// Drawer Controls
function openCartDrawer() {
  document.getElementById("cartDrawerOverlay")?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  document.getElementById("cartDrawerOverlay")?.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Apply Promo Code
function applyPromoCode() {
  const input = document.getElementById("cartPromoInput");
  const code = input ? input.value.trim().toUpperCase() : "";

  if (code === "FLORA10" || code === "BLOOM10") {
    appliedDiscount = 0.10;
    updateCartUI();
    showToast("✨ 10% VIP Discount Applied Successfully!");
  } else if (code === "") {
    showToast("Please enter a valid coupon code");
  } else {
    showToast("Invalid code. Try using 'FLORA10'");
  }
}

// WhatsApp Direct Checkout
function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast("Your cart is empty! Add some delicious floral bakes first.");
    return;
  }

  const phone = "917083517862"; // 070835 17862
  let message = `*🌸 NEW ORDER INQUIRY - THE FLORA BAKERY NASHIK* 🌸\n\n`;
  message += `Hello! I would like to place an order:\n\n`;

  let subtotal = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    message += `${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${itemTotal}\n`;
  });

  const discountAmount = subtotal * appliedDiscount;
  const grandTotal = subtotal - discountAmount;

  message += `\n*Subtotal:* ₹${subtotal}`;
  if (appliedDiscount > 0) {
    message += `\n*Discount (10%):* -₹${discountAmount}`;
  }
  message += `\n*Total Amount:* ₹${grandTotal}`;
  message += `\n*Delivery Location:* Nashik, Maharashtra`;
  message += `\n\nPlease confirm availability and payment details. Thank you! 🍰`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Custom Cake Builder Modal
function openCakeBuilderModal() {
  document.getElementById("cakeBuilderModal")?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCakeBuilderModal() {
  document.getElementById("cakeBuilderModal")?.classList.remove("active");
  document.body.style.overflow = "auto";
}

function submitCustomCakeInquiry(event) {
  event.preventDefault();
  const occasion = document.getElementById("cakeOccasion")?.value;
  const size = document.getElementById("cakeSize")?.value;
  const flavor = document.getElementById("cakeFlavor")?.value;
  const palette = document.getElementById("cakePalette")?.value;
  const messageText = document.getElementById("cakeMessage")?.value || "None";
  const date = document.getElementById("cakeDate")?.value;
  const notes = document.getElementById("cakeNotes")?.value || "N/A";

  const phone = "917083517862";
  let waMsg = `*🎂 CUSTOM CAKE INQUIRY - THE FLORA BAKERY NASHIK* 🎂\n\n`;
  waMsg += `Hello Chef! I want to order a custom handcrafted floral cake:\n\n`;
  waMsg += `• *Occasion:* ${occasion}\n`;
  waMsg += `• *Cake Weight:* ${size}\n`;
  waMsg += `• *Flavor:* ${flavor}\n`;
  waMsg += `• *Floral Color Palette:* ${palette}\n`;
  waMsg += `• *Message on Cake:* "${messageText}"\n`;
  waMsg += `• *Required Date:* ${date}\n`;
  waMsg += `• *Special Notes:* ${notes}\n\n`;
  waMsg += `Please provide me with a custom quote and confirm the date. Thank you!`;

  closeCakeBuilderModal();
  showToast("🎉 Custom cake inquiry prepared! Opening WhatsApp...");
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`, "_blank");
  }, 600);
}

// Quick View Modal
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const content = document.getElementById("quickViewContent");
  if (content) {
    content.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:28px; align-items:center;">
        <div style="border-radius:18px; overflow:hidden; border:2px solid var(--border-light); height:320px;">
          <img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div>
          <span class="heading-tag" style="margin-bottom:8px;">${product.categoryLabel}</span>
          <h3 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--text-cocoa); margin-bottom:8px;">${product.name}</h3>
          <div class="product-rating" style="margin-bottom:12px;">
            <span class="star" style="color:#FFB800;"><i class="fas fa-star"></i></span>
            <strong>${product.rating}</strong>
            <span style="color:var(--text-muted);">(${product.reviews} happy Nashik customers)</span>
          </div>
          <div style="font-size:1.6rem; font-weight:800; color:var(--rose-deep); margin-bottom:14px;">
            ₹${product.price} <span style="font-size:0.85rem; color:var(--text-muted); font-weight:500;">/ ${product.unit}</span>
          </div>
          <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">
            ${product.description}
          </p>
          <div style="background:var(--pink-soft); padding:12px 16px; border-radius:12px; font-size:0.85rem; margin-bottom:20px;">
            🌿 <strong>Pure Vegetarian:</strong> 100% Eggless with organic edible floral garnishes.
          </div>
          <div style="display:flex; gap:12px;">
            <button class="btn btn-primary" onclick="addToCart(${product.id}); closeQuickViewModal();">
              <i class="fas fa-shopping-bag"></i> Add to Cart • ₹${product.price}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("quickViewModal")?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeQuickViewModal() {
  document.getElementById("quickViewModal")?.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Toast Alert System
function showToast(message) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast-alert";
  toast.innerHTML = `<span>🌸</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Newsletter Signup & Instant Coupon Unlock
function submitNewsletter(event) {
  event.preventDefault();
  const input = document.getElementById("newsletterEmail");
  const val = input ? input.value : "";
  if (val) {
    showToast("🎉 Welcome to VIP Bloom Club! Use code 'FLORA10' for 10% off your first order!");
    if (input) input.value = "";
    appliedDiscount = 0.10;
    updateCartUI();
  }
}

// Sticky Header & Scroll Effects
function setupStickyHeader() {
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("scrolled");
    } else {
      header?.classList.remove("scrolled");
    }
  });
}

// Announcement Bar Dynamic Messages
function setupAnnouncements() {
  const announcements = [
    "🌸 Free Delivery on Orders Above ₹999 across Nashik | Order 24 Hrs in Advance",
    "✨ 100% Handcrafted Eggless Floral Cakes & Luxury Gifting Hampers",
    "📍 Studio: Ibadat Villa, Sai Nath Nagar, Nashik | Call / WhatsApp 070835 17862"
  ];
  let idx = 0;
  const el = document.getElementById("announcementText");
  if (el) {
    setInterval(() => {
      idx = (idx + 1) % announcements.length;
      el.style.opacity = "0";
      setTimeout(() => {
        el.textContent = announcements[idx];
        el.style.opacity = "1";
      }, 300);
    }, 4500);
  }
}

// General Event Listeners
function setupEventListeners() {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById("mobileMenuToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("mobile-active");
    });
  }

  // Close modals on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCartDrawer();
      closeCakeBuilderModal();
      closeQuickViewModal();
    }
  });
}
