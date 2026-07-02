// --- SALON BOOKING & ADMIN PORTAL SCRIPT ---

let selectedDate = null;
let selectedTime = null;
let selectedServices = [];
let mockAppointments = [
  { id: 'APT-928', client: 'Sarah Connor', service: 'Balayage & Styling', date: '2026-07-03', time: '10:30', price: 950, status: 'Confirmed' },
  { id: 'APT-929', client: 'Bruce Wayne', service: 'Gentlemens Grooming', date: '2026-07-03', time: '14:00', price: 350, status: 'Confirmed' },
  { id: 'APT-930', client: 'Peter Parker', service: 'Hydrating Facial', date: '2026-07-04', time: '09:00', price: 600, status: 'Pending' }
];

document.addEventListener('DOMContentLoaded', () => {
  initCalendar();
  initServiceSelect();
  initTimeSlotSelect();
  initFormSubmit();
  initDashboardToggle();
});

// 1. Calendar Generation
function initCalendar() {
  const grid = document.getElementById('calendarGrid');
  if (!grid) return;
  
  // Clear previous grid elements (except day labels)
  const labels = grid.querySelectorAll('.calendar-day-label');
  grid.innerHTML = '';
  labels.forEach(l => grid.appendChild(l));

  const date = new Date(2026, 6, 1); // July 2026
  const startDay = date.getDay(); // Day of week (0=Sunday)
  const totalDays = 31; // Days in July
  
  // Empty blocks for offset
  for (let i = 0; i < startDay; i++) {
    const emptyEl = document.createElement('div');
    emptyEl.className = 'calendar-day empty';
    grid.appendChild(emptyEl);
  }
  
  // July days
  const todayDate = 2; // Say today is July 2nd
  for (let day = 1; day <= totalDays; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;
    
    // Disable past days
    if (day < todayDate) {
      dayEl.classList.add('disabled');
    } else {
      dayEl.addEventListener('click', (e) => {
        const activeDay = grid.querySelector('.calendar-day.active');
        if (activeDay) activeDay.classList.remove('active');
        dayEl.classList.add('active');
        selectedDate = `2026-07-${day < 10 ? '0' + day : day}`;
      });
    }
    grid.appendChild(dayEl);
  }
}

// 2. Service Selection
function initServiceSelect() {
  const serviceCards = document.querySelectorAll('.salon-service-item');
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      const id = card.dataset.id;
      const price = parseFloat(card.dataset.price);
      const name = card.dataset.name;
      
      const index = selectedServices.findIndex(s => s.id === id);
      if (index > -1) {
        selectedServices.splice(index, 1);
      } else {
        selectedServices.push({ id, name, price });
      }
      updateTotalDisplay();
    });
  });
}

function updateTotalDisplay() {
  const totalLabel = document.getElementById('bookingTotalValue');
  if (!totalLabel) return;
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  totalLabel.textContent = `R${total.toFixed(2)}`;
}

// 3. Time Slot Selection
function initTimeSlotSelect() {
  const slots = document.querySelectorAll('.time-slot');
  slots.forEach(slot => {
    slot.addEventListener('click', () => {
      const activeSlot = document.querySelector('.time-slot.active');
      if (activeSlot) activeSlot.classList.remove('active');
      
      slot.classList.add('active');
      selectedTime = slot.dataset.time;
    });
  });
}

// 4. Form Submit
function initFormSubmit() {
  const btn = document.getElementById('btnSubmitBooking');
  if (!btn) return;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    
    if (selectedServices.length === 0) {
      showToast('Please select at least one service.', true);
      return;
    }
    if (!selectedDate) {
      showToast('Please select a booking date.', true);
      return;
    }
    if (!selectedTime) {
      showToast('Please select an appointment time.', true);
      return;
    }
    if (!name || !email || !phone) {
      showToast('Please complete all contact fields.', true);
      return;
    }
    
    // Create new appointment object
    const newApt = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      client: name,
      service: selectedServices.map(s => s.name).join(', '),
      date: selectedDate,
      time: selectedTime,
      price: selectedServices.reduce((sum, s) => sum + s.price, 0),
      status: 'Pending'
    };
    
    // Add to table array
    mockAppointments.unshift(newApt);
    
    // Show success dialog
    openBookingSuccessModal(newApt);
    
    // Reset Form
    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';
    selectedServices = [];
    selectedDate = null;
    selectedTime = null;
    
    // Clear selections
    const serviceCards = document.querySelectorAll('.salon-service-item');
    serviceCards.forEach(card => card.classList.remove('active'));
    
    const activeDay = document.querySelector('.calendar-day.active');
    if (activeDay) activeDay.classList.remove('active');
    
    const activeSlot = document.querySelector('.time-slot.active');
    if (activeSlot) activeSlot.classList.remove('active');
    
    updateTotalDisplay();
    renderDashboardTable();
    updateDashboardStats();
  });
}

function openBookingSuccessModal(apt) {
  const overlay = document.getElementById('bookingModalOverlay');
  const details = document.getElementById('bookingModalDetails');
  
  if (overlay && details) {
    details.innerHTML = `
      <div style="font-size:0.95rem; line-height:1.8; margin-top:16px;">
        <p><strong>Appointment ID:</strong> ${apt.id}</p>
        <p><strong>Client Name:</strong> ${apt.client}</p>
        <p><strong>Service(s):</strong> ${apt.service}</p>
        <p><strong>Date & Time:</strong> ${apt.date} @ ${apt.time}</p>
        <p><strong>Total Value:</strong> R${apt.price.toFixed(2)}</p>
        <p style="color:var(--success); font-weight:600; margin-top:16px;">✓ A SMS confirmation and calendar link has been sent to ${document.getElementById('clientPhone').value || 'your device'}.</p>
      </div>
    `;
    overlay.classList.add('active');
  }
}

// 5. Dashboard Views Toggle
function initDashboardToggle() {
  const btn = document.getElementById('toggleDashBtn');
  const dash = document.getElementById('salonDashboard');
  const clientView = document.getElementById('salonClientView');
  
  if (btn && dash && clientView) {
    btn.addEventListener('click', () => {
      dash.classList.toggle('active');
      if (dash.classList.contains('active')) {
        btn.innerHTML = '⚙️ Close Admin Dashboard';
        renderDashboardTable();
        updateDashboardStats();
        // Scroll to dashboard
        dash.scrollIntoView({ behavior: 'smooth' });
      } else {
        btn.innerHTML = '⚙️ View Live Admin Dashboard';
      }
    });
  }

  // Modal close
  const modalClose = document.getElementById('bookingModalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      document.getElementById('bookingModalOverlay').classList.remove('active');
    });
  }
}

function updateDashboardStats() {
  const totalSales = mockAppointments.reduce((sum, a) => sum + a.price, 0);
  const pendingCount = mockAppointments.filter(a => a.status === 'Pending').length;
  
  const salesVal = document.getElementById('dashTotalSales');
  const apptsVal = document.getElementById('dashTotalCount');
  const pendingVal = document.getElementById('dashPendingCount');
  
  if (salesVal) salesVal.textContent = `R${totalSales.toLocaleString('en-ZA')}`;
  if (apptsVal) apptsVal.textContent = mockAppointments.length;
  if (pendingVal) pendingVal.textContent = pendingCount;
}

function renderDashboardTable() {
  const tbody = document.getElementById('dashAppointmentsBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  mockAppointments.forEach(apt => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600; color:var(--primary);">${apt.id}</td>
      <td>${apt.client}</td>
      <td>${apt.service}</td>
      <td>${apt.date} @ ${apt.time}</td>
      <td style="font-weight:700;">R${apt.price}</td>
      <td>
        <span class="status-badge ${apt.status === 'Confirmed' ? 'status-confirmed' : 'status-pending'}">${apt.status}</span>
      </td>
      <td>
        ${apt.status === 'Pending' ? `<button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="confirmAppointment('${apt.id}')">Approve</button>` : '—'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global scope approval method
window.confirmAppointment = function(id) {
  const apt = mockAppointments.find(a => a.id === id);
  if (apt) {
    apt.status = 'Confirmed';
    showToast(`Appointment ${id} confirmed!`);
    renderDashboardTable();
    updateDashboardStats();
  }
};
