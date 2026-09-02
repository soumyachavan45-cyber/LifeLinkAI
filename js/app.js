/**
 * LifeLink AI - Global Application Controller
 * Handles Themes, Multi-language Translations, Counters, Modals, and UI micro-interactions.
 */

(function() {
  'use strict';

  // Multi-Language Dictionary
  const TRANSLATIONS = {
    en: {
      brand_tagline: "Smart Emergency Blood & Community Response Platform",
      hero_title: "One Drop Can Save A Life. Connected by AI.",
      hero_desc: "LifeLink AI brings together blood donors, recipients, hospitals, and emergency responders in seconds with intelligent matching and live emergency dispatch.",
      btn_sos: "EMERGENCY SOS",
      btn_find_donor: "Find Blood Donor",
      btn_donate: "Become a Donor",
      stat_donors: "Active Donors",
      stat_lives: "Lives Saved",
      stat_hospitals: "Partner Hospitals",
      stat_response: "Avg Response Time",
      section_features_title: "Next-Gen Emergency Medical Network",
      section_camps_title: "Upcoming Blood Donation Drives",
      nav_home: "Home",
      nav_search: "Find Donors",
      nav_request: "Request Blood",
      nav_inventory: "Hospitals & Banks",
      nav_compatibility: "Compatibility",
      nav_ai_bot: "AI Assistant",
      nav_dashboard: "Dashboard"
    },
    hi: {
      brand_tagline: "स्मार्ट आपातकालीन रक्त और सामुदायिक प्रतिक्रिया मंच",
      hero_title: "रक्त की एक बूंद बचा सकती है जीवन। AI द्वारा संचालित।",
      hero_desc: "लाइफलिंग AI बुद्धिमान मिलान और लाइव आपातकालीन प्रेषण के साथ रक्तदाताओं, प्राप्तकर्ताओं और अस्पतालों को सेकंडों में जोड़ता है।",
      btn_sos: "आपातकालीन SOS",
      btn_find_donor: "रक्तदाता खोजें",
      btn_donate: "रक्तदाता बनें",
      stat_donors: "सक्रिय रक्तदाता",
      stat_lives: "बचाए गए जीवन",
      stat_hospitals: "भागीदार अस्पताल",
      stat_response: "औसत प्रतिक्रिया समय",
      section_features_title: "आधुनिक आपातकालीन चिकित्सा नेटवर्क",
      section_camps_title: "आगामी रक्तदान शिविर",
      nav_home: "होम",
      nav_search: "रक्तदाता खोजें",
      nav_request: "रक्त का अनुरोध",
      nav_inventory: "अस्पताल और ब्लड बैंक",
      nav_compatibility: "अनुकूलता",
      nav_ai_bot: "AI सहायक",
      nav_dashboard: "डैशबोर्ड"
    },
    mr: {
      brand_tagline: "स्मार्ट आपत्कालीन रक्त आणि समुदाय प्रतिसाद व्यासपीठ",
      hero_title: "रक्ताचा एक थेंब वाचवू शकतो प्राण. AI द्वारे जोडलेले.",
      hero_desc: "लाईफलिंग AI तात्काळ रक्तदाते, रुग्ण आणि रुग्णालयांना जोडणारे स्मार्ट व्यासपीठ आहे.",
      btn_sos: "आपत्कालीन SOS",
      btn_find_donor: "रक्तदाता शोधा",
      btn_donate: "रक्तदाता व्हा",
      stat_donors: "सक्रिय रक्तदाते",
      stat_lives: "वाचवलेले प्राण",
      stat_hospitals: "संलग्न रुग्णालये",
      stat_response: "सरासरी प्रतिसाद वेळ",
      section_features_title: "अत्याधुनिक वैद्यकीय प्रतिसाद प्रणाली",
      section_camps_title: "रक्तदान शिबिरे",
      nav_home: "मुख्यपृष्ठ",
      nav_search: "रक्तदाता शोधा",
      nav_request: "रक्त मागणी",
      nav_inventory: "रुग्णालय व बँका",
      nav_compatibility: "अनुकूलता",
      nav_ai_bot: "AI सहाय्यक",
      nav_dashboard: "डॅशबोर्ड"
    },
    es: {
      brand_tagline: "Plataforma Inteligente de Sangre de Emergencia y Respuesta Comunitaria",
      hero_title: "Una Gota Puede Salvar Una Vida. Conectado por IA.",
      hero_desc: "LifeLink AI une a donantes de sangre, receptores y hospitales en segundos con coincidencia inteligente.",
      btn_sos: "SOS DE EMERGENCIA",
      btn_find_donor: "Buscar Donante",
      btn_donate: "Ser Donante",
      stat_donors: "Donantes Activos",
      stat_lives: "Vidas Salvadas",
      stat_hospitals: "Hospitales Asociados",
      stat_response: "Tiempo de Respuesta",
      section_features_title: "Red Médica de Emergencia de Próxima Generación",
      section_camps_title: "Próximas Campañas de Donación",
      nav_home: "Inicio",
      nav_search: "Buscar Donantes",
      nav_request: "Solicitar Sangre",
      nav_inventory: "Hospitales y Bancos",
      nav_compatibility: "Compatibilidad",
      nav_ai_bot: "Asistente IA",
      nav_dashboard: "Panel"
    }
  };

  class AppController {
    constructor() {
      this.currentLang = localStorage.getItem('lifelink_lang') || 'en';
      this.currentTheme = localStorage.getItem('lifelink_theme') || 'dark';
      this.init();
    }

    init() {
      this.applyTheme(this.currentTheme);
      this.applyLanguage(this.currentLang);
      this.bindEvents();
      this.initAnimatedCounters();
      this.initNavbarScroll();
    }

    bindEvents() {
      // Theme Toggle Buttons
      document.addEventListener('click', (e) => {
        const themeBtn = e.target.closest('#theme-toggle-btn, .theme-toggle-btn');
        if (themeBtn) {
          const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
          this.applyTheme(newTheme);
        }

        // Language Selectors
        const langSelect = e.target.closest('#lang-selector, .lang-selector');
        if (langSelect && e.type === 'change') {
          this.applyLanguage(langSelect.value);
        }

        // Mobile Menu Hamburger Toggle
        const menuToggle = e.target.closest('#mobile-menu-toggle');
        if (menuToggle) {
          const navLinks = document.querySelector('.nav-links');
          if (navLinks) navLinks.classList.toggle('active');
        }

        // Modal Close Triggers
        const modalClose = e.target.closest('.modal-close, [data-close-modal]');
        if (modalClose) {
          const modal = modalClose.closest('.modal-overlay');
          if (modal) modal.classList.remove('active');
        }
      });

      const langEl = document.getElementById('lang-selector');
      if (langEl) {
        langEl.value = this.currentLang;
        langEl.addEventListener('change', (e) => this.applyLanguage(e.target.value));
      }
    }

    applyTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('lifelink_theme', theme);

      // Update toggle icon
      document.querySelectorAll('.theme-toggle-icon').forEach(icon => {
        if (theme === 'light') {
          icon.className = 'fa-solid fa-moon theme-toggle-icon';
        } else {
          icon.className = 'fa-solid fa-sun theme-toggle-icon';
        }
      });

      window.dispatchEvent(new CustomEvent('lifelink:theme-change', { detail: { theme } }));
    }

    applyLanguage(lang) {
      if (!TRANSLATIONS[lang]) lang = 'en';
      this.currentLang = lang;
      localStorage.setItem('lifelink_lang', lang);

      const dict = TRANSLATIONS[lang];
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
          el.textContent = dict[key];
        }
      });
    }

    initAnimatedCounters() {
      const counters = document.querySelectorAll('.counter-value');
      if (!counters.length) return;

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute('data-target') || 0;
            const duration = 1800; // ms
            const stepTime = 20;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.textContent = target.toLocaleString() + (counter.dataset.suffix || '');
                clearInterval(timer);
              } else {
                counter.textContent = Math.floor(current).toLocaleString() + (counter.dataset.suffix || '');
              }
            }, stepTime);

            obs.unobserve(counter);
          }
        });
      }, { threshold: 0.2 });

      counters.forEach(c => observer.observe(c));
    }

    initNavbarScroll() {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }

    openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
      }
    }

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
      }
    }
  }

  window.LifeLinkApp = new AppController();
})();
