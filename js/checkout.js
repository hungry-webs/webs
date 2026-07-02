// --- CHECKOUT OPERATIONS SCRIPT ---

let selectedShippingCost = 65.00; // Default PAXI
let selectedShippingName = 'PAXI';

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  initShippingOptions();
  initCheckoutSubmit();
});

// 1. Render Summary List & Totals
function renderCheckoutSummary() {
  const list = document.getElementById('checkoutSummaryList');
  const subtotalLabel = document.getElementById('checkoutSubtotal');
  const shippingLabel = document.getElementById('checkoutShipping');
  const totalLabel = document.getElementById('checkoutTotalPayable');
  const btn = document.getElementById('btnPlaceOrder');
  
  if (!list || !subtotalLabel || !totalLabel) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted); padding:20px 0; text-align:center;">Your shopping cart is currently empty.<br><br><a href="tshirt.html" class="btn btn-secondary" style="font-size:0.85rem;">Browse E-Commerce Store</a></div>';
    subtotalLabel.textContent = 'R0.00';
    if (shippingLabel) shippingLabel.textContent = 'R0.00';
    totalLabel.textContent = 'R0.00';
    
    // Disable inputs & submit button
    if (btn) btn.disabled = true;
    const inputs = document.querySelectorAll('.contact-input, input[type="radio"]');
    inputs.forEach(i => i.disabled = true);
    return;
  }
  
  if (btn) btn.disabled = false;
  list.innerHTML = '';
  
  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'summary-item';
    itemEl.innerHTML = `
      <div>
        <span class="summary-item-name">${item.name}</span>
        <span class="summary-item-qty">x${item.qty}</span>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Variant: ${item.variant}</div>
      </div>
      <span class="summary-item-price">R${(item.price * item.qty).toFixed(2)}</span>
    `;
    list.appendChild(itemEl);
  });
  
  const subtotal = getCartSubtotal();
  subtotalLabel.textContent = `R${subtotal.toFixed(2)}`;
  if (shippingLabel) shippingLabel.textContent = `R${selectedShippingCost.toFixed(2)}`;
  
  const total = subtotal + selectedShippingCost;
  totalLabel.textContent = `R${total.toFixed(2)}`;
}

// 2. Shipping Radio Toggles
function initShippingOptions() {
  const cards = document.querySelectorAll('.shipping-option-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Toggle card class
      cards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      
      // Update radio check
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      
      selectedShippingCost = parseFloat(card.dataset.cost);
      selectedShippingName = card.dataset.name;
      
      renderCheckoutSummary();
    });
  });
}

// 3. Place Order Submit
function initCheckoutSubmit() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validate card inputs
    const holder = document.getElementById('cardHolder').value.trim();
    const number = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('cardExpiry').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();
    
    if (!holder || !number || !expiry || !cvv) {
      showToast('Please enter your card payment details.', true);
      return;
    }
    
    // Check format (dummy check)
    if (number.length < 12 || cvv.length < 3) {
      showToast('Please enter valid credit/debit card numbers.', true);
      return;
    }
    
    const cart = getCart();
    const subtotal = getCartSubtotal();
    const total = subtotal + selectedShippingCost;
    const orderNumber = `HWB-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Trigger Success Modal
    openSuccessModal({
      orderNo: orderNumber,
      items: cart,
      subtotal: subtotal,
      shipping: selectedShippingCost,
      total: total,
      holder: holder
    });
    
    // Clear shopping cart
    clearCart();
    renderCheckoutSummary();
    
    // Reset Form
    form.reset();
  });
}

function openSuccessModal(order) {
  const overlay = document.getElementById('successModalOverlay');
  const receipt = document.getElementById('successReceipt');
  
  if (overlay && receipt) {
    let itemsRows = '';
    order.items.forEach(item => {
      itemsRows += `
        <div class="order-receipt-row">
          <span>${item.qty}x ${item.name}</span>
          <span>R${(item.price * item.qty).toFixed(2)}</span>
        </div>
      `;
    });
    
    receipt.innerHTML = `
      <div style="text-align:center; font-weight:700; border-bottom:1px dashed rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:12px;">
        HUNGRY WEBS STORE RECEIPT
      </div>
      <div class="order-receipt-row">
        <strong>Order Number:</strong>
        <strong>${order.orderNo}</strong>
      </div>
      <div class="order-receipt-row" style="margin-bottom:16px;">
        <span>Cardholder:</span>
        <span>${order.holder}</span>
      </div>
      
      <div style="border-bottom:1px dashed rgba(255,255,255,0.05); padding-bottom:6px; margin-bottom:10px;">
        ITEMS:
      </div>
      ${itemsRows}
      
      <div style="border-top:1px dashed rgba(255,255,255,0.05); padding-top:10px; margin-top:16px;">
        <div class="order-receipt-row">
          <span>Subtotal:</span>
          <span>R${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="order-receipt-row">
          <span>Shipping (${selectedShippingName}):</span>
          <span>R${order.shipping.toFixed(2)}</span>
        </div>
        <div class="order-receipt-row" style="font-size:0.95rem; font-weight:700; color:var(--secondary); margin-top:6px; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px;">
          <span>Total Paid:</span>
          <span>R${order.total.toFixed(2)}</span>
        </div>
      </div>
    `;
    
    overlay.classList.add('active');
  }
}
