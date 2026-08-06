/**
 * THE FLORA BAKERY - E-COMMERCE & INTERACTIVE LOGIC
 * Connected in real-time to FloraDB Unified Storage Engine
 * Features: On-Site E-Commerce Checkout (COD & Gateway-Ready), Confirmation Email Dispatch, 
 * Cart Drawer, Custom Cake Consultation, QuickView, Mobile Navigation & Real-Time Sync
 */

// Helper to get active products from FloraDB
function getStoreProducts() {
  if (window.FloraDB && typeof window.FloraDB.getProducts === 'function') {
    return window.FloraDB.getProducts({ status: 'active' });
  }
  return [];
}

// Shopping Cart State
let cart = [
  { id: 1, name: "Blush Rose & Lychee Chiffon Cake", price: 1299, qty: 1, image: "images/cat-cakes.jpg" }
];
let appliedDiscountData = null;
let currentFilterCategory = "all";
let currentCompletedOrder = null;

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(currentFilterCategory);
  updateCartUI();
  setupStickyHeader();
  setupAnnouncements();
  setupEventListeners();
  setupCheckoutDateDefaults();

  // Listen for real-time changes from Admin Panel or across tabs
  window.addEventListener('flora:data-changed', (e) => {
    renderProducts(currentFilterCategory);
    updateCartUI();
  });
});

// Setup Default & Min Date for Checkout
function setupCheckoutDateDefaults() {
  const dateInput = document.getElementById("checkoutDate");
  const customDateInput = document.getElementById("cakeDate");
  const today = new Date();
  
  // Format to YYYY-MM-DD
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDateStr = `${yyyy}-${mm}-${dd}`;

  if (dateInput) {
    dateInput.min = minDateStr;
    dateInput.value = minDateStr;
  }
  if (customDateInput) {
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    const tmrwDD = String(tmrw.getDate()).padStart(2, '0');
    const tmrwMM = String(tmrw.getMonth() + 1).padStart(2, '0');
    customDateInput.min = `${tmrw.getFullYear()}-${tmrwMM}-${tmrwDD}`;
    customDateInput.value = `${tmrw.getFullYear()}-${tmrwMM}-${tmrwDD}`;
  }
}

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
            ${product.eggless ? `<span class="veg-emblem" title="100% Pure Vegetarian Eggless"></span>` : '<span></span>'}
            ${product.badge ? `<span class="product-tag-badge">${product.badge}</span>` : isOutOfStock ? `<span class="product-tag-badge sold-out">Sold Out</span>` : ''}
          </div>

          <button class="product-quickview-btn" onclick="event.stopPropagation(); openQuickView(${product.id})" title="View Details">
            <i class="fas fa-expand"></i> <span>Details</span>
          </button>
        </div>

        <!-- Product Information Body -->
        <div class="product-info-wrap">
          <div class="product-category-tag">${product.categoryLabel || product.category}</div>
          <h3 class="product-name" onclick="openQuickView(${product.id})">${product.name}</h3>
          
          <div class="product-rating-row">
            <span class="product-rating-pill">
              <i class="fas fa-star"></i>
              <span>${product.rating || 5.0}</span>
            </span>
            <span class="rating-count">(${product.reviews || 20})</span>
          </div>

          <div class="product-pricing-row">
            <span class="price-current">₹${product.price}</span>
            ${product.comparePrice ? `<span class="price-original">₹${product.comparePrice}</span>` : ''}
            <span class="product-unit">/ ${product.unit || '0.5 kg'}</span>
          </div>

          <!-- Stock Radar Indicator -->
          <div class="product-stock-status ${isOutOfStock ? 'out-of-stock' : product.stock <= 5 ? 'low-stock' : 'in-stock'}">
            ${isOutOfStock 
              ? '✕ Sold Out for Today' 
              : product.stock <= 5 
                ? `⚡ Only ${product.stock} units remaining today` 
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
                <i class="fas fa-plus"></i> Add to Cart
              </button>
            ` : `
              <div class="qty-control-pill">
                <button class="qty-stepper-btn" onclick="changeQty(${product.id}, -1)" aria-label="Decrease quantity">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="qty-stepper-val">${inCartQty} in Cart</span>
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
function openMobileNav() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) {
    drawer.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileNav() {
  const drawer = document.getElementById("mobileNavDrawer");
  if (drawer) {
    drawer.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// Add Item to Cart
function addToCart(productId) {
  const allProducts = getStoreProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    showToast("This item is currently sold out for today!");
    return;
  }

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    if (existing.qty >= product.stock) {
      showToast(`Only ${product.stock} units available in stock.`);
      return;
    }
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  updateCartUI();
  renderProducts(currentFilterCategory);
  showToast(`🌸 Added "${product.name}" to cart!`);
}

// Update Cart User Interface & Calculations
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Update header badges
  const badge1 = document.getElementById("cartCountBadge");
  const badge2 = document.getElementById("cartBadge");
  [badge1, badge2].forEach(b => {
    if (b) {
      b.textContent = totalCount;
      b.style.display = totalCount > 0 ? "flex" : "none";
    }
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Calculate Promo Discount
  let discountAmount = 0;
  if (appliedDiscountData) {
    if (appliedDiscountData.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedDiscountData.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscountData.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Update Free Shipping Progress Bar (Threshold ₹999)
  const freeThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const diff = freeThreshold - subtotal;
  
  const fillEl = document.getElementById("freeShippingFill");
  const textEl = document.getElementById("freeShippingText");
  
  if (fillEl) fillEl.style.width = `${progressPercent}%`;
  if (textEl) {
    if (subtotal === 0) {
      textEl.innerHTML = `Add <strong>₹${freeThreshold}</strong> for <strong>FREE Delivery</strong> in Nashik 🌸`;
    } else if (subtotal >= freeThreshold) {
      textEl.innerHTML = `🎉 You unlocked <strong>FREE Chilled Delivery</strong> in Nashik!`;
    } else {
      textEl.innerHTML = `Add <strong>₹${diff}</strong> more for <strong>FREE Delivery</strong> in Nashik`;
    }
  }

  // Update Totals
  const subtotalEl = document.getElementById("cartSubtotal");
  const grandTotalEl = document.getElementById("cartGrandTotal");
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  // Update Cart Drawer Items List
  const itemsContainer = document.getElementById("cartItemsBody");
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div style="font-size:3.5rem; margin-bottom:12px;">🌸</div>
          <h4 style="font-size:1.1rem; color:var(--text-cocoa); margin-bottom:6px;">Your sweet cart is empty</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:16px;">
            Explore our freshly picked floral cakes and melt-in-mouth French pastries.
          </p>
          <button class="btn btn-secondary" onclick="closeCartDrawer(); window.location.hash='#categories';">
            Explore Menu
          </button>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item-row">
          <img src="${item.image || 'images/cat-cakes.jpg'}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-info">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty(${item.id}, -1)">-</button>
              <span style="font-weight:700; font-size:0.9rem; min-width:20px; text-align:center;">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
              <button style="margin-left:auto; background:none; color:#C62828; font-size:0.85rem; font-weight:600; cursor:pointer;" onclick="removeFromCart(${item.id})">
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
  renderProducts(currentFilterCategory);
}

// Remove from Cart
function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
  renderProducts(currentFilterCategory);
  showToast("Item removed from cart");
}

// Cart Drawer Controls
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

  if (!code) {
    showToast("Please enter a promo code (e.g. FLORA10)");
    return;
  }

  if (window.FloraDB && typeof window.FloraDB.applyDiscount === 'function') {
    const result = window.FloraDB.applyDiscount(code, subtotal);
    if (result.valid) {
      appliedDiscountData = { code: result.code, value: result.value, type: result.type, amount: result.discountAmount };
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

// =============================================================================
// ON-SITE E-COMMERCE CHECKOUT FLOW (SHOPIFY-GRADE)
// =============================================================================

function openCheckoutModal() {
  if (cart.length === 0) {
    showToast("Your cart is empty! Add some delicious floral bakes first.");
    return;
  }

  closeCartDrawer();
  updateCheckoutSummary();
  setupCheckoutDateDefaults();

  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById("checkoutModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

function updateCheckoutSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const freeThreshold = 999;
  const deliveryFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : 99;

  let discountAmount = 0;
  if (appliedDiscountData) {
    if (appliedDiscountData.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedDiscountData.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscountData.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Update Summary Rows
  const itemsContainer = document.getElementById("checkoutItemsList");
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-summary-item">
        <img src="${item.image || 'images/cat-cakes.jpg'}" alt="${item.name}" class="summary-item-img">
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-qty">Qty: ${item.qty} &bull; ₹${item.price.toLocaleString('en-IN')} each</div>
        </div>
        <div class="summary-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
  }

  const subtotalEl = document.getElementById("checkoutSubtotal");
  const deliveryFeeEl = document.getElementById("checkoutDeliveryFee");
  const grandTotalEl = document.getElementById("checkoutGrandTotal");
  const btnTotalEl = document.getElementById("checkoutBtnTotal");
  const discountRow = document.getElementById("checkoutDiscountRow");
  const discountCodeEl = document.getElementById("checkoutDiscountCode");
  const discountValEl = document.getElementById("checkoutDiscountVal");

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`;
    deliveryFeeEl.style.color = deliveryFee === 0 ? "#059669" : "var(--text-cocoa)";
  }
  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  if (btnTotalEl) btnTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

  if (discountRow) {
    if (discountAmount > 0 && appliedDiscountData) {
      discountRow.style.display = "flex";
      if (discountCodeEl) discountCodeEl.textContent = appliedDiscountData.code;
      if (discountValEl) discountValEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
    } else {
      discountRow.style.display = "none";
    }
  }
}

// Process Checkout Form Submission (COD E-Commerce Order)
function processCheckoutOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("Your cart is empty!");
    closeCheckoutModal();
    return;
  }

  const name = document.getElementById("checkoutName")?.value.trim();
  const phone = document.getElementById("checkoutPhone")?.value.trim();
  const email = document.getElementById("checkoutEmail")?.value.trim();
  const date = document.getElementById("checkoutDate")?.value;
  const slot = document.getElementById("checkoutSlot")?.value;
  const address = document.getElementById("checkoutAddress")?.value.trim();
  const locality = document.getElementById("checkoutLocality")?.value;
  const landmark = document.getElementById("checkoutLandmark")?.value.trim();
  const cakeMessage = document.getElementById("checkoutCakeMessage")?.value.trim();
  const notes = document.getElementById("checkoutNotes")?.value.trim();

  // Basic validation
  if (!name || !phone || !email || !address) {
    showToast("Please fill in all required fields!");
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = subtotal >= 999 ? 0 : 99;

  let discountAmount = 0;
  if (appliedDiscountData) {
    if (appliedDiscountData.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedDiscountData.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, appliedDiscountData.value);
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const fullAddress = `${address}${landmark ? ` (Near ${landmark})` : ''}, ${locality}, Nashik`;

  // Construct Order Object
  const orderPayload = {
    customerName: name,
    phone: phone,
    email: email,
    address: fullAddress,
    locality: locality,
    deliveryDate: date,
    timeSlot: slot,
    cakeMessage: cakeMessage,
    notes: notes,
    items: [...cart],
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    discount: discountAmount,
    total: grandTotal,
    paymentMethod: "COD"
  };

  // Add Order to Unified DB (Triggers notifications, email logs, stock decrement)
  let createdOrder = null;
  if (window.FloraDB && typeof window.FloraDB.addOrder === 'function') {
    createdOrder = window.FloraDB.addOrder(orderPayload);
  } else {
    createdOrder = { ...orderPayload, id: `FB-${Math.floor(Math.random()*1000 + 1000)}` };
  }

  currentCompletedOrder = createdOrder;

  // Clear Cart
  cart = [];
  appliedDiscountData = null;
  updateCartUI();
  renderProducts(currentFilterCategory);

  // Close Checkout Modal & Open Order Success Screen
  closeCheckoutModal();
  openOrderSuccessModal(createdOrder);

  // Toast celebration
  showToast(`🎉 Order #${createdOrder.id} confirmed! Confirmation email dispatched.`);
}

// Order Success Modal Handler
function openOrderSuccessModal(order) {
  const modal = document.getElementById("orderSuccessModal");
  if (!modal || !order) return;

  const idEl = document.getElementById("successOrderId");
  const nameEl = document.getElementById("successCustomerName");
  const dateEl = document.getElementById("successDeliveryDate");
  const totalEl = document.getElementById("successTotal");
  const emailEl = document.getElementById("successCustomerEmail");

  if (idEl) idEl.textContent = `#${order.id}`;
  if (nameEl) nameEl.textContent = order.customerName;
  if (dateEl) dateEl.textContent = `${order.deliveryDate || 'Scheduled'} (${order.timeSlot || 'Afternoon'})`;
  if (totalEl) totalEl.textContent = `₹${order.total.toLocaleString('en-IN')}`;
  if (emailEl) emailEl.textContent = order.email;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeOrderSuccessModal() {
  const modal = document.getElementById("orderSuccessModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}

// Simulated Email Receipt Modal Viewer
function openEmailReceiptModal() {
  if (!currentCompletedOrder) return;
  const order = currentCompletedOrder;

  const modal = document.getElementById("emailReceiptModal");
  if (!modal) return;

  const subjectEl = document.getElementById("emailModalSubject");
  const toEl = document.getElementById("emailModalTo");
  const dateEl = document.getElementById("emailModalDate");
  const bodyEl = document.getElementById("emailRenderedBody");

  if (subjectEl) subjectEl.textContent = `🌸 Order Confirmed! The Flora Bakery Order #${order.id}`;
  if (toEl) toEl.textContent = `${order.customerName} <${order.email}>`;
  if (dateEl) dateEl.textContent = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  if (bodyEl && window.FloraDB && typeof window.FloraDB.generateEmailHTML === 'function') {
    bodyEl.innerHTML = window.FloraDB.generateEmailHTML(order);
  }

  modal.classList.add("active");
}

function closeEmailReceiptModal() {
  const modal = document.getElementById("emailReceiptModal");
  if (modal) {
    modal.classList.remove("active");
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
  showToast("🎉 Custom cake inquiry sent to studio!");
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
            ${product.eggless ? `<span class="veg-emblem" title="100% Pure Vegetarian Eggless"></span>` : '<span></span>'}
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
function showToast(message) {
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

  if (cartBtn) cartBtn.addEventListener("click", openCartDrawer);
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
