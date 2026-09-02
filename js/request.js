/**
 * LifeLink AI - Blood Request Management & Real-Time Tracking
 */

(function() {
  'use strict';

  class RequestManager {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderLiveRequests();
      this.renderTrackerProgress();
    }

    bindEvents() {
      const form = document.getElementById('form-create-blood-request');
      if (form) {
        form.addEventListener('submit', (e) => this.handleCreateRequest(e));
      }

      // Filter tabs in request feed
      document.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-req-filter]');
        if (filterBtn) {
          document.querySelectorAll('[data-req-filter]').forEach(b => b.classList.remove('active'));
          filterBtn.classList.add('active');
          this.renderLiveRequests(filterBtn.dataset.reqFilter);
        }

        // Accept request action
        const acceptBtn = e.target.closest('.btn-accept-request');
        if (acceptBtn) {
          const reqId = acceptBtn.dataset.reqId;
          this.handleAcceptRequest(reqId);
        }
      });

      // Listen for new requests or data reset
      window.addEventListener('lifelink:data-change', () => {
        this.renderLiveRequests();
        this.renderTrackerProgress();
      });
    }

    handleCreateRequest(e) {
      e.preventDefault();
      const form = e.target;

      const newRequest = {
        patientName: form.patientName.value.trim(),
        bloodGroup: form.bloodGroup.value,
        units: parseInt(form.units.value) || 1,
        hospital: form.hospital.value.trim(),
        city: form.city.value.trim(),
        urgency: form.urgency.value,
        requiredFor: form.requiredFor.value.trim() || 'Urgent Medical Need',
        contactPhone: form.contactPhone.value.trim() || '+1 (555) 000-0000',
        expiresInMins: form.urgency.value === 'CRITICAL' ? 30 : 120
      };

      const created = window.LifeLinkDB.addRequest(newRequest);
      window.LifeLinkAuth.showToast(`Emergency request for ${created.patientName} (${created.bloodGroup}) is now LIVE!`, 'success');

      form.reset();
      this.renderLiveRequests();
      this.renderTrackerProgress();

      // Scroll to live list
      const feed = document.getElementById('live-requests-feed');
      if (feed) feed.scrollIntoView({ behavior: 'smooth' });
    }

    handleAcceptRequest(reqId) {
      const requests = window.LifeLinkDB.getRequests();
      const target = requests.find(r => r.id === reqId);
      if (!target) return;

      target.status = 'DONOR_EN_ROUTE';
      target.donorsAccepted = (target.donorsAccepted || 0) + 1;
      window.LifeLinkDB.set('emergencyRequests', requests);

      window.LifeLinkAuth.showToast(`Thank you! You have accepted request ${target.id}. Hospital has been notified.`, 'success');
      this.renderLiveRequests();
      this.renderTrackerProgress();
    }

    renderLiveRequests(filter = 'ALL') {
      const container = document.getElementById('live-requests-feed');
      if (!container) return;

      let requests = window.LifeLinkDB.getRequests();

      if (filter !== 'ALL') {
        requests = requests.filter(r => r.urgency === filter);
      }

      if (requests.length === 0) {
        container.innerHTML = `
          <div class="glass-card text-center" style="padding: 2.5rem;">
            <i class="fa-solid fa-heart-circle-check fa-3x text-emerald" style="margin-bottom: 1rem;"></i>
            <h4>All Clear! No Pending Requests</h4>
            <p>No active emergencies matching this criteria right now.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = requests.map(r => {
        const isCritical = r.urgency === 'CRITICAL';
        return `
          <div class="glass-card ${isCritical ? 'glass-card-critical' : ''}" style="margin-bottom: 1.25rem;">
            <div class="flex justify-between items-center" style="margin-bottom: 0.85rem;">
              <div class="flex items-center gap-2">
                <span class="badge ${isCritical ? 'badge-crimson' : 'badge-amber'}">
                  ${isCritical ? '🚨 CRITICAL EMERGENCY' : '⚡ ' + r.urgency}
                </span>
                <span class="text-muted" style="font-size: 0.8rem; font-family: var(--font-mono);">${r.id}</span>
              </div>
              <div class="blood-badge blood-badge-sm">
                ${r.bloodGroup}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4" style="margin-bottom: 1rem;">
              <div>
                <h4 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${r.patientName}</h4>
                <p style="font-size: 0.88rem;"><i class="fa-solid fa-hospital text-crimson"></i> ${r.hospital}, ${r.city}</p>
                <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">${r.requiredFor}</p>
              </div>
              <div class="text-right">
                <div style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #ff5252;">
                  ${r.units} Units Required
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-emerald);">
                  <i class="fa-solid fa-users"></i> ${r.donorsNotified} Notified • ${r.donorsAccepted || 0} Accepted
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center" style="border-top: 1px solid var(--border-glass); padding-top: 0.85rem;">
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                <i class="fa-regular fa-clock"></i> Posted: ${new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div class="flex gap-2">
                <a href="tel:${r.contactPhone}" class="btn btn-glass btn-sm">
                  <i class="fa-solid fa-phone"></i> Call Emergency
                </a>
                <button class="btn btn-primary btn-sm btn-accept-request" data-req-id="${r.id}">
                  <i class="fa-solid fa-hand-holding-heart"></i> I Can Donate
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    renderTrackerProgress() {
      const trackerContainer = document.getElementById('active-request-tracker');
      if (!trackerContainer) return;

      const requests = window.LifeLinkDB.getRequests();
      const activeReq = requests.find(r => r.status !== 'FULFILLED') || requests[0];

      if (!activeReq) {
        trackerContainer.innerHTML = `<p class="text-muted">No active live tracking requests.</p>`;
        return;
      }

      const steps = [
        { label: 'Broadcasted', done: true },
        { label: 'Donors Notified', done: true },
        { label: 'Donor Accepted', done: activeReq.status === 'DONOR_EN_ROUTE' || activeReq.status === 'FULFILLED' },
        { label: 'Blood Delivered', done: activeReq.status === 'FULFILLED' }
      ];

      trackerContainer.innerHTML = `
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="flex justify-between items-center" style="margin-bottom: 1.25rem;">
            <div>
              <span class="badge badge-crimson">LIVE DISPATCH TRACKER</span>
              <h4 style="margin-top: 0.3rem;">${activeReq.patientName} (${activeReq.bloodGroup} • ${activeReq.units} Units)</h4>
            </div>
            <span class="pulse-dot"></span>
          </div>

          <div style="display: flex; justify-content: space-between; position: relative; margin: 2rem 0;">
            <div style="position: absolute; top: 50%; left: 10%; right: 10%; height: 3px; background: var(--border-glass); z-index: 1;"></div>
            ${steps.map((step, idx) => `
              <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; position: relative;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: ${step.done ? 'var(--primary-500)' : 'var(--bg-surface-elevated)'}; border: 2px solid ${step.done ? '#ff5252' : 'var(--border-glass)'}; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; box-shadow: ${step.done ? '0 0 15px var(--primary-glow)' : 'none'};">
                  ${step.done ? '✓' : idx + 1}
                </div>
                <span style="font-size: 0.78rem; font-weight: 600; margin-top: 0.5rem; color: ${step.done ? 'var(--text-primary)' : 'var(--text-muted)'};">${step.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkRequest = new RequestManager();
  });
})();
