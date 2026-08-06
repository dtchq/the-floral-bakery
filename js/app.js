/**
 * THE FLORA BAKERY - E-COMMERCE & INTERACTIVE LOGIC
 * Connected in real-time to FloraDB Unified Storage Engine
 * High-Converting CRO Features, Cart Drawer, Modals, Dynamic Admin Sync & WhatsApp Checkout
 */

// Helper to get active products from FloraDB or fallback
function getStoreProducts() {
  if (window.FloraDB && typeof window.FloraDB.getProducts === 'function') {
    return window.FloraDB.getProducts();
  }
  return [];
}

// Shopping Cart State
let cart = [
  { id: 1, name: "Blush Rose & Lychee Chiffon Cake", price: 1299, qty: 1, image: "images/cat-cakes.jpg" }
];
let appliedDiscountData = null;
let currentFilterCategory = "all";

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(currentFilterCategory);
  updateCartUI();
  setupStickyHeader();
  setupAnnouncements();
  setupEventListeners();

  // Listen for real-time changes from Admin Panel
  window.addEventListener('flora:data-changed', (e) => {
    renderProducts(currentFilterCategory);
    updateCartUI();
  });
});

// Render Products Grid
function renderProducts(filterCategory = "all") {
  currentFilterCategory = filterCategory;
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const allProducts = getStoreProducts();
  const filtered = filterCategory === "all" 
    ? allProducts 
    : allProducts.filter(p => p.category === filterCategory);

  // Update Status Text
  const statusEl = document.getElementById("filterStatusText");
  if (statusEl) {
    statusEl.innerHTML = `Showing <strong>${filtered.length} Handcrafted Bakes</strong>`;
  }

  // Update Tab Badges
  const countAll = document.getElementById("count-all");
  if (countAll) countAll.textContent = allProducts.length;
  const countCakes = document.getElementById("count-cakes");
  if (countCakes) countCakes.textContent = allProducts.filter(p => p.category === "cakes").length;
  const countPastries = document.getElementById("count-pastries");
  if (countPastries) countPastries.textContent = allProducts.filter(p => p.category === "pastries").length;
  const countMuffins = document.getElementById("count-muffins");
  if (countMuffins) countMuffins.textContent = allProducts.filter(p => p.category === "muffins").length;
  const countCombos = document.getElementById("count-combos");
  if (countCombos) countCombos.textContent = allProducts.filter(p => p.category === "combos").length;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🌸</div>
        <h4 style="font-size: 1.2rem; color: var(--text-cocoa); margin-bottom: 8px;">No items in this collection currently</h4>
        <p style="font-size: 0.9rem;">Check back soon or consult our chef for a bespoke bake.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const cartItem = cart.find(item => item.id === product.id);
    const inCartQty = cartItem ? cartItem.qty : 0;
    const isOutOfStock = product.stock <= 0;

    return `
      <div class="product-card" data-id="${product.id}">
        <!-- Top Thumbnail Area -->
        <div class="product-thumb-holder" onclick="openQuickView(${product.id})">
          <img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">
          
          <!-- Pure Veg Emblem & Badges -->
          <div class="card-top-badges">
            ${product.eggless ? `<span class="veg-emblem" title="100% Pure Vegetarian Eggless"></span>` : ''}
            ${product.badge ? `<span class="product-tag-badge">${product.badge}</span>` : ''}
            ${isOutOfStock ? `<span class="product-tag-badge" style="background:#EF4444; color:#FFF;">Sold Out</span>` : ''}
          </div>

          <button class="product-quickview-btn" onclick="event.stopPropagation(); openQuickView(${product.id})" title="View Details">
            <i class="fas fa-expand"></i> <span>Details</span>
          </button>
        </div>

        <!-- Product Information Body -->
        <div class="product-info">
          <div class="product-meta-row">
            <span class="product-category-meta">${product.categoryLabel || product.category}</span>
            <div class="product-rating-pill">
              <i class="fas fa-star"></i>
              <span>${product.rating || 5.0}</span>
            </div>
          </div>

          <h4 class="product-name" onclick="openQuickView(${product.id})">${product.name}</h4>
          
          <div class="product-unit-pill">
            <i class="fas fa-scale-balanced" style="font-size:0.68rem; opacity:0.7;"></i> ${product.unit || '0.5 kg'}
          </div>

          <!-- Price & Add Action -->
          <div class="product-pricing-action">
            <div class="price-box">
              <span class="price-currency">₹</span><span class="price-current">${product.price}</span>
              ${product.comparePrice ? `<span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-muted); margin-left:4px;">₹${product.comparePrice}</span>` : ''}
            </div>
            
            ${isOutOfStock ? `
              <button class="add-to-cart-btn" style="background:#E2E8F0; color:#64748B; cursor:not-allowed;" disabled>
                <span>Sold Out</span>
              </button>
            ` : `
              <button class="add-to-cart-btn ${inCartQty > 0 ? 'in-cart' : ''}" 
                      id="addBtn-${product.id}" 
                      onclick="addToCart(${product.id})" 
                      title="Add ${product.name} to cart" 
                      aria-label="Add ${product.name} to cart">
                ${inCartQty > 0 ? `<i class="fas fa-check"></i> <span>${inCartQty} in cart</span>` : `<i class="fas fa-plus"></i> <span>ADD</span>`}
              </button>
            `}
          </div>

        </div>
      </div>
    `;
  }).join('');
}

// Filter Tab Switcher
function filterProducts(category, btnElement) {
  document.querySelectorAll(".filter-tab-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
    if (!btnElement && btn.getAttribute("data-category") === category) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    }
  });
  if (btnElement) {
    btnElement.classList.add("active");
    btnElement.setAttribute("aria-selected", "true");
  }
  renderProducts(category);
}

// 1-Tap Category Hub Navigator
function selectCategory(category) {
  filterProducts(category);
  const target = document.getElementById("bestsellers");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Add Item to Cart
function addToCart(productId) {
  const allProducts = getStoreProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast("This item is currently sold out for baking.");
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast(`Only ${product.stock} units available in stock right now.`);
      return;
    }
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

  // Instant card button feedback
  const btn = document.getElementById(`addBtn-${productId}`);
  if (btn) {
    const updatedQty = existing ? existing.qty : 1;
    btn.classList.add("in-cart");
    btn.innerHTML = `<i class="fas fa-check"></i> <span>${updatedQty} in cart</span>`;
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
  const freeThreshold = window.FloraDB ? (window.FloraDB.getSettings().freeShippingThreshold || 999) : 999;

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartBadge) cartBadge.textContent = totalItems;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let discountAmount = 0;
  if (appliedDiscountData) {
    if (appliedDiscountData.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedDiscountData.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscountData.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Free shipping calculation
  if (progressFill && progressText) {
    if (subtotal >= freeThreshold) {
      progressFill.style.width = "100%";
      progressFill.style.background = "#2E7D32";
      progressText.innerHTML = `🎉 You unlocked <strong>FREE Nashik Delivery</strong>!`;
    } else {
      const remaining = freeThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
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

  const product = getStoreProducts().find(p => p.id === productId);
  if (delta > 0 && product && item.qty >= product.stock) {
    showToast(`Only ${product.stock} units available in stock.`);
    return;
  }

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
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  if (window.FloraDB) {
    const result = window.FloraDB.validateDiscount(code, subtotal);
    if (result.valid) {
      appliedDiscountData = result.discount;
      updateCartUI();
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  } else {
    if (code === "FLORA10" || code === "BLOOM10") {
      appliedDiscountData = { type: 'percent', value: 10, code };
      updateCartUI();
      showToast("✨ 10% VIP Discount Applied Successfully!");
    } else {
      showToast("Invalid code. Try using 'FLORA10'");
    }
  }
}

// WhatsApp Direct Checkout
function checkoutWhatsApp() {
  if (cart.length === 0) {
    showToast("Your cart is empty! Add some delicious floral bakes first.");
    return;
  }

  const settings = window.FloraDB ? window.FloraDB.getSettings() : { whatsapp: "917083517862" };
  const phone = settings.whatsapp || "917083517862";

  let message = `*🌸 NEW ORDER INQUIRY - THE FLORA BAKERY NASHIK* 🌸\n\n`;
  message += `Hello! I would like to place an order:\n\n`;

  let subtotal = 0;
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    message += `${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${itemTotal}\n`;
  });

  let discountAmount = 0;
  if (appliedDiscountData) {
    if (appliedDiscountData.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedDiscountData.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscountData.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  message += `\n*Subtotal:* ₹${subtotal}`;
  if (discountAmount > 0) {
    message += `\n*Discount (${appliedDiscountData.code}):* -₹${discountAmount}`;
  }
  message += `\n*Total Amount:* ₹${grandTotal}`;
  message += `\n*Delivery Location:* Nashik, Maharashtra`;
  message += `\n\nPlease confirm availability and payment details. Thank you! 🍰`;

  // Auto-record order in Admin Database FloraDB
  if (window.FloraDB) {
    window.FloraDB.addOrder({
      customerName: "Website WhatsApp Order",
      phone: "070835 17862",
      address: "Nashik Delivery Zone",
      items: [...cart],
      subtotal,
      discount: discountAmount,
      total: grandTotal,
      notes: `Applied Coupon: ${appliedDiscountData ? appliedDiscountData.code : 'None'}`
    });
  }

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

  const settings = window.FloraDB ? window.FloraDB.getSettings() : { whatsapp: "917083517862" };
  const phone = settings.whatsapp || "917083517862";

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

  // Auto-record inquiry in Admin FloraDB
  if (window.FloraDB) {
    window.FloraDB.addInquiry({
      customerName: "Custom Cake Consultation",
      phone: "070835 17862",
      occasion,
      size,
      flavor,
      palette,
      message: messageText,
      requiredDate: date,
      notes
    });
  }

  closeCakeBuilderModal();
  showToast("🎉 Custom cake inquiry prepared! Opening WhatsApp...");
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`, "_blank");
  }, 600);
}

// Quick View Modal
function openQuickView(productId) {
  const allProducts = getStoreProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const content = document.getElementById("quickViewContent");
  if (content) {
    const isOutOfStock = product.stock <= 0;
    content.innerHTML = `
      <div class="quickview-modal-grid">
        <div class="quickview-img-wrap">
          <img src="${product.image}" alt="${product.name}" class="quickview-img">
          <div class="card-top-badges">
            ${product.eggless ? `<span class="veg-emblem" title="100% Pure Vegetarian Eggless"></span>` : ''}
            ${product.badge ? `<span class="product-tag-badge">${product.badge}</span>` : ''}
            ${isOutOfStock ? `<span class="product-tag-badge" style="background:#EF4444; color:#FFF;">Sold Out</span>` : ''}
          </div>
        </div>
        <div class="quickview-details">
          <span class="heading-tag" style="margin-bottom:6px;">${product.categoryLabel || product.category}</span>
          <h3 class="quickview-title">${product.name}</h3>
          
          <div class="product-rating" style="margin-bottom:10px;">
            <span class="star" style="color:#FFB800;"><i class="fas fa-star"></i></span>
            <strong>${product.rating || 5.0}</strong>
            <span style="color:var(--text-muted); font-size:0.8rem;">(${product.reviews || 40} reviews in Nashik)</span>
          </div>

          <div class="quickview-price-row">
            <span class="quickview-price">₹${product.price}</span>
            <span class="quickview-unit">/ ${product.unit || '0.5 kg'}</span>
            ${product.stock <= 5 && product.stock > 0 ? `<span style="color:#D97706; font-weight:700; font-size:0.8rem; margin-left:10px;">⚠️ Only ${product.stock} left</span>` : ''}
          </div>

          <p class="quickview-desc">
            ${product.description}
          </p>

          <div class="quickview-usp-pill">
            <span class="veg-emblem-inline"></span>
            <span><strong>100% Eggless Pure Veg:</strong> Handcrafted with edible, pesticide-free blooms & pure dairy butter.</span>
          </div>

          <div class="quickview-actions">
            ${isOutOfStock ? `
              <button class="btn btn-secondary" style="flex:1; cursor:not-allowed;" disabled>
                Sold Out for Today
              </button>
            ` : `
              <button class="btn btn-primary" style="flex:1;" onclick="addToCart(${product.id}); closeQuickViewModal();">
                <i class="fas fa-shopping-bag"></i> Add to Cart • ₹${product.price}
              </button>
            `}
            <a href="https://wa.me/917083517862?text=Hello%20The%20Flora%20Bakery!%20I%20have%20a%20question%20about%20${encodeURIComponent(product.name)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding:10px 14px;" title="Chat with Baker">
              <i class="fab fa-whatsapp"></i>
            </a>
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

// Sticky Header Setup
function setupStickyHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

// Announcements Rotator
function setupAnnouncements() {
  const messages = [
    "🌸 Handcrafted with 100% Organic Edible Flowers & Pure Butter",
    "🚚 FREE Chilled Doorstep Delivery Across Nashik on Orders Above ₹999",
    "🎂 Bespoke Custom Cakes Made to Order — 24 Hours Advance Notice",
    "🌿 100% Vegetarian & Pure Eggless Kitchen Studio in Nashik"
  ];
  let index = 0;
  const announcementEl = document.getElementById("announcementText");
  if (!announcementEl) return;

  setInterval(() => {
    index = (index + 1) % messages.length;
    announcementEl.style.opacity = "0";
    announcementEl.style.transform = "translateY(-8px)";
    setTimeout(() => {
      announcementEl.textContent = messages[index];
      announcementEl.style.opacity = "1";
      announcementEl.style.transform = "translateY(0)";
    }, 300);
  }, 4500);
}

// Toast Alert Engine
function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span class="toast-icon">🌸</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

// Global Event Listeners
function setupEventListeners() {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      mobileToggle.classList.toggle("active");
    });
  }

  // Cart Drawer Trigger
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawerClose = document.getElementById("cartDrawerClose");
  const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");

  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener("click", closeCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener("click", closeCartDrawer);

  // VIP Bloom Club Coupon Copy
  const copyBtn = document.getElementById("copyCouponBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("FLORA10");
      showToast("🌸 Coupon code FLORA10 copied to clipboard!");
      const cartInput = document.getElementById("cartPromoInput");
      if (cartInput) {
        cartInput.value = "FLORA10";
      }
    });
  }
}
