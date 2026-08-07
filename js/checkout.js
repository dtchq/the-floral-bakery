/**
 * THE FLORA BAKERY - DEDICATED CHECKOUT ENGINE
 * High-Converting, Frictionless Guest Checkout with Real-Time Validation,
 * Live Order Summary, Nashik Delivery Scheduling, and Instant Admin Sync.
 */

(function() {
  'use strict';

  let appliedDiscount = null;
  let selectedPaymentMethod = 'COD';

  document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
  });

  function initCheckoutPage() {
    const summary = FloraDB.getCartSummary();
    if (summary.items.length === 0) {
      showToast('⚠️ Your shopping bag is empty. Please select a bake first.');
      setTimeout(() => {
        window.location.href = 'index.html#categories';
      }, 1500);
      return;
    }

    // Set default delivery date to today/tomorrow
    const dateInput = document.getElementById('deliveryDate');
    if (dateInput) {
      const today = new Date();
      const minDate = today.toISOString().split('T')[0];
      dateInput.min = minDate;
      
      // Default to today if before 4pm, else tomorrow
      const hours = today.getHours();
      const defaultDate = new Date();
      if (hours >= 16) {
        defaultDate.setDate(defaultDate.getDate() + 1);
      }
      dateInput.value = defaultDate.toISOString().split('T')[0];
    }

    renderOrderSummary();

    // Listen for FloraDB data changes
    window.addEventListener('flora:data-changed', () => {
      renderOrderSummary();
    });
  }

  // Render Order Summary Sidebar & Mobile Bar
  function renderOrderSummary() {
    const summary = FloraDB.getCartSummary();
    const cart = summary.items;

    const countBadge = document.getElementById('summaryCountBadge');
    if (countBadge) countBadge.textContent = `${summary.totalCount} ${summary.totalCount === 1 ? 'item' : 'items'}`;

    const itemsList = document.getElementById('summaryItemsList');
    if (itemsList) {
      itemsList.innerHTML = cart.map(item => `
        <div class="summary-item-row">
          <div class="summary-item-img-wrap">
            <img src="${item.image}" alt="${item.name}" class="summary-item-img">
            <span class="summary-qty-bubble">${item.qty}</span>
          </div>
          <div class="summary-item-details">
            <h4 class="summary-item-name">${item.name}</h4>
            <span class="summary-item-variant">${item.variantName || 'Standard'}</span>
            ${item.cakeMessage ? `<span class="summary-item-message"><i class="fas fa-pen-nib"></i> "${item.cakeMessage}"</span>` : ''}
          </div>
          <span class="summary-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
        </div>
      `).join('');
    }

    // Calculation Breakdown
    let discountAmount = 0;
    if (appliedDiscount) {
      discountAmount = appliedDiscount.discountAmount;
    }

    const deliveryFee = summary.isFreeShipping ? 0 : summary.deliveryFee;
    const grandTotal = Math.max(0, summary.subtotal - discountAmount + deliveryFee);

    const subtotalEl = document.getElementById('summarySubtotalVal');
    const discountRow = document.getElementById('summaryDiscountRow');
    const discountCodeEl = document.getElementById('summaryDiscountCode');
    const discountValEl = document.getElementById('summaryDiscountVal');
    const deliveryEl = document.getElementById('summaryDeliveryVal');
    const grandTotalEl = document.getElementById('summaryGrandTotalVal');
    const mobileBarTotal = document.getElementById('mobileBarTotal');
    const mobileBarAmount = document.getElementById('mobileBarAmount');

    if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toLocaleString('en-IN')}`;

    if (discountRow && discountValEl) {
      if (discountAmount > 0) {
        discountRow.style.display = 'flex';
        discountCodeEl.textContent = appliedDiscount.code;
        discountValEl.textContent = `-₹${discountAmount.toLocaleString('en-IN')}`;
      } else {
        discountRow.style.display = 'none';
      }
    }

    if (deliveryEl) {
      deliveryEl.textContent = summary.isFreeShipping ? 'FREE (Nashik)' : `₹${deliveryFee}`;
      deliveryEl.style.color = summary.isFreeShipping ? '#059669' : 'inherit';
    }

    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    if (mobileBarTotal) mobileBarTotal.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
    if (mobileBarAmount) mobileBarAmount.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  }

  // Mobile Summary Accordion Toggle
  window.toggleMobileSummary = function() {
    const panel = document.getElementById('checkoutSummaryPanel');
    const arrow = document.getElementById('mobileSummaryArrow');
    if (panel) {
      panel.classList.toggle('mobile-open');
      if (arrow) {
        arrow.style.transform = panel.classList.contains('mobile-open') ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    }
  };

  // Payment Method Switcher
  window.handlePaymentMethodChange = function(method) {
    selectedPaymentMethod = method;
    const codCard = document.getElementById('codOptionCard');
    const onlineCard = document.getElementById('onlineOptionCard');
    const submitBtn = document.getElementById('checkoutSubmitBtn');

    if (codCard) codCard.classList.toggle('selected', method === 'COD');
    if (onlineCard) onlineCard.classList.toggle('selected', method === 'ONLINE');

    if (submitBtn) {
      if (method === 'COD') {
        submitBtn.innerHTML = `<i class="fas fa-check-circle"></i> Place Order (Cash on Delivery)`;
      } else {
        submitBtn.innerHTML = `<i class="fas fa-lock"></i> Proceed to Pay via UPI / Cards`;
      }
    }
  };

  // Apply Promo Code
  window.handleApplyPromo = function() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;
    const code = input.value.trim();
    const summary = FloraDB.getCartSummary();

    const res = FloraDB.applyDiscountCode(code, summary.subtotal);
    if (res.valid) {
      appliedDiscount = res;
      showToast(res.message);
      renderOrderSummary();
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  window.applySuggestedPromo = function(code) {
    const input = document.getElementById('promoCodeInput');
    if (input) input.value = code;
    handleApplyPromo();
  };

  // Handle Order Placement
  window.handlePlaceOrder = function(event) {
    event.preventDefault();

    const summary = FloraDB.getCartSummary();
    if (summary.items.length === 0) {
      showToast('⚠️ Your shopping bag is empty.');
      return;
    }

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const deliveryDate = document.getElementById('deliveryDate').value;
    const deliverySlot = document.getElementById('deliverySlot').value;
    const address = document.getElementById('deliveryAddress').value.trim();
    const locality = document.getElementById('deliveryLocality').value;
    const landmark = document.getElementById('deliveryLandmark').value.trim();
    const cakeMessage = document.getElementById('checkoutCakeMessage').value.trim();
    const notes = document.getElementById('orderNotes').value.trim();

    if (!name || !phone || !email || !address || !deliveryDate) {
      showToast('⚠️ Please complete all required fields marked with *');
      return;
    }

    // Phone format check (must have at least 10 digits)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      showToast('⚠️ Please enter a valid 10-digit mobile number.');
      return;
    }

    const submitBtn = document.getElementById('checkoutSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Confirming with Kitchen...`;
    }

    let discountAmount = 0;
    let discountCode = '';
    if (appliedDiscount) {
      discountAmount = appliedDiscount.discountAmount;
      discountCode = appliedDiscount.code;
    }

    const deliveryFee = summary.isFreeShipping ? 0 : summary.deliveryFee;
    const grandTotal = Math.max(0, summary.subtotal - discountAmount + deliveryFee);
    const fullAddress = `${address}${landmark ? ` (Near ${landmark})` : ''}, ${locality}, Nashik`;

    const orderData = {
      customerName: name,
      phone: phone,
      email: email,
      deliveryDate: deliveryDate,
      timeSlot: deliverySlot,
      address: fullAddress,
      locality: locality,
      landmark: landmark,
      cakeMessage: cakeMessage,
      notes: notes,
      items: summary.items,
      subtotal: summary.subtotal,
      deliveryFee: deliveryFee,
      discount: discountAmount,
      discountCode: discountCode,
      total: grandTotal,
      paymentMethod: selectedPaymentMethod
    };

    setTimeout(() => {
      // Save order to FloraDB
      const createdOrder = FloraDB.addOrder(orderData);

      // Redirect to Order Success page
      window.location.href = `order-success.html?orderId=${createdOrder.id}`;
    }, 600);
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

})();
