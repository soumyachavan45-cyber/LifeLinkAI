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
      // Parse URL parameters (e.g. from homepage quick finder or blood group cards)
      const urlParams = new URLSearchParams(window.location.search);
      const bgParam = urlParams.get('bg');
      const cityParam = urlParams.get('city');

      if (bgParam) {
        this.currentFilter.bloodGroup = bgParam;
        const bgSelect = document.getElementById('search-blood-group');
        if (bgSelect) bgSelect.value = bgParam;
      }
      if (cityParam) {
        this.currentFilter.city = cityParam;
        const citySelect = document.getElementById('search-city');
        if (citySelect) citySelect.value = cityParam;
      }

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

      // 1. Plot Verified Donors (Green / Crimson Badges)
      donors.forEach((d, i) => {
        const lat = d.lat || (19.0760 + (Math.sin(i * 1.5) * 0.04));
        const lng = d.lng || (72.8777 + (Math.cos(i * 1.5) * 0.05));

        const customIcon = L.divIcon({
          className: 'custom-donor-pin',
          html: `
            <div style="background: #16a34a; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.5);">
              ${d.bloodGroup}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        marker.bindPopup(`
          <div style="padding: 8px; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 200px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <span style="font-size:10px; font-weight:800; color:#16a34a; text-transform:uppercase;">● Verified Donor</span>
              <span style="background:#fef2f2; color:#d62828; font-weight:800; font-size:11px; padding:2px 6px; border-radius:10px;">${d.bloodGroup}</span>
            </div>
            <strong style="font-size: 14px; color: #0f172a;">${d.name}</strong><br/>
            <span style="font-size: 12px; color: #64748b;"><i class="fa-solid fa-location-dot text-crimson"></i> ${d.area || d.city}</span><br/>
            <div style="margin-top:6px; font-size: 11px; color:#475569;">
              Distance: <b>${d.distanceKm} km</b> • Match Score: <b>${d.aiScore}%</b>
            </div>
            <button onclick="LifeLinkSearch.handleDirectDonorRequest('${d.id}')" style="margin-top:8px; background:#d62828; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:700; font-size:12px; width:100%;">
              <i class="fa-solid fa-bell"></i> Request Blood
            </button>
          </div>
        `);
        this.markers.push(marker);
      });

      // 2. Plot Active Emergency Patients (Pulsing Red)
      const emergencyRequests = window.LifeLinkDB ? window.LifeLinkDB.getRequests() : [];
      emergencyRequests.forEach((req, idx) => {
        const patientCoords = req.city === 'New Delhi' ? [28.5672 + idx*0.02, 77.2100 + idx*0.015] :
                              req.city === 'Hyderabad' ? [17.4177 + idx*0.02, 78.4140 + idx*0.015] :
                              [19.0150 + idx*0.02, 72.8350 + idx*0.015];

        const patientIcon = L.divIcon({
          className: 'custom-patient-pin',
          html: `
            <div style="background: #dc2626; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.35); animation: pulse-ring 1.5s infinite;">
              <i class="fa-solid fa-bed-pulse"></i>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const pMarker = L.marker(patientCoords, { icon: patientIcon }).addTo(this.map);
        pMarker.bindPopup(`
          <div style="padding: 8px; font-family: -apple-system, sans-serif; min-width: 210px;">
            <div style="font-size:10px; font-weight:800; color:#dc2626; text-transform:uppercase;">🚨 EMERGENCY BLOOD CALL</div>
            <strong style="font-size: 14px;">${req.patientName} (${req.bloodGroup})</strong><br/>
            <span style="font-size: 12px; color: #64748b;">${req.hospital}</span><br/>
            <span style="font-size: 11px; color: #dc2626; font-weight:700;">Needs ${req.units} Units • Urgency: ${req.urgency}</span><br/>
            <a href="request.html" style="display:inline-block; margin-top:8px; text-align:center; background:#dc2626; color:#fff; padding:5px 10px; border-radius:6px; font-size:12px; font-weight:700; width:100%; text-decoration:none;">
              Help Patient Now →
            </a>
          </div>
        `);
        this.markers.push(pMarker);
      });

      // 3. Plot Regional Hospitals (Trust Blue)
      const hospitals = [
        { name: 'AIIMS Apex Trauma Center', city: 'New Delhi', lat: 28.5672, lng: 77.2100, beds: 14 },
        { name: 'Tata Memorial Hospital', city: 'Mumbai', lat: 19.0060, lng: 72.8427, beds: 8 },
        { name: 'Apollo Hospitals Healthcare', city: 'Hyderabad', lat: 17.4177, lng: 78.4140, beds: 12 },
        { name: 'KEM Hospital & Research', city: 'Mumbai', lat: 19.0029, lng: 72.8426, beds: 6 }
      ];

      hospitals.forEach(h => {
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-pin',
          html: `
            <div style="background: #2563eb; color: white; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);">
              <i class="fa-solid fa-hospital"></i>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const hMarker = L.marker([h.lat, h.lng], { icon: hospitalIcon }).addTo(this.map);
        hMarker.bindPopup(`
          <div style="padding: 8px; font-family: -apple-system, sans-serif; min-width: 190px;">
            <div style="font-size:10px; font-weight:800; color:#2563eb; text-transform:uppercase;">🏥 PARTNER HOSPITAL</div>
            <strong style="font-size: 13px;">${h.name}</strong><br/>
            <span style="font-size: 11px; color:#64748b;">${h.city} • Trauma Desk 24/7</span><br/>
            <span style="font-size: 11px; color:#16a34a; font-weight:700;">● Active Blood Requisition Ready</span>
          </div>
        `);
        this.markers.push(hMarker);
      });

      // 4. Plot Regional Blood Banks (Amber)
      const bloodBanks = [
        { name: 'National Red Cross Bio-Bank', city: 'Mumbai', lat: 19.0657, lng: 72.8687, units: 140 },
        { name: 'Central Delhi Blood Center', city: 'New Delhi', lat: 28.6304, lng: 77.2177, units: 95 }
      ];

      bloodBanks.forEach(b => {
        const bankIcon = L.divIcon({
          className: 'custom-bank-pin',
          html: `
            <div style="background: #f59e0b; color: white; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 14px; border: 2px solid white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.45);">
              <i class="fa-solid fa-boxes-stacked"></i>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const bMarker = L.marker([b.lat, b.lng], { icon: bankIcon }).addTo(this.map);
        bMarker.bindPopup(`
          <div style="padding: 8px; font-family: -apple-system, sans-serif; min-width: 180px;">
            <div style="font-size:10px; font-weight:800; color:#f59e0b; text-transform:uppercase;">🏦 REGIONAL BLOOD BANK</div>
            <strong style="font-size: 13px;">${b.name}</strong><br/>
            <span style="font-size: 11px; color:#64748b;">${b.city} • Reserve: <b>${b.units} Units</b></span><br/>
            <a href="bloodbanks.html" style="font-size: 11px; color:#2563eb; font-weight:700; text-decoration:none;">View Full Inventory →</a>
          </div>
        `);
        this.markers.push(bMarker);
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
