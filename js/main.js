// --- GLOBAL UI & NAVIGATION CONTROLLER ---

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCartDrawer();
  highlightActiveLink();
});

// Mobile Hamburger Menu
function initMobileMenu() {
  const hamburger = document.getElementById('hamburgerMenu');
  const navMenu = document.getElementById('navMenu');
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking links
    const navLinks = navMenu.querySelectorAll('a:not(.nav-dropdown-toggle)');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

// Interactive Cart Drawer Rendering
function initCartDrawer() {
  const cartBtn = document.getElementById('navCartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeBtn = document.getElementById('closeCartDrawer');
  const overlay = document.getElementById('cartOverlay');
  
  if (cartBtn && cartDrawer) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartDrawer);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeCartDrawer);
  }
  
  // Re-render drawer whenever cart items change
  window.addEventListener('cartUpdated', renderCartDrawer);
  
  // Render on initial load
  renderCartDrawer();
}

function openCartDrawer() {
  const cartDrawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (cartDrawer && overlay) {
    cartDrawer.classList.add('open');
    overlay.classList.add('open');
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const cartDrawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (cartDrawer && overlay) {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('open');
  }
}

// Render items inside the cart drawer
function renderCartDrawer() {
  const itemsContainer = document.getElementById('cartDrawerItems');
  const subtotalLabel = document.getElementById('cartDrawerSubtotal');
  
  if (!itemsContainer) return;
  
  const cart = getCart();
  
  if (cart.length === 0) {
    itemsContainer.innerHTML = '<div class="cart-empty-message">Your shopping cart is empty.<br>Browse our stores to add items!</div>';
    if (subtotalLabel) subtotalLabel.textContent = 'R0.00';
    return;
  }
  
  itemsContainer.innerHTML = '';
  
  cart.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    
    // Fallback if image doesn't exist yet
    const imgPath = item.image || 'images/placeholder.png';
    
    itemEl.innerHTML = `
      <div class="cart-item-img">
        <img src="${imgPath}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-variant">Variant: ${item.variant}</div>
        <div class="cart-item-price">R${item.price.toFixed(2)}</div>
        <div class="cart-item-qty-row">
          <div class="qty-control">
            <button class="qty-btn dec-btn" data-id="${item.id}" data-variant="${item.variant}">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn inc-btn" data-id="${item.id}" data-variant="${item.variant}">+</button>
          </div>
          <span class="cart-item-remove" data-id="${item.id}" data-variant="${item.variant}">Remove</span>
        </div>
      </div>
    `;
    
    itemsContainer.appendChild(itemEl);
  });
  
  if (subtotalLabel) {
    subtotalLabel.textContent = `R${getCartSubtotal().toFixed(2)}`;
  }
  
  // Attach Event Listeners to buttons inside drawer
  const incButtons = itemsContainer.querySelectorAll('.inc-btn');
  const decButtons = itemsContainer.querySelectorAll('.dec-btn');
  const removeButtons = itemsContainer.querySelectorAll('.cart-item-remove');
  
  incButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const variant = e.target.dataset.variant;
      const item = cart.find(i => i.id === id && i.variant === variant);
      if (item) {
        updateCartQty(id, variant, item.qty + 1);
      }
    });
  });
  
  decButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const variant = e.target.dataset.variant;
      const item = cart.find(i => i.id === id && i.variant === variant);
      if (item) {
        updateCartQty(id, variant, item.qty - 1);
      }
    });
  });
  
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const variant = e.target.dataset.variant;
      removeFromCart(id, variant);
      showToast('Item removed from cart.');
    });
  });
}

// Highlight the current page link in navbar
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split('/').pop() || 'index.html';
  
  const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === pageName) {
      link.classList.add('active');
      
      // If inside dropdown, make parent active
      const parentDropdown = link.closest('.nav-item-dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.nav-link');
        if (toggle) toggle.classList.add('active');
      }
    } else {
      link.classList.remove('active');
    }
  });
}
