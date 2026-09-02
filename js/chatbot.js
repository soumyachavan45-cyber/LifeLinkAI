/**
 * LifeLink AI - Intelligent Medical Advisor & Blood Donation Eligibility Chatbot
 */

(function() {
  'use strict';

  // Comprehensive Medical Knowledge Base for Blood Donation & Triage
  const KNOWLEDGE_BASE = [
    {
      keywords: ['fever', 'cold', 'flu', 'sick', 'temperature'],
      response: "🌡️ **Fever & Viral Illness**: You must be fully recovered and symptom-free for at least **14 days** after a fever, cold, or viral infection before donating blood. This ensures both your safety and the safety of the recipient."
    },
    {
      keywords: ['tattoo', 'piercing', 'ink'],
      response: "🎨 **Tattoos & Body Piercings**: If you received a tattoo or body piercing from a licensed facility using single-use sterile needles, the deferral period is usually **3 months** (or 6 months depending on local regional regulations). If done at an unlicensed setting, wait 12 months."
    },
    {
      keywords: ['alcohol', 'beer', 'wine', 'drink', 'drinking'],
      response: "🍷 **Alcohol Consumption**: Avoid consuming alcohol for at least **24 to 48 hours** prior to blood donation. Alcohol causes dehydration, which can lead to lightheadedness during or after phlebotomy. Drink plenty of water instead!"
    },
    {
      keywords: ['weight', 'age', 'hemoglobin', 'eligibility', 'criteria', 'who can donate'],
      response: "📋 **General Eligibility Criteria**:\n- **Age**: 18 – 65 years old\n- **Weight**: Minimum 50 kg (110 lbs)\n- **Hemoglobin**: Minimum 12.5 g/dL for females, 13.0 g/dL for males\n- **Blood Pressure**: 90/60 to 140/90 mmHg\n- **Pulse**: 60 - 100 bpm regular."
    },
    {
      keywords: ['frequently', 'often', 'gap', 'how often', 'interval', 'days between'],
      response: "⏳ **Donation Frequency**:\n- **Whole Blood**: Every **56 days** (8 weeks) for males, 90 days for females.\n- **Platelets (Apheresis)**: Every **7 days** (up to 24 times/year).\n- **Plasma**: Every **28 days**."
    },
    {
      keywords: ['medication', 'medicine', 'antibiotics', 'aspirin', 'drugs'],
      response: "💊 **Medications**:\n- **Antibiotics**: Wait 7 days after completing the course.\n- **Aspirin**: Wait 48 hours if donating platelets (acceptable for whole blood).\n- **Blood thinners**: Deferral required — consult our medical team on duty."
    },
    {
      keywords: ['food', 'diet', 'eat', 'before donation', 'prepare'],
      response: "🥗 **Pre-Donation Preparation**:\n1. Drink 500ml of water 30 minutes before donation.\n2. Eat a healthy, iron-rich meal (spinach, beans, lean meats) 2–3 hours prior.\n3. Avoid fatty or greasy foods, as excess lipids interfere with blood testing tests."
    },
    {
      keywords: ['universal', 'o-', 'o negative', 'ab+', 'ab positive', 'best blood'],
      response: "🩸 **Universal Donors & Recipients**:\n- **O Negative (O-)**: Universal Red Blood Cell donor. Essential in trauma emergencies where there's no time to crossmatch!\n- **AB Positive (AB+)**: Universal Red Blood Cell recipient and Universal Plasma donor."
    },
    {
      keywords: ['after donation', 'post donation', 'dizzy', 'faint', 'recovery'],
      response: "🩹 **Post-Donation Care**:\n1. Rest for 10-15 minutes in the refreshment lounge.\n2. Keep the bandage on for 4 hours.\n3. Avoid strenuous exercise or heavy lifting for 24 hours.\n4. If you feel dizzy, sit down and put your head between your knees or lie down."
    }
  ];

  class AIChatbotEngine {
    constructor() {
      this.chatHistory = [];
      this.init();
    }

    init() {
      this.bindEvents();
      this.sendInitialGreeting();
    }

    bindEvents() {
      const sendBtn = document.getElementById('chat-send-btn');
      const input = document.getElementById('chat-input-text');

      if (sendBtn && input) {
        sendBtn.addEventListener('click', () => this.handleSendMessage());
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') this.handleSendMessage();
        });
      }

      // Quick prompt chips
      document.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chat-prompt]');
        if (chip) {
          const prompt = chip.dataset.chatPrompt;
          if (input) input.value = prompt;
          this.handleSendMessage();
        }
      });
    }

    sendInitialGreeting() {
      const messagesContainer = document.getElementById('chat-messages-box');
      if (!messagesContainer || messagesContainer.children.length > 0) return;

      this.appendBotMessage(
        "👋 Hello! I am **LifeLink AI Medical Assistant**.\n\nI can help answer your questions about **blood donation eligibility**, **donor preparation**, **fever/medication rules**, and **emergency donor matching**. How can I assist you today?"
      );
    }

    handleSendMessage() {
      const input = document.getElementById('chat-input-text');
      if (!input || !input.value.trim()) return;

      const userText = input.value.trim();
      input.value = '';

      this.appendUserMessage(userText);

      // Simulate AI typing indicator
      const typingEl = this.showTypingIndicator();

      setTimeout(() => {
        if (typingEl) typingEl.remove();
        const botReply = this.generateResponse(userText);
        this.appendBotMessage(botReply);
      }, 700);
    }

    generateResponse(query) {
      const clean = query.toLowerCase();

      // Check knowledge base
      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(k => clean.includes(k))) {
          return item.response;
        }
      }

      // Check compatibility question
      if (clean.includes('can') && (clean.includes('donate to') || clean.includes('receive from'))) {
        return "🧬 **Blood Compatibility Check**: You can use our interactive **Blood Compatibility Matrix** on the menu to see real-time transfusion rules between any ABO & Rh blood types!";
      }

      // Fallback
      return "🤖 I understand your question regarding blood and healthcare response. For personalized medical assessments, please consult our on-duty physician or refer to the **Donor Guidelines** section in your dashboard.";
    }

    appendUserMessage(text) {
      const container = document.getElementById('chat-messages-box');
      if (!container) return;

      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg user';
      msgDiv.innerHTML = `
        <div class="chat-bubble">
          <p>${this.escapeHtml(text)}</p>
        </div>
      `;
      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    }

    appendBotMessage(text) {
      const container = document.getElementById('chat-messages-box');
      if (!container) return;

      // Parse markdown-like bold and line breaks
      const formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');

      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg bot';
      msgDiv.innerHTML = `
        <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--grad-primary); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="chat-bubble">
          <p>${formatted}</p>
        </div>
      `;
      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    }

    showTypingIndicator() {
      const container = document.getElementById('chat-messages-box');
      if (!container) return null;

      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-msg bot';
      typingDiv.id = 'chat-typing-indicator';
      typingDiv.innerHTML = `
        <div style="width: 34px; height: 34px; border-radius: 50%; background: var(--grad-primary); display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0;">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="chat-bubble" style="display: flex; gap: 4px; align-items: center; padding: 0.8rem 1.2rem;">
          <span class="pulse-dot"></span>
          <span class="pulse-dot" style="animation-delay: 0.2s;"></span>
          <span class="pulse-dot" style="animation-delay: 0.4s;"></span>
        </div>
      `;
      container.appendChild(typingDiv);
      container.scrollTop = container.scrollHeight;
      return typingDiv;
    }

    escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.LifeLinkChatbot = new AIChatbotEngine();
  });
})();
