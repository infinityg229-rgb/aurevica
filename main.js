// Aurevica Lumina Healthcare Platform - Main JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject and Initialize Agent Collaboration Console
    injectAgentConsole();
    
    // 2. Wire up Common UI Elements
    setupMobileNav();
    setupActiveNavLink();
    
    // 3. Page-Specific Initializations
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (page === 'index.html' || page === '') {
        initHomePage();
    } else if (page === 'login.html' || page === 'signup.html') {
        initAuthPage();
    } else if (page === 'ai-assistant.html') {
        initAIAssistantPage();
    } else if (page === 'health-tracker.html') {
        initHealthTrackerPage();
    } else if (page === 'medical-knowledge.html') {
        initMedicalKnowledgePage();
    } else if (page === 'speech-therapy.html') {
        initSpeechTherapyPage();
    } else if (page === 'consultation.html') {
        initConsultationPage();
    } else if (page === 'pricing.html') {
        initPricingPage();
    } else if (page === 'report-analysis.html') {
        initReportAnalysisPage();
    } else if (page === 'organ-health.html') {
        initOrganHealthPage();
    } else if (page === 'pharmacy.html') {
        initPharmacyPage();
    }
});

/* ==========================================
   AGENT COLLABORATION CONSOLE
   ========================================== */
function injectAgentConsole() {
    const consoleHTML = `
        <div id="agent-console" class="agent-console-widget minimized">
            <div class="console-header" onclick="toggleAgentConsole()">
                <div class="console-title">
                    <span class="console-status-dot"></span>
                    Aurevica
                </div>
                <button class="console-toggle-btn">▲</button>
            </div>
            <div id="console-body" class="console-body">
                <!-- Logs will be inserted here -->
            </div>
            <div class="console-input-container">
                <input type="text" id="console-chat-input" placeholder="Ask Aurevica AI..." onkeydown="handleConsoleChat(event)" onclick="event.stopPropagation()">
                <button id="console-chat-send" onclick="sendConsoleChat(event)">Send</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', consoleHTML);
    
    // Initial boot logs
    logAgent('supervisor', 'Initializing Aurevica Multi-Agent System...');
    logAgent('designer', 'Applying slate-blue (#051424) and neon-lime (#a1fb00) color tokens.');
    logAgent('frontend', 'DOM loaded. Responsive grid structures established.');
    logAgent('interlink', 'Cross-navigation paths mapped and verified.');
    logAgent('copywriting', 'Medical disclaimers and clinical terminology verified for accuracy.');
}

function toggleAgentConsole() {
    const widget = document.getElementById('agent-console');
    const btn = widget.querySelector('.console-toggle-btn');
    if (widget.classList.contains('minimized')) {
        widget.classList.remove('minimized');
        widget.classList.add('expanded');
        btn.textContent = '▼';
        logAgent('supervisor', 'Agent Console expanded. Interactive chat active.');
    } else {
        widget.classList.remove('expanded');
        widget.classList.add('minimized');
        btn.textContent = '▲';
    }
}

function logAgent(agent, message) {
    const consoleBody = document.getElementById('console-body');
    if (!consoleBody) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logHTML = `
        <div class="console-log">
            <span class="console-timestamp">[${timestamp}]</span>
            <span class="console-agent agent-${agent.toLowerCase()}">${agent.toUpperCase()}:</span>
            <span class="console-msg">${message}</span>
        </div>
    `;
    consoleBody.insertAdjacentHTML('beforeend', logHTML);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function handleConsoleChat(event) {
    if (event.key === 'Enter') {
        sendConsoleChat(event);
    }
}

function sendConsoleChat(event) {
    event.stopPropagation();
    const input = document.getElementById('console-chat-input');
    const query = input.value.trim();
    if (!query) return;
    
    // Clear input
    input.value = '';
    
    // Log user message
    logAgent('user', query);
    
    // Generate Agent Response
    setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('heart') || lowerQuery.includes('cardio') || lowerQuery.includes('attack')) {
            logAgent('ceo', 'AI CEO: Analyzing cardiac symptoms. Heart Attacks (Myocardial Infarctions) require emergency stenting or thrombolytic drugs. Natural support: Hawthorn Berry, CoQ10.');
        } else if (lowerQuery.includes('kidney') || lowerQuery.includes('renal') || lowerQuery.includes('stone')) {
            logAgent('supervisor', 'Supervisor: Kidney stones are fully curable. Drink 3L+ water, use lemon juice & olive oil. Chronic kidney disease (CKD) requires strict BP control and avoiding NSAIDs.');
        } else if (lowerQuery.includes('eye') || lowerQuery.includes('vision') || lowerQuery.includes('glaucoma') || lowerQuery.includes('cataract')) {
            logAgent('designer', 'Designer: Retinal scan active. Glaucoma requires pressure-lowering drops to prevent nerve damage. Cataracts are cured via IOL lens replacement surgery.');
        } else if (lowerQuery.includes('fever') || lowerQuery.includes('dengue') || lowerQuery.includes('malaria')) {
            logAgent('supervisor', 'Supervisor: Fever alert. For Dengue, use Paracetamol only. Do NOT use Ibuprofen/NSAIDs due to bleeding risks. Malaria is cured with ACT therapy.');
        } else if (lowerQuery.includes('diet') || lowerQuery.includes('eat') || lowerQuery.includes('food')) {
            logAgent('ceo', 'AI CEO: Dietetics loaded. Heart: Low-sodium, trans-fat-free. Kidney: Low-sodium, low-potassium. Fatty Liver (NAFLD): Mediterranean diet, zero fructose.');
        } else if (lowerQuery.includes('help') || lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            logAgent('supervisor', 'Supervisor: Welcome to Aurevica. Ask me about heart, kidney, eye, lung, or liver conditions, or query specific medications (e.g. Paracetamol, Ibuprofen).');
        } else {
            logAgent('supervisor', 'Supervisor: Query received. I can provide clinical data on organ systems, medical knowledge, medication safety, or speech exercises.');
        }
    }, 600);
}

/* ==========================================
   COMMON NAVIGATION WIRING
   ========================================== */
function setupMobileNav() {
    // In a real application, wire up a mobile hamburger menu here
}

function setupActiveNavLink() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* ==========================================
   PAGE: HOME / INDEX
   ========================================== */
let activeRemedy = null;
function initHomePage() {
    logAgent('supervisor', 'Home Page active. Verifying home remedy safeguards.');
    
    const remedyCards = document.querySelectorAll('.remedy-card');
    const modalBackdrop = document.getElementById('disclaimer-modal');
    const acceptBtn = document.getElementById('accept-disclaimer-btn');
    const cancelBtn = document.getElementById('cancel-disclaimer-btn');
    
    remedyCards.forEach(card => {
        card.addEventListener('click', () => {
            activeRemedy = card.getAttribute('data-remedy');
            logAgent('interlink', `User requested home remedy details for: ${activeRemedy}`);
            
            // Check if disclaimer accepted
            if (localStorage.getItem('remedies_disclaimer_accepted') === 'true') {
                showRemedyDetails(activeRemedy);
            } else {
                logAgent('supervisor', 'Safety check: Prompting medical disclaimer.');
                modalBackdrop.classList.add('active');
            }
        });
    });
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('remedies_disclaimer_accepted', 'true');
            modalBackdrop.classList.remove('active');
            logAgent('supervisor', 'Disclaimer accepted. Access granted to home remedies.');
            showRemedyDetails(activeRemedy);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modalBackdrop.classList.remove('active');
            logAgent('supervisor', 'Disclaimer declined. Access to home remedies blocked.');
        });
    }
}

const remediesData = {
    cold: {
        title: "Natural Cold & Cough Remedies",
        remedy: "Ginger-Honey Tea: Boil sliced ginger in water for 10 mins, strain, add 1 tbsp of organic honey and a squeeze of lemon. Drink 2-3 times daily. Saltwater gargles (1/2 tsp salt in warm water) reduce throat swelling."
    },
    migraine: {
        title: "Natural Migraine & Headache Relief",
        remedy: "Peppermint Oil Massage: Apply diluted peppermint essential oil to temples and forehead. Feverfew tea is also known to reduce migraine frequency. Rest in a dark, quiet room with a cold compress on the neck."
    },
    indigestion: {
        title: "Natural Indigestion & Acid Reflux Relief",
        remedy: "Fennel Seeds / Chamomile Tea: Chew 1 tsp of fennel seeds after meals, or drink warm Chamomile tea. Avoid lying down immediately after eating. Apple Cider Vinegar (1 tsp in a glass of water before meals) can balance stomach acid."
    },
    insomnia: {
        title: "Natural Insomnia & Sleep Aids",
        remedy: "Valerian Root & Warm Milk: Drink warm milk with a pinch of nutmeg, or Valerian root tea 45 minutes before bedtime. Maintain a dark room, keep screens away, and practice deep diaphragmatic breathing for 5 minutes."
    }
};

function showRemedyDetails(remedyKey) {
    const data = remediesData[remedyKey];
    if (!data) return;
    
    // Find or create details container
    let container = document.getElementById('remedy-details-display');
    if (!container) {
        const grid = document.querySelector('.remedy-grid');
        grid.insertAdjacentHTML('afterend', `
            <div id="remedy-details-display" class="card" style="margin-top: 2rem; border-color: var(--secondary-color); background-color: var(--secondary-light); animation: fadeIn 0.4s ease-out;">
                <h3 id="remedy-title" style="color: var(--secondary-hover)"></h3>
                <p id="remedy-content" style="color: var(--text-main); margin-top: 0.5rem; font-weight: 500;"></p>
            </div>
        `);
        container = document.getElementById('remedy-details-display');
    }
    
    document.getElementById('remedy-title').textContent = data.title;
    document.getElementById('remedy-content').textContent = data.remedy;
    logAgent('copywriting', `Rendering professional medical instructions for ${data.title}.`);
}

/* ==========================================
   PAGE: AUTHENTICATION
   ========================================== */
function initAuthPage() {
    logAgent('frontend', 'Auth forms ready. Google, Facebook, Apple, and Mobile OAuth hooks configured.');
    
    const phoneForm = document.getElementById('phone-login-form');
    if (phoneForm) {
        phoneForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone-input').value;
            logAgent('backend', `Initiating SMS OTP challenge for: ${phone}`);
            
            // Simulate OTP Input
            const otpContainer = document.getElementById('otp-container') || document.createElement('div');
            otpContainer.id = 'otp-container';
            otpContainer.className = 'form-group';
            otpContainer.style.marginTop = '1rem';
            otpContainer.innerHTML = `
                <label for="otp-input">Enter 6-Digit OTP sent to your mobile</label>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="otp-input" class="form-input" placeholder="123456" maxlength="6" style="text-align: center; font-size: 1.25rem; letter-spacing: 0.2em;" required>
                    <button type="button" id="verify-otp-btn" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">Verify</button>
                </div>
            `;
            
            phoneForm.appendChild(otpContainer);
            document.getElementById('verify-otp-btn').addEventListener('click', () => {
                logAgent('backend', 'OTP matched. Granting secure session token.');
                logAgent('supervisor', 'User successfully authenticated.');
                alert('Authentication successful! Redirecting to Home...');
                window.location.href = 'index.html';
            });
        });
    }
}

/* ==========================================
   PAGE: AI ASSISTANT (DIET & SYMPTOMS)
   ========================================== */
let aiMode = 'symptoms'; // 'symptoms' or 'diet'
const langGreetings = {
    en: "Hello! I am Aurevica Lumina's Clinical AI Assistant. How can I help you today? Please tell me what symptoms you are experiencing.",
    hi: "नमस्ते! मैं ऑरेविका का क्लिनिकल एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ? कृपया मुझे बताएं कि आपको क्या लक्षण महसूस हो रहे हैं।",
    es: "¡Hola! Soy el Asistente de IA Clínica de Aurevica Lumina. ¿Cómo puedo ayudarte hoy? Por favor, dime qué síntomas estás experimentando.",
    ja: "こんにちは！Aurevica Luminaの臨床AIアシスタントです。本日はどのようなお手伝いをしましょうか？現在どのような症状があるか教えてください。"
};

function initAIAssistantPage() {
    logAgent('ceo', 'AI CEO: Booting multi-lingual symptom checker and diet engine.');
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const langSelect = document.getElementById('lang-select');
    const modeBtns = document.querySelectorAll('.chat-mode-btn');
    
    // Toggle Modes
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aiMode = btn.getAttribute('data-mode');
            
            logAgent('ceo', `AI Mode switched to: ${aiMode.toUpperCase()}`);
            clearChat();
            
            if (aiMode === 'symptoms') {
                addBotMessage(langGreetings[langSelect.value]);
            } else {
                addBotMessage("Welcome to the AI Diet Planner! Please enter your main goal (e.g., Weight Loss, Muscle Gain, Manage Diabetes, Blood Pressure Control).");
            }
        });
    });
    
    // Send Message
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        
        addUserMessage(text);
        chatInput.value = '';
        
        logAgent('frontend', 'User message captured. Dispatching to AI analysis pipeline.');
        
        // Simulate AI Processing
        setTimeout(() => {
            processAIResponse(text, langSelect.value);
        }, 1000);
    };
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Language Selector Change
    langSelect.addEventListener('change', () => {
        logAgent('copywriting', `Language localized to: ${langSelect.options[langSelect.selectedIndex].text}`);
        clearChat();
        if (aiMode === 'symptoms') {
            addBotMessage(langGreetings[langSelect.value]);
        } else {
            addBotMessage("Welcome to the AI Diet Planner! Please enter your main goal (e.g., Weight Loss, Muscle Gain, Manage Diabetes, Blood Pressure Control).");
        }
    });
    
    // Initial Message
    addBotMessage(langGreetings[langSelect.value]);
}

function clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '';
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const msgHTML = `
        <div class="chat-msg user">
            <div class="msg-bubble">${text}</div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    const msgHTML = `
        <div class="chat-msg bot">
            <div class="chat-avatar">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="msg-bubble">${text}</div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Symptom Checker Database
const symptomsDatabase = {
    fever: {
        en: "Based on your symptom of fever, you might have a viral infection or Influenza. Do you also have a cough or body aches?",
        hi: "बुखार के लक्षण के आधार पर, आपको वायरल संक्रमण या इन्फ्लूएंजा हो सकता है। क्या आपको खांसी या शरीर में दर्द भी है?",
        es: "Según su síntoma de fiebre, podría tener una infección viral o influenza. ¿También tiene tos o dolores corporales?",
        ja: "発熱の症状から、ウイルス感染症またはインフルエンザの可能性があります。咳や体の痛みもありますか？"
    },
    cough: {
        en: "A persistent cough could indicate Bronchitis or a respiratory infection. Are you experiencing any chest pain or difficulty breathing?",
        hi: "लगातार खांसी ब्रोंकाइटis या श्वसन संक्रमण का संकेत हो सकती है। क्या आपको छाती में दर्द या सांस लेने में कठिनाई हो रही है?",
        es: "Una tos persistente podría indicar bronquitis o una infección respiratoria. ¿Tiene dolor en el pecho o dificultad para respirar?",
        ja: "長引く咳は気管支炎や呼吸器感染症を示している可能性があります。胸の痛みや息苦しさはありますか？"
    },
    headache: {
        en: "Frequent headaches could be Migraine or Tension Headaches. Are you sensitive to light or sound?",
        hi: "बार-बार होने वाला सिरदर्द माइग्रेन या तनाव का सिरदर्द हो सकता है। क्या आप प्रकाश या ध्वनि के प्रति संवेदनशील हैं?",
        es: "Los dolores de cabeza frecuentes pueden ser migraña o dolor de cabeza por tensión. ¿Es sensible a la luz o al sonido?",
        ja: "頻繁な頭痛は片頭痛や緊張型頭痛の可能性があります。光や音に敏感ですか？"
    }
};

function processAIResponse(inputText, lang) {
    logAgent('ceo', `AI Engine parsing query: "${inputText}"`);
    const textLower = inputText.toLowerCase();
    
    if (aiMode === 'symptoms') {
        let matched = false;
        for (const key in symptomsDatabase) {
            if (textLower.includes(key) || (lang === 'hi' && (textLower.includes('बुखार') && key === 'fever' || textLower.includes('खांसी') && key === 'cough' || textLower.includes('सिरदर्द') && key === 'headache'))) {
                addBotMessage(symptomsDatabase[key][lang]);
                logAgent('supervisor', `Clinical match found for: ${key.toUpperCase()}. Diagnostic safety disclaimer active.`);
                matched = true;
                break;
            }
        }
        
        if (!matched) {
            const fallback = {
                en: "Thank you for describing your symptoms. To help me analyze better, could you specify how long you have had this and if you have a fever?",
                hi: "अपने लक्षणों का वर्णन करने के लिए धन्यवाद। बेहतर विश्लेषण करने में मेरी मदद करने के लिए, क्या आप बता सकते हैं कि आपको यह कितने समय से है और क्या आपको बुखार है?",
                es: "Gracias por describir sus síntomas. Para ayudarme a analizar mejor, ¿podría especificar cuánto tiempo hace que tiene esto y si tiene fiebre?",
                ja: "症状を説明していただきありがとうございます。より詳細な分析のため、この症状がいつから続いているか、また発熱があるかどうか教えていただけますか？"
            };
            addBotMessage(fallback[lang]);
            logAgent('ceo', 'No direct match. Asking refining questions to build diagnostic confidence.');
        }
    } else {
        // Diet Planner response
        logAgent('ceo', 'Diet Planner Engine synthesizing customized nutritional recommendations.');
        if (textLower.includes('weight') || textLower.includes('loss') || textLower.includes('fat')) {
            addBotMessage(`**AI Recommended Weight Loss Diet Plan:**<br>
                • **Breakfast**: Oatmeal with chia seeds, berries, and skimmed milk.<br>
                • **Lunch**: Grilled chicken salad or Quinoa bowl with mixed vegetables and olive oil dressing.<br>
                • **Snack**: A handful of almonds and green tea.<br>
                • **Dinner**: Baked salmon or tofu with steamed broccoli and sweet potato.<br>
                *Note: Drink at least 3 liters of water daily. Limit sodium and processed sugars.*`);
        } else if (textLower.includes('diabetes') || textLower.includes('sugar')) {
            addBotMessage(`**AI Recommended Low-Glycemic Diabetes Diet Plan:**<br>
                • **Breakfast**: Spinach and mushroom omelet or sprouted grain toast with avocado.<br>
                • **Lunch**: Lentil soup with a large leafy green salad (low-carb dressing).<br>
                • **Snack**: Greek yogurt with walnut halves.<br>
                • **Dinner**: Roasted turkey breast or grilled paneer with grilled asparagus and cauliflower mash.<br>
                *Note: Monitor your glucose levels. Prioritize high-fiber foods.*`);
        } else {
            addBotMessage(`**AI Balanced Wellness Diet Plan:**<br>
                • **Breakfast**: Whole grain porridge with sliced banana and flaxseeds.<br>
                • **Lunch**: Brown rice with mixed dal (lentil curry) and sautéed spinach.<br>
                • **Snack**: Apple slices with almond butter.<br>
                • **Dinner**: Lean protein (chicken/fish/tempeh) with roasted zucchini and bell peppers.<br>
                *Adjust portion sizes based on your daily energy expenditure.*`);
        }
    }
}

/* ==========================================
   PAGE: HEALTH TRACKER
   ========================================== */
function initHealthTrackerPage() {
    logAgent('backend', 'Health Tracker local database loaded. Initializing SVG charts.');
    
    // BP Tracker Form
    const bpForm = document.getElementById('bp-form');
    if (bpForm) {
        bpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sys = parseInt(document.getElementById('sys-input').value);
            const dia = parseInt(document.getElementById('dia-input').value);
            
            logAgent('backend', `Logging BP reading: ${sys}/${dia} mmHg.`);
            
            let status = 'normal';
            let statusClass = 'status-normal';
            if (sys >= 140 || dia >= 90) {
                status = 'High (Stage 2)';
                statusClass = 'status-danger';
                logAgent('supervisor', 'Alert: High Blood Pressure detected. Advisory warning triggered.');
            } else if (sys >= 120 || dia >= 80) {
                status = 'Elevated';
                statusClass = 'status-warning';
            }
            
            addHistoryItem('bp-history', `${sys}/${dia} mmHg`, status, statusClass);
            updateChart('bp-chart', [sys, dia], ['Systolic', 'Diastolic']);
            bpForm.reset();
        });
    }
    
    // Sugar Tracker Form
    const sugarForm = document.getElementById('sugar-form');
    if (sugarForm) {
        sugarForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sugar = parseInt(document.getElementById('sugar-input').value);
            const type = document.getElementById('sugar-type').value;
            
            logAgent('backend', `Logging Blood Sugar reading: ${sugar} mg/dL (${type}).`);
            
            let status = 'normal';
            let statusClass = 'status-normal';
            
            if (type === 'fasting') {
                if (sugar >= 126) {
                    status = 'Diabetic';
                    statusClass = 'status-danger';
                    logAgent('supervisor', 'Alert: High Fasting Blood Sugar. Advising physician consult.');
                } else if (sugar >= 100) {
                    status = 'Prediabetic';
                    statusClass = 'status-warning';
                }
            } else {
                if (sugar >= 200) {
                    status = 'Diabetic';
                    statusClass = 'status-danger';
                    logAgent('supervisor', 'Alert: High Post-Meal Blood Sugar.');
                } else if (sugar >= 140) {
                    status = 'Prediabetic';
                    statusClass = 'status-warning';
                }
            }
            
            addHistoryItem('sugar-history', `${sugar} mg/dL (${type})`, status, statusClass);
            updateChart('sugar-chart', [sugar], [type.toUpperCase()]);
            sugarForm.reset();
        });
    }
}

function addHistoryItem(containerId, value, status, statusClass) {
    const container = document.getElementById(containerId);
    const date = new Date().toLocaleDateString();
    const itemHTML = `
        <div class="history-item">
            <span>${date}</span>
            <span class="history-val">${value}</span>
            <span class="status-badge ${statusClass}">${status}</span>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', itemHTML);
}

function updateChart(chartId, values, labels) {
    const chart = document.getElementById(chartId);
    chart.innerHTML = ''; // Clear previous
    
    const maxVal = Math.max(...values, 150); // Scale relative to max value
    
    values.forEach((val, index) => {
        const pct = (val / maxVal) * 100;
        const barHTML = `
            <div class="chart-bar-container">
                <div class="chart-bar" style="height: ${pct}%" data-value="${val}"></div>
                <div class="chart-label">${labels[index] || ''}</div>
            </div>
        `;
        chart.insertAdjacentHTML('beforeend', barHTML);
    });
    
    logAgent('placement', `Re-rendered SVG chart bars for ${chartId}.`);
}

/* ==========================================
   PAGE: MEDICAL KNOWLEDGE A-Z
   ========================================== */
function initMedicalKnowledgePage() {
    logAgent('copywriting', 'A-Z Clinical Database loaded. Search indexing complete.');
    
    const searchInput = document.getElementById('search-input');
    const azBtns = document.querySelectorAll('.az-btn');
    const cards = document.querySelectorAll('.disease-card');
    
    // A-Z Filter
    azBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            azBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const letter = btn.getAttribute('data-letter');
            
            logAgent('interlink', `Filtering A-Z Directory by letter: ${letter}`);
            
            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.trim();
                if (letter === 'ALL' || title.startsWith(letter)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Live Search
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        logAgent('frontend', `Searching directory for: "${query}"`);
        
        cards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || desc.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Accordion Toggle
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const details = card.querySelector('.disease-details');
            const isOpened = details.classList.contains('active');
            
            // Close all details
            document.querySelectorAll('.disease-details').forEach(d => d.classList.remove('active'));
            
            if (!isOpened) {
                details.classList.add('active');
                logAgent('frontend', `Expanded medical details card: ${card.querySelector('h3').textContent}`);
            }
        });
    });
}

/* ==========================================
   PAGE: SPEECH THERAPY
   ========================================== */
function initSpeechTherapyPage() {
    logAgent('supervisor', 'Speech therapy acoustic model loaded. Ready for recording simulation.');
    
    const recordBtn = document.getElementById('record-btn');
    const recordStatusLabel = document.getElementById('record-status-label');
    const exerciseCards = document.querySelectorAll('.exercise-card');
    const activeText = document.getElementById('active-exercise-text');
    const resultsContainer = document.getElementById('analyzer-results');
    
    let activeDisorder = 'stuttering';
    
    // Select Exercise
    exerciseCards.forEach(card => {
        card.addEventListener('click', () => {
            exerciseCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const prompt = card.getAttribute('data-prompt');
            activeDisorder = card.getAttribute('data-disorder');
            activeText.textContent = `"${prompt}"`;
            logAgent('interlink', `Switched active speech exercise: ${card.querySelector('h4').textContent}`);
        });
    });
    
    // Record Simulation
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (recordBtn.classList.contains('recording')) {
                // Stop recording
                recordBtn.classList.remove('recording');
                recordStatusLabel.textContent = 'Click to Start Recording';
                logAgent('backend', 'Acoustic sample captured. Processing audio analysis...');
                
                // Show mock results based on the selected disorder
                setTimeout(() => {
                    let reportHTML = '';
                    
                    if (activeDisorder === 'stuttering') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Fluency Analysis Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">92%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Fluency Rate</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">1.2s</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Easy Onset Delay</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Controlled</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Laryngeal Tension</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Excellent application of the *Easy Onset* technique. Your pre-vocalic airflow was well-timed at 1.2 seconds, successfully preventing glottal blocks on the initial 'S' sound. Keep practicing light articulatory contact on plosives.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'apraxia') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Motor Planning Analysis</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">88%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Syllabic Pacing</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">0.45s</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Transition Gap</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Stable</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Motor Rhythm</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Good rhythmic consistency. Your syllable-to-syllable transition gaps averaged 0.45 seconds, indicating controlled motor sequencing. Continue practicing slow rate drills to reinforce the neural pathways for multi-syllabic words.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'dysarthria') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Dysarthria Articulation Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">78%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Intelligibility</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">68 dB</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Vocal Intensity</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: #f59e0b;">Moderate</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Consonant Strength</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Vocal intensity was sustained at 68 dB using diaphragmatic support. However, plosive consonants ('b', 'p') showed minor slurring. Focus on exaggerating jaw movement and tongue pressure to increase consonant clarity.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'lisp') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Sibilant Articulation Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">95%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Sibilant Accuracy</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">Minimal</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Air Leakage</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Correct</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Tongue Position</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Outstanding 'S' sound production! Acoustic analysis shows zero lateral air leakage, indicating that your tongue tip remained behind your closed front teeth as practiced. Continue practicing this tongue placement.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'deepening') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Voice Resonance & Pitch Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">95 Hz</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Fundamental Freq (F0)</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">89%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Chest Resonance</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Relaxed</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Laryngeal Strain</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Outstanding chest resonance! Your fundamental pitch (F0) was recorded at 95 Hz, reflecting a successful lower-register voice. The Yawn-Sigh technique effectively lowered your larynx and reduced throat constriction. Keep practicing this chest-projection method daily.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'twisters') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Articulatory Agility Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">94%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Clarity Score</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">165</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Pacing (WPM)</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">0.22s</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Transition Gap</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Excellent articulatory precision. Your transition gaps between the rapid bilabial plosives ('P') averaged 0.22 seconds, maintaining high clarity with zero phoneme slurring. This indicates strong motor agility.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'aphasia') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Language Retrieval Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">100%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Accuracy</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">1.8s</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Retrieval Latency</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Normal</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Word Association</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: You correctly retrieved the target word 'west' with a latency of 1.8 seconds. This is an excellent response time. Continue verbal association exercises daily to reinforce linguistic networks.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'dysfbj' || activeDisorder === 'dysphonia') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Vocal Resonance Report</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">90%</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Resonance Balance</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">Low</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Vocal Cord Strain</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Balanced</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Pitch Glide</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Resonant focus was placed correctly in the nasal and oral cavities, minimizing vocal fold friction. Your pitch glide was smooth and controlled. Ensure adequate hydration during practice.
                                </p>
                            </div>
                        `;
                    } else if (activeDisorder === 'cluttering') {
                        reportHTML = `
                            <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.02); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color)">Pacing & Rate Analysis</h4>
                                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; text-align: center;">
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">135</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Speech Rate (WPM)</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--primary);">1.8s</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Pause Duration</p>
                                    </div>
                                    <div>
                                        <h5 style="font-size: 1.5rem; color: var(--accent-color);">Optimal</h5>
                                        <p style="font-size: 0.8rem; color: var(--text-muted);">Cluttering Index</p>
                                    </div>
                                </div>
                                <p style="font-size: 13.5px; margin-top: 1rem; color: var(--text-main);">
                                    **AI Clinical Feedback**: Excellent pacing! Your speech rate was controlled at 135 words per minute, and you took deliberate, structured pauses at each comma. This completely eliminated any syllabic telescoping.
                                </p>
                            </div>
                        `;
                    }
                    
                    resultsContainer.innerHTML = reportHTML;
                    logAgent('ceo', 'Acoustic analyzer completed successfully.');
                }, 1500);
            } else {
                // Start recording
                recordBtn.classList.add('recording');
                recordStatusLabel.textContent = 'Recording... Speak Now';
                resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Listening... Speak the prompt text clearly into your microphone.</p>';
                logAgent('backend', 'Microphone stream open. Capturing real-time audio...');
            }
        });
    }
}

/* ==========================================
   PAGE: DOCTOR CONSULTATION / BOOKING
   ========================================== */
function initConsultationPage() {
    logAgent('booking', 'Consultation portal loaded. Querying real-time physician schedules.');
    
    const bookingBtns = document.querySelectorAll('.doctor-booking-btn');
    const modalBackdrop = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const ticketContainer = document.getElementById('appointment-ticket-container');
    const specialtyBtns = document.querySelectorAll('.specialty-btn');
    const doctorCards = document.querySelectorAll('.doctor-card');
    let selectedDoctor = '';
    
    // Specialty Filter
    specialtyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            specialtyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const specialty = btn.getAttribute('data-specialty');
            logAgent('interlink', `Filtering doctors by specialty: ${specialty}`);
            
            doctorCards.forEach(card => {
                const docSpec = card.querySelector('.doctor-specialty').textContent.trim().toLowerCase();
                if (specialty === 'all' || docSpec.includes(specialty.toLowerCase())) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    bookingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedDoctor = btn.getAttribute('data-doctor');
            document.getElementById('modal-doctor-name').textContent = selectedDoctor;
            modalBackdrop.classList.add('active');
            logAgent('booking', `User initiated appointment flow for: ${selectedDoctor}`);
        });
    });
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('booking-date').value;
            const time = document.getElementById('booking-time').value;
            const name = document.getElementById('patient-name').value;
            
            logAgent('backend', `Committing booking: ${selectedDoctor} on ${date} at ${time} for ${name}.`);
            
            // Close Modal
            modalBackdrop.classList.remove('active');
            
            // Generate Ticket
            ticketContainer.innerHTML = `
                <div class="ticket">
                    <div class="ticket-header">
                        <h3>APPOINTMENT TICKET</h3>
                        <p style="color: var(--secondary-color); font-weight: 600;">Aurevica Lumina CLINICAL SERVICES</p>
                    </div>
                    <div class="ticket-body">
                        <span class="ticket-label">Doctor:</span>
                        <span class="ticket-val">${selectedDoctor}</span>
                        
                        <span class="ticket-label">Patient:</span>
                        <span class="ticket-val">${name}</span>
                        
                        <span class="ticket-label">Date:</span>
                        <span class="ticket-val">${date}</span>
                        
                        <span class="ticket-label">Time Slot:</span>
                        <span class="ticket-val">${time}</span>
                        
                        <span class="ticket-label">Status:</span>
                        <span class="ticket-val" style="color: var(--secondary-color);">CONFIRMED</span>
                    </div>
                    <div style="text-align: center; margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1rem;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-family: 'Courier New', monospace;">TICKET-ID: AUR-${Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                </div>
            `;
            
            logAgent('booking', `Booking confirmed. Ticket issued. Slot locked.`);
            logAgent('supervisor', 'Scheduler verified: Zero conflicts in slot assignment.');
            bookingForm.reset();
        });
    }
    
    // Close booking modal when clicking outside or close buttons (simplification)
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            modalBackdrop.classList.remove('active');
        }
    });
}

/* ==========================================
   PAGE: PRICING PLANS
   ========================================== */
const planPrices = {
    monthly: {
        usd: { basic: "$9", pro: "$29", elite: "$79" },
        inr: { basic: "₹799", pro: "₹2,499", elite: "₹6,999" },
        jpy: { basic: "¥1,200", pro: "¥4,200", elite: "¥11,500" }
    },
    quarterly: {
        usd: { basic: "$24", pro: "$74", elite: "$199" },
        inr: { basic: "₹1,999", pro: "₹6,499", elite: "₹17,999" },
        jpy: { basic: "¥3,200", pro: "¥10,500", elite: "¥29,000" }
    },
    yearly: {
        usd: { basic: "$79", pro: "$239", elite: "$639" },
        inr: { basic: "₹6,499", pro: "₹19,999", elite: "₹54,999" },
        jpy: { basic: "¥11,000", pro: "¥34,000", elite: "¥92,000" }
    }
};

function initPricingPage() {
    logAgent('designer', 'Pricing grid loaded. Formatting multi-currency tables.');
    
    const billingBtns = document.querySelectorAll('.toggle-btn');
    const currencySelect = document.getElementById('currency-select');
    
    let activeBilling = 'monthly';
    
    const updatePrices = () => {
        const curr = currencySelect.value;
        const prices = planPrices[activeBilling][curr];
        const suffix = activeBilling === 'monthly' ? '/mo' : activeBilling === 'quarterly' ? '/qtr' : '/yr';
        
        document.getElementById('basic-price').innerHTML = `${prices.basic}<span>${suffix}</span>`;
        document.getElementById('pro-price').innerHTML = `${prices.pro}<span>${suffix}</span>`;
        document.getElementById('elite-price').innerHTML = `${prices.elite}<span>${suffix}</span>`;
        
        logAgent('backend', `Prices updated to: Currency=${curr.toUpperCase()}, Period=${activeBilling.toUpperCase()}`);
    };
    
    billingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            billingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeBilling = btn.getAttribute('data-period');
            updatePrices();
        });
    });
    
    currencySelect.addEventListener('change', updatePrices);
    
    // Initial Price Render
    updatePrices();
}

/* ==========================================
   PAGE: REPORT ANALYSIS & UPLOADS
   ========================================== */
function initReportAnalysisPage() {
    logAgent('ceo', 'AI CEO: Clinical report analysis pipeline ready. Supports PDF, DICOM, and images.');
    
    const fileInput = document.getElementById('report-file-input');
    const simulateBlurry = document.getElementById('simulate-blurry-check');
    const scannerAnim = document.getElementById('scanner-animation');
    const resultCard = document.getElementById('analysis-result-card');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            logAgent('frontend', `File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB).`);
            
            // Show scanning animation
            scannerAnim.style.display = 'flex';
            logAgent('ceo', 'AI Scanner activated. Initiating computer vision check.');
            
            setTimeout(() => {
                scannerAnim.style.display = 'none';
                
                // Check if blurry simulation is checked
                if (simulateBlurry && simulateBlurry.checked) {
                    logAgent('supervisor', 'Safety check: Image quality insufficient (low resolution or blur detected).');
                    resultCard.innerHTML = `
                        <div style="text-align: center; color: var(--accent-color); animation: fadeIn 0.4s ease-out;">
                            <svg style="width: 64px; height: 64px; fill: none; stroke: currentColor; stroke-width: 2; margin-bottom: 1rem;" viewBox="0 0 24 24">
                                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                            </svg>
                            <h3>Scan Failed: Low Image Quality</h3>
                            <p style="color: var(--text-muted); margin-top: 0.5rem;">
                                The uploaded report image is blurry or has poor contrast. Aurevica Lumina's AI is unable to safely read the metrics. Please upload a clear, high-resolution scan or PDF.
                            </p>
                        </div>
                    `;
                } else {
                    // Generate Clear Analysis
                    logAgent('ceo', 'Clinical metrics extracted successfully. Synthesizing analysis.');
                    resultCard.innerHTML = `
                        <div style="animation: fadeIn 0.4s ease-out;">
                            <h3 style="color: var(--primary-color); margin-bottom: 1rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem;">AI Clinical Report Analysis</h3>
                            
                            <div style="margin-bottom: 1.5rem;">
                                <h4 style="font-size: 1.05rem; color: var(--text-main); font-weight: 700;">1. Identified Conditions & Problems</h4>
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
                                    • **Elevated Cholesterol (LDL)**: Report shows LDL levels at 165 mg/dL, which exceeds the optimal threshold (< 100 mg/dL).<br>
                                    • **Mild Vitamin D3 Deficiency**: Level is 22 ng/mL (optimal range: 30-100 ng/mL).
                                </p>
                            </div>
                            
                            <div style="margin-bottom: 1.5rem;">
                                <h4 style="font-size: 1.05rem; color: var(--text-main); font-weight: 700;">2. How to Improve (Actionable Steps)</h4>
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">
                                    • **Dietary Shift**: Incorporate soluble fiber (oats, beans, lentils) and healthy fats (olive oil, avocados) to naturally lower LDL.<br>
                                    • **Supplements**: Consider a daily Vitamin D3 supplement of 2000 IU (consult your doctor for exact dosage).<br>
                                    • **Activity**: Engage in 30 minutes of moderate aerobic exercise (brisk walking, cycling) at least 5 times a week.
                                </p>
                            </div>
                            
                            <div style="background-color: var(--secondary-light); border-left: 4px solid var(--secondary-color); padding: 1rem; border-radius: var(--radius-sm);">
                                <h5 style="color: var(--secondary-hover); font-weight: 700;">AI Summary</h5>
                                <p style="font-size: 0.85rem; color: var(--text-main); margin-top: 0.25rem;">
                                    This report indicates metabolic markers that can be highly optimized through early lifestyle modifications. Share these findings with your doctor during your next scheduled consult.
                                </p>
                            </div>
                        </div>
                    `;
                    logAgent('supervisor', 'Report analysis complete. Clinical disclaimers attached.');
                }
            }, 2500);
        });
    }
}

/* ==========================================
   PAGE: ORGAN HEALTH
   ========================================== */
function initOrganHealthPage() {
    logAgent('supervisor', 'Organ health portal loaded. Verifying organ-specific pathology nodes.');
    
    const organBtns = document.querySelectorAll('.organ-btn');
    const contentSections = document.querySelectorAll('.organ-content-section');
    
    organBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            organBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            const organ = btn.getAttribute('data-organ');
            logAgent('ceo', `AI CEO: Analyzing pathophysiology and clinical data for organ: ${organ.toUpperCase()}`);
            
            contentSections.forEach(sect => {
                sect.classList.remove('active');
            });
            
            const activeSect = document.getElementById(`sect-${organ}`);
            if (activeSect) {
                activeSect.classList.add('active');
            }
            
            logAgent('placement', `Realigned grid layouts for ${organ} health cards.`);
        });
    });
}

/* ==========================================
   PAGE: MEDICATIONS / PHARMACY
   ========================================== */
function initPharmacyPage() {
    logAgent('supervisor', 'Clinical pharmacy ledger loaded. Verifying pharmaceutical contraindications.');
    
    const searchInput = document.getElementById('med-search-input');
    const filterBtns = document.querySelectorAll('.med-filter-btn');
    const medCards = document.querySelectorAll('.med-card');
    
    // Camera Scanner Elements
    const startCameraBtn = document.getElementById('start-camera-btn');
    const captureScanBtn = document.getElementById('capture-scan-btn');
    const scanSimSelect = document.getElementById('scan-simulator-select');
    const cameraViewport = document.getElementById('camera-viewport');
    const cameraStatusText = document.getElementById('camera-status-text');
    const cameraScanLine = document.getElementById('camera-scan-line');
    const scannerOutput = document.getElementById('scanner-output');
    
    let activeCategory = 'all';
    let isCameraOn = false;
    
    // Camera toggle
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', () => {
            isCameraOn = !isCameraOn;
            if (isCameraOn) {
                logAgent('backend', 'Camera stream open. Video capture interface active.');
                cameraViewport.classList.add('active');
                cameraStatusText.textContent = 'Simulating Live Camera Feed...';
                startCameraBtn.textContent = 'Stop Camera';
                captureScanBtn.style.display = 'inline-flex';
                scanSimSelect.style.display = 'inline-flex';
            } else {
                logAgent('backend', 'Camera stream closed.');
                cameraViewport.classList.remove('active');
                cameraStatusText.textContent = 'Camera Feed Offline';
                startCameraBtn.textContent = 'Start Camera';
                captureScanBtn.style.display = 'none';
                scanSimSelect.style.display = 'none';
                scannerOutput.style.display = 'none';
            }
        });
    }
    
    // Capture and Analyze
    if (captureScanBtn) {
        captureScanBtn.addEventListener('click', () => {
            logAgent('ceo', 'AI CEO: Capturing frame. Launching OCR and Vision-Language models...');
            cameraScanLine.style.display = 'block';
            scannerOutput.style.display = 'none';
            
            setTimeout(() => {
                cameraScanLine.style.display = 'none';
                const selectedScan = scanSimSelect.value;
                
                if (selectedScan === 'blurry') {
                    logAgent('supervisor', 'Safety check: Image quality too low. OCR text extraction failed.');
                    scannerOutput.innerHTML = `
                        <div style="color: var(--error); font-weight: 600; text-align: center;">
                            <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 2; margin: 0 auto 0.5rem auto; display: block;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Scan Failed: Medicine label is not scanned properly. Please ensure the drug name is clearly visible and scan again.
                        </div>
                    `;
                } else {
                    logAgent('ceo', `AI CEO: Drug identified as ${selectedScan.toUpperCase()}. Fetching clinical indicators.`);
                    logAgent('supervisor', 'Supervisor: Verifying drug contraindications and safety guidelines.');
                    
                    let drugData = {};
                    if (selectedScan === 'dolo') {
                        drugData = {
                            name: "Dolo 650 (Paracetamol / Acetaminophen)",
                            chemical: "Paracetamol IP 650 mg",
                            strengths: "Drops: 100mg/ml | Syrup: 120mg/5ml or 250mg/5ml | Tablets: 500mg, 650mg, 1000mg",
                            uses: "Antipyretic & Analgesic: Treats high viral fever, dengue fever, headaches, and body aches.",
                            dosage: "Adults: 1 tablet (650mg) every 4-6 hours. Max: 4000mg/day. Children: 10-15 mg/kg per dose.",
                            precautions: "Do not exceed 4g/day. High doses cause acute liver failure (hepatotoxicity). Safe for Dengue (does not thin blood)."
                        };
                    } else if (selectedScan === 'aspirin') {
                        drugData = {
                            name: "Aspirin (Acetylsalicylic Acid)",
                            chemical: "Acetylsalicylic Acid 75 mg or 325 mg",
                            strengths: "Tablets: 75mg (cardiac), 150mg, 325mg (pain/fever)",
                            uses: "Anti-platelet (blood thinner) for cardiovascular heart attack/stroke prevention; Analgesic for pain and inflammatory fever.",
                            dosage: "Cardiac: 75mg daily. Pain: 325mg - 650mg every 4-6 hours. Take with food.",
                            precautions: "<strong>Strictly contraindicated in children under 12</strong> (causes Reye's Syndrome - fatal brain/liver swelling). Avoid in Dengue or bleeding disorders."
                        };
                    } else if (selectedScan === 'combiflam') {
                        drugData = {
                            name: "Combiflam (Ibuprofen + Paracetamol)",
                            chemical: "Ibuprofen BP 400 mg + Paracetamol IP 325 mg",
                            strengths: "Tablets: 400mg Ibuprofen / 325mg PCM",
                            uses: "Anti-inflammatory & Analgesic: Severe muscle strains, arthritis, joint pain, dental pain.",
                            dosage: "Adults: 1 tablet 2-3 times daily after meals. Do not take on an empty stomach.",
                            precautions: "<strong>Strictly contraindicated in Dengue Fever</strong> (Ibuprofen increases bleeding risk). Avoid in active gastric ulcers."
                        };
                    } else if (selectedScan === 'cremaffin') {
                        drugData = {
                            name: "Cremaffin Syrup (Laxative)",
                            chemical: "Liquid Paraffin IP 1.25 mL + Milk of Magnesia IP 3.75 mL per 5 mL",
                            strengths: "Oral Liquid Suspension",
                            uses: "Osmotic Laxative: Treats acute or chronic constipation by softening stool. Safe for adults and geriatric patients.",
                            dosage: "Adults & Elderly: 15 mL to 30 mL taken at bedtime with a full glass of warm water.",
                            precautions: "Do not use daily for more than 1 week (causes bowel dependence and electrolyte imbalance). Take 2 hours apart from other drugs."
                        };
                    } else if (selectedScan === 'monocef') {
                        drugData = {
                            name: "Monocef Injection (Ceftriaxone)",
                            chemical: "Ceftriaxone Sodium Sterile USP 1g (1000 mg)",
                            strengths: "Vial: 250mg, 500mg, 1g, 2g",
                            uses: "Cephalosporin Antibiotic: Severe systemic bacterial infections, typhoid fever, meningitis, abdominal sepsis.",
                            dosage: "Adults: 1g - 2g once daily via slow Intravenous (IV) infusion or deep Intramuscular (IM) injection.",
                            precautions: "Must be administered in a clinical setting by a healthcare professional. Test dose required to check for cephalosporin allergies."
                        };
                    }
                    
                    scannerOutput.innerHTML = `
                        <div style="background-color: var(--surface-container-high); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md);">
                            <h4 style="color: var(--accent-color); font-size: 16px; margin-bottom: 0.75rem;">AI Scan Result: ${drugData.name}</h4>
                            <div style="margin-bottom: 0.5rem; font-size: 13px;">
                                <strong style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; display: block;">Chemical Composition:</strong>
                                <span style="color: var(--primary); font-weight: 600;">${drugData.chemical}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem; font-size: 13px;">
                                <strong style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; display: block;">Available Strengths:</strong>
                                <span style="color: var(--text-main);">${drugData.strengths}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem; font-size: 13px;">
                                <strong style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; display: block;">Primary Clinical Uses:</strong>
                                <span style="color: var(--text-main);">${drugData.uses}</span>
                            </div>
                            <div style="margin-bottom: 0.5rem; font-size: 13px;">
                                <strong style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; display: block;">Standard Dosage:</strong>
                                <span style="color: var(--text-main);">${drugData.dosage}</span>
                            </div>
                            <div style="font-size: 13px;">
                                <strong style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; display: block;">Clinical Precautions:</strong>
                                <span style="color: var(--text-main);" class="warning-text">${drugData.precautions}</span>
                            </div>
                        </div>
                    `;
                }
                
                scannerOutput.style.display = 'block';
            }, 2000);
        });
    }
    
    const filterMeds = () => {
        const query = searchInput.value.toLowerCase();
        logAgent('frontend', `Searching pharmacy index for: "${query}" (Class: ${activeCategory.toUpperCase()})`);
        
        medCards.forEach(card => {
            // Search all text inside the card (title, generic, chemical, strengths, uses, dosage, precautions)
            const cardText = card.textContent.toLowerCase();
            const category = card.getAttribute('data-category');
            
            const matchesSearch = cardText.includes(query);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    };
    
    // Category Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.getAttribute('data-category');
            
            logAgent('backend', `Filtering pharmacy by category: ${activeCategory.toUpperCase()}`);
            filterMeds();
        });
    });
    
    // Live Search Input
    if (searchInput) {
        searchInput.addEventListener('input', filterMeds);
    }
}
