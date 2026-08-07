/**
 * THE FLORA BAKERY - UNIVERSAL STOREFRONT LAYOUT ENGINE (v3.0)
 * Provides consistent, responsive Header, Mobile Drawer, Slide Cart Drawer, and Footer
 * across all public storefront pages with active link routing and real-time FloraDB sync.
 */

(function(window) {
  'use strict';

  const SiteLayout = {
    // Current Active Page Detection
    getCurrentPage() {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('shop.html') || path.endsWith('/shop')) return 'shop';
      if (path.includes('categories.html') || path.endsWith('/categories')) return 'categories';
      if (path.includes('about.html') || path.endsWith('/about')) return 'about';
      if (path.includes('contact.html') || path.endsWith('/contact')) return 'contact';
      if (path.includes('product.html') || path.endsWith('/product')) return 'product';
      if (path.includes('checkout.html') || path.endsWith('/checkout')) return 'checkout';
      if (path.includes('order-success.html') || path.endsWith('/order-success')) return 'order-success';
      return 'home';
    },

    // 1. Render Universal Announcement Bar & Header
    getHeaderHTML(activePage) {
      if (activePage === 'checkout') {
        return `
          <header class="checkout-header" id="siteHeader">
            <div class="container checkout-header-inner">
              <a href="index.html" class="brand-logo-wrap" aria-label="Return to Home">
                <img src="images/logo-icon.svg" alt="The Flora Bakery Logo" class="brand-logo-img" onerror="this.src='images/hero-floral-cake.jpg'">
                <div class="brand-text-block">
                  <span class="brand-name">THE FLORA BAKERY</span>
                  <span class="brand-tagline">Secure Checkout • Nashik</span>
                </div>
              </a>
              <div class="checkout-security-badge">
                <i class="fas fa-shield-alt security-lock-icon"></i>
                <span>256-Bit SSL Encrypted • 100% Pure Veg Patisserie</span>
              </div>
              <a href="shop.html" class="checkout-back-link">
                <i class="fas fa-arrow-left"></i> Return to Shop
              </a>
            </div>
          </header>
        `;
      }

      return `
        <!-- ANNOUNCEMENT BAR TICKER -->
        <aside class="announcement-bar" role="region" aria-label="Special Announcements">
          <div class="announcement-wrapper">
            <div class="announcement-track">
              <span class="announcement-item"><span class="badge-pill">SAME DAY</span> 🌸 Order before 3 PM for Chilled Same-Day Delivery across Nashik</span>
              <span class="announcement-item"><span class="badge-pill">100% EGGLESS</span> 🌿 All Creations are Pure Vegetarian & Crowned with Organic Edible Blooms</span>
              <span class="announcement-item"><span class="badge-pill">SPECIAL OFFER</span> ✨ Use Code <strong>FLORA10</strong> for 10% OFF on Orders Above ₹499</span>
              <span class="announcement-item"><span class="badge-pill">FREE SHIPPING</span> 🛵 Free Doorstep Delivery Across Nashik on Orders Over ₹999</span>
            </div>
          </div>
        </aside>

        <!-- STICKY SITE HEADER -->
        <header class="site-header" id="siteHeader">
          <div class="header-inner container">
            <button class="mobile-menu-toggle" id="mobileMenuToggle" onclick="window.openMobileNav()" aria-label="Open Navigation Menu">
              <i class="fas fa-bars"></i>
            </button>

            <a href="index.html" class="brand-logo-wrap" aria-label="The Flora Bakery Homepage">
              <img src="images/logo-icon.svg" alt="The Flora Bakery" class="brand-logo-img" onerror="this.src='images/hero-floral-cake.jpg'">
              <div class="brand-text-block">
                <span class="brand-name">THE FLORA BAKERY</span>
                <span class="brand-tagline">Artisanal Botanical Patisserie • Nashik</span>
              </div>
            </a>

            <!-- Universal Desktop Navigation -->
            <nav class="nav-menu" aria-label="Primary Navigation">
              <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
              <a href="shop.html" class="nav-link ${activePage === 'shop' ? 'active' : ''}">Shop Bakes</a>
              <a href="categories.html" class="nav-link ${activePage === 'categories' ? 'active' : ''}">Categories</a>
              <a href="about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About Us</a>
              <a href="contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Contact</a>
            </nav>

            <div class="header-actions">
              <a href="https://api.whatsapp.com/send?phone=917083517862&text=Hello%20The%20Flora%20Bakery!%20I%20would%20like%20to%20inquire%20about%20a%20bespoke%20floral%20cake." target="_blank" rel="noopener" class="concierge-link-btn" title="Chat with Head Baker on WhatsApp">
                <i class="fab fa-whatsapp"></i>
                <span class="concierge-text">Concierge</span>
              </a>

              <button class="action-icon-btn cart-trigger-btn" id="cartBtn" onclick="window.openCartDrawer()" aria-label="Open Shopping Bag">
                <i class="fas fa-shopping-bag"></i>
                <span class="cart-count-badge" id="cartCountBadge" style="display: none;">0</span>
              </button>
            </div>
          </div>
        </header>
      `;
    },

    // 2. Render Universal Mobile Navigation Drawer
    getMobileDrawerHTML(activePage) {
      if (activePage === 'checkout') return '';

      return `
        <div class="mobile-nav-drawer" id="mobileNavDrawer" onclick="if(event.target === this) window.closeMobileNav()">
          <div class="mobile-nav-content">
            <div class="mobile-drawer-header">
              <div class="brand-text-block">
                <span class="brand-name">THE FLORA BAKERY</span>
                <span class="brand-tagline">Artisanal Patisserie • Nashik</span>
              </div>
              <button class="drawer-close-btn" onclick="window.closeMobileNav()" aria-label="Close menu">&times;</button>
            </div>
            
            <ul class="mobile-nav-links">
              <li><a href="index.html" class="mobile-nav-link ${activePage === 'home' ? 'active' : ''}" onclick="window.closeMobileNav()"><i class="fas fa-home"></i> Home</a></li>
              <li><a href="shop.html" class="mobile-nav-link ${activePage === 'shop' ? 'active' : ''}" onclick="window.closeMobileNav()"><i class="fas fa-birthday-cake"></i> Shop All Bakes</a></li>
              <li><a href="categories.html" class="mobile-nav-link ${activePage === 'categories' ? 'active' : ''}" onclick="window.closeMobileNav()"><i class="fas fa-th-large"></i> Explore Categories</a></li>
              <li><a href="about.html" class="mobile-nav-link ${activePage === 'about' ? 'active' : ''}" onclick="window.closeMobileNav()"><i class="fas fa-leaf"></i> About Our Bakery</a></li>
              <li><a href="contact.html" class="mobile-nav-link ${activePage === 'contact' ? 'active' : ''}" onclick="window.closeMobileNav()"><i class="fas fa-envelope"></i> Contact & Studio</a></li>
            </ul>

            <div class="mobile-drawer-promo">
              <div class="drawer-promo-card">
                <span class="promo-pill">SPECIAL</span>
                <p class="promo-text">Get 10% OFF with code <strong>FLORA10</strong></p>
              </div>
            </div>

            <div class="mobile-drawer-footer">
              <p class="drawer-contact-info"><i class="fas fa-map-marker-alt"></i> Sai Nath Nagar, Nashik 422009</p>
              <p class="drawer-contact-info"><i class="fas fa-phone-alt"></i> +91 70835 17862</p>
              <a href="https://api.whatsapp.com/send?phone=917083517862&text=Hello%20The%20Flora%20Bakery!" target="_blank" class="drawer-whatsapp-btn">
                <i class="fab fa-whatsapp"></i> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
    },

    // 3. Render Universal Slide-Out Cart Drawer
    getCartDrawerHTML() {
      return `
        <div class="cart-drawer-overlay" id="cartDrawerOverlay" onclick="window.closeCartDrawer()"></div>
        <aside class="cart-drawer" id="cartDrawer" role="dialog" aria-modal="true" aria-label="Shopping Bag">
          <div class="cart-drawer-header">
            <div class="cart-drawer-title-wrap">
              <i class="fas fa-shopping-bag cart-title-icon"></i>
              <h2 class="cart-drawer-title">Your Shopping Bag</h2>
              <span class="cart-drawer-count-badge" id="cartDrawerCount">0 items</span>
            </div>
            <button class="cart-drawer-close" onclick="window.closeCartDrawer()" aria-label="Close bag">&times;</button>
          </div>

          <!-- FREE SHIPPING PROGRESS METER -->
          <div class="cart-shipping-meter" id="cartShippingMeter">
            <div class="shipping-meter-text" id="shippingMeterText">
              <i class="fas fa-truck text-rose"></i> Add <span class="text-bold" id="shippingMeterNeeded">₹400</span> for <strong>FREE Doorstep Delivery</strong> in Nashik!
            </div>
            <div class="shipping-meter-bar">
              <div class="shipping-meter-fill" id="shippingMeterFill" style="width: 0%;"></div>
            </div>
          </div>

          <!-- CART ITEMS LIST CONTAINER -->
          <div class="cart-drawer-body" id="cartDrawerBody">
            <!-- Dynamic Items or Empty State -->
          </div>

          <!-- CART DRAWER FOOTER & CHECKOUT CTA -->
          <div class="cart-drawer-footer" id="cartDrawerFooter">
            <!-- Promo Code Input Box -->
            <div class="cart-promo-box">
              <div class="promo-input-group">
                <i class="fas fa-tag promo-icon"></i>
                <input type="text" id="cartPromoInput" class="promo-input" placeholder="Coupon Code (e.g. FLORA10)" style="text-transform: uppercase;">
                <button type="button" class="promo-apply-btn" onclick="window.applyCartDrawerPromo()">Apply</button>
              </div>
              <div id="cartPromoMessage" class="promo-message"></div>
            </div>

            <!-- Totals Breakdown -->
            <div class="cart-totals-breakdown">
              <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-val" id="cartDrawerSubtotal">₹0</span>
              </div>
              <div class="total-row" id="cartDrawerDiscountRow" style="display: none;">
                <span class="total-label text-success"><i class="fas fa-check-circle"></i> Discount Applied</span>
                <span class="total-val text-success" id="cartDrawerDiscountVal">-₹0</span>
              </div>
              <div class="total-row">
                <span class="total-label">Estimated Delivery</span>
                <span class="total-val" id="cartDrawerShipping">₹0</span>
              </div>
              <div class="total-row grand-total-row">
                <span class="total-label">Grand Total</span>
                <span class="total-val" id="cartDrawerGrandTotal">₹0</span>
              </div>
            </div>

            <!-- Savings Badge -->
            <div class="cart-savings-badge" id="cartDrawerSavingsBadge" style="display: none;">
              🎉 You are saving <span id="cartDrawerSavingsAmount">₹0</span> on this order!
            </div>

            <!-- Direct Checkout Action Button -->
            <a href="checkout.html" class="cart-checkout-btn" id="cartCheckoutBtn">
              <span>Proceed to Checkout</span>
              <i class="fas fa-arrow-right"></i>
            </a>

            <div class="cart-secure-footer-notes">
              <span><i class="fas fa-shield-alt"></i> 100% Secure Checkout</span>
              <span><i class="fas fa-seedling"></i> Pure Vegetarian Guarantee</span>
            </div>
          </div>
        </aside>
      `;
    },

    // 4. Render Universal Luxury Storefront Footer
    getFooterHTML(activePage) {
      if (activePage === 'checkout') {
        return `
          <footer class="checkout-minimal-footer">
            <div class="container text-center">
              <p class="footer-copyright">&copy; ${new Date().getFullYear()} The Flora Bakery Nashik. Handcrafted with love & edible florals.</p>
              <div class="footer-trust-mini">
                <span><i class="fas fa-lock"></i> SSL Secured</span> •
                <span><i class="fas fa-leaf"></i> 100% Pure Veg</span> •
                <span><i class="fas fa-truck"></i> Chilled Same-Day Delivery</span>
              </div>
            </div>
          </footer>
        `;
      }

      return `
        <footer class="site-footer">
          <div class="container footer-container">
            <div class="footer-grid">
              
              <!-- Col 1: Brand & Philosophy -->
              <div class="footer-col brand-col">
                <a href="index.html" class="footer-logo">
                  <img src="images/logo-icon.svg" alt="The Flora Bakery Logo" class="footer-logo-img" onerror="this.src='images/hero-floral-cake.jpg'">
                  <div class="brand-text-block">
                    <span class="brand-name">THE FLORA BAKERY</span>
                    <span class="brand-tagline">Artisanal Patisserie • Nashik</span>
                  </div>
                </a>
                <p class="footer-desc">
                  Nashik’s premier 100% pure vegetarian boutique patisserie. We craft bespoke cakes, French craquelin pastries, and festive hampers adorned with certified organic edible florals.
                </p>
                <div class="footer-veg-badge">
                  <span class="veg-icon-dot"></span>
                  <span class="veg-text">100% Pure Vegetarian & Eggless Certified</span>
                </div>
              </div>

              <!-- Col 2: Quick Links -->
              <div class="footer-col">
                <h4 class="footer-heading">Storefront</h4>
                <ul class="footer-links">
                  <li><a href="index.html"><i class="fas fa-chevron-right"></i> Home</a></li>
                  <li><a href="shop.html"><i class="fas fa-chevron-right"></i> Shop All Bakes</a></li>
                  <li><a href="categories.html"><i class="fas fa-chevron-right"></i> Collections</a></li>
                  <li><a href="about.html"><i class="fas fa-chevron-right"></i> Our Story & Chef</a></li>
                  <li><a href="contact.html"><i class="fas fa-chevron-right"></i> Custom Cake Inquiries</a></li>
                </ul>
              </div>

              <!-- Col 3: Signature Categories -->
              <div class="footer-col">
                <h4 class="footer-heading">Collections</h4>
                <ul class="footer-links">
                  <li><a href="shop.html?category=cakes"><i class="fas fa-birthday-cake"></i> Botanical Floral Cakes</a></li>
                  <li><a href="shop.html?category=pastries"><i class="fas fa-cookie"></i> French Craquelin Pastries</a></li>
                  <li><a href="shop.html?category=muffins"><i class="fas fa-bread-slice"></i> Chamomile & Lavender Muffins</a></li>
                  <li><a href="shop.html?category=combos"><i class="fas fa-gift"></i> Luxury Celebration Hampers</a></li>
                </ul>
              </div>

              <!-- Col 4: Studio Contact & Delivery -->
              <div class="footer-col">
                <h4 class="footer-heading">Studio & Concierge</h4>
                <ul class="footer-contact-list">
                  <li>
                    <i class="fas fa-map-marker-alt text-rose"></i>
                    <span>Shop 4, Flora Avenue, Sai Nath Nagar, Nashik 422009</span>
                  </li>
                  <li>
                    <i class="fas fa-phone-alt text-rose"></i>
                    <span>+91 70835 17862</span>
                  </li>
                  <li>
                    <i class="fas fa-clock text-rose"></i>
                    <span>Mon – Sun: 9:00 AM – 11:00 PM</span>
                  </li>
                  <li>
                    <i class="fas fa-truck text-rose"></i>
                    <span>Chilled Same-Day Delivery in Nashik</span>
                  </li>
                </ul>
                <div class="footer-social-row">
                  <a href="https://api.whatsapp.com/send?phone=917083517862&text=Hello%20The%20Flora%20Bakery!" target="_blank" rel="noopener" class="social-icon-btn whatsapp" aria-label="WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener" class="social-icon-btn instagram" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener" class="social-icon-btn facebook" aria-label="Facebook">
                    <i class="fab fa-facebook-f"></i>
                  </a>
                </div>
              </div>

            </div>

            <!-- Footer Bottom Strip -->
            <div class="footer-bottom-strip">
              <p class="footer-copyright">
                &copy; ${new Date().getFullYear()} The Flora Bakery Nashik. All Rights Reserved. Pure Vegetarian Floral Confections.
              </p>
              <div class="footer-payment-methods">
                <span class="pay-chip"><i class="fas fa-money-bill-wave"></i> Cash on Delivery</span>
                <span class="pay-chip"><i class="fas fa-mobile-alt"></i> Instant UPI / QR</span>
                <span class="pay-chip"><i class="fas fa-shield-alt"></i> SSL Protected</span>
              </div>
            </div>
          </div>
        </footer>
      `;
    },

    // 5. Initialize Universal Layout on Page
    init() {
      const activePage = this.getCurrentPage();

      // Mount or hydrate Header
      const headerRoot = document.getElementById('siteHeaderRoot') || document.getElementById('site-header-root');
      if (headerRoot) {
        headerRoot.innerHTML = this.getHeaderHTML(activePage);
      }

      // Mount or hydrate Mobile Drawer
      const mobileDrawerRoot = document.getElementById('mobileDrawerRoot') || document.getElementById('site-mobile-drawer-root');
      if (mobileDrawerRoot) {
        mobileDrawerRoot.innerHTML = this.getMobileDrawerHTML(activePage);
      }

      // Mount or hydrate Cart Drawer
      const cartDrawerRoot = document.getElementById('cartDrawerRoot') || document.getElementById('site-cart-drawer-root');
      if (cartDrawerRoot && activePage !== 'checkout') {
        cartDrawerRoot.innerHTML = this.getCartDrawerHTML();
      }

      // Mount or hydrate Footer
      const footerRoot = document.getElementById('siteFooterRoot') || document.getElementById('site-footer-root');
      if (footerRoot) {
        footerRoot.innerHTML = this.getFooterHTML(activePage);
      }

      // Bind Scroll Header Effect
      this.bindScrollHeader();

      // Bind FloraDB Cart Sync
      this.bindCartSync();

      // Initial Cart Badge and Content Update
      this.updateCartBadge();
      if (activePage !== 'checkout') {
        this.renderCartDrawerContent();
      }
    },

    bindScrollHeader() {
      const header = document.getElementById('siteHeader');
      if (!header) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }, { passive: true });
    },

    bindCartSync() {
      // Listen for local custom events
      window.addEventListener('flora:cart-updated', () => {
        this.updateCartBadge();
        this.renderCartDrawerContent();
      });

      // Listen for cross-tab storage changes
      window.addEventListener('storage', (e) => {
        if (e.key === 'flora_cart_v3' || e.key === 'flora_discount_v3') {
          this.updateCartBadge();
          this.renderCartDrawerContent();
        }
      });
    },

    updateCartBadge() {
      if (!window.FloraDB) return;
      const count = window.FloraDB.getCartCount();
      const badges = document.querySelectorAll('#cartCountBadge, .cart-count-badge, #headerCartCount');
      badges.forEach(badge => {
        if (badge) {
          badge.textContent = count;
          badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
      });
    },

    // Render Slide Cart Drawer Body & Totals
    renderCartDrawerContent() {
      if (!window.FloraDB) return;

      const cartBody = document.getElementById('cartDrawerBody');
      const cartCountLabel = document.getElementById('cartDrawerCount');
      const subtotalEl = document.getElementById('cartDrawerSubtotal');
      const grandTotalEl = document.getElementById('cartDrawerGrandTotal');
      const shippingEl = document.getElementById('cartDrawerShipping');
      const discountRow = document.getElementById('cartDrawerDiscountRow');
      const discountValEl = document.getElementById('cartDrawerDiscountVal');
      const savingsBadge = document.getElementById('cartDrawerSavingsBadge');
      const savingsAmountEl = document.getElementById('cartDrawerSavingsAmount');
      const shippingMeter = document.getElementById('cartShippingMeter');
      const shippingMeterText = document.getElementById('shippingMeterText');
      const shippingMeterFill = document.getElementById('shippingMeterFill');
      const checkoutBtn = document.getElementById('cartCheckoutBtn');
      const cartFooter = document.getElementById('cartDrawerFooter');

      if (!cartBody) return;

      const cart = window.FloraDB.getCart();
      const summary = window.FloraDB.getCartSummary();
      const count = summary.totalCount;

      if (cartCountLabel) cartCountLabel.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;

      if (cart.length === 0) {
        cartBody.innerHTML = `
          <div class="cart-drawer-empty">
            <div class="empty-cart-icon"><i class="fas fa-shopping-basket"></i></div>
            <h3 class="empty-cart-title">Your shopping bag is empty</h3>
            <p class="empty-cart-desc">Explore our botanical floral cakes and freshly baked French pastries.</p>
            <a href="shop.html" class="btn btn-primary btn-explore-bakes" onclick="window.closeCartDrawer()">
              <i class="fas fa-birthday-cake"></i> Explore Bakes
            </a>
          </div>
        `;
        if (shippingMeter) shippingMeter.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
      }

      if (shippingMeter) shippingMeter.style.display = 'block';
      if (cartFooter) cartFooter.style.display = 'block';

      // Free shipping progress calculation
      const freeThreshold = summary.freeThreshold || 999;
      const progress = Math.min(100, Math.round((summary.subtotal / freeThreshold) * 100));
      if (shippingMeterFill) shippingMeterFill.style.width = `${progress}%`;

      if (summary.subtotal >= freeThreshold) {
        if (shippingMeterText) {
          shippingMeterText.innerHTML = `🎉 <strong>Congratulations!</strong> You have qualified for <strong>FREE Doorstep Delivery</strong> across Nashik!`;
        }
      } else {
        const needed = freeThreshold - summary.subtotal;
        if (shippingMeterText) {
          shippingMeterText.innerHTML = `<i class="fas fa-truck text-rose"></i> Add <span class="text-bold">₹${needed}</span> more for <strong>FREE Doorstep Delivery</strong>!`;
        }
      }

      // Check active applied discount
      const activeDiscount = window.FloraDB.getAppliedDiscount ? window.FloraDB.getAppliedDiscount() : null;
      let discountAmount = 0;
      if (activeDiscount) {
        const res = window.FloraDB.applyDiscountCode(activeDiscount.code, summary.subtotal);
        if (res.valid) discountAmount = res.discountAmount;
      }

      const finalShipping = summary.subtotal >= freeThreshold ? 0 : 99;
      const finalGrandTotal = Math.max(0, summary.subtotal - discountAmount + (summary.subtotal > 0 ? finalShipping : 0));

      if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal}`;
      if (shippingEl) shippingEl.textContent = finalShipping === 0 ? 'FREE' : `₹${finalShipping}`;
      if (grandTotalEl) grandTotalEl.textContent = `₹${finalGrandTotal}`;

      if (discountRow && discountValEl) {
        if (discountAmount > 0) {
          discountRow.style.display = 'flex';
          discountValEl.textContent = `-₹${discountAmount}`;
        } else {
          discountRow.style.display = 'none';
        }
      }

      const totalSavings = summary.savings + discountAmount + (summary.subtotal >= freeThreshold ? 99 : 0);
      if (savingsBadge && savingsAmountEl) {
        if (totalSavings > 0) {
          savingsBadge.style.display = 'block';
          savingsAmountEl.textContent = `₹${totalSavings}`;
        } else {
          savingsBadge.style.display = 'none';
        }
      }

      // Build Items HTML
      let itemsHTML = '<div class="cart-items-wrapper">';
      cart.forEach((item, index) => {
        itemsHTML += `
          <div class="cart-drawer-item" data-cart-key="${item.cartKey}">
            <img src="${item.image || 'images/category-pastries.jpg'}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/hero-floral-cake.jpg'">
            <div class="cart-item-details">
              <div class="cart-item-header-row">
                <a href="product.html?id=${item.id}" class="cart-item-name" onclick="window.closeCartDrawer()">${item.name}</a>
                <button type="button" class="cart-item-remove" onclick="window.removeCartItem('${item.cartKey}')" title="Remove item" aria-label="Remove item">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
              <div class="cart-item-variant">${item.variantName || 'Standard'} • <span class="text-veg">Pure Veg 🌿</span></div>
              ${item.cakeMessage ? `<div class="cart-item-msg"><i class="fas fa-pen-fancy"></i> "${item.cakeMessage}"</div>` : ''}
              <div class="cart-item-bottom-row">
                <div class="cart-qty-stepper">
                  <button type="button" class="qty-btn" onclick="window.updateCartItemQty('${item.cartKey}', -1)" aria-label="Decrease quantity">−</button>
                  <span class="qty-display">${item.qty}</span>
                  <button type="button" class="qty-btn" onclick="window.updateCartItemQty('${item.cartKey}', 1)" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-price-col">
                  <span class="item-price">₹${item.price * item.qty}</span>
                  ${item.comparePrice > item.price ? `<span class="item-compare-price">₹${item.comparePrice * item.qty}</span>` : ''}
                </div>
              </div>
            </div>
          </div>
        `;
      });
      itemsHTML += '</div>';

      // Upsell Recommendations
      const upsells = window.FloraDB.getUpsellProducts ? window.FloraDB.getUpsellProducts(cart).slice(0, 2) : [];
      if (upsells.length > 0) {
        itemsHTML += `
          <div class="cart-upsells-section">
            <h4 class="cart-upsell-heading">✨ Recommended Chef Add-ons</h4>
            <div class="cart-upsells-grid">
              ${upsells.map(up => `
                <div class="cart-upsell-card">
                  <img src="${up.image}" alt="${up.name}" class="upsell-img" onerror="this.src='images/category-pastries.jpg'">
                  <div class="upsell-info">
                    <span class="upsell-title">${up.name}</span>
                    <span class="upsell-price">₹${up.price}</span>
                  </div>
                  <button type="button" class="upsell-add-btn" onclick="window.quickAddUpsell('${up.id}')" aria-label="Add ${up.name} to bag">
                    <i class="fas fa-plus"></i> Add
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      cartBody.innerHTML = itemsHTML;
    }
  };

  // Global Drawer & Layout Controls
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
      document.body.style.overflow = '';
    }
  };

  window.openCartDrawer = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) {
      SiteLayout.renderCartDrawerContent();
      drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCartDrawer = function() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartDrawerOverlay');
    if (drawer) {
      drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  window.updateCartItemQty = function(cartKey, delta) {
    if (!window.FloraDB) return;
    const cart = window.FloraDB.getCart();
    const item = cart.find(i => i.cartKey === cartKey);
    if (!item) return;
    
    const newQty = item.qty + delta;
    window.FloraDB.updateCartItemQty(cartKey, newQty);
    SiteLayout.updateCartBadge();
    SiteLayout.renderCartDrawerContent();
  };

  window.removeCartItem = function(cartKey) {
    if (!window.FloraDB) return;
    window.FloraDB.removeFromCart(cartKey);
    SiteLayout.updateCartBadge();
    SiteLayout.renderCartDrawerContent();
    if (window.showToast) window.showToast('Item removed from bag', 'info');
  };

  window.quickAddUpsell = function(productId) {
    if (!window.FloraDB) return;
    const product = window.FloraDB.getProductById(productId);
    if (!product) return;
    window.FloraDB.addToCart(product, product.variants ? product.variants[0] : null, 1);
    SiteLayout.updateCartBadge();
    SiteLayout.renderCartDrawerContent();
    if (window.showToast) window.showToast(`Added ${product.name} to bag! 🌸`, 'success');
  };

  window.applyCartDrawerPromo = function() {
    const input = document.getElementById('cartPromoInput');
    const msgEl = document.getElementById('cartPromoMessage');
    if (!input || !window.FloraDB) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      if (msgEl) {
        msgEl.className = 'promo-message error';
        msgEl.textContent = 'Please enter a coupon code';
      }
      return;
    }

    const summary = window.FloraDB.getCartSummary();
    const res = window.FloraDB.applyDiscountCode(code, summary.subtotal);
    if (res.valid) {
      if (window.FloraDB.saveAppliedDiscount) {
        window.FloraDB.saveAppliedDiscount({ code: code, discountAmount: res.discountAmount });
      }
      if (msgEl) {
        msgEl.className = 'promo-message success';
        msgEl.textContent = `✨ ${res.message || 'Coupon applied successfully!'}`;
      }
      SiteLayout.renderCartDrawerContent();
    } else {
      if (msgEl) {
        msgEl.className = 'promo-message error';
        msgEl.textContent = res.message || 'Invalid or expired coupon code';
      }
    }
  };

  // Toast Utility
  window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-card toast-${type}`;
    const icon = type === 'success' ? 'check-circle' : (type === 'error' ? 'exclamation-circle' : 'info-circle');
    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  };

  // Auto-init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SiteLayout.init());
  } else {
    SiteLayout.init();
  }

  window.SiteLayout = SiteLayout;

})(window);
