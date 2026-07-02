// --- EVENT TICKETING & ORGANIZER PORTAL SCRIPT ---

let selectedTier = 'GA';
let ticketPrice = 150.00;
let ticketQty = 1;

let mockTickets = [
  { id: 'TKT-108', buyer: 'Tony Stark', tier: 'VIP', qty: 2, price: 1000, status: 'Active' },
  { id: 'TKT-109', buyer: 'Steve Rogers', tier: 'GA', qty: 1, price: 150, status: 'Active' },
  { id: 'TKT-110', buyer: 'Natasha Romanoff', tier: 'VIP', qty: 1, price: 500, status: 'Checked In' }
];

document.addEventListener('DOMContentLoaded', () => {
  initTicketTierSelect();
  initQtyControl();
  initPurchaseSubmit();
  initOrgDashboardToggle();
});

// 1. Ticket Tier Selection
function initTicketTierSelect() {
  const cards = document.querySelectorAll('.ticket-type-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const activeCard = document.querySelector('.ticket-type-card.active');
      if (activeCard) activeCard.classList.remove('active');
      
      card.classList.add('active');
      selectedTier = card.dataset.tier;
      ticketPrice = parseFloat(card.dataset.price);
      
      updateTotal();
    });
  });
}

// 2. Quantity Controls
function initQtyControl() {
  const decBtn = document.getElementById('ticketDec');
  const incBtn = document.getElementById('ticketInc');
  const qtyVal = document.getElementById('ticketQtyVal');
  
  if (decBtn && incBtn && qtyVal) {
    decBtn.addEventListener('click', () => {
      if (ticketQty > 1) {
        ticketQty--;
        qtyVal.textContent = ticketQty;
        updateTotal();
      }
    });
    
    incBtn.addEventListener('click', () => {
      if (ticketQty < 10) {
        ticketQty++;
        qtyVal.textContent = ticketQty;
        updateTotal();
      }
    });
  }
}

function updateTotal() {
  const totalLabel = document.getElementById('ticketTotalAmount');
  if (totalLabel) {
    totalLabel.textContent = `R${(ticketPrice * ticketQty).toFixed(2)}`;
  }
}

// 3. Purchase Submit
function initPurchaseSubmit() {
  const btn = document.getElementById('btnBuyTicket');
  if (!btn) return;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const buyerName = document.getElementById('buyerName').value.trim();
    const buyerEmail = document.getElementById('buyerEmail').value.trim();
    
    if (!buyerName || !buyerEmail) {
      showToast('Please complete all fields.', true);
      return;
    }
    
    const ticketId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const cost = ticketPrice * ticketQty;
    
    const newTkt = {
      id: ticketId,
      buyer: buyerName,
      tier: selectedTier,
      qty: ticketQty,
      price: cost,
      status: 'Active'
    };
    
    // Add to logs
    mockTickets.unshift(newTkt);
    
    // Show success dialog
    openTicketSuccessModal(newTkt);
    
    // Reset Form
    document.getElementById('buyerName').value = '';
    document.getElementById('buyerEmail').value = '';
    ticketQty = 1;
    const qtyVal = document.getElementById('ticketQtyVal');
    if (qtyVal) qtyVal.textContent = 1;
    
    updateTotal();
    renderOrgTable();
    updateOrgStats();
  });
}

function openTicketSuccessModal(tkt) {
  const overlay = document.getElementById('ticketModalOverlay');
  const qrBox = document.getElementById('ticketQRContainer');
  const details = document.getElementById('ticketModalDetails');
  
  if (overlay && qrBox && details) {
    // Generate simple SVG QR Code mockup
    qrBox.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 130px; height: 130px;">
        <rect x="0" y="0" width="100" height="100" fill="white" />
        <!-- Position finders -->
        <rect x="5" y="5" width="25" height="25" fill="black" />
        <rect x="10" y="10" width="15" height="15" fill="white" />
        <rect x="13" y="13" width="9" height="9" fill="black" />

        <rect x="70" y="5" width="25" height="25" fill="black" />
        <rect x="75" y="10" width="15" height="15" fill="white" />
        <rect x="78" y="13" width="9" height="9" fill="black" />

        <rect x="5" y="70" width="25" height="25" fill="black" />
        <rect x="10" y="75" width="15" height="15" fill="white" />
        <rect x="13" y="78" width="9" height="9" fill="black" />

        <!-- Mock bits -->
        <rect x="40" y="10" width="5" height="5" fill="black" />
        <rect x="50" y="15" width="10" height="5" fill="black" />
        <rect x="45" y="30" width="5" height="10" fill="black" />
        <rect x="60" y="45" width="15" height="5" fill="black" />
        <rect x="35" y="55" width="5" height="5" fill="black" />
        <rect x="50" y="70" width="10" height="10" fill="black" />
        <rect x="80" y="75" width="10" height="15" fill="black" />
      </svg>
    `;
    
    details.innerHTML = `
      <p><strong>Ticket ID:</strong> ${tkt.id}</p>
      <p><strong>Attendee:</strong> ${tkt.buyer}</p>
      <p><strong>Access Level:</strong> ${tkt.tier} Access</p>
      <p><strong>Quantity:</strong> ${tkt.qty} x Ticket(s)</p>
      <p><strong>Total Paid:</strong> R${tkt.price.toFixed(2)}</p>
      <p style="color:var(--secondary); font-size:0.75rem; margin-top:10px;">Please show this QR code at the entrance of Cyber Beats Festival.</p>
    `;
    
    overlay.classList.add('active');
  }
}

// 4. Organizer Dashboard Toggle
function initOrgDashboardToggle() {
  const btn = document.getElementById('toggleOrgBtn');
  const dash = document.getElementById('orgDashboard');
  const clientView = document.getElementById('orgClientView');
  
  if (btn && dash && clientView) {
    btn.addEventListener('click', () => {
      dash.classList.toggle('active');
      if (dash.classList.contains('active')) {
        btn.innerHTML = '⚙️ Close Organizer Console';
        renderOrgTable();
        updateOrgStats();
        dash.scrollIntoView({ behavior: 'smooth' });
      } else {
        btn.innerHTML = '⚙️ View Organizer Dashboard';
      }
    });
  }

  // Modal close
  const modalClose = document.getElementById('ticketModalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      document.getElementById('ticketModalOverlay').classList.remove('active');
    });
  }
}

function updateOrgStats() {
  const totalSales = mockTickets.reduce((sum, t) => sum + t.price, 0);
  const ticketCount = mockTickets.reduce((sum, t) => sum + t.qty, 0);
  const checkedIn = mockTickets.filter(t => t.status === 'Checked In').reduce((sum, t) => sum + t.qty, 0);
  const percent = ticketCount > 0 ? Math.round((checkedIn / ticketCount) * 100) : 0;
  
  const salesVal = document.getElementById('orgTotalSales');
  const tktsVal = document.getElementById('orgTotalCount');
  const checkinVal = document.getElementById('orgCheckinPercent');
  
  if (salesVal) salesVal.textContent = `R${totalSales.toLocaleString('en-ZA')}`;
  if (tktsVal) tktsVal.textContent = `${ticketCount} Sold`;
  if (checkinVal) checkinVal.textContent = `${percent}% (${checkedIn})`;
}

function renderOrgTable() {
  const tbody = document.getElementById('orgTicketsBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  mockTickets.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--secondary);">${t.id}</td>
      <td>${t.buyer}</td>
      <td>
        <span class="badge ${t.tier === 'VIP' ? 'badge-accent' : 'badge-secondary'}">${t.tier}</span>
      </td>
      <td>${t.qty}</td>
      <td style="font-weight:700;">R${t.price}</td>
      <td>
        <span class="status-badge ${t.status === 'Checked In' ? 'status-confirmed' : 'status-pending'}">${t.status}</span>
      </td>
      <td>
        ${t.status === 'Active' ? `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem; border-color:var(--secondary);" onclick="checkInTicket('${t.id}')">Scan QR</button>` : '—'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global scope scan simulation
window.checkInTicket = function(id) {
  const tkt = mockTickets.find(t => t.id === id);
  if (tkt) {
    tkt.status = 'Checked In';
    showToast(`Ticket ${id} successfully scanned!`);
    renderOrgTable();
    updateOrgStats();
  }
};
