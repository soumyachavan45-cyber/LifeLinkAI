/**
 * LifeLink AI - Official Blood Donation Certificate Generator
 */

(function() {
  'use strict';

  class CertificateManager {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.renderCertificate();
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        const downloadCertBtn = e.target.closest('#btn-download-certificate');
        if (downloadCertBtn) {
          this.downloadCertificate();
        }

        const printCertBtn = e.target.closest('#btn-print-certificate');
        if (printCertBtn) {
          window.print();
        }
      });

      window.addEventListener('lifelink:auth-change', () => {
        this.renderCertificate();
      });
    }

    renderCertificate() {
      const user = window.LifeLinkDB.getCurrentUser();
      const certName = document.getElementById('cert-donor-name');
      const certUnits = document.getElementById('cert-donor-units');
      const certDate = document.getElementById('cert-issue-date');

      if (certName) certName.textContent = user.name;
      if (certUnits) certUnits.textContent = `${user.donationsCount || 14} Units (${(user.donationsCount || 14) * 3} Lives Saved)`;
      if (certDate) certDate.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    downloadCertificate() {
      window.LifeLinkAuth.showToast('Rendering Certificate of Honor in high resolution...', 'info');

      const user = window.LifeLinkDB.getCurrentUser();
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 850;
      const ctx = canvas.getContext('2d');

      // Parchment / Clean Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1200, 850);

      // Ornate Border
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 1140, 790);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, 1104, 754);

      // Header
      ctx.fillStyle = '#b71c1c';
      ctx.font = 'bold 36px serif';
      ctx.textAlign = 'center';
      ctx.fillText('LIFELINK AI EMERGENCY RESPONSE FOUNDATION', 600, 120);

      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'italic 26px serif';
      ctx.fillText('CERTIFICATE OF APPRECIATION & LIFE SAVING HONOR', 600, 170);

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#555555';
      ctx.fillText('This certificate is proudly awarded to', 600, 240);

      // Recipient Name
      ctx.fillStyle = '#b71c1c';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(user.name, 600, 310);

      // Underline
      ctx.strokeStyle = '#b71c1c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(350, 330);
      ctx.lineTo(850, 330);
      ctx.stroke();

      // Description
      ctx.font = '21px serif';
      ctx.fillStyle = '#333333';
      ctx.fillText(
        `for their noble contribution of voluntary blood donation (Blood Group: ${user.bloodGroup || 'O+'}),`,
        600,
        380
      );
      ctx.fillText(
        `having donated ${user.donationsCount || 14} blood units and directly saving over ${(user.donationsCount || 14) * 3} human lives.`,
        600,
        420
      );

      // Red Cross / LifeLink Gold Seal
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath();
      ctx.arc(600, 560, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 38px sans-serif';
      ctx.fillText('✚', 600, 574);

      // Signatures
      ctx.fillStyle = '#111111';
      ctx.font = 'bold 20px serif';
      ctx.fillText('Dr. Evelyn Reed', 300, 720);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Chief Medical Director', 300, 745);

      ctx.fillStyle = '#111111';
      ctx.font = 'bold 20px serif';
      ctx.fillText(new Date().toLocaleDateString(), 900, 720);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Date of Certification', 900, 745);

      // Trigger Download
      const link = document.createElement('a');
      link.download = `LifeLink_Certificate_${user.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      window.LifeLinkAuth.showToast('Certificate downloaded in high resolution!', 'success');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkCert = new CertificateManager();
  });
})();
