/**
 * THE FLORA BAKERY - E-COMMERCE & INTERACTIVE STOREFRONT LOGIC
 * Connected in real-time to FloraDB Unified Storage Engine.
 * Features: High-Converting PDP Navigation, Slide Cart Drawer with Dynamic Upsells,
 * Direct Dedicated Checkout Redirection, Custom Cake Inquiries & Cross-Tab Sync.
 */

// Helper to get active products from FloraDB
function getStoreProducts() {
  if (window.FloraDB && typeof window.FloraDB.getProducts === 'function') {
    return window.FloraDB.getProducts({ status: 'active' });
  }
  return [];
}

let appliedDiscountData = null;
let currentFilterCategory = "all";

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(currentFilterCategory);
  updateCartUI();
  setupStickyHeader();
  setupAnnouncements();
  setupEventListeners();

  // Listen for real-time changes from Admin Studio or across tabs
  window.addEventListener('flora:data-changed', (e) => {
    renderProducts(currentFilterCategory);
    updateCartUI();
  });
});

// Render Products Grid on Storefront
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
    statusEl.innerHTML = `Showing <strong>${filtered.length} Handcrafted Botanical Bakes</strong>`;
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

  const cart = window.FloraDB ? window.FloraDB.getCart() : [];

  grid.innerHTML = filtered.map(product => {
    const inCartQty = cart.filter(item => item.id === product.id).reduce((sum, i) => sum + i.qty, 0);
    const isOutOfStock = product.stock <= 0;

    return `
      <div class="product-card" data-id="${product.id}">
        <!-- Top Thumbnail Area (Clicks into Dedicated Product Detail Page) -->
        <div class="product-thumb-holder" onclick="window.location.href='product.html?id=${product.id}'">
          <img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">
          
          <!-- Pure Veg Emblem & Badges -->
          <div class="card-top-badges">
            ${product.eggless ? `<span class="veg-emblem" title="100% Pure Vegetarian Eggless"></span>` : '<span></span>'}
            ${product.badge ? `<span class="product-tag-badge">${product.badge}</span>` : isOutOfStock ? `<span class="product-tag-badge sold-out">Sold Out</span>` : ''}
          </div>

          <a href="product.html?id=${product.id}" class="product-quickview-btn" onclick="event.stopPropagation();" title="View Product Page">
            <i class="fas fa-eye"></i> <span>View Bake</span>
          </a>
        </div>

        <!-- Product Information Body -->
        <div class="product-info-wrap">
          <div class="product-category-tag">${product.categoryLabel || product.category}</div>
          <h3 class="product-name" onclick="window.location.href='product.html?id=${product.id}'">${product.name}</h3>
          
          <div class="product-rating-row">
            <span class="product-rating-pill">
              <i class="fas fa-star"></i>
              <span>${(product.rating || 4.9).toFixed(1)}</span>
            </span>
            <span class="rating-count">(${product.reviews || 24} reviews)</span>
          </div>

          <div class="product-pricing-row">
            <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
            ${product.comparePrice ? `<span class="price-original">₹${product.comparePrice.toLocaleString('en-IN')}</span>` : ''}
            <span class="product-unit">/ ${product.unit || '0.5 kg'}</span>
          </div>

          <!-- Stock Radar Indicator -->
          <div class="product-stock-status ${isOutOfStock ? 'out-of-stock' : product.stock <= 4 ? 'low-stock' : 'in-stock'}">
            ${isOutOfStock 
              ? '✕ Sold Out for Today' 
              : product.stock <= 4 
                ? `⚡ Only ${product.stock} units left for today` 
                : `✓ Freshly Baked & Available`}
          </div>

          <!-- Action Button Area -->
          <div class="product-card-actions">
            ${isOutOfStock ? `
              <button class="btn btn-disabled" disabled>
                Sold Out
              </button>
            ` : inCartQty === 0 ? `
              <button class="btn btn-primary btn-add-cart" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-bag"></i> Add to Cart
              </button>
            ` : `
              <div class="qty-control-pill">
                <button class="qty-stepper-btn" onclick="changeQty(${product.id}, -1)" aria-label="Decrease quantity">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="qty-stepper-val" onclick="openCartDrawer()">${inCartQty} in Bag</span>
                <button class="qty-stepper-btn" onclick="changeQty(${product.id}, 1)" aria-label="Increase quantity">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            `}
          </div>

        </div>
      </div>
    `;
  }).join('');
}

// Category Tab Filter
function filterProducts(category, buttonEl) {
  currentFilterCategory = category;
  document.querySelectorAll(".filter-tab-btn").forEach(btn => {
    btn.classList.remove("active");
    btn.setAttribute("aria-selected", "false");
  });
  if (buttonEl) {
    buttonEl.classList.add("active");
    buttonEl.setAttribute("aria-selected", "true");
  } else {
    const matchingBtn = document.querySelector(`.filter-tab-btn[data-category="${category}"]`);
    if (matchingBtn) {
      matchingBtn.classList.add("active");
      matchingBtn.setAttribute("aria-selected", "true");
    }
  }
  renderProducts(category);
}

// Select Category from Card Hub or Occasion Chips
function selectCategory(category) {
  const tabBtn = document.querySelector(`.filter-tab-btn[data-category="${category}"]`);
  filterProducts(category, tabBtn);
  const bestsellersSection = document.getElementById("bestsellers");
  if (bestsellersSection) {
    bestsellersSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Legacy alias
function filterCategory(category, buttonEl) {
  filterProducts(category, buttonEl);
}

// Mobile Navigation Drawer Controls
if (!window.openMobileNav) {
  window.openMobileNav = function() {
    const drawer = document.getElementById("mobileNavDrawer");
    if (drawer) {
      drawer.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };
}

if (!window.closeMobileNav) {
  window.closeMobileNav = function() {
    const drawer = document.getElementById("mobileNavDrawer");
    if (drawer) {
      drawer.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  };
}

// =============================================================================
// UNIFIED SHOPPING CART ENGINE (FLORADB POWERED)
// =============================================================================

function addToCart(productId) {
  const allProducts = getStoreProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast("This item is currently sold out for today!");
    return;
  }

  if (window.FloraDB) {
    window.FloraDB.addToCart(product);
  }

  updateCartUI();
  renderProducts(currentFilterCategory);
  showToast(`🌸 Added "${product.name}" to your floral bag!`);
  
  // Automatically open slide cart drawer with dynamic upsells
  openCartDrawer();
}

function changeQty(productId, delta) {
  if (!window.FloraDB) return;
  const cart = window.FloraDB.getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    window.FloraDB.updateCartQty(item.cartKey, item.qty + delta);
    updateCartUI();
    renderProducts(currentFilterCategory);
  }
}

function removeFromCart(cartKeyOrId) {
  if (window.FloraDB) {
    window.FloraDB.removeFromCart(cartKeyOrId);
    updateCartUI();
    renderProducts(currentFilterCategory);
    showToast("Item removed from bag");
  }
}

// Update Cart Drawer UI & Calculation Meter
function updateCartUI() {
  if (!window.FloraDB) return;

  if (window.SiteLayout && typeof window.SiteLayout.renderCartDrawerContent === 'function') {
    window.SiteLayout.renderCartDrawerContent();
    if (typeof window.SiteLayout.updateCartBadge === 'function') {
      window.SiteLayout.updateCartBadge();
    }
    return;
  }

  const summary = window.FloraDB.getCartSummary();
  const cart = summary.items;

  // Header Badges
  const badge1 = document.getElementById("cartCountBadge");
  const drawerCount = document.getElementById("cartDrawerCount");

  if (badge1) {
    badge1.textContent = summary.totalCount;
    badge1.style.display = summary.totalCount > 0 ? "flex" : "none";
  }

  if (drawerCount) drawerCount.textContent = summary.totalCount;

  // Free Shipping Progress Bar
  const fillEl = document.getElementById("shippingMeterFill");
  const textEl = document.getElementById("shippingMeterText");
  const neededEl = document.getElementById("shippingMeterNeeded");
  
  if (fillEl) fillEl.style.width = `${summary.progressPercent}%`;
  if (textEl) {
    if (summary.isFreeShipping) {
      textEl.innerHTML = `<i class="fas fa-check-circle" style="color:#059669;"></i> 🎉 You unlocked <strong>FREE Chilled Delivery in Nashik</strong>!`;
      if (fillEl) fillEl.style.background = "#059669";
    } else {
      textEl.innerHTML = `<i class="fas fa-truck"></i> Add <strong id="shippingMeterNeeded">₹${summary.amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE Delivery in Nashik</strong>`;
      if (fillEl) fillEl.style.background = "linear-gradient(90deg, var(--rose-deep), #FF85A1)";
    }
  }

  // Totals
  let discountAmount = 0;
  if (appliedDiscountData) {
    discountAmount = appliedDiscountData.discountAmount;
  }

  const deliveryFee = summary.isFreeShipping ? 0 : summary.deliveryFee;
  const grandTotal = Math.max(0, summary.subtotal - discountAmount + deliveryFee);

  const subtotalEl = document.getElementById("cartDrawerSubtotal");
  const grandTotalEl = document.getElementById("cartDrawerGrandTotal");
  const deliveryEl = document.getElementById("cartDrawerShipping");
  const discountRow = document.getElementById("cartDrawerDiscountRow");
  const discountVal = document.getElementById("cartDrawerDiscountVal");

  if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.textContent = summary.isFreeShipping ? "FREE" : `₹${deliveryFee}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  
  if (discountAmount > 0 && discountRow && discountVal) {
    discountRow.style.display = "flex";
    discountVal.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
  } else if (discountRow) {
    discountRow.style.display = "none";
  }

  // Render Items List
  const itemsContainer = document.getElementById("cartDrawerBody");
  const footerEl = document.getElementById("cartDrawerFooter");

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state" style="text-align:center; padding:32px 16px;">
          <div style="font-size:3rem; margin-bottom:12px;">🌸</div>
          <h4 style="font-size:1.1rem; color:var(--text-cocoa); margin-bottom:6px;">Your sweet bag is empty</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
            Explore our freshly picked floral cakes and melt-in-mouth French pastries.
          </p>
          <button class="btn btn-secondary" onclick="closeCartDrawer(); window.location.hash='#categories';">
            Explore Menu
          </button>
        </div>
      `;
      if (footerEl) footerEl.style.display = "none";
    } else {
      if (footerEl) footerEl.style.display = "block";
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item-row">
          <img src="${item.image || 'images/cat-cakes.jpg'}" alt="${item.name}" class="cart-item-thumb" onclick="window.location.href='product.html?id=${item.id}'">
          <div class="cart-item-info" style="flex:1;">
            <h5 class="cart-item-title" onclick="window.location.href='product.html?id=${item.id}'">${item.name}</h5>
            <span class="cart-item-variant" style="display:block; font-size:0.8rem; color:var(--text-muted); margin-bottom:4px;">${item.variantName || 'Standard'}</span>
            ${item.cakeMessage ? `<span style="display:block; font-size:0.78rem; color:var(--rose-deep); margin-bottom:4px;"><i class="fas fa-pen-nib"></i> "${item.cakeMessage}"</span>` : ''}
            <div class="cart-item-price" style="font-weight:700; color:var(--text-cocoa);">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
            <div class="cart-item-qty" style="display:flex; align-items:center; gap:8px; margin-top:6px;">
              <button class="qty-btn" onclick="changeCartKeyQty('${item.cartKey}', -1)">-</button>
              <span style="font-weight:700; font-size:0.9rem; min-width:20px; text-align:center;">${item.qty}</span>
              <button class="qty-btn" onclick="changeCartKeyQty('${item.cartKey}', 1)">+</button>
              <button style="margin-left:auto; background:none; color:#C62828; font-size:0.85rem; font-weight:600; cursor:pointer; border:none;" onclick="removeFromCart('${item.cartKey}')">
                <i class="fas fa-trash-alt"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Render Dynamic Upsells inside Cart Drawer
  renderDrawerUpsells();
}

function changeCartKeyQty(cartKey, delta) {
  if (!window.FloraDB) return;
  const cart = window.FloraDB.getCart();
  const item = cart.find(i => i.cartKey === cartKey);
  if (item) {
    window.FloraDB.updateCartQty(cartKey, item.qty + delta);
    updateCartUI();
    renderProducts(currentFilterCategory);
  }
}

// Render Upsell Carousel Inside Cart Drawer
function renderDrawerUpsells() {
  const upsellTrack = document.getElementById("cartUpsellItems");
  const upsellSection = document.getElementById("cartUpsellSection");
  if (!upsellTrack || !window.FloraDB) return;

  const upsells = window.FloraDB.getUpsellProducts();
  if (upsells.length === 0) {
    if (upsellSection) upsellSection.style.display = "none";
    return;
  }

  if (upsellSection) upsellSection.style.display = "block";
  upsellTrack.innerHTML = upsells.map(p => `
    <div class="upsell-item-card">
      <img src="${p.image}" alt="${p.name}" class="upsell-thumb" onclick="window.location.href='product.html?id=${p.id}'">
      <div class="upsell-info">
        <span class="upsell-item-name" onclick="window.location.href='product.html?id=${p.id}'">${p.name}</span>
        <span class="upsell-item-price">₹${p.price.toLocaleString('en-IN')}</span>
      </div>
      <button class="btn btn-secondary upsell-add-btn" onclick="addUpsell(${p.id})">
        <i class="fas fa-plus"></i> Add
      </button>
    </div>
  `).join('');
}

function addUpsell(productId) {
  const prod = window.FloraDB ? window.FloraDB.getProductById(productId) : null;
  if (prod) {
    window.FloraDB.addToCart(prod, null, 1);
    showToast(`🌸 Added "${prod.name}" to your bag!`);
    updateCartUI();
    renderProducts(currentFilterCategory);
  }
}

// Cart Drawer Visibility
if (!window.openCartDrawer) {
  window.openCartDrawer = function() {
    const overlay = document.getElementById("cartDrawerOverlay");
    const drawer = document.getElementById("cartDrawer");
    if (overlay) overlay.classList.add("active");
    if (drawer) drawer.classList.add("active");
    document.body.style.overflow = "hidden";
    updateCartUI();
  };
}

if (!window.closeCartDrawer) {
  window.closeCartDrawer = function() {
    const overlay = document.getElementById("cartDrawerOverlay");
    const drawer = document.getElementById("cartDrawer");
    if (overlay) overlay.classList.remove("active");
    if (drawer) drawer.classList.remove("active");
    document.body.style.overflow = "auto";
  };
}

// Promo Code Application
function applyPromoCode() {
  const input = document.getElementById("cartPromoInput") || document.getElementById("cartCouponInput");
  const code = input ? input.value.trim().toUpperCase() : "";
  const summary = window.FloraDB ? window.FloraDB.getCartSummary() : { subtotal: 0 };

  if (!code) {
    showToast("Please enter a promo code (e.g. FLORA10)");
    return;
  }

  if (window.FloraDB) {
    const result = window.FloraDB.applyDiscountCode(code, summary.subtotal);
    if (result.valid) {
      appliedDiscountData = result;
      updateCartUI();
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  }
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

  closeCakeBuilderModal();
  showToast("🎉 Custom cake inquiry sent to studio!");
  setTimeout(() => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`, "_blank");
  }, 600);
}

// Sticky Header Setup
function setupStickyHeader() {
  const header = document.getElementById("siteHeader") || document.getElementById("header");
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
if (!window.showToast) {
  window.showToast = function(message) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

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
  };
}

// Newsletter Subscription
function submitNewsletter(event) {
  event.preventDefault();
  const input = document.getElementById("newsletterEmail");
  if (input && input.value) {
    showToast("🎉 Welcome to VIP Bloom Club! Use code FLORA10 for 10% off.");
    input.value = "";
  }
}

// Global Event Listeners
function setupEventListeners() {
  // Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobileMenuToggle") || document.getElementById("mobileToggle");
  if (mobileToggle) {
    mobileToggle.addEventListener("click", openMobileNav);
  }

  // Cart Drawer Triggers
  const cartBtn = document.getElementById("cartBtn");
  const cartDrawerOverlay = document.getElementById("cartDrawerOverlay");
  const cartDrawerClose = document.getElementById("cartDrawerClose");

  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
  if (cartDrawerOverlay) cartDrawerOverlay.addEventListener("click", closeCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener("click", closeCartDrawer);

  // VIP Bloom Club Coupon Copy
  const copyBtn = document.getElementById("copyCouponBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("FLORA10");
      showToast("🌸 Coupon code FLORA10 copied to clipboard!");
      const cartInput = document.getElementById("cartPromoInput") || document.getElementById("cartCouponInput");
      if (cartInput) {
        cartInput.value = "FLORA10";
      }
    });
  }
}

// Modal Handlers
if (!window.closeQuickViewModal) {
  window.closeQuickViewModal = function() {
    const modal = document.getElementById("quickViewModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "auto";
  };
}

if (!window.closeCheckoutModal) {
  window.closeCheckoutModal = function() {
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "auto";
  };
}

if (!window.processCheckoutOrder) {
  window.processCheckoutOrder = function(event) {
    if (event) event.preventDefault();
    if (window.closeCheckoutModal) window.closeCheckoutModal();
    const successModal = document.getElementById("orderSuccessModal");
    if (successModal) successModal.classList.add("active");
    if (window.FloraDB && typeof window.FloraDB.clearCart === 'function') {
        window.FloraDB.clearCart();
    }
    updateCartUI();
  };
}

if (!window.openEmailReceiptModal) {
  window.openEmailReceiptModal = function() {
    const modal = document.getElementById("emailReceiptModal");
    if (modal) modal.classList.add("active");
  };
}

if (!window.closeOrderSuccessModal) {
  window.closeOrderSuccessModal = function() {
    const modal = document.getElementById("orderSuccessModal");
    if (modal) modal.classList.remove("active");
  };
}

if (!window.closeEmailReceiptModal) {
  window.closeEmailReceiptModal = function() {
    const modal = document.getElementById("emailReceiptModal");
    if (modal) modal.classList.remove("active");
  };
}

