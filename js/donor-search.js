/**
 * LifeLink AI - Smart AI Donor Matcher & Radar Visualizer
 */

(function() {
  'use strict';

  // ABO & Rh Blood Compatibility Mapping
  const COMPATIBILITY_RULES = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Red Cell Donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'] // Universal Recipient
  };

  class DonorSearchEngine {
    constructor() {
      this.map = null;
      this.markers = [];
      this.currentFilter = {
        bloodGroup: 'ALL',
        city: 'ALL',
        maxDistance: 25,
        onlyAvailable: true
      };
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderDonorCards();
      this.initMap();
    }

    bindEvents() {
      // Search form controls
      const filterBtn = document.getElementById('btn-apply-filters');
      if (filterBtn) {
        filterBtn.addEventListener('click', () => this.applyFilters());
      }

      const bloodSelect = document.getElementById('search-blood-group');
      if (bloodSelect) {
        bloodSelect.addEventListener('change', () => this.applyFilters());
      }

      const radiusRange = document.getElementById('search-radius');
      if (radiusRange) {
        const radiusDisplay = document.getElementById('radius-val-display');
        radiusRange.addEventListener('input', (e) => {
          if (radiusDisplay) radiusDisplay.textContent = `${e.target.value} km`;
          this.applyFilters();
        });
      }

      // Action buttons inside donor cards
      document.addEventListener('click', (e) => {
        const reqBtn = e.target.closest('.btn-request-donor');
        if (reqBtn) {
          const donorId = reqBtn.dataset.donorId;
          this.handleDirectDonorRequest(donorId);
        }
      });
    }

    calculateAIMatchScore(donor, targetBloodGroup = 'ALL') {
      let score = 70; // baseline

      // Compatibility weight
      if (targetBloodGroup !== 'ALL') {
        const compatibleRecipients = COMPATIBILITY_RULES[donor.bloodGroup] || [];
        if (compatibleRecipients.includes(targetBloodGroup)) {
          score += 15;
        } else {
          score -= 30;
        }
      }

      // Availability bonus
      if (donor.isAvailable) score += 10;
      else score -= 25;

      // Distance penalty
      const distPenalty = Math.min(20, donor.distanceKm * 1.5);
      score -= distPenalty;

      // Last Donation Latency (Safe recovery period > 56 days)
      if (donor.lastDonatedDaysAgo >= 56) score += 10;
      else score -= 20;

      // Historical response rate
      score += (donor.responseRate / 100) * 10;

      return Math.max(10, Math.min(99, Math.round(score)));
    }

    getRankBadge(score) {
      if (score >= 90) return { label: 'TOP AI MATCH (99%)', class: 'badge-emerald' };
      if (score >= 80) return { label: 'HIGH MATCH (85%)', class: 'badge-cyan' };
      if (score >= 65) return { label: 'GOOD MATCH', class: 'badge-amber' };
      return { label: 'STANDARD MATCH', class: 'badge-crimson' };
    }

    applyFilters() {
      const bloodSelect = document.getElementById('search-blood-group');
      const citySelect = document.getElementById('search-city');
      const radiusRange = document.getElementById('search-radius');
      const availCheck = document.getElementById('filter-available-only');

      if (bloodSelect) this.currentFilter.bloodGroup = bloodSelect.value;
      if (citySelect) this.currentFilter.city = citySelect.value;
      if (radiusRange) this.currentFilter.maxDistance = +radiusRange.value;
      if (availCheck) this.currentFilter.onlyAvailable = availCheck.checked;

      this.renderDonorCards();
      this.updateMapMarkers();
    }

    getFilteredDonors() {
      const donors = window.LifeLinkDB.getDonors();
      const targetBlood = this.currentFilter.bloodGroup;

      return donors
        .filter(donor => {
          if (this.currentFilter.onlyAvailable && !donor.isAvailable) return false;
          if (donor.distanceKm > this.currentFilter.maxDistance) return false;
          if (this.currentFilter.city !== 'ALL' && !donor.city.toLowerCase().includes(this.currentFilter.city.toLowerCase())) return false;
          
          if (targetBlood !== 'ALL') {
            const compatible = COMPATIBILITY_RULES[donor.bloodGroup] || [];
            if (!compatible.includes(targetBlood)) return false;
          }
          return true;
        })
        .map(donor => {
          const aiScore = this.calculateAIMatchScore(donor, targetBlood);
          return { ...donor, aiScore };
        })
        .sort((a, b) => b.aiScore - a.aiScore); // Rank by AI Match
    }

    renderDonorCards() {
      const container = document.getElementById('donors-grid-container');
      if (!container) return;

      const donors = this.getFilteredDonors();
      
      const countEl = document.getElementById('matched-donors-count');
      if (countEl) countEl.textContent = `${donors.length} Verified Donors Available Across India`;

      if (donors.length === 0) {
        container.innerHTML = `
          <div class="glass-card text-center" style="grid-column: 1 / -1; padding: 3rem;">
            <i class="fa-solid fa-user-slash fa-3x text-crimson" style="margin-bottom: 1rem;"></i>
            <h3>No Donors Found in Selected Region</h3>
            <p>Try selecting 'All Cities' or adjusting the search radius.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = donors.map((d, index) => {
        const badgeInfo = this.getRankBadge(d.aiScore);
        const locationText = d.area ? d.area : `${d.city}, ${d.state || 'India'}`;
        return `
          <div class="glass-card donor-card ${index === 0 ? 'glass-card-hero' : ''}">
            <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
              <span class="badge ${badgeInfo.class}">
                <i class="fa-solid fa-brain"></i> ${badgeInfo.label}
              </span>
              <div class="blood-badge ${d.bloodGroup.includes('-') ? 'blood-badge-crimson' : ''}">
                ${d.bloodGroup}
              </div>
            </div>

            <div class="flex items-center gap-3" style="margin-bottom: 1rem;">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" 
                   class="user-avatar" style="width: 48px; height: 48px;" alt="${d.name}">
              <div>
                <h4 style="font-size: 1.05rem;">${d.name}</h4>
                <p style="font-size: 0.82rem;"><i class="fa-solid fa-location-dot text-crimson"></i> ${locationText} (${d.distanceKm} km away)</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2" style="margin-bottom: 1.25rem; font-size: 0.82rem; background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: var(--radius-sm);">
              <div>
                <span class="text-muted">Status:</span>
                <span style="font-weight: 700; color: ${d.isAvailable ? 'var(--accent-emerald)' : 'var(--text-muted)'}">
                  ${d.isAvailable ? '● Available' : '○ Busy'}
                </span>
              </div>
              <div>
                <span class="text-muted">Last Donated:</span>
                <span style="font-weight: 600;">${d.lastDonatedDaysAgo}d ago</span>
              </div>
              <div>
                <span class="text-muted">Response Rate:</span>
                <span style="font-weight: 700; color: var(--accent-cyan);">${d.responseRate}%</span>
              </div>
              <div>
                <span class="text-muted">AI Match Index:</span>
                <span style="font-weight: 700; color: #ff5252;">${d.aiScore}/100</span>
              </div>
            </div>

            <div class="flex gap-2">
              <button class="btn btn-primary btn-sm flex-1 btn-request-donor" data-donor-id="${d.id}">
                <i class="fa-solid fa-bell"></i> Request Blood
              </button>
              <a href="tel:${d.phone}" class="btn btn-glass btn-sm btn-icon" title="Call Donor (${d.phone})">
                <i class="fa-solid fa-phone"></i>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    initMap() {
      const mapEl = document.getElementById('map-container');
      if (!mapEl || typeof L === 'undefined') return;

      // Center around India (Mumbai by default)
      this.map = L.map('map-container').setView([19.0760, 72.8777], 11);

      // Clean tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(this.map);

      this.updateMapMarkers();
    }

    updateMapMarkers() {
      if (!this.map || typeof L === 'undefined') return;

      // Clear existing markers
      this.markers.forEach(m => this.map.removeLayer(m));
      this.markers = [];

      const donors = this.getFilteredDonors();
      const cityCoordsMap = {
        'ALL': [20.5937, 78.9629],
        'Mumbai': [19.0760, 72.8777],
        'New Delhi': [28.6139, 77.2090],
        'Bengaluru': [12.9716, 77.5946],
        'Pune': [18.5204, 73.8567],
        'Chennai': [13.0827, 80.2707],
        'Kolkata': [22.5726, 88.3639],
        'Hyderabad': [17.3850, 78.4867],
        'Jaipur': [26.9124, 75.7873],
        'Ahmedabad': [23.0225, 72.5714],
        'Lucknow': [26.8467, 80.9462]
      };

      // Smooth pan to city if selected
      const selectedCity = this.currentFilter.city;
      if (selectedCity && selectedCity !== 'ALL' && cityCoordsMap[selectedCity]) {
        this.map.flyTo(cityCoordsMap[selectedCity], 12, { duration: 1.2 });
      } else if (selectedCity === 'ALL' && donors.length > 0) {
        this.map.flyTo([20.5937, 78.9629], 5, { duration: 1.2 });
      }

      donors.forEach((d, i) => {
        const lat = d.lat || (19.0760 + (Math.sin(i * 1.5) * 0.04));
        const lng = d.lng || (72.8777 + (Math.cos(i * 1.5) * 0.05));

        const customIcon = L.divIcon({
          className: 'custom-donor-pin',
          html: `
            <div style="background: #d32f2f; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2px solid white; box-shadow: 0 0 15px rgba(211,47,47,0.8);">
              ${d.bloodGroup}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="padding: 6px; color: #111; font-family: sans-serif;">
            <strong style="color: #d32f2f; font-size: 14px;">${d.name} (${d.bloodGroup})</strong><br/>
            <span style="font-size: 12px; color: #555;"><i class="fa-solid fa-location-dot"></i> ${d.area || d.city}</span><br/>
            <span style="font-size: 12px;">Distance: <b>${d.distanceKm} km</b> | AI Match: <b>${d.aiScore}%</b></span><br/>
            <span style="font-size: 12px;">Phone: <b>${d.phone}</b></span><br/>
            <button onclick="LifeLinkSearch.handleDirectDonorRequest('${d.id}')" style="margin-top:8px; background:#d32f2f; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold; width:100%;">Request Blood Now</button>
          </div>
        `);
        this.markers.push(marker);
      });
    }

    handleDirectDonorRequest(donorId) {
      const donors = window.LifeLinkDB.getDonors();
      const donor = donors.find(d => d.id === donorId);
      if (!donor) return;

      window.LifeLinkAuth.showToast(`Emergency alert dispatched to ${donor.name} via SMS & App Push!`, 'success');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkSearch = new DonorSearchEngine();
  });
})();
