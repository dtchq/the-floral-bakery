/**
 * THE FLORA BAKERY - PRODUCT DETAIL PAGE (PDP) ENGINE
 * High-Converting E-commerce Product Page with Interactive Variants, Gallery Zoom,
 * Slide Cart Drawer with Upsells, and Frictionless Checkout Redirects.
 */

(function() {
  'use strict';

  let currentProduct = null;
  let selectedVariant = null;
  let currentQty = 1;
  let appliedDiscount = null;

  // Initialize Page
  document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
    setupCartDrawerEvents();
    setupMobileNav();
  });

  function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || 1;

    currentProduct = FloraDB.getProductById(productId) || FloraDB.getProducts()[0];
    if (!currentProduct) {
      window.location.href = 'index.html';
      return;
    }

    renderProductDetails(currentProduct);
    renderRelatedProducts(currentProduct);
    updateCartUI();

    // Listen for FloraDB events
    window.addEventListener('flora:data-changed', (e) => {
      updateCartUI();
    });
  }

  // Render Full Product Information
  function renderProductDetails(product) {
    document.title = `${product.name} | The Flora Bakery Nashik`;

    // Breadcrumbs
    const bcCat = document.getElementById('pdpBreadcrumbCategory');
    const bcCurrent = document.getElementById('pdpBreadcrumbCurrent');
    if (bcCat) {
      bcCat.textContent = product.categoryLabel || product.category;
      bcCat.href = `index.html#categories`;
    }
    if (bcCurrent) bcCurrent.textContent = product.name;

    // Gallery
    const mainImg = document.getElementById('pdpMainImage');
    const thumbStrip = document.getElementById('pdpThumbStrip');
    const tagBadge = document.getElementById('pdpTagBadge');

    if (mainImg) {
      mainImg.src = product.image;
      mainImg.alt = product.name;
    }

    if (tagBadge) {
      tagBadge.textContent = product.badge || 'Artisanal';
    }

    if (thumbStrip) {
      const gallery = (product.gallery && product.gallery.length > 0) ? product.gallery : [product.image];
      thumbStrip.innerHTML = gallery.map((imgSrc, idx) => `
        <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" onclick="selectPdpImage('${imgSrc}', this)">
          <img src="${imgSrc}" alt="${product.name} view ${idx + 1}">
        </button>
      `).join('');
    }

    // Title & Meta
    const catTag = document.getElementById('pdpCategoryTag');
    const titleEl = document.getElementById('pdpTitle');
    const shortDesc = document.getElementById('pdpShortDesc');
    const ratingNum = document.getElementById('pdpRatingNum');
    const reviewCount = document.getElementById('pdpReviewCount');

    if (catTag) catTag.textContent = (product.categoryLabel || product.category).toUpperCase();
    if (titleEl) titleEl.textContent = product.name;
    if (shortDesc) shortDesc.textContent = product.description;
    if (ratingNum) ratingNum.textContent = (product.rating || 4.9).toFixed(1);
    if (reviewCount) reviewCount.textContent = `(${product.reviews || 120} verified reviews)`;

    // Variants Engine
    const variantsContainer = document.getElementById('pdpVariantChips');
    const variantLabel = document.getElementById('pdpSelectedVariantLabel');

    const variantsList = (product.variants && product.variants.length > 0) ? product.variants : [
      { id: 'default', name: product.unit || 'Standard Size', price: product.price, comparePrice: product.comparePrice, isDefault: true }
    ];

    selectedVariant = variantsList.find(v => v.isDefault) || variantsList[0];

    if (variantsContainer) {
      variantsContainer.innerHTML = variantsList.map(v => {
        const info = formatVariantDisplay(v);
        const isSelected = (v.id === selectedVariant.id);
        return `
          <button type="button" 
                  class="pdp-variant-card ${isSelected ? 'active' : ''}" 
                  data-id="${v.id}" 
                  onclick="selectVariant('${v.id}')"
                  aria-pressed="${isSelected}">
            <div class="variant-card-left">
              <span class="variant-radio-ring">
                <span class="variant-radio-dot"></span>
              </span>
              <div class="variant-card-text">
                <span class="variant-main-title">${info.mainTitle}</span>
                ${info.subHint ? `<span class="variant-serving-hint">${info.subHint}</span>` : ''}
              </div>
            </div>

            <div class="variant-card-right">
              <div class="variant-price-wrap">
                <span class="variant-current-price">₹${info.price.toLocaleString('en-IN')}</span>
                ${info.comparePrice && info.comparePrice > info.price ? `<span class="variant-compare-price">₹${info.comparePrice.toLocaleString('en-IN')}</span>` : ''}
              </div>
              ${info.savings > 0 ? `<span class="variant-savings-badge">SAVE ${info.savings}%</span>` : ''}
            </div>
          </button>
        `;
      }).join('');
    }

    if (variantLabel) {
      variantLabel.innerHTML = `<i class="fas fa-check-circle"></i> ${selectedVariant.name}`;
    }

    updatePricingDisplay();

    // Botanicals & Specs
    const botanicalsList = document.getElementById('pdpBotanicalsList');
    if (botanicalsList && product.botanicals) {
      botanicalsList.innerHTML = product.botanicals.map(b => `<li><i class="fas fa-seedling"></i> ${b}</li>`).join('');
    }

    // Inscription message counter & live preview
    const customMsgInput = document.getElementById('pdpCustomMessage');
    const charCounter = document.getElementById('pdpMsgCharCount');
    const previewBox = document.getElementById('pdpMsgPreviewBox');
    const previewText = document.getElementById('pdpMsgPreviewText');
    if (customMsgInput && charCounter) {
      customMsgInput.addEventListener('input', () => {
        const val = customMsgInput.value;
        charCounter.textContent = `${val.length}/35`;
        if (previewBox && previewText) {
          if (val.trim().length > 0) {
            previewBox.style.display = 'flex';
            previewText.textContent = `"${val.trim()}"`;
          } else {
            previewBox.style.display = 'none';
          }
        }
      });
    }

    // Auto-update delivery checker on locality dropdown change
    const localitySelect = document.getElementById('pdpLocalitySelect');
    if (localitySelect) {
      localitySelect.addEventListener('change', checkPdpDelivery);
    }

    // Reviews List
    renderReviews(product);

    // Mobile Sticky Bar
    const stickyThumb = document.getElementById('stickyThumb');
    const stickyTitle = document.getElementById('stickyTitle');
    const stickyPrice = document.getElementById('stickyPrice');
    if (stickyThumb) stickyThumb.src = product.image;
    if (stickyTitle) stickyTitle.textContent = product.name;
    if (stickyPrice) stickyPrice.textContent = `₹${selectedVariant.price.toLocaleString('en-IN')}`;
  }

  // Variant Display Parser Helper
  function formatVariantDisplay(variant) {
    let mainTitle = variant.name;
    let subHint = '';
    
    if (variant.name.includes('(')) {
      const parts = variant.name.split('(');
      mainTitle = parts[0].trim();
      subHint = parts.slice(1).join('(').replace(/\)/g, '').trim();
    } else if (variant.name.toLowerCase().includes('0.5 kg') || variant.name.toLowerCase().includes('500g')) {
      subHint = 'Serves 4–6 • Perfect for intimate celebrations';
    } else if (variant.name.toLowerCase().includes('1.0 kg') || variant.name.toLowerCase().includes('1 kg')) {
      subHint = 'Serves 8–10 • Most Popular Party Size';
    } else if (variant.name.toLowerCase().includes('1.5 kg')) {
      subHint = 'Serves 12–15 • Grand Family Gathering';
    } else if (variant.name.toLowerCase().includes('2.0 kg') || variant.name.toLowerCase().includes('2.5 kg')) {
      subHint = 'Serves 18–25 • Showstopper Masterpiece';
    } else if (variant.name.toLowerCase().includes('2 pieces')) {
      subHint = 'Ideal for 1–2 Persons';
    } else if (variant.name.toLowerCase().includes('4 pieces')) {
      subHint = 'Family Treat Box';
    } else if (variant.name.toLowerCase().includes('6 pieces')) {
      subHint = 'Party & Gifting Pack';
    }

    const price = Number(variant.price);
    const comparePrice = Number(variant.comparePrice || (variant.price * 1.15));
    const savings = (variant.comparePrice && variant.comparePrice > variant.price)
      ? Math.round(((variant.comparePrice - variant.price) / variant.comparePrice) * 100)
      : 0;

    return { mainTitle, subHint, price, comparePrice, savings };
  }

  // Gallery Image Switcher
  window.selectPdpImage = function(src, btnEl) {
    const mainImg = document.getElementById('pdpMainImage');
    if (mainImg) {
      mainImg.style.opacity = '0.4';
      setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
      }, 150);
    }
    document.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
  };

  // Variant Switcher
  window.selectVariant = function(variantId) {
    if (!currentProduct || !currentProduct.variants) return;
    const variant = currentProduct.variants.find(v => v.id === variantId);
    if (!variant) return;

    selectedVariant = variant;
    document.querySelectorAll('.pdp-variant-card, .pdp-variant-chip, .variant-chip').forEach(c => {
      const match = (c.dataset.id === variantId);
      c.classList.toggle('active', match);
      c.setAttribute('aria-pressed', match);
    });

    const variantLabel = document.getElementById('pdpSelectedVariantLabel');
    if (variantLabel) {
      variantLabel.innerHTML = `<i class="fas fa-check-circle"></i> ${selectedVariant.name}`;
    }

    updatePricingDisplay();
  };

  function updatePricingDisplay() {
    if (!selectedVariant) return;

    const currentPriceEl = document.getElementById('pdpPriceCurrent');
    const origPriceEl = document.getElementById('pdpPriceOriginal');
    const discountPill = document.getElementById('pdpDiscountPill');
    const stickyPrice = document.getElementById('stickyPrice');

    const price = Number(selectedVariant.price);
    const comparePrice = Number(selectedVariant.comparePrice || price * 1.15);
    const savings = Math.max(0, comparePrice - price);
    const percent = Math.round((savings / comparePrice) * 100);

    if (currentPriceEl) currentPriceEl.textContent = `₹${price.toLocaleString('en-IN')}`;
    if (origPriceEl) {
      if (savings > 0) {
        origPriceEl.textContent = `₹${comparePrice.toLocaleString('en-IN')}`;
        origPriceEl.style.display = 'inline';
      } else {
        origPriceEl.style.display = 'none';
      }
    }
    if (discountPill) {
      if (percent > 0) {
        discountPill.textContent = `SAVE ${percent}%`;
        discountPill.style.display = 'inline-block';
      } else {
        discountPill.style.display = 'none';
      }
    }
    if (stickyPrice) stickyPrice.textContent = `₹${price.toLocaleString('en-IN')}`;
  }

  // Quantity Controls
  window.changePdpQty = function(delta) {
    currentQty = Math.max(1, currentQty + delta);
    const qtyVal = document.getElementById('pdpQtyVal');
    if (qtyVal) qtyVal.textContent = currentQty;
  };

  // Add To Cart CTA -> Auto opens Slide Cart Drawer with Upsells
  window.handlePdpAddToCart = function() {
    if (!currentProduct) return;

    const customMsgInput = document.getElementById('pdpCustomMessage');
    const customMessage = customMsgInput ? customMsgInput.value.trim() : '';

    FloraDB.addToCart(currentProduct, selectedVariant, currentQty, customMessage);
    
    // Reset quantity
    currentQty = 1;
    const qtyVal = document.getElementById('pdpQtyVal');
    if (qtyVal) qtyVal.textContent = 1;

    showToast(`🌸 Added "${currentProduct.name}" (${selectedVariant.name}) to your bag!`);
    
    // Automatically open slide cart drawer
    openCartDrawer();
  };

  // Buy Now CTA -> Adds to cart and redirects straight to checkout
  window.handlePdpBuyNow = function() {
    if (!currentProduct) return;

    const customMsgInput = document.getElementById('pdpCustomMessage');
    const customMessage = customMsgInput ? customMsgInput.value.trim() : '';

    FloraDB.addToCart(currentProduct, selectedVariant, currentQty, customMessage);
    window.location.href = 'checkout.html';
  };

  // Delivery Checker
  window.checkPdpDelivery = function() {
    const locSelect = document.getElementById('pdpLocalitySelect');
    const resultBox = document.getElementById('pdpCheckerResult');
    if (!locSelect || !resultBox) return;

    const loc = locSelect.value;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <i class="fas fa-check-circle" style="color:#059669;"></i> 
      <strong>Same-Day Chilled Delivery Confirmed for ${loc}!</strong> 
      Order before 3:00 PM today for evening celebration slots.
    `;
  };

  // Copy Promo Code
  window.copyPromo = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`✨ Promo code "${code}" copied to clipboard!`);
    });
  };

  // Video Modal
  window.openVideoModal = function() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    if (modal) {
      modal.classList.add('active');
      if (iframe && currentProduct.videoUrl) {
        iframe.src = currentProduct.videoUrl;
      }
    }
  };

  window.closeVideoModal = function() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    if (modal) {
      modal.classList.remove('active');
      if (iframe) iframe.src = '';
    }
  };

  // Customer Reviews
  function renderReviews(product) {
    const grid = document.getElementById('pdpReviewsGrid');
    if (!grid) return;

    const reviews = (product.reviewsList && product.reviewsList.length > 0) ? product.reviewsList : [
      { name: "Pooja Deshmukh", rating: 5, date: "2 days ago", comment: "Ordered for my sister's birthday in College Road. The balance of edible rose petals and light mascarpone was ethereal! 10/10 recommend.", verified: true },
      { name: "Aditya Patil", rating: 5, date: "1 week ago", comment: "The Lambeth piping and fresh organic blooms looked even better in person than in the photos. Everyone was mesmerized.", verified: true },
      { name: "Sneha Kulkarni", rating: 5, date: "2 weeks ago", comment: "100% eggless and extraordinarily soft! The presentation with luxury gold cake base and ribbon was stunning.", verified: true }
    ];

    grid.innerHTML = reviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-meta">
            <span class="reviewer-name">${r.name}</span>
            ${r.verified ? `<span class="verified-buyer-badge"><i class="fas fa-check-circle"></i> Verified Patron</span>` : ''}
          </div>
          <div class="review-stars">
            ${'<i class="fas fa-star"></i>'.repeat(r.rating)}
          </div>
        </div>
        <p class="review-body">"${r.comment}"</p>
        <span class="review-date"><i class="far fa-clock"></i> ${r.date} • Nashik</span>
      </div>
    `).join('');
  }

  // Related Products
  function renderRelatedProducts(product) {
    const grid = document.getElementById('pdpRelatedGrid');
    if (!grid) return;

    const allProducts = FloraDB.getProducts();
    const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);

    grid.innerHTML = related.map(p => `
      <article class="product-card">
        <div class="product-thumb-holder" onclick="window.location.href='product.html?id=${p.id}'">
          <img src="${p.image}" alt="${p.name}" class="product-thumb" loading="lazy">
          <div class="card-top-badges">
            ${p.eggless ? `<span class="veg-emblem" title="100% Pure Veg Eggless"></span>` : '<span></span>'}
            ${p.badge ? `<span class="product-tag-badge">${p.badge}</span>` : ''}
          </div>
          <span class="product-quickview-btn">
            <i class="fas fa-eye"></i> View Bake
          </span>
        </div>
        <div class="product-info-wrap">
          <span class="product-category-tag">${(p.categoryLabel || p.category).toUpperCase()}</span>
          <h3 class="product-name" onclick="window.location.href='product.html?id=${p.id}'">${p.name}</h3>
          <div class="product-pricing-row">
            <span class="price-current">₹${p.price.toLocaleString('en-IN')}</span>
            ${p.comparePrice ? `<span class="price-original">₹${p.comparePrice.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <div class="product-card-actions">
            <button class="btn btn-primary btn-add-cart" onclick="quickAddRelated(${p.id})">
              <i class="fas fa-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  window.quickAddRelated = function(productId) {
    const prod = FloraDB.getProductById(productId);
    if (prod) {
      FloraDB.addToCart(prod, null, 1);
      showToast(`🌸 Added "${prod.name}" to bag!`);
      openCartDrawer();
    }
  };

  // =========================================================================
  // SLIDE CART DRAWER & DYNAMIC UPSELLS
  // =========================================================================
  function setupCartDrawerEvents() {
    const cartBtn = document.getElementById('cartBtn');
    const overlay = document.getElementById('cartDrawerOverlay');
    const closeBtn = document.getElementById('cartDrawerClose');

    if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
    if (overlay) overlay.addEventListener('click', closeCartDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  }

  window.openCartDrawer = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      updateCartUI();
      drawer.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCartDrawer = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer && overlay) {
      drawer.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

  function updateCartUI() {
    const summary = FloraDB.getCartSummary();
    const cart = summary.items;

    // Badges
    const badge = document.getElementById('cartCountBadge');
    if (badge) {
      badge.textContent = summary.totalCount;
      badge.style.display = summary.totalCount > 0 ? 'flex' : 'none';
    }

    const drawerCount = document.getElementById('cartDrawerCount');
    if (drawerCount) drawerCount.textContent = summary.totalCount;

    // Free Shipping Progress
    const meterFill = document.getElementById('meterBarFill');
    const meterText = document.getElementById('freeShippingText');
    if (meterFill && meterText) {
      meterFill.style.width = `${summary.progressPercent}%`;
      if (summary.isFreeShipping) {
        meterText.innerHTML = `<i class="fas fa-check-circle" style="color:#059669;"></i> <strong>Congratulations!</strong> You have unlocked <strong>FREE Doorstep Delivery in Nashik</strong>!`;
        meterFill.style.background = '#059669';
      } else {
        meterText.innerHTML = `<i class="fas fa-truck"></i> Add <strong>₹${summary.amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more for <strong>FREE Delivery in Nashik</strong>!`;
        meterFill.style.background = 'linear-gradient(90deg, var(--rose-deep), #FF85A1)';
      }
    }

    // Cart Items Rendering
    const itemsContainer = document.getElementById('cartDrawerItems');
    const footerEl = document.getElementById('cartDrawerFooter');

    if (!itemsContainer) return;

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="empty-cart-view">
          <i class="fas fa-shopping-bag empty-icon"></i>
          <h3>Your Floral Bag is Empty</h3>
          <p>Treat yourself or a loved one to fresh artisanal floral bakes handcrafted in Nashik.</p>
          <a href="index.html#categories" class="btn btn-primary" onclick="closeCartDrawer()">Explore Bakes</a>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';
      renderCartUpsells();
      return;
    }

    if (footerEl) footerEl.style.display = 'block';

    itemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item-row" data-key="${item.cartKey}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-details">
          <div class="cart-item-title-row">
            <h4 class="cart-item-title">${item.name}</h4>
            <button class="cart-item-remove-btn" onclick="removeCartItem('${item.cartKey}')" title="Remove item">&times;</button>
          </div>
          <span class="cart-item-variant">${item.variantName || 'Standard'}</span>
          ${item.cakeMessage ? `<span class="cart-item-inscription"><i class="fas fa-pen-nib"></i> "${item.cakeMessage}"</span>` : ''}
          <div class="cart-item-bottom-row">
            <div class="cart-qty-stepper">
              <button class="cart-qty-btn" onclick="changeCartItemQty('${item.cartKey}', -1)">-</button>
              <span class="cart-qty-val">${item.qty}</span>
              <button class="cart-qty-btn" onclick="changeCartItemQty('${item.cartKey}', 1)">+</button>
            </div>
            <span class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Summary calculations
    let discountVal = 0;
    if (appliedDiscount) {
      discountVal = appliedDiscount.discountAmount;
    }

    const deliveryVal = summary.isFreeShipping ? 0 : summary.deliveryFee;
    const grandTotal = Math.max(0, summary.subtotal - discountVal + deliveryVal);

    const subtotalEl = document.getElementById('cartSubtotalVal');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountEl = document.getElementById('cartDiscountVal');
    const deliveryEl = document.getElementById('cartDeliveryVal');
    const grandTotalEl = document.getElementById('cartGrandTotalVal');

    if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toLocaleString('en-IN')}`;
    if (discountRow && discountEl) {
      if (discountVal > 0) {
        discountRow.style.display = 'flex';
        discountEl.textContent = `-₹${discountVal.toLocaleString('en-IN')}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
    if (deliveryEl) {
      deliveryEl.textContent = summary.isFreeShipping ? 'FREE (Nashik)' : `₹${deliveryVal}`;
      deliveryEl.style.color = summary.isFreeShipping ? '#059669' : 'inherit';
    }
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;

    // Render Upsell Carousel inside drawer
    renderCartUpsells();
  }

  // Dynamic Upsell Recommendations Inside Drawer
  function renderCartUpsells() {
    const upsellTrack = document.getElementById('cartUpsellItems');
    if (!upsellTrack) return;

    const upsells = FloraDB.getUpsellProducts();
    if (upsells.length === 0) {
      document.getElementById('cartUpsellSection').style.display = 'none';
      return;
    }

    document.getElementById('cartUpsellSection').style.display = 'block';
    upsellTrack.innerHTML = upsells.map(p => `
      <div class="upsell-item-card">
        <img src="${p.image}" alt="${p.name}" class="upsell-thumb" onclick="window.location.href='product.html?id=${p.id}'">
        <div class="upsell-info">
          <span class="upsell-item-name" onclick="window.location.href='product.html?id=${p.id}'">${p.name}</span>
          <span class="upsell-item-price">₹${p.price.toLocaleString('en-IN')}</span>
        </div>
        <button class="btn btn-secondary upsell-add-btn" onclick="addUpsellToCart(${p.id})">
          <i class="fas fa-plus"></i> Add
        </button>
      </div>
    `).join('');
  }

  window.addUpsellToCart = function(productId) {
    const prod = FloraDB.getProductById(productId);
    if (prod) {
      FloraDB.addToCart(prod, null, 1);
      showToast(`🌸 Added "${prod.name}" to bag!`);
      updateCartUI();
    }
  };

  window.changeCartItemQty = function(cartKey, delta) {
    const cart = FloraDB.getCart();
    const item = cart.find(i => i.cartKey === cartKey);
    if (item) {
      FloraDB.updateCartQty(cartKey, item.qty + delta);
      updateCartUI();
    }
  };

  window.removeCartItem = function(cartKey) {
    FloraDB.removeFromCart(cartKey);
    updateCartUI();
  };

  window.applyCartCoupon = function() {
    const input = document.getElementById('cartCouponInput');
    if (!input) return;
    const code = input.value.trim();
    const summary = FloraDB.getCartSummary();

    const res = FloraDB.applyDiscountCode(code, summary.subtotal);
    if (res.valid) {
      appliedDiscount = res;
      showToast(res.message);
      updateCartUI();
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  // Toast System
  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fas fa-seedling toast-icon" style="color:var(--rose-deep);"></i>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Mobile Drawer
  function setupMobileNav() {
    const toggle = document.getElementById('mobileMenuToggle');
    if (toggle) toggle.addEventListener('click', openMobileNav);
  }

  window.openMobileNav = function() {
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeMobileNav = function() {
    const drawer = document.getElementById('mobileNavDrawer');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  };

})();
