/**
 * LifeLink AI - Interactive Blood Compatibility Visualizer & Matrix
 */

(function() {
  'use strict';

  // ABO / Rh Full Compatibility Lookup Table
  const RED_CELL_MATRIX = {
    'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
    'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
    'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
    'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
    'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
    'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
    'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
    'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
  };

  const ALL_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  class CompatibilityEngine {
    constructor() {
      this.selectedDonor = 'O-';
      this.selectedRecipient = 'A+';
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderFullMatrix();
      this.updateCompatibilityVisualizer();
    }

    bindEvents() {
      const donorSelect = document.getElementById('compat-donor-select');
      const recipientSelect = document.getElementById('compat-recipient-select');

      if (donorSelect) {
        donorSelect.addEventListener('change', (e) => {
          this.selectedDonor = e.target.value;
          this.updateCompatibilityVisualizer();
        });
      }

      if (recipientSelect) {
        recipientSelect.addEventListener('change', (e) => {
          this.selectedRecipient = e.target.value;
          this.updateCompatibilityVisualizer();
        });
      }

      // Quick blood pill click in matrix
      document.addEventListener('click', (e) => {
        const pill = e.target.closest('[data-select-blood]');
        if (pill) {
          const type = pill.dataset.selectType;
          const bg = pill.dataset.selectBlood;
          if (type === 'donor' && donorSelect) {
            donorSelect.value = bg;
            this.selectedDonor = bg;
          } else if (type === 'recipient' && recipientSelect) {
            recipientSelect.value = bg;
            this.selectedRecipient = bg;
          }
          this.updateCompatibilityVisualizer();
        }
      });
    }

    isCompatible(donor, recipient) {
      const allowed = RED_CELL_MATRIX[donor]?.canDonateTo || [];
      return allowed.includes(recipient);
    }

    updateCompatibilityVisualizer() {
      const isCompat = this.isCompatible(this.selectedDonor, this.selectedRecipient);
      const resultBox = document.getElementById('compat-result-box');
      const flowAnim = document.getElementById('compat-blood-flow');

      if (resultBox) {
        if (isCompat) {
          resultBox.innerHTML = `
            <div class="glass-card text-center" style="border-color: rgba(0, 230, 118, 0.4); background: rgba(0, 230, 118, 0.08);">
              <i class="fa-solid fa-circle-check fa-3x text-emerald" style="margin-bottom: 0.8rem;"></i>
              <h3 style="color: var(--accent-emerald);">MATCH COMPATIBLE!</h3>
              <p style="font-size: 0.95rem; margin-top: 0.4rem;">
                <b>${this.selectedDonor}</b> red blood cells can be safely transfused into <b>${this.selectedRecipient}</b> patients.
              </p>
              <div class="badge badge-emerald" style="margin-top: 1rem;">SAFE FOR TRANSFUSION</div>
            </div>
          `;
        } else {
          resultBox.innerHTML = `
            <div class="glass-card text-center glass-card-critical">
              <i class="fa-solid fa-triangle-exclamation fa-3x text-crimson" style="margin-bottom: 0.8rem;"></i>
              <h3 style="color: #ff5252;">INCOMPATIBLE TRANSFUSION!</h3>
              <p style="font-size: 0.95rem; margin-top: 0.4rem;">
                <b>${this.selectedDonor}</b> red blood cells will cause agglutination / hemolysis if given to <b>${this.selectedRecipient}</b>!
              </p>
              <div class="badge badge-crimson" style="margin-top: 1rem;">ANTIBODY REACTION RISK</div>
            </div>
          `;
        }
      }

      // Highlight donate/receive lists
      const canGiveEl = document.getElementById('compat-can-give-list');
      const canReceiveEl = document.getElementById('compat-can-receive-list');

      if (canGiveEl && RED_CELL_MATRIX[this.selectedDonor]) {
        canGiveEl.innerHTML = RED_CELL_MATRIX[this.selectedDonor].canDonateTo.map(bg => 
          `<span class="blood-badge blood-badge-sm">${bg}</span>`
        ).join('');
      }

      if (canReceiveEl && RED_CELL_MATRIX[this.selectedDonor]) {
        canReceiveEl.innerHTML = RED_CELL_MATRIX[this.selectedDonor].canReceiveFrom.map(bg => 
          `<span class="blood-badge blood-badge-sm">${bg}</span>`
        ).join('');
      }
    }

    renderFullMatrix() {
      const matrixTable = document.getElementById('full-compatibility-matrix');
      if (!matrixTable) return;

      let html = `
        <thead>
          <tr>
            <th class="matrix-th">Donor ↓ / Recipient →</th>
            ${ALL_GROUPS.map(g => `<th class="matrix-th">${g}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
      `;

      ALL_GROUPS.forEach(donor => {
        html += `<tr><td class="matrix-th">${donor}</td>`;
        ALL_GROUPS.forEach(recipient => {
          const compatible = this.isCompatible(donor, recipient);
          html += `
            <td class="matrix-td ${compatible ? 'compatible' : 'incompatible'}">
              ${compatible ? '<i class="fa-solid fa-check"></i>' : '✕'}
            </td>
          `;
        });
        html += `</tr>`;
      });

      html += `</tbody>`;
      matrixTable.innerHTML = html;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkCompat = new CompatibilityEngine();
  });
})();
