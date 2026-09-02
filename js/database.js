/**
 * LifeLink AI - Central Database & State Management Engine
 * Handles pre-seeded mock records, LocalStorage sync, and reactive events.
 */

(function() {
  'use strict';

  const STORAGE_KEY_PREFIX = 'lifelink_';

  // Seed Data: Realistic Indian Medical & Emergency Records
  const SEED_DATA = {
    users: [
      {
        id: 'usr-001',
        name: 'Dr. Aditi Sharma',
        role: 'hospital',
        email: 'hospital@lifelink.ai',
        phone: '+91 98101 23456',
        hospitalName: 'AIIMS Apex Trauma Center, New Delhi',
        city: 'New Delhi',
        state: 'Delhi NCR',
        bloodGroup: 'O+',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'usr-002',
        name: 'Rohan Deshmukh',
        role: 'donor',
        email: 'donor@lifelink.ai',
        phone: '+91 98201 12345',
        bloodGroup: 'O-',
        age: 28,
        gender: 'Male',
        city: 'Mumbai',
        state: 'Maharashtra',
        isAvailable: true,
        donationsCount: 14,
        lastDonationDate: '2026-06-15',
        badges: ['Life Saver', 'Golden Heart', 'Legend', '10+ Donations'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'usr-003',
        name: 'Pooja Verma',
        role: 'donor',
        email: 'pooja.verma@example.com',
        phone: '+91 98450 67890',
        bloodGroup: 'A+',
        age: 24,
        gender: 'Female',
        city: 'Bengaluru',
        state: 'Karnataka',
        isAvailable: true,
        donationsCount: 6,
        lastDonationDate: '2026-07-20',
        badges: ['Hero', 'Silver Donor'],
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'usr-004',
        name: 'Aniket Patil',
        role: 'donor',
        email: 'aniket.p@example.com',
        phone: '+91 98220 34567',
        bloodGroup: 'B-',
        age: 32,
        gender: 'Male',
        city: 'Pune',
        state: 'Maharashtra',
        isAvailable: true,
        donationsCount: 9,
        lastDonationDate: '2026-05-10',
        badges: ['Gold Donor', 'Fast Responder'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'usr-005',
        name: 'Meera Nair',
        role: 'recipient',
        email: 'recipient@lifelink.ai',
        phone: '+91 98470 56789',
        bloodGroup: 'AB-',
        city: 'Kochi',
        state: 'Kerala',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'usr-006',
        name: 'Col. Rajesh Iyer',
        role: 'admin',
        email: 'admin@lifelink.ai',
        phone: '+91 98110 99999',
        bloodGroup: 'B+',
        city: 'New Delhi',
        state: 'Delhi NCR',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
      }
    ],

    donorsList: [
      {
        id: 'dn-101',
        name: 'Rohan Deshmukh (Universal Donor)',
        bloodGroup: 'O-',
        city: 'Mumbai',
        state: 'Maharashtra',
        area: 'Bandra West, Mumbai',
        lat: 19.0596,
        lng: 72.8295,
        distanceKm: 2.4,
        isAvailable: true,
        lastDonatedDaysAgo: 78,
        responseRate: 98,
        phone: '+91 98201 12345',
        verified: true
      },
      {
        id: 'dn-102',
        name: 'Pooja Verma',
        bloodGroup: 'A+',
        city: 'Bengaluru',
        state: 'Karnataka',
        area: 'Indiranagar, Bengaluru',
        lat: 12.9784,
        lng: 77.6408,
        distanceKm: 4.8,
        isAvailable: true,
        lastDonatedDaysAgo: 45,
        responseRate: 94,
        phone: '+91 98450 67890',
        verified: true
      },
      {
        id: 'dn-103',
        name: 'Aniket Patil',
        bloodGroup: 'B-',
        city: 'Pune',
        state: 'Maharashtra',
        area: 'Kothrud, Pune',
        lat: 18.5074,
        lng: 73.8077,
        distanceKm: 5.2,
        isAvailable: true,
        lastDonatedDaysAgo: 110,
        responseRate: 99,
        phone: '+91 98220 34567',
        verified: true
      },
      {
        id: 'dn-104',
        name: 'Deepak Sundaram',
        bloodGroup: 'AB+',
        city: 'Chennai',
        state: 'Tamil Nadu',
        area: 'Anna Nagar, Chennai',
        lat: 13.0850,
        lng: 80.2101,
        distanceKm: 3.1,
        isAvailable: true,
        lastDonatedDaysAgo: 65,
        responseRate: 92,
        phone: '+91 98401 23456',
        verified: true
      },
      {
        id: 'dn-105',
        name: 'Kavita Sen',
        bloodGroup: 'O+',
        city: 'Kolkata',
        state: 'West Bengal',
        area: 'Salt Lake City, Kolkata',
        lat: 22.5867,
        lng: 88.4178,
        distanceKm: 7.5,
        isAvailable: true,
        lastDonatedDaysAgo: 92,
        responseRate: 96,
        phone: '+91 98301 45678',
        verified: true
      },
      {
        id: 'dn-106',
        name: 'Vikram Singhania',
        bloodGroup: 'B+',
        city: 'Hyderabad',
        state: 'Telangana',
        area: 'Hitec City, Hyderabad',
        lat: 17.4435,
        lng: 78.3772,
        distanceKm: 1.8,
        isAvailable: true,
        lastDonatedDaysAgo: 60,
        responseRate: 100,
        phone: '+91 98490 12345',
        verified: true
      },
      {
        id: 'dn-107',
        name: 'Neha Rathore',
        bloodGroup: 'A-',
        city: 'Jaipur',
        state: 'Rajasthan',
        area: 'Malviya Nagar, Jaipur',
        lat: 26.8532,
        lng: 75.8052,
        distanceKm: 6.0,
        isAvailable: true,
        lastDonatedDaysAgo: 120,
        responseRate: 91,
        phone: '+91 98290 67890',
        verified: true
      },
      {
        id: 'dn-108',
        name: 'Arjun Patel',
        bloodGroup: 'AB-',
        city: 'Ahmedabad',
        state: 'Gujarat',
        area: 'Navrangpura, Ahmedabad',
        lat: 23.0365,
        lng: 72.5611,
        distanceKm: 4.5,
        isAvailable: true,
        lastDonatedDaysAgo: 85,
        responseRate: 95,
        phone: '+91 98250 12345',
        verified: true
      },
      {
        id: 'dn-109',
        name: 'Dr. Sameer Khan',
        bloodGroup: 'O-',
        city: 'New Delhi',
        state: 'Delhi NCR',
        area: 'Hauz Khas, New Delhi',
        lat: 28.5494,
        lng: 77.2001,
        distanceKm: 3.2,
        isAvailable: true,
        lastDonatedDaysAgo: 95,
        responseRate: 97,
        phone: '+91 98111 54321',
        verified: true
      },
      {
        id: 'dn-110',
        name: 'Tanmay Joshi',
        bloodGroup: 'A+',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        area: 'Gomti Nagar, Lucknow',
        lat: 26.8500,
        lng: 80.9900,
        distanceKm: 3.8,
        isAvailable: true,
        lastDonatedDaysAgo: 40,
        responseRate: 96,
        phone: '+91 98390 11223',
        verified: true
      }
    ],

    emergencyRequests: [
      {
        id: 'REQ-9921',
        patientName: 'Aarav Mehta',
        bloodGroup: 'O-',
        units: 3,
        hospital: 'AIIMS Apex Trauma Center (ICU Bed 4)',
        city: 'New Delhi',
        state: 'Delhi NCR',
        urgency: 'CRITICAL',
        status: 'BROADCASTED',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        expiresInMins: 45,
        requiredFor: 'Emergency Post-Accident Surgery',
        contactPhone: '+91 98100 11911',
        donorsNotified: 28,
        donorsAccepted: 3
      },
      {
        id: 'REQ-9918',
        patientName: 'Sunita Kulkarni',
        bloodGroup: 'A+',
        units: 2,
        hospital: 'Tata Memorial Hospital & Cancer Institute',
        city: 'Mumbai',
        state: 'Maharashtra',
        urgency: 'URGENT',
        status: 'DONOR_EN_ROUTE',
        createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
        expiresInMins: 120,
        requiredFor: 'Oncology Platelet & Red Cell Support',
        contactPhone: '+91 98200 44123',
        donorsNotified: 18,
        donorsAccepted: 2
      },
      {
        id: 'REQ-9915',
        patientName: 'Rajeshwar Rao',
        bloodGroup: 'B+',
        units: 4,
        hospital: 'Apollo Hospitals, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        urgency: 'STANDARD',
        status: 'FULFILLED',
        createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        expiresInMins: 0,
        requiredFor: 'Thalassemia Blood Transfusion',
        contactPhone: '+91 98490 77987',
        donorsNotified: 25,
        donorsAccepted: 4
      }
    ],

    hospitalInventory: {
      'A+': { units: 38, minThreshold: 20, status: 'OPTIMAL' },
      'A-': { units: 9, minThreshold: 12, status: 'LOW' },
      'B+': { units: 45, minThreshold: 20, status: 'OPTIMAL' },
      'B-': { units: 6, minThreshold: 10, status: 'CRITICAL_LOW' },
      'AB+': { units: 24, minThreshold: 15, status: 'OPTIMAL' },
      'AB-': { units: 3, minThreshold: 8, status: 'CRITICAL_LOW' },
      'O+': { units: 52, minThreshold: 30, status: 'OPTIMAL' },
      'O-': { units: 7, minThreshold: 25, status: 'CRITICAL_LOW' } // Universal Red
    },

    donationCamps: [
      {
        id: 'CAMP-301',
        title: 'Indian Red Cross Society - National Mega Blood Drive',
        organizer: 'National Blood Transfusion Council (NBTC India)',
        date: 'Sept 15, 2026 (09:00 AM - 05:00 PM)',
        location: 'BKC Exhibition Grounds, Bandra Kurla Complex, Mumbai, Maharashtra',
        targetUnits: 500,
        registeredDonors: 342,
        banner: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'CAMP-302',
        title: 'Youth India LifeLink Campus Blood Drive',
        organizer: 'IIT Bombay & Rotaract Club Volunteers',
        date: 'Sept 22, 2026 (10:00 AM - 04:00 PM)',
        location: 'IIT Bombay SAC Gymkhana Grounds, Powai, Mumbai',
        targetUnits: 300,
        registeredDonors: 215,
        banner: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600'
      },
      {
        id: 'CAMP-303',
        title: 'Delhi NCR Community Mega Blood Donation Camp',
        organizer: 'Lions Club India & AIIMS Blood Bank',
        date: 'Sept 28, 2026 (09:30 AM - 04:30 PM)',
        location: 'Connaught Place Central Park, New Delhi',
        targetUnits: 400,
        registeredDonors: 280,
        banner: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600'
      }
    ],

    donationHistory: [
      {
        id: 'DON-881',
        date: '2026-06-15',
        hospital: 'KEM Hospital & Blood Bank, Mumbai',
        units: 1,
        bloodGroup: 'O-',
        patientCategory: 'Emergency Pediatric Cardiac Care',
        certificateUrl: '#',
        pointsEarned: 150
      },
      {
        id: 'DON-874',
        date: '2026-02-10',
        hospital: 'Indian Red Cross Mobile Blood Van, Dadar',
        units: 1,
        bloodGroup: 'O-',
        patientCategory: 'Emergency Trauma Response',
        certificateUrl: '#',
        pointsEarned: 150
      },
      {
        id: 'DON-862',
        date: '2025-10-04',
        hospital: 'Tata Memorial Hospital, Parel, Mumbai',
        units: 1,
        bloodGroup: 'O-',
        patientCategory: 'Oncology Support Transfusion',
        certificateUrl: '#',
        pointsEarned: 150
      }
    ]
  };

  class DatabaseEngine {
    constructor() {
      this.init();
    }

    init() {
      // Force refresh if old US seed data is present in localStorage
      const existingUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
      const needsMigration = !existingUser || existingUser.includes('New York') || existingUser.includes('Alex Mercer');

      if (needsMigration) {
        Object.keys(SEED_DATA).forEach(key => {
          localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(SEED_DATA[key]));
        });
        sessionStorage.setItem('lifelink_current_user', JSON.stringify(SEED_DATA.users[1]));
      } else {
        Object.keys(SEED_DATA).forEach(key => {
          if (!localStorage.getItem(STORAGE_KEY_PREFIX + key)) {
            localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(SEED_DATA[key]));
          }
        });
      }

      // Default Active Session
      if (!sessionStorage.getItem('lifelink_current_user')) {
        const defaultUser = this.getUsers()[1]; // Rohan Deshmukh (Donor) default
        sessionStorage.setItem('lifelink_current_user', JSON.stringify(defaultUser));
      }
    }

    get(key) {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : null;
    }

    set(key, value) {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('lifelink:data-change', { detail: { key, value } }));
    }

    getUsers() { return this.get('users') || []; }
    getDonors() { return this.get('donorsList') || []; }
    getRequests() { return this.get('emergencyRequests') || []; }
    getInventory() { return this.get('hospitalInventory') || {}; }
    getCamps() { return this.get('donationCamps') || []; }
    getHistory() { return this.get('donationHistory') || []; }

    getCurrentUser() {
      const u = sessionStorage.getItem('lifelink_current_user');
      return u ? JSON.parse(u) : this.getUsers()[1];
    }

    setCurrentUser(user) {
      sessionStorage.setItem('lifelink_current_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('lifelink:auth-change', { detail: user }));
    }

    addRequest(reqData) {
      const requests = this.getRequests();
      const newReq = {
        id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date().toISOString(),
        status: 'BROADCASTED',
        donorsNotified: Math.floor(10 + Math.random() * 20),
        donorsAccepted: 0,
        ...reqData
      };
      requests.unshift(newReq);
      this.set('emergencyRequests', requests);
      return newReq;
    }

    updateInventory(bloodGroup, deltaUnits) {
      const inv = this.getInventory();
      if (inv[bloodGroup]) {
        inv[bloodGroup].units = Math.max(0, inv[bloodGroup].units + deltaUnits);
        if (inv[bloodGroup].units <= inv[bloodGroup].minThreshold / 2) {
          inv[bloodGroup].status = 'CRITICAL_LOW';
        } else if (inv[bloodGroup].units <= inv[bloodGroup].minThreshold) {
          inv[bloodGroup].status = 'LOW';
        } else {
          inv[bloodGroup].status = 'OPTIMAL';
        }
        this.set('hospitalInventory', inv);
      }
      return inv;
    }

    addDonor(donor) {
      const donors = this.getDonors();
      const newDonor = {
        id: 'dn-' + Math.floor(200 + Math.random() * 800),
        verified: true,
        responseRate: 95,
        lastDonatedDaysAgo: 90,
        ...donor
      };
      donors.unshift(newDonor);
      this.set('donorsList', donors);
      return newDonor;
    }

    resetToDefaults() {
      Object.keys(SEED_DATA).forEach(key => {
        localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(SEED_DATA[key]));
      });
      window.dispatchEvent(new CustomEvent('lifelink:data-change', { detail: { reset: true } }));
    }
  }

  window.LifeLinkDB = new DatabaseEngine();
})();
