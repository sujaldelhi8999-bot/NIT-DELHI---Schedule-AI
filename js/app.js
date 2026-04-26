/* ==================================================
   APP.JS — App shell, routing, modal, toast
   ================================================== */

const App = (() => {
  let currentPage = 'dashboard';

  function init() {
    Utils.initDarkMode();
    // Load sample data if nothing exists
    SampleData.load();

    // Navigation
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', () => navigate(item.dataset.page));
    });

    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Re-render on data change
    window.addEventListener('store-change', () => {
      if (currentPage === 'dashboard') UIDashboard.updateStats();
    });

    // First render
    renderPage('dashboard');
  }

  function navigate(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(`page-${page}`);
    if (el) el.classList.add('active');
    currentPage = page;
    renderPage(page);
  }

  function renderPage(page) {
    switch (page) {
      case 'dashboard':    UIDashboard.render(); break;
      case 'inputs':       UIInputs.render(); break;
      case 'section-view': UIViews.renderSectionView(); break;
      case 'faculty-view': UIViews.renderFacultyView(); break;
      case 'room-view':    UIViews.renderRoomView(); break;
    }
  }

  /* ---- MODAL ---- */
  function modal(title, bodyHtml, onSave) {
    const mc = document.getElementById('modalContent');
    mc.innerHTML = `
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="modal-close" id="modalCloseBtn">&times;</button>
      </div>
      <div class="modal-body">${bodyHtml}</div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="modalCancelBtn">Cancel</button>
        <button class="btn btn-primary" id="modalSaveBtn">Save</button>
      </div>
    `;
    document.getElementById('modalOverlay').classList.add('open');
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
    document.getElementById('modalSaveBtn').addEventListener('click', () => {
      const result = onSave();
      if (result !== false) closeModal();
    });
    setTimeout(() => {
      const first = mc.querySelector('input,select,textarea');
      if (first) first.focus();
    }, 100);
  }

  function closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
  }

  /* ---- TOAST ---- */
  function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success:'✓', error:'✕', info:'ℹ', warning:'⚠' };
    el.innerHTML = `<span>${icons[type]||''}</span> ${message}`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      el.style.transition = 'all .3s';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { navigate, modal, closeModal, toast };
})();
