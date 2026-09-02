/**
 * LifeLink AI - Authentication, Session Management & 1-Click Role Switcher
 */

(function() {
  'use strict';

  class AuthController {
    constructor() {
      this.init();
    }

    init() {
      this.bindEvents();
      this.updateAuthUI();
    }

    bindEvents() {
      // Listen for role-switch triggers across pages
      document.addEventListener('click', (e) => {
        const roleBtn = e.target.closest('[data-switch-role]');
        if (roleBtn) {
          const role = roleBtn.dataset.switchRole;
          this.switchDemoRole(role);
        }

        const logoutBtn = e.target.closest('#btn-logout, .btn-logout');
        if (logoutBtn) {
          e.preventDefault();
          this.logout();
        }
      });
    }

    switchDemoRole(role) {
      const users = window.LifeLinkDB.getUsers();
      const targetUser = users.find(u => u.role.toLowerCase() === role.toLowerCase()) || users[1];
      window.LifeLinkDB.setCurrentUser(targetUser);
      
      this.showToast(`Switched active profile to: ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'info');
      
      // If on login or register, forward to dashboard
      if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
        window.location.href = 'dashboard.html';
      } else {
        // Trigger UI updates
        this.updateAuthUI();
        window.dispatchEvent(new CustomEvent('lifelink:role-switched', { detail: targetUser }));
      }
    }

    login(email, password) {
      const users = window.LifeLinkDB.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        window.LifeLinkDB.setCurrentUser(user);
        return { success: true, user };
      }
      
      // Create guest session if not matching
      const guestUser = {
        id: 'usr-' + Date.now().toString().slice(-4),
        name: email.split('@')[0],
        email: email,
        role: 'donor',
        bloodGroup: 'O+',
        city: 'New York',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
      };
      window.LifeLinkDB.setCurrentUser(guestUser);
      return { success: true, user: guestUser };
    }

    logout() {
      sessionStorage.removeItem('lifelink_current_user');
      this.showToast('You have been safely logged out.', 'info');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 600);
    }

    updateAuthUI() {
      const user = window.LifeLinkDB ? window.LifeLinkDB.getCurrentUser() : null;
      if (!user) return;

      // Update avatar & name elements across DOM
      document.querySelectorAll('.auth-user-name').forEach(el => el.textContent = user.name);
      document.querySelectorAll('.auth-user-role').forEach(el => el.textContent = user.role.toUpperCase());
      document.querySelectorAll('.auth-user-blood').forEach(el => el.textContent = user.bloodGroup || 'O+');
      document.querySelectorAll('.auth-user-avatar').forEach(el => {
        if (el.tagName === 'IMG') el.src = user.avatar;
      });

      // Update Active Role Buttons in Switcher Bar
      document.querySelectorAll('[data-switch-role]').forEach(btn => {
        if (btn.dataset.switchRole.toLowerCase() === user.role.toLowerCase()) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    showToast(message, type = 'info') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      
      const iconMap = {
        success: 'fa-circle-check',
        error: 'fa-triangle-exclamation',
        info: 'fa-bell'
      };

      toast.innerHTML = `
        <i class="fa-solid ${iconMap[type] || 'fa-info-circle'} toast-icon"></i>
        <div class="toast-content">
          <h5>${type.toUpperCase()}</h5>
          <p>${message}</p>
        </div>
      `;

      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  }

  window.LifeLinkAuth = new AuthController();
})();
