/**
 * LifeLink AI - Real-time Analytics & Chart.js Engine
 */

(function() {
  'use strict';

  class AnalyticsEngine {
    constructor() {
      this.supplyDemandChart = null;
      this.bloodDistChart = null;
      this.responseTimeChart = null;
      this.init();
    }

    init() {
      if (typeof Chart === 'undefined') return;
      this.setupChartDefaults();
      this.renderCharts();
    }

    setupChartDefaults() {
      Chart.defaults.color = '#94a3b8';
      Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
      Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(14, 18, 26, 0.92)';
      Chart.defaults.plugins.tooltip.borderColor = 'rgba(229, 57, 53, 0.4)';
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.padding = 12;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
    }

    renderCharts() {
      this.renderSupplyDemandChart();
      this.renderBloodDistChart();
      this.renderResponseTimeChart();
    }

    renderSupplyDemandChart() {
      const ctx = document.getElementById('chart-supply-demand');
      if (!ctx) return;

      this.supplyDemandChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          datasets: [
            {
              label: 'Blood Donations (Units)',
              data: [320, 410, 380, 520, 610, 590, 680, 740, 810],
              backgroundColor: 'rgba(0, 230, 118, 0.65)',
              borderColor: '#00e676',
              borderWidth: 1,
              borderRadius: 6
            },
            {
              label: 'Emergency Requests (Units)',
              data: [360, 430, 400, 490, 580, 620, 650, 710, 780],
              backgroundColor: 'rgba(229, 57, 53, 0.65)',
              borderColor: '#e53935',
              borderWidth: 1,
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' } }
          }
        }
      });
    }

    renderBloodDistChart() {
      const ctx = document.getElementById('chart-blood-distribution');
      if (!ctx) return;

      const inv = window.LifeLinkDB ? window.LifeLinkDB.getInventory() : {
        'A+': { units: 28 }, 'A-': { units: 7 },
        'B+': { units: 34 }, 'B-': { units: 4 },
        'AB+': { units: 19 }, 'AB-': { units: 2 },
        'O+': { units: 42 }, 'O-': { units: 5 }
      };

      const labels = Object.keys(inv);
      const data = labels.map(k => inv[k].units);

      this.bloodDistChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: [
              '#e53935', '#ef5350', '#d32f2f', '#c62828',
              '#00e5ff', '#00b0ff', '#00e676', '#ff1744'
            ],
            borderColor: '#0e121a',
            borderWidth: 3,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right' }
          },
          cutout: '68%'
        }
      });
    }

    renderResponseTimeChart() {
      const ctx = document.getElementById('chart-response-time');
      if (!ctx) return;

      this.responseTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          datasets: [{
            label: 'Avg Response Time (Minutes)',
            data: [42, 35, 28, 22, 16, 11],
            borderColor: '#00e5ff',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00e5ff',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, title: { display: true, text: 'Minutes' } }
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkAnalytics = new AnalyticsEngine();
  });
})();
