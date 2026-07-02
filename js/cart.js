// --- CART MANAGEMENT SYSTEM (SHARED) ---

const CART_KEY = 'hungrywebs_cart';

// Get cart from localStorage
function getCart() {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  // Dispatch custom event so other components or the checkout page know the cart updated
  window.dispatchEvent(new Event('cartUpdated'));
}

// Add item to cart
function addToCart(product) {
  let cart = getCart();
  
  // Find item with same ID and variant
  const existingItemIndex = cart.findIndex(item => 
    item.id === product.id && item.variant === product.variant
  );
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += parseInt(product.qty || 1);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      variant: product.variant || 'Default',
      qty: parseInt(product.qty || 1),
      source: product.source // 'tshirt', 'iphone', 'perfume'
    });
  }
  
  saveCart(cart);
  showToast(`Added ${product.name} (${product.variant}) to cart!`);
}

// Remove item from cart
function removeFromCart(id, variant) {
  let cart = getCart();
  cart = cart.filter(item => !(item.id === id && item.variant === variant));
  saveCart(cart);
}

// Update item quantity
function updateCartQty(id, variant, newQty) {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === id && item.variant === variant);
  
  if (itemIndex > -1) {
    if (newQty <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].qty = parseInt(newQty);
    }
    saveCart(cart);
  }
}

// Clear cart
function clearCart() {
  saveCart([]);
}

// Calculate subtotal
function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.qty), 0);
}

// Calculate item count
function getCartCount() {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.qty, 0);
}

// Update navigation cart badge
function updateCartBadge() {
  const badges = document.querySelectorAll('.nav-cart-count');
  const count = getCartCount();
  
  badges.forEach(badge => {
    badge.textContent = count;
    if (count === 0) {
      badge.style.display = 'none';
    } else {
      badge.style.display = 'flex';
    }
  });
}

// Show toast notification
function showToast(message, isError = false) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.innerHTML = `
    <span class="toast-icon">${isError ? '✕' : '✓'}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3000);
}

// Initialize badge on script load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
