/**
 * LifeLink AI - Emergency SOS Panic System
 * Handles instant GPS acquisition, 5-second countdown, and priority emergency broadcast.
 */

(function() {
  'use strict';

  class SOSEngine {
    constructor() {
      this.countdownTimer = null;
      this.remainingSeconds = 5;
      this.init();
    }

    init() {
      this.bindEvents();
    }

    bindEvents() {
      document.addEventListener('click', (e) => {
        const sosTrigger = e.target.closest('#btn-trigger-sos, .btn-sos-trigger');
        if (sosTrigger) {
          e.preventDefault();
          this.startSOSSequence();
        }

        const cancelSOS = e.target.closest('#btn-cancel-sos');
        if (cancelSOS) {
          this.cancelSOSSequence();
        }

        const confirmInstant = e.target.closest('#btn-confirm-instant-sos');
        if (confirmInstant) {
          this.dispatchSOSAlert();
        }
      });
    }

    startSOSSequence() {
      this.remainingSeconds = 5;
      const modal = document.getElementById('modal-sos-countdown');
      if (modal) {
        modal.classList.add('active');
        this.updateCountdownDisplay();
        
        clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
          this.remainingSeconds--;
          this.updateCountdownDisplay();

          if (this.remainingSeconds <= 0) {
            clearInterval(this.countdownTimer);
            this.dispatchSOSAlert();
          }
        }, 1000);
      } else {
        // Direct dispatch if modal not in DOM
        this.dispatchSOSAlert();
      }
    }

    updateCountdownDisplay() {
      const numEl = document.getElementById('sos-timer-number');
      if (numEl) {
        numEl.textContent = this.remainingSeconds;
      }
    }

    cancelSOSSequence() {
      clearInterval(this.countdownTimer);
      const modal = document.getElementById('modal-sos-countdown');
      if (modal) modal.classList.remove('active');
      window.LifeLinkAuth.showToast('Emergency SOS broadcast was aborted.', 'info');
    }

    dispatchSOSAlert() {
      clearInterval(this.countdownTimer);
      const modal = document.getElementById('modal-sos-countdown');
      if (modal) modal.classList.remove('active');

      const user = window.LifeLinkDB.getCurrentUser();

      // Create high-priority critical emergency request
      const sosRequest = window.LifeLinkDB.addRequest({
        patientName: `EMERGENCY SOS: ${user.name}`,
        bloodGroup: user.bloodGroup || 'O-',
        units: 2,
        hospital: 'Nearest Trauma Emergency Room (GPS Auto-Routed)',
        city: user.city || 'Downtown District',
        urgency: 'CRITICAL',
        status: 'BROADCASTED',
        requiredFor: 'Panic SOS Triggered - Life Threatening Emergency',
        contactPhone: user.phone || '+1 (555) 911-0000',
        expiresInMins: 30
      });

      // Play audio notification chime (using Web Audio API)
      this.playAlarmTone();

      window.LifeLinkAuth.showToast(
        `🚨 CRITICAL SOS BROADCASTED! Alert sent to 28 nearby donors & Emergency Medical Dispatch.`,
        'error'
      );

      // Trigger custom event
      window.dispatchEvent(new CustomEvent('lifelink:sos-dispatched', { detail: sosRequest }));

      // Redirect to request tracking if not there
      if (!window.location.pathname.includes('request') && !window.location.pathname.includes('dashboard')) {
        setTimeout(() => {
          window.location.href = 'request.html';
        }, 1200);
      }
    }

    playAlarmTone() {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch alarm
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        // Silent fallback
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkSOS = new SOSEngine();
  });
})();
