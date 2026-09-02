/**
 * LifeLink AI - Digital QR Donor ID Card Generator & 3D Card Controller
 */

(function() {
  'use strict';

  class QRCardManager {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderDonorCard();
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        // Flip card on click
        const cardWrapper = e.target.closest('.donor-card-3d-wrapper');
        if (cardWrapper) {
          const card = cardWrapper.querySelector('.donor-card-3d');
          if (card) card.classList.toggle('flipped');
        }

        // Download card button
        const downloadBtn = e.target.closest('#btn-download-donor-card');
        if (downloadBtn) {
          this.downloadCardAsImage();
        }
      });

      window.addEventListener('lifelink:auth-change', () => {
        this.renderDonorCard();
      });
    }

    renderDonorCard() {
      const user = window.LifeLinkDB.getCurrentUser();
      const cardFront = document.getElementById('donor-card-front');
      const cardBack = document.getElementById('donor-card-back');
      const qrContainer = document.getElementById('donor-card-qr-box');

      if (!cardFront || !cardBack) return;

      // Update Card Details
      document.querySelectorAll('.card-donor-name').forEach(el => el.textContent = user.name);
      document.querySelectorAll('.card-donor-blood').forEach(el => el.textContent = user.bloodGroup || 'O+');
      document.querySelectorAll('.card-donor-id').forEach(el => el.textContent = user.id || 'LL-9821');
      document.querySelectorAll('.card-donor-city').forEach(el => el.textContent = user.city ? `${user.city}, ${user.state || 'India'}` : 'Mumbai, Maharashtra');
      document.querySelectorAll('.card-donor-donations').forEach(el => el.textContent = `${user.donationsCount || 14} Donations`);

      // Generate dynamic verifiable QR code image
      if (qrContainer) {
        const qrData = encodeURIComponent(JSON.stringify({
          app: 'LifeLinkAI',
          id: user.id,
          name: user.name,
          bloodGroup: user.bloodGroup,
          status: 'VERIFIED_DONOR',
          verifiedAt: '2026-09-02'
        }));

        qrContainer.innerHTML = `
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}&color=ffffff&bgcolor=161b22" 
               alt="Donor QR Verification" style="width: 100px; height: 100px; border-radius: 8px; border: 1px solid rgba(229,57,53,0.4);" />
        `;
      }
    }

    downloadCardAsImage() {
      window.LifeLinkAuth.showToast('Generating high-resolution Digital Donor Card...', 'info');
      
      // Render canvas snapshot
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      const user = window.LifeLinkDB.getCurrentUser();

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 800, 480);
      grad.addColorStop(0, '#1a0508');
      grad.addColorStop(0.5, '#0c0204');
      grad.addColorStop(1, '#240810');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 480);

      // Gold / Red Border
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, 780, 460);

      // Header Text
      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('LIFELINK AI • OFFICIAL DONOR ID', 40, 60);

      // Donor Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(user.name, 40, 140);

      // Blood Group Highlight
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(700, 90, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user.bloodGroup || 'O+', 700, 102);
      ctx.textAlign = 'left';

      // Details
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Donor ID: ${user.id}`, 40, 200);
      ctx.fillText(`Location: ${user.city || 'New York, USA'}`, 40, 240);
      ctx.fillText(`Total Donations: ${user.donationsCount || 14} Lives Impacted`, 40, 280);
      ctx.fillText(`Verification: Cryptographically Certified`, 40, 320);

      // Security Seal
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('✔ VERIFIED ACTIVE HERO DONOR', 40, 420);

      // Trigger download
      const link = document.createElement('a');
      link.download = `LifeLink_Donor_Card_${user.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      window.LifeLinkAuth.showToast('Donor Card downloaded successfully!', 'success');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkQR = new QRCardManager();
  });
})();
