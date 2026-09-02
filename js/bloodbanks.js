/**
 * LifeLink AI - Hospital Blood Inventory & Donation Camp Manager
 */

(function() {
  'use strict';

  class BloodBanksManager {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderInventory();
      this.renderCamps();
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        // Inventory adjustment (+ / -)
        const adjustBtn = e.target.closest('[data-inventory-action]');
        if (adjustBtn) {
          const group = adjustBtn.dataset.bloodGroup;
          const delta = adjustBtn.dataset.inventoryAction === 'inc' ? 1 : -1;
          this.adjustStock(group, delta);
        }

        // Register for Camp
        const campRegBtn = e.target.closest('.btn-register-camp');
        if (campRegBtn) {
          const campId = campRegBtn.dataset.campId;
          this.handleCampRegistration(campId, campRegBtn);
        }
      });

      window.addEventListener('lifelink:data-change', () => {
        this.renderInventory();
      });
    }

    adjustStock(bloodGroup, delta) {
      const inv = window.LifeLinkDB.updateInventory(bloodGroup, delta);
      window.LifeLinkAuth.showToast(`Updated ${bloodGroup} units to: ${inv[bloodGroup].units}`, 'info');
      this.renderInventory();
    }

    handleCampRegistration(campId, btnElement) {
      const camps = window.LifeLinkDB.getCamps();
      const camp = camps.find(c => c.id === campId);
      if (!camp) return;

      camp.registeredDonors = (camp.registeredDonors || 0) + 1;
      window.LifeLinkDB.set('donationCamps', camps);

      btnElement.innerHTML = `<i class="fa-solid fa-check"></i> Registered!`;
      btnElement.classList.remove('btn-primary');
      btnElement.classList.add('btn-glass');
      btnElement.disabled = true;

      window.LifeLinkAuth.showToast(`You have successfully registered for ${camp.title}! Check your email for pass.`, 'success');
      this.renderCamps();
    }

    renderInventory() {
      const container = document.getElementById('hospital-inventory-grid');
      if (!container) return;

      const inv = window.LifeLinkDB.getInventory();
      const groups = Object.keys(inv);

      container.innerHTML = groups.map(group => {
        const item = inv[group];
        let statusBadge = `<span class="badge badge-emerald">OPTIMAL</span>`;
        let cardClass = '';

        if (item.status === 'CRITICAL_LOW') {
          statusBadge = `<span class="badge badge-crimson">🚨 CRITICAL LOW</span>`;
          cardClass = 'glass-card-critical';
        } else if (item.status === 'LOW') {
          statusBadge = `<span class="badge badge-amber">⚠️ LOW STOCK</span>`;
        }

        return `
          <div class="inventory-card glass-card ${cardClass}">
            <div class="inventory-header">
              <div class="blood-badge blood-badge-sm">${group}</div>
              ${statusBadge}
            </div>

            <div class="inventory-counter">
              <button class="inventory-btn" data-inventory-action="dec" data-blood-group="${group}">-</button>
              <span class="inventory-value">${item.units} <small style="font-size: 0.75rem; color: var(--text-muted);">Units</small></span>
              <button class="inventory-btn" data-inventory-action="inc" data-blood-group="${group}">+</button>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>Min Required: ${item.minThreshold}</span>
              <span>Available: <b>${item.units}</b></span>
            </div>
          </div>
        `;
      }).join('');
    }

    renderCamps() {
      const container = document.getElementById('donation-camps-grid');
      if (!container) return;

      const camps = window.LifeLinkDB.getCamps();

      container.innerHTML = camps.map(camp => {
        return `
          <div class="glass-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
            <img src="${camp.banner}" style="width: 100%; height: 180px; object-fit: cover;" alt="${camp.title}">
            <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <span class="badge badge-crimson" style="margin-bottom: 0.6rem;">BLOOD DRIVE CAMP</span>
                <h4 style="font-size: 1.15rem; margin-bottom: 0.5rem;">${camp.title}</h4>
                <p style="font-size: 0.85rem; margin-bottom: 0.5rem;"><i class="fa-regular fa-calendar text-crimson"></i> ${camp.date}</p>
                <p style="font-size: 0.85rem; margin-bottom: 1rem;"><i class="fa-solid fa-location-dot text-cyan"></i> ${camp.location}</p>
              </div>

              <div>
                <div class="flex justify-between items-center" style="font-size: 0.82rem; margin-bottom: 0.8rem; background: var(--bg-surface-elevated); padding: 0.5rem 0.8rem; border-radius: var(--radius-sm);">
                  <span>Target: <b>${camp.targetUnits} Units</b></span>
                  <span style="color: var(--accent-emerald);">Registered: <b>${camp.registeredDonors}</b></span>
                </div>
                <button class="btn btn-primary btn-sm btn-register-camp" data-camp-id="${camp.id}" style="width: 100%;">
                  <i class="fa-solid fa-id-badge"></i> Register to Donate
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkBanks = new BloodBanksManager();
  });
})();
