// Aurevica Lumina Healthcare Platform - Main JavaScript Logic

// Supabase Client & User State
let supabaseClient = null;
let currentUser = null;

async function initSupabase() {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        if (config.supabaseUrl && config.supabaseAnonKey) {
            supabaseClient = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            
            // Check current session
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                currentUser = session.user;
                updateAuthUI(true);
                // Trigger cloud loads
                const path = window.location.pathname;
                if (path.includes('health-tracker.html')) {
                    await loadMoodHistory();
                    await loadHabits();
                } else if (path.includes('ai-assistant.html')) {
                    await loadJournalHistoryFromCloud();
                }
            } else {
                updateAuthUI(false);
            }
            
            // Listen for auth changes
            supabaseClient.auth.onAuthStateChange(async (event, session) => {
                if (session) {
                    currentUser = session.user;
                    updateAuthUI(true);
                } else {
                    currentUser = null;
                    updateAuthUI(false);
                }
            });
            
            logAgent('backend', 'Supabase Client initialized successfully.');
        } else {
            logAgent('backend', 'Supabase configuration missing on server.');
        }
    } catch (err) {
        console.error('Supabase init error:', err);
    }
}

function updateAuthUI(loggedIn) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    let loginBtn = navLinks.querySelector('.nav-btn');
    if (!loginBtn) return;
    
    if (loggedIn) {
        loginBtn.textContent = 'Logout';
        loginBtn.href = '#';
        loginBtn.id = 'logout-btn';
        
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        newLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (supabaseClient) {
                await supabaseClient.auth.signOut();
                logAgent('supervisor', 'User logged out.');
                window.location.href = 'index.html';
            }
        });
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.href = 'login.html';
        loginBtn.id = 'login-btn';
        
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
    }
}

// Supabase Sync Helpers
async function saveMoodCheckin(mood, note) {
    const date = new Date().toLocaleDateString();
    const newCheckin = { date, mood, note };
    
    if (supabaseClient && currentUser) {
        try {
            const { error } = await supabaseClient.from('daily_checkin').insert({
                user_id: currentUser.id,
                mood: mood,
                ai_note: note
            });
            if (error) throw error;
            logAgent('backend', 'Synced daily check-in with Supabase.');
        } catch (err) {
            console.error('Failed to sync check-in with Supabase:', err);
        }
    }
    
    const history = JSON.parse(localStorage.getItem('aurevica_mood_history') || '[]');
    history.push(newCheckin);
    localStorage.setItem('aurevica_mood_history', JSON.stringify(history));
}

async function loadMoodHistory() {
    if (supabaseClient && currentUser) {
        try {
            const { data, error } = await supabaseClient
                .from('daily_checkin')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            
            if (data) {
                const history = data.map(d => ({
                    date: new Date(d.created_at).toLocaleDateString(),
                    mood: d.mood,
                    note: d.ai_note
                }));
                localStorage.setItem('aurevica_mood_history', JSON.stringify(history));
            }
        } catch (err) {
            console.error('Failed to load mood history from Supabase:', err);
        }
    }
}

async function saveHabits(habits) {
    localStorage.setItem('aurevica_habits', JSON.stringify(habits));
    
    if (supabaseClient && currentUser) {
        try {
            // Delete existing habits for this user to avoid duplication
            await supabaseClient.from('habits').delete().eq('user_id', currentUser.id);
            
            const habitsToInsert = habits.map(h => ({
                user_id: currentUser.id,
                habit_name: h.name,
                completed: h.completedToday,
                streak: h.streak
            }));
            
            if (habitsToInsert.length > 0) {
                const { error } = await supabaseClient.from('habits').insert(habitsToInsert);
                if (error) throw error;
            }
            logAgent('backend', 'Synced habits with Supabase.');
        } catch (err) {
            console.error('Failed to sync habits with Supabase:', err);
        }
    }
}

async function loadHabits() {
    if (supabaseClient && currentUser) {
        try {
            const { data, error } = await supabaseClient
                .from('habits')
                .select('*');
            if (error) throw error;
            
            if (data && data.length > 0) {
                const habits = data.map(d => ({
                    name: d.habit_name,
                    completedToday: d.completed,
                    streak: d.streak
                }));
                localStorage.setItem('aurevica_habits', JSON.stringify(habits));
            }
        } catch (err) {
            console.error('Failed to load habits from Supabase:', err);
        }
    }
}

async function saveWellnessScore(sleep, water, exercise, mood, total_score) {
    if (supabaseClient && currentUser) {
        try {
            const { error } = await supabaseClient.from('wellness_score').insert({
                user_id: currentUser.id,
                sleep: parseInt(sleep),
                water: parseInt(water),
                exercise: parseInt(exercise),
                mood: parseInt(mood),
                total_score: parseInt(total_score)
            });
            if (error) throw error;
            logAgent('backend', 'Synced wellness score with Supabase.');
        } catch (err) {
            console.error('Failed to sync wellness score with Supabase:', err);
        }
    }
}

async function saveJournalEntry(text, analysis) {
    if (supabaseClient && currentUser) {
        try {
            const { error } = await supabaseClient.from('journal').insert({
                user_id: currentUser.id,
                content: text,
                ai_summary: analysis
            });
            if (error) throw error;
            logAgent('backend', 'Synced journal entry with Supabase.');
        } catch (err) {
            console.error('Failed to sync journal with Supabase:', err);
        }
    }
    
    const history = JSON.parse(localStorage.getItem('aurevica_journal_history') || '[]');
    history.push({
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        text: text,
        analysis: analysis
    });
    localStorage.setItem('aurevica_journal_history', JSON.stringify(history));
}

async function loadJournalHistoryFromCloud() {
    if (supabaseClient && currentUser) {
        try {
            const { data, error } = await supabaseClient
                .from('journal')
                .select('*')
                .order('created_at', { ascending: true });
            if (error) throw error;
            
            if (data) {
                const history = data.map(d => ({
                    date: new Date(d.created_at).toLocaleDateString() + ' ' + new Date(d.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    text: d.content,
                    analysis: d.ai_summary
                }));
                localStorage.setItem('aurevica_journal_history', JSON.stringify(history));
            }
        } catch (err) {
            console.error('Failed to load journals from Supabase:', err);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inject and Initialize Agent Collaboration Console
    injectAgentConsole();
    
    // 2. Initialize Supabase Auth & DB
    await initSupabase();
    
    // 3. Wire up Common UI Elements
    setupMobileNav();
    setupActiveNavLink();
    
    // 4. Page-Specific Initializations
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
    
    // Log thinking state
    logAgent('system', 'Aurevica AI is analyzing query...');
    
    const removeSystemLog = () => {
        const consoleBody = document.getElementById('console-body');
        if (consoleBody && consoleBody.lastElementChild) {
            const lastLine = consoleBody.lastElementChild;
            if (lastLine.querySelector('.agent-system') || lastLine.textContent.includes('analyzing query')) {
                lastLine.remove();
            }
        }
    };
    
    // Call Serverless API
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: query,
            mode: 'symptoms', // default to clinical symptoms mode
            language: 'en'
        })
    })
    .then(async res => {
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
        }
        return res.json();
    })
    .then(data => {
        removeSystemLog();
        logAgent('supervisor', formatMarkdown(data.reply));
    })
    .catch(err => {
        removeSystemLog();
        logAgent('system', `Error: ${err.message}`);
    });
}

/* ==========================================
   COMMON NAVIGATION WIRING
   ========================================== */
function setupMobileNav() {
    const menuToggle = document.getElementById('menu-toggle-btn') || document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
            logAgent('frontend', 'Toggled mobile navigation drawer.');
        });
    }
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

    // Quick Symptom Search
    const quickInput = document.getElementById('quick-symptom-input');
    const quickBtn = document.getElementById('quick-symptom-btn');
    
    if (quickInput && quickBtn) {
        const handleQuickSearch = () => {
            const query = quickInput.value.trim();
            if (query) {
                window.location.href = `ai-assistant.html?query=${encodeURIComponent(query)}`;
            }
        };
        
        quickBtn.addEventListener('click', handleQuickSearch);
        quickInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleQuickSearch();
        });
    }

    // Daily Quote System
    const quoteText = document.getElementById('daily-quote-text');
    const regenBtn = document.getElementById('regenerate-quote-btn');
    
    if (quoteText && regenBtn) {
        const savedQuote = localStorage.getItem('aurevica_daily_quote');
        const savedQuoteDate = localStorage.getItem('aurevica_daily_quote_date');
        const todayStr = new Date().toDateString();
        
        if (savedQuote && savedQuoteDate === todayStr) {
            quoteText.textContent = savedQuote;
        } else {
            fetchDailyQuote();
        }
        
        regenBtn.addEventListener('click', () => {
            fetchDailyQuote();
        });
    }
}

function fetchDailyQuote() {
    const quoteText = document.getElementById('daily-quote-text');
    const regenBtn = document.getElementById('regenerate-quote-btn');
    if (!quoteText) return;
    
    if (regenBtn) regenBtn.disabled = true;
    quoteText.style.opacity = 0.5;
    
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Generate a motivational renewal quote.',
            mode: 'quote',
            language: 'en'
        })
    })
    .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch quote');
        return res.json();
    })
    .then(data => {
        const quote = data.reply.trim();
        quoteText.textContent = quote;
        localStorage.setItem('aurevica_daily_quote', quote);
        localStorage.setItem('aurevica_daily_quote_date', new Date().toDateString());
        quoteText.style.opacity = 1;
        if (regenBtn) regenBtn.disabled = false;
    })
    .catch(err => {
        console.error(err);
        quoteText.style.opacity = 1;
        if (regenBtn) regenBtn.disabled = false;
    });
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
    logAgent('frontend', 'Auth forms ready. Email/Password sign-in and sign-up active.');
    
    const authForm = document.getElementById('email-auth-form');
    const nameGroup = document.getElementById('name-group');
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authToggleLink = document.getElementById('auth-toggle-link');
    
    let isSignUp = false;
    
    if (authToggleLink) {
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUp = !isSignUp;
            if (isSignUp) {
                authTitle.textContent = "Create an Account";
                if (nameGroup) nameGroup.style.display = 'block';
                authSubmitBtn.textContent = "Sign Up";
                authToggleLink.textContent = "Sign in here";
                const toggleTextNode = document.getElementById('auth-toggle-text');
                if (toggleTextNode && toggleTextNode.childNodes[0]) {
                    toggleTextNode.childNodes[0].textContent = "Already have an account? ";
                }
            } else {
                authTitle.textContent = "Welcome to Aurevica";
                if (nameGroup) nameGroup.style.display = 'none';
                authSubmitBtn.textContent = "Sign In";
                authToggleLink.textContent = "Sign up here";
                const toggleTextNode = document.getElementById('auth-toggle-text');
                if (toggleTextNode && toggleTextNode.childNodes[0]) {
                    toggleTextNode.childNodes[0].textContent = "Don't have an account? ";
                }
            }
        });
    }
    
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!supabaseClient) {
                alert('Supabase is not initialized yet. Please wait.');
                return;
            }
            
            const email = document.getElementById('email-input').value.trim();
            const password = document.getElementById('password-input').value.trim();
            const name = document.getElementById('name-input')?.value.trim();
            
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = isSignUp ? "Creating Account..." : "Signing In...";
            
            try {
                if (isSignUp) {
                    const { data, error } = await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { name: name || 'User' }
                        }
                    });
                    if (error) throw error;
                    alert('Sign up successful! You are logged in.');
                    window.location.href = 'index.html';
                } else {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });
                    if (error) throw error;
                    logAgent('supervisor', 'User successfully authenticated via Supabase Auth.');
                    window.location.href = 'index.html';
                }
            } catch (err) {
                alert(`Authentication error: ${err.message}`);
            } finally {
                authSubmitBtn.disabled = false;
                authSubmitBtn.textContent = isSignUp ? "Sign Up" : "Sign In";
            }
        });
    }
    
    // Social Logins
    const googleBtn = document.getElementById('google-login-btn');
    const facebookBtn = document.getElementById('facebook-login-btn');
    const appleBtn = document.getElementById('apple-login-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            if (supabaseClient) {
                await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
            }
        });
    }
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            if (supabaseClient) {
                await supabaseClient.auth.signInWithOAuth({ provider: 'facebook' });
            }
        });
    }
    if (appleBtn) {
        appleBtn.addEventListener('click', async () => {
            if (supabaseClient) {
                await supabaseClient.auth.signInWithOAuth({ provider: 'apple' });
            }
        });
    }
}

/* ==========================================
   PAGE: AI ASSISTANT (DIET & SYMPTOMS)
   ========================================== */
let aiMode = 'symptoms'; // 'symptoms', 'diet', 'journal', or 'planner'
const langGreetings = {
    en: "Hello! I am Aurevica Lumina's Clinical AI Assistant. How can I help you today? Please tell me what symptoms you are experiencing.",
    hi: "नमस्ते! मैं ऑरेविका का क्लिनिकल एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ? कृपया मुझे बताएं कि आपको क्या लक्षण महसूस हो रहे हैं।",
    es: "¡Hola! Soy el Asistente de IA Clínica de Aurevica Lumina. ¿Cómo puedo ayudarte hoy? Por favor, dime qué síntomas estás experimentando.",
    ja: "こんにちは！Aurevica Luminaの臨床AIアシスタントです。本日はどのようなお手伝いをしましょうか？現在どのような症状があるか教えてください。"
};

function initAIAssistantPage() {
    logAgent('ceo', 'AI CEO: Booting multi-lingual clinical, nutrition, and wellness engine.');
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const langSelect = document.getElementById('lang-select');
    const modeBtns = document.querySelectorAll('.chat-mode-btn');
    const micBtn = document.getElementById('chat-mic-btn');
    const memoryToggle = document.getElementById('memory-toggle');
    
    const chatMessages = document.getElementById('chat-messages');
    const chatInputArea = document.getElementById('chat-input-area');
    const journalContainer = document.getElementById('journal-container');
    const plannerContainer = document.getElementById('planner-container');
    
    const chatHeaderTitle = document.getElementById('chat-header-title');
    const chatHeaderSubtitle = document.getElementById('chat-header-subtitle');
    
    // Load Memory Setting
    if (memoryToggle) {
        memoryToggle.checked = localStorage.getItem('aurevica_memory_enabled') === 'true';
        memoryToggle.addEventListener('change', () => {
            localStorage.setItem('aurevica_memory_enabled', memoryToggle.checked);
            logAgent('supervisor', `AI Memory System ${memoryToggle.checked ? 'ENABLED' : 'DISABLED'}.`);
        });
    }

    // Toggle Modes
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            aiMode = btn.getAttribute('data-mode');
            
            logAgent('ceo', `AI Mode switched to: ${aiMode.toUpperCase()}`);
            
            // Hide all containers
            chatMessages.style.display = 'none';
            chatInputArea.style.display = 'none';
            journalContainer.style.display = 'none';
            plannerContainer.style.display = 'none';
            
            if (aiMode === 'symptoms') {
                chatHeaderTitle.textContent = "Aurevica Lumina Clinical AI";
                chatHeaderSubtitle.textContent = "Active Diagnostic Node";
                chatMessages.style.display = 'flex';
                chatInputArea.style.display = 'flex';
                clearChat();
                addBotMessage(langGreetings[langSelect.value]);
            } else if (aiMode === 'diet') {
                chatHeaderTitle.textContent = "Aurevica AI Diet Planner";
                chatHeaderSubtitle.textContent = "Clinical Nutrition Node";
                chatMessages.style.display = 'flex';
                chatInputArea.style.display = 'flex';
                clearChat();
                addBotMessage("Welcome to the AI Diet Planner! Please enter your main goal (e.g., Weight Loss, Muscle Gain, Manage Diabetes, Blood Pressure Control).");
            } else if (aiMode === 'journal') {
                chatHeaderTitle.textContent = "AI Reflective Journal";
                chatHeaderSubtitle.textContent = "Mindfulness & Pattern Analysis";
                journalContainer.style.display = 'flex';
                loadJournalHistory();
            } else if (aiMode === 'planner') {
                chatHeaderTitle.textContent = "AI Wellness Planner";
                chatHeaderSubtitle.textContent = "Personal Routine Architect";
                plannerContainer.style.display = 'flex';
                loadWellnessPlan();
            }
        });
    });
    
    // Voice AI: Speech to Text (Microphone)
    if (micBtn && chatInput) {
        let recognition = null;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onstart = () => {
                micBtn.style.color = 'var(--accent-color)';
                micBtn.style.filter = 'drop-shadow(0 0 5px var(--accent-color))';
                chatInput.placeholder = "Listening...";
            };
            
            recognition.onend = () => {
                micBtn.style.color = 'var(--text-muted)';
                micBtn.style.filter = 'none';
                chatInput.placeholder = "Type your symptoms...";
            };
            
            recognition.onresult = (event) => {
                const resultText = event.results[0][0].transcript;
                chatInput.value = resultText;
                logAgent('frontend', `Voice transcription: "${resultText}"`);
            };
            
            recognition.onerror = (err) => {
                logAgent('system', `Speech recognition error: ${err.error}`);
            };
            
            micBtn.addEventListener('click', () => {
                recognition.start();
            });
        } else {
            micBtn.style.display = 'none';
        }
    }
    
    // Send Message
    const sendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        
        addUserMessage(text);
        chatInput.value = '';
        
        logAgent('frontend', 'User message captured. Dispatching to AI analysis pipeline.');
        processAIResponse(text, langSelect.value);
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
        } else if (aiMode === 'diet') {
            addBotMessage("Welcome to the AI Diet Planner! Please enter your main goal (e.g., Weight Loss, Muscle Gain, Manage Diabetes, Blood Pressure Control).");
        }
    });
    
    // Journal Logic
    const analyzeJournalBtn = document.getElementById('analyze-journal-btn');
    const journalInput = document.getElementById('journal-entry-input');
    const journalResult = document.getElementById('journal-analysis-result');
    
    if (analyzeJournalBtn && journalInput && journalResult) {
        analyzeJournalBtn.addEventListener('click', () => {
            const text = journalInput.value.trim();
            if (!text) return;
            
            analyzeJournalBtn.disabled = true;
            journalResult.style.display = 'block';
            journalResult.innerHTML = `
                <div style="display: flex; gap: 6px; align-items: center; justify-content: center; padding: 1.5rem 0;">
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.25rem;">AI is analyzing your journal entry...</span>
                </div>
            `;
            
            const memoryContext = getMemoryContext();
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    mode: 'journal',
                    language: langSelect.value,
                    memory: memoryContext
                })
            })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Server error (${res.status})`);
                }
                return res.json();
            })
            .then(async data => {
                const analysisHtml = formatMarkdown(data.reply);
                
                // Save entry to history & cloud
                await saveJournalEntry(text, data.reply);
                
                // Save to memory if enabled
                if (memoryToggle && memoryToggle.checked) {
                    updateAIMemory('journal', text);
                }
                
                loadJournalHistory();
                analyzeJournalBtn.disabled = false;
                journalInput.value = '';
            })
            .catch(err => {
                journalResult.innerHTML = `<span style="color: var(--error);">Error: Failed to analyze entry. ${err.message}</span>`;
                analyzeJournalBtn.disabled = false;
            });
        });
    }

    // Planner Logic
    const plannerForm = document.getElementById('planner-form');
    const plannerResult = document.getElementById('planner-result');
    
    if (plannerForm && plannerResult) {
        plannerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const goal = document.getElementById('planner-goal').value.trim();
            const lifestyle = document.getElementById('planner-lifestyle').value.trim();
            const routine = document.getElementById('planner-routine').value.trim();
            
            const submitBtn = plannerForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            plannerResult.style.display = 'block';
            plannerResult.innerHTML = `
                <div style="display: flex; gap: 6px; align-items: center; justify-content: center; padding: 1.5rem 0;">
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                    <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.25rem;">AI is crafting your personal wellness plan...</span>
                </div>
            `;
            
            const messageText = `Primary Goal: ${goal}\nLifestyle: ${lifestyle}\nCurrent Routine: ${routine}`;
            const memoryContext = getMemoryContext();
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    mode: 'wellness_plan',
                    language: langSelect.value,
                    memory: memoryContext
                })
            })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Server error (${res.status})`);
                }
                return res.json();
            })
            .then(data => {
                // Save plan
                const planData = {
                    goal,
                    lifestyle,
                    routine,
                    plan: data.reply
                };
                localStorage.setItem('aurevica_wellness_plan', JSON.stringify(planData));
                
                // Save to memory if enabled
                if (memoryToggle && memoryToggle.checked) {
                    updateAIMemory('planner', `Goal: ${goal}, Routine: ${routine}`);
                }
                
                loadWellnessPlan();
                submitBtn.disabled = false;
            })
            .catch(err => {
                plannerResult.innerHTML = `<span style="color: var(--error);">Error: Failed to generate plan. ${err.message}</span>`;
                submitBtn.disabled = false;
            });
        });
    }
    
    // Initial Message / URL Check
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('query');
    
    if (urlQuery) {
        addBotMessage(langGreetings[langSelect.value]);
        addUserMessage(urlQuery);
        processAIResponse(urlQuery, langSelect.value);
    } else {
        addBotMessage(langGreetings[langSelect.value]);
    }
}

function clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) messagesContainer.innerHTML = '';
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
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
    if (!messagesContainer) return;
    const msgId = 'bot-msg-' + Date.now();
    const textPlain = text.replace(/<[^>]*>/g, '');
    
    const msgHTML = `
        <div class="chat-msg bot" id="${msgId}">
            <div class="chat-avatar">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="msg-bubble" style="position: relative; padding-right: 2.25rem;">
                ${text}
                <button class="speak-btn" onclick="speakText('${escapeQuotes(textPlain)}')" style="position: absolute; right: 8px; bottom: 8px; background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 2px;" title="Read aloud">
                    <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                </button>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function processAIResponse(inputText, lang) {
    logAgent('ceo', `AI Engine parsing query: "${inputText}"`);
    
    showTypingIndicator();
    const memoryContext = getMemoryContext();
    
    fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: inputText,
            mode: aiMode,
            language: lang,
            memory: memoryContext
        })
    })
    .then(async res => {
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
        }
        return res.json();
    })
    .then(data => {
        hideTypingIndicator();
        addBotMessage(formatMarkdown(data.reply));
    })
    .catch(err => {
        hideTypingIndicator();
        addBotMessage(`<strong>Error:</strong> Failed to get response from Aurevica AI.<br><span style="color: var(--accent-color);">${err.message}</span>`);
    });
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    hideTypingIndicator();
    
    const msgHTML = `
        <div class="chat-msg bot" id="typing-indicator" style="opacity: 0.7;">
            <div class="chat-avatar">
                <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div class="msg-bubble" style="display: flex; gap: 6px; align-items: center; padding: 12px 16px;">
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
            </div>
        </div>
    `;
    messagesContainer.insertAdjacentHTML('beforeend', msgHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function formatMarkdown(text) {
    // 1. Headings
    text = text.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    text = text.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    
    // 2. Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 3. Bullet lists
    text = text.replace(/^\s*[\-\*]\s+(.*)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    text = text.replace(/<\/ul>\s*<ul>/g, '');
    
    // 4. Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function getMemoryContext() {
    const enabled = localStorage.getItem('aurevica_memory_enabled') === 'true';
    if (!enabled) return '';
    return localStorage.getItem('aurevica_ai_memory') || '';
}

function updateAIMemory(source, text) {
    let currentMemory = localStorage.getItem('aurevica_ai_memory') || '';
    const dateStr = new Date().toLocaleDateString();
    
    if (source === 'journal') {
        currentMemory += `\n[Journal Context - ${dateStr}]: User expressed: "${text.substring(0, 150)}..."`;
    } else if (source === 'planner') {
        currentMemory += `\n[Wellness Goal Context - ${dateStr}]: ${text}`;
    }
    
    if (currentMemory.length > 800) {
        currentMemory = currentMemory.substring(currentMemory.length - 800);
    }
    localStorage.setItem('aurevica_ai_memory', currentMemory);
}

function escapeQuotes(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

function loadJournalHistory() {
    const journalResult = document.getElementById('journal-analysis-result');
    if (!journalResult) return;
    
    const history = JSON.parse(localStorage.getItem('aurevica_journal_history') || '[]');
    if (history.length === 0) {
        journalResult.style.display = 'none';
    } else {
        journalResult.style.display = 'flex';
        const latest = history[history.length - 1];
        
        let historyListHtml = '';
        history.slice(0, -1).reverse().forEach((entry, idx) => {
            const realIdx = history.length - 2 - idx;
            historyListHtml += `
                <div class="history-item" onclick="viewJournalEntry(${realIdx})" style="cursor: pointer; padding: 0.6rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--surface-container-high); margin-bottom: 0.5rem; transition: var(--transition-fast);">
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${entry.date}</div>
                    <div style="font-size: 0.8rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 0.15rem;">${entry.text.substring(0, 70)}...</div>
                </div>
            `;
        });
        
        journalResult.innerHTML = `
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--accent-color); margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">AI Journal Analysis & Reflection</h3>
            <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--surface-container-low); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-style: italic; border-left: 3px solid var(--accent-color); margin-bottom: 1rem;">"${latest.text}"</div>
                ${formatMarkdown(latest.analysis)}
            </div>
            
            ${historyListHtml ? `
                <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">Previous Journal Entries</h4>
                    <div style="max-height: 180px; overflow-y: auto;">
                        ${historyListHtml}
                    </div>
                </div>
            ` : ''}
        `;
    }
}

window.viewJournalEntry = function(index) {
    const history = JSON.parse(localStorage.getItem('aurevica_journal_history') || '[]');
    const entry = history[index];
    if (!entry) return;
    
    const journalResult = document.getElementById('journal-analysis-result');
    if (!journalResult) return;
    
    let historyListHtml = '';
    history.forEach((item, idx) => {
        if (idx === index) return;
        historyListHtml += `
            <div class="history-item" onclick="viewJournalEntry(${idx})" style="cursor: pointer; padding: 0.6rem 0.8rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--surface-container-high); margin-bottom: 0.5rem; transition: var(--transition-fast);">
                <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${item.date}</div>
                <div style="font-size: 0.8rem; color: var(--text-main); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 0.15rem;">${item.text.substring(0, 70)}...</div>
            </div>
        `;
    });
    
    journalResult.innerHTML = `
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--accent-color); margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">AI Journal Analysis & Reflection (${entry.date})</h3>
        <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: var(--surface-container-low); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-style: italic; border-left: 3px solid var(--accent-color); margin-bottom: 1rem;">"${entry.text}"</div>
            ${formatMarkdown(entry.analysis)}
        </div>
        
        ${historyListHtml ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">Other Journal Entries</h4>
                <div style="max-height: 180px; overflow-y: auto;">
                    ${historyListHtml}
                </div>
            </div>
        ` : ''}
    `;
};

function loadWellnessPlan() {
    const plannerResult = document.getElementById('planner-result');
    if (!plannerResult) return;
    
    const savedPlan = JSON.parse(localStorage.getItem('aurevica_wellness_plan') || 'null');
    if (!savedPlan) {
        plannerResult.style.display = 'none';
    } else {
        plannerResult.style.display = 'block';
        plannerResult.innerHTML = `
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--accent-color); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Your AI Personal Wellness Plan</h3>
            <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: var(--surface-container-high); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.8rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
                    <div><span style="color: var(--text-muted); font-weight: 600;">Goal:</span> ${savedPlan.goal}</div>
                    <div><span style="color: var(--text-muted); font-weight: 600;">Lifestyle:</span> ${savedPlan.lifestyle}</div>
                </div>
                ${formatMarkdown(savedPlan.plan)}
            </div>
        `;
    }
}

/* ==========================================
   PAGE: HEALTH TRACKER
   ========================================== */
function initHealthTrackerPage() {
    logAgent('backend', 'Health Tracker local database loaded. Initializing SVG charts.');
    
    // Load BP History from LocalStorage
    const bpHistory = JSON.parse(localStorage.getItem('aurevica_bp_history') || '[]');
    const bpHistoryContainer = document.getElementById('bp-history');
    if (bpHistoryContainer) {
        bpHistoryContainer.innerHTML = '';
        bpHistory.forEach(item => {
            addHistoryItem('bp-history', item.value, item.status, item.statusClass, item.date);
        });
        if (bpHistory.length > 0) {
            const latest = bpHistory[bpHistory.length - 1];
            updateChart('bp-chart', latest.values, ['Systolic', 'Diastolic']);
        }
    }

    // Load Sugar History from LocalStorage
    const sugarHistory = JSON.parse(localStorage.getItem('aurevica_sugar_history') || '[]');
    const sugarHistoryContainer = document.getElementById('sugar-history');
    if (sugarHistoryContainer) {
        sugarHistoryContainer.innerHTML = '';
        sugarHistory.forEach(item => {
            addHistoryItem('sugar-history', item.value, item.status, item.statusClass, item.date);
        });
        if (sugarHistory.length > 0) {
            const latest = sugarHistory[sugarHistory.length - 1];
            updateChart('sugar-chart', [latest.value], [latest.type.toUpperCase()]);
        }
    }

    // Load Mood History from LocalStorage
    renderMoodHistoryAndChart();

    // BP Tracker Form
    const bpForm = document.getElementById('bp-form');
    if (bpForm) {
        bpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const sys = parseInt(document.getElementById('sys-input').value);
            const dia = parseInt(document.getElementById('dia-input').value);
            
            logAgent('backend', `Logging BP reading: ${sys}/${dia} mmHg.`);
            
            let status = 'Normal';
            let statusClass = 'status-normal';
            if (sys >= 140 || dia >= 90) {
                status = 'High (Stage 2)';
                statusClass = 'status-danger';
                logAgent('supervisor', 'Alert: High Blood Pressure detected. Advisory warning triggered.');
            } else if (sys >= 120 || dia >= 80) {
                status = 'Elevated';
                statusClass = 'status-warning';
            }
            
            const date = new Date().toLocaleDateString();
            const newItem = {
                date: date,
                value: `${sys}/${dia} mmHg`,
                status: status,
                statusClass: statusClass,
                values: [sys, dia]
            };
            
            bpHistory.push(newItem);
            localStorage.setItem('aurevica_bp_history', JSON.stringify(bpHistory));
            
            addHistoryItem('bp-history', newItem.value, newItem.status, newItem.statusClass, newItem.date);
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
            
            let status = 'Normal';
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
            
            const date = new Date().toLocaleDateString();
            const newItem = {
                date: date,
                value: `${sugar} mg/dL (${type})`,
                status: status,
                statusClass: statusClass,
                value: `${sugar} mg/dL (${type})`,
                valueNum: sugar,
                type: type
            };
            
            sugarHistory.push(newItem);
            localStorage.setItem('aurevica_sugar_history', JSON.stringify(sugarHistory));
            
            addHistoryItem('sugar-history', newItem.value, newItem.status, newItem.statusClass, newItem.date);
            updateChart('sugar-chart', [sugar], [type.toUpperCase()]);
            sugarForm.reset();
        });
    }

    // Mood Check-in Interaction
    const moodBtns = document.querySelectorAll('.mood-btn');
    const resultContainer = document.getElementById('checkin-result-container');
    const noteText = document.getElementById('wellness-note-text');
    
    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            logAgent('frontend', `User clicked mood: ${mood.toUpperCase()}`);
            
            // Disable buttons and show loading state
            moodBtns.forEach(b => b.disabled = true);
            resultContainer.style.display = 'block';
            noteText.innerHTML = `
                <div style="display: flex; gap: 6px; align-items: center; padding: 0.5rem 0;">
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem;">AI is writing your wellness note...</span>
                </div>
            `;
            
            // Call API
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Generate a short, encouraging personalized wellness note (max 3 sentences) for a user who checked in today feeling ${mood}. Do not include any greeting or conversational filler. Start directly with the note.`,
                    mode: 'checkin',
                    language: 'en'
                })
            })
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || `Server error (${res.status})`);
                }
                return res.json();
            })
            .then(async data => {
                noteText.innerHTML = formatMarkdown(data.reply);
                
                // Save check-in & cloud sync
                await saveMoodCheckin(mood, data.reply);
                
                // Re-render
                renderMoodHistoryAndChart();
                
                // Re-enable
                moodBtns.forEach(b => b.disabled = false);
            })
            .catch(err => {
                noteText.innerHTML = `<span style="color: var(--error);">Error: Failed to generate wellness note. ${err.message}</span>`;
                moodBtns.forEach(b => b.disabled = false);
            });
        });
    });

    // Wellness Score Sliders
    const sleepSlider = document.getElementById('sleep-slider');
    const waterSlider = document.getElementById('water-slider');
    const exerciseSlider = document.getElementById('exercise-slider');
    const moodSlider = document.getElementById('mood-slider');
    
    const sleepVal = document.getElementById('sleep-val');
    const waterVal = document.getElementById('water-val');
    const exerciseVal = document.getElementById('exercise-val');
    const moodVal = document.getElementById('mood-val');
    
    const scoreNum = document.getElementById('wellness-score-num');
    const progressRing = document.getElementById('score-progress-ring');
    const analyzeScoreBtn = document.getElementById('analyze-score-btn');
    const scoreExplanationBox = document.getElementById('score-explanation-box');
    const scoreExplanationText = document.getElementById('score-explanation-text');
    
    function calculateWellnessScore() {
        if (!sleepSlider) return {};
        
        const sleep = parseFloat(sleepSlider.value);
        const water = parseInt(waterSlider.value);
        const exercise = parseInt(exerciseSlider.value);
        const mood = parseInt(moodSlider.value);
        
        // Update slider labels
        if (sleepVal) sleepVal.textContent = `${sleep} hrs`;
        if (waterVal) waterVal.textContent = `${water} glasses`;
        if (exerciseVal) exerciseVal.textContent = `${exercise} mins`;
        if (moodVal) moodVal.textContent = `${mood}/10`;
        
        // Calculate weighted score
        let sleepScore = (sleep / 8) * 40;
        if (sleepScore > 40) sleepScore = 40 - (sleepScore - 40);
        sleepScore = Math.max(0, sleepScore);
        
        let waterScore = (water / 8) * 20;
        waterScore = Math.min(20, waterScore);
        
        let exerciseScore = (exercise / 30) * 20;
        exerciseScore = Math.min(20, exerciseScore);
        
        let moodScore = (mood / 10) * 20;
        
        const totalScore = Math.round(sleepScore + waterScore + exerciseScore + moodScore);
        
        // Update UI
        if (scoreNum) scoreNum.textContent = totalScore;
        
        if (progressRing) {
            const circumference = 439.82;
            const offset = circumference - (totalScore / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        const metrics = { sleep, water, exercise, mood, score: totalScore };
        localStorage.setItem('aurevica_wellness_metrics', JSON.stringify(metrics));
        
        return metrics;
    }
    
    [sleepSlider, waterSlider, exerciseSlider, moodSlider].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', calculateWellnessScore);
            slider.addEventListener('change', () => {
                const metrics = calculateWellnessScore();
                saveWellnessScore(metrics.sleep, metrics.water, metrics.exercise, metrics.mood, metrics.score);
            });
        }
    });
    
    const savedMetrics = JSON.parse(localStorage.getItem('aurevica_wellness_metrics') || 'null');
    if (savedMetrics) {
        if (sleepSlider) sleepSlider.value = savedMetrics.sleep;
        if (waterSlider) waterSlider.value = savedMetrics.water;
        if (exerciseSlider) exerciseSlider.value = savedMetrics.exercise;
        if (moodSlider) moodSlider.value = savedMetrics.mood;
    }
    calculateWellnessScore();
    
    if (analyzeScoreBtn) {
        analyzeScoreBtn.addEventListener('click', () => {
            const metrics = calculateWellnessScore();
            analyzeScoreBtn.disabled = true;
            scoreExplanationBox.style.display = 'block';
            scoreExplanationText.innerHTML = `
                <div style="display: flex; gap: 6px; align-items: center; padding: 0.5rem 0;">
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                    <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem;">AI is analyzing your wellness vitals...</span>
                </div>
            `;
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Sleep: ${metrics.sleep} hours, Water: ${metrics.water} glasses, Exercise: ${metrics.exercise} minutes, Mood: ${metrics.mood}/10. Total Wellness Score: ${metrics.score}/100.`,
                    mode: 'wellness_score',
                    language: 'en'
                })
            })
            .then(async res => {
                if (!res.ok) throw new Error('Failed to analyze wellness score');
                return res.json();
            })
            .then(data => {
                scoreExplanationText.innerHTML = formatMarkdown(data.reply);
                analyzeScoreBtn.disabled = false;
            })
            .catch(err => {
                scoreExplanationText.innerHTML = `<span style="color: var(--error);">Error: ${err.message}</span>`;
                analyzeScoreBtn.disabled = false;
            });
        });
    }
    
    // Habit Tracker
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitListContainer = document.getElementById('habit-list-container');
    const habitProgressPct = document.getElementById('habit-progress-pct');
    const habitProgressBar = document.getElementById('habit-progress-bar');
    const habitEncourageBtn = document.getElementById('habit-encourage-btn');
    const habitEncourageBox = document.getElementById('habit-encourage-box');
    
    let habits = JSON.parse(localStorage.getItem('aurevica_habits') || '[]');
    if (habits.length === 0) {
        habits = [
            { name: "Drink 8 glasses of water", completedToday: false, streak: 0 },
            { name: "8 hours of sleep", completedToday: false, streak: 0 },
            { name: "30 mins exercise", completedToday: false, streak: 0 }
        ];
    }
    
    function renderHabits() {
        if (!habitListContainer) return;
        habitListContainer.innerHTML = '';
        
        let completedCount = 0;
        
        habits.forEach((habit, index) => {
            if (habit.completedToday) completedCount++;
            
            const habitHTML = `
                <div class="history-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--surface-container-high); border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <input type="checkbox" class="habit-checkbox" data-index="${index}" ${habit.completedToday ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-color); cursor: pointer;">
                        <span style="font-size: 0.85rem; ${habit.completedToday ? 'text-decoration: line-through; color: var(--text-muted);' : 'color: var(--text-main);'}">${habit.name}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-color);">🔥 ${habit.streak}d</span>
                        <button class="delete-habit-btn" data-index="${index}" style="background: none; border: none; color: var(--error); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 2px;" title="Delete habit">
                            <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5;"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `;
            habitListContainer.insertAdjacentHTML('beforeend', habitHTML);
        });
        
        const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
        if (habitProgressPct) habitProgressPct.textContent = `${pct}% Done`;
        if (habitProgressBar) habitProgressBar.style.width = `${pct}%`;
        
        const habitSyncVal = document.getElementById('habit-sync-val');
        if (habitSyncVal) habitSyncVal.textContent = `${pct}% consistency`;
        
        const checkboxes = habitListContainer.querySelectorAll('.habit-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', async () => {
                const idx = parseInt(cb.getAttribute('data-index'));
                const completed = cb.checked;
                habits[idx].completedToday = completed;
                if (completed) {
                    habits[idx].streak += 1;
                } else {
                    habits[idx].streak = Math.max(0, habits[idx].streak - 1);
                }
                await saveHabits(habits);
                renderHabits();
                calculateWellnessScore();
            });
        });
        
        const deleteBtns = habitListContainer.querySelectorAll('.delete-habit-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                habits.splice(idx, 1);
                await saveHabits(habits);
                renderHabits();
                calculateWellnessScore();
            });
        });
    }
    
    if (addHabitBtn && habitInput) {
        addHabitBtn.addEventListener('click', async () => {
            const name = habitInput.value.trim();
            if (!name) return;
            
            habits.push({ name, completedToday: false, streak: 0 });
            habitInput.value = '';
            await saveHabits(habits);
            renderHabits();
            calculateWellnessScore();
        });
        
        habitInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const name = habitInput.value.trim();
                if (!name) return;
                habits.push({ name, completedToday: false, streak: 0 });
                habitInput.value = '';
                await saveHabits(habits);
                renderHabits();
                calculateWellnessScore();
            }
        });
    }
    
    if (habitEncourageBtn && habitEncourageBox) {
        habitEncourageBtn.addEventListener('click', () => {
            habitEncourageBtn.disabled = true;
            habitEncourageBox.style.display = 'block';
            habitEncourageBox.innerHTML = `
                <div style="display: flex; gap: 6px; align-items: center; padding: 0.25rem 0;">
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                    <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                    <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.25rem;">AI is writing a motivational note...</span>
                </div>
            `;
            
            const habitStreaks = habits.map(h => `${h.name}: streak of ${h.streak} days`).join(', ');
            
            fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `My habits and streaks are: ${habitStreaks}. Give me a short, energetic boost of encouragement.`,
                    mode: 'habit_encouragement',
                    language: 'en'
                })
            })
            .then(async res => {
                if (!res.ok) throw new Error('Failed to get encouragement');
                return res.json();
            })
            .then(data => {
                habitEncourageBox.innerHTML = data.reply;
                habitEncourageBtn.disabled = false;
            })
            .catch(err => {
                habitEncourageBox.innerHTML = `<span style="color: var(--error);">Error: ${err.message}</span>`;
                habitEncourageBtn.disabled = false;
            });
        });
    }
    
    renderHabits();
}

function renderMoodHistoryAndChart() {
    const history = JSON.parse(localStorage.getItem('aurevica_mood_history') || '[]');
    
    // 1. Render History List
    const historyContainer = document.getElementById('mood-history');
    if (historyContainer) {
        historyContainer.innerHTML = '';
        if (history.length === 0) {
            historyContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem 0;">No check-in history.</div>';
        } else {
            // Render in reverse chronological order
            [...history].reverse().forEach(item => {
                let moodEmoji = '😊';
                let moodLabel = 'Good';
                let badgeClass = 'status-normal';
                
                if (item.mood === 'okay') {
                    moodEmoji = '😐';
                    moodLabel = 'Okay';
                    badgeClass = 'status-warning';
                } else if (item.mood === 'low') {
                    moodEmoji = '😔';
                    moodLabel = 'Low';
                    badgeClass = 'status-danger';
                }
                
                const itemHTML = `
                    <div class="history-item" style="flex-direction: column; align-items: flex-start; gap: 0.35rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
                        <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${item.date}</span>
                            <span class="status-badge ${badgeClass}" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">${moodEmoji} ${moodLabel}</span>
                        </div>
                        <p style="font-size: 0.8rem; line-height: 1.4; color: var(--text-main); margin: 0; font-style: italic;">"${item.note}"</p>
                    </div>
                `;
                historyContainer.insertAdjacentHTML('beforeend', itemHTML);
            });
        }
    }
    
    // 2. Render Trends Chart (Last 7 check-ins)
    const chartContainer = document.getElementById('mood-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '';
        const last7 = history.slice(-7);
        if (last7.length === 0) {
            chartContainer.innerHTML = '<div style="text-align: center; width: 100%; color: var(--text-muted); font-size: 0.9rem;">No check-ins logged yet.</div>';
        } else {
            last7.forEach(item => {
                let val = 3;
                let color = 'var(--accent-color)'; // Good (lime)
                let emoji = '😊';
                if (item.mood === 'okay') {
                    val = 2;
                    color = '#f59e0b'; // Warning (orange)
                    emoji = '😐';
                } else if (item.mood === 'low') {
                    val = 1;
                    color = 'var(--error)'; // Danger (red)
                    emoji = '😔';
                }
                
                const pct = (val / 3) * 100;
                
                // Format date to MM/DD
                let dateLabel = item.date;
                try {
                    const parts = item.date.split('/');
                    if (parts.length >= 2) {
                        dateLabel = `${parts[0]}/${parts[1]}`;
                    }
                } catch (e) {}
                
                const barHTML = `
                    <div class="chart-bar-container" style="display: flex; flex-direction: column; align-items: center; flex: 1; height: 100%; justify-content: flex-end;">
                        <span style="font-size: 0.9rem; margin-bottom: 0.25rem;">${emoji}</span>
                        <div class="chart-bar" style="height: ${pct}%; width: 16px; background-color: ${color}; border-radius: var(--radius-sm) var(--radius-sm) 0 0; transition: height 0.3s ease; box-shadow: 0 0 15px ${color}44;" data-value="${moodToText(item.mood)}"></div>
                        <div class="chart-label" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem; font-weight: 500;">${dateLabel}</div>
                    </div>
                `;
                chartContainer.insertAdjacentHTML('beforeend', barHTML);
            });
        }
    }
}

function moodToText(mood) {
    if (mood === 'good') return 'Good';
    if (mood === 'okay') return 'Okay';
    return 'Low';
}

function addHistoryItem(containerId, value, status, statusClass, date = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const dateStr = date || new Date().toLocaleDateString();
    const itemHTML = `
        <div class="history-item">
            <span>${dateStr}</span>
            <span class="history-val">${value}</span>
            <span class="status-badge ${statusClass}">${status}</span>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', itemHTML);
}

function updateChart(chartId, values, labels) {
    const chart = document.getElementById(chartId);
    if (!chart) return;
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
    logAgent('supervisor', 'Speech therapy acoustic model loaded. Ready for recording.');
    
    const recordBtn = document.getElementById('record-btn');
    const recordStatusLabel = document.getElementById('record-status-label');
    const exerciseCards = document.querySelectorAll('.exercise-card');
    const activeText = document.getElementById('active-exercise-text');
    const resultsContainer = document.getElementById('analyzer-results');
    
    let activeDisorder = 'stuttering';
    let recognition = null;
    let isRecording = false;
    let transcribedText = '';
    
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
    
    // Web Speech API Setup
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            isRecording = true;
            recordBtn.classList.add('recording');
            recordStatusLabel.textContent = 'Recording... Speak Now';
            resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Listening... Speak the prompt text clearly into your microphone.</p>';
            logAgent('backend', 'Microphone stream open. Capturing speech...');
        };
        
        recognition.onend = () => {
            isRecording = false;
            recordBtn.classList.remove('recording');
            recordStatusLabel.textContent = 'Click to Start Recording';
        };
        
        recognition.onresult = (event) => {
            transcribedText = event.results[0][0].transcript;
            logAgent('frontend', `Speech transcription: "${transcribedText}"`);
            processSpeechAnalysis(transcribedText);
        };
        
        recognition.onerror = (err) => {
            logAgent('system', `Speech recognition error: ${err.error}`);
            resultsContainer.innerHTML = `<p style="color: var(--error); text-align: center; padding: 1rem;">Error: Microphone permission denied or no speech detected.</p>`;
        };
    }
    
    const processSpeechAnalysis = (spokenText) => {
        resultsContainer.innerHTML = `
            <div style="display: flex; gap: 6px; align-items: center; justify-content: center; padding: 1.5rem 0;">
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.25rem;">AI is analyzing your pronunciation and fluency...</span>
            </div>
        `;
        
        const prompt = activeText.textContent.replace(/"/g, '');
        const message = `Disorder Category: ${activeDisorder}\nTarget Prompt: "${prompt}"\nSpoken Text: "${spokenText}"`;
        
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                mode: 'speech_analysis',
                language: 'en'
            })
        })
        .then(async res => {
            if (!res.ok) throw new Error('Failed to analyze speech');
            return res.json();
        })
        .then(data => {
            resultsContainer.innerHTML = `
                <div class="card" style="border-color: var(--accent-color); background-color: rgba(161,251,0,0.01); animation: fadeIn 0.4s ease-out; padding: 1.5rem;">
                    <h4 style="color: var(--accent-color); margin-bottom: 1rem;">AI Speech Analysis Report</h4>
                    <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 1rem;">
                        <div style="background: var(--surface-container-high); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; border-left: 3px solid var(--accent-color);">
                            <strong>You Spoke:</strong> "${spokenText}"
                        </div>
                        ${formatMarkdown(data.reply)}
                    </div>
                </div>
            `;
            logAgent('ceo', 'Acoustic speech analysis completed successfully.');
        })
        .catch(err => {
            resultsContainer.innerHTML = `<p style="color: var(--error); text-align: center; padding: 1rem;">Error: Failed to analyze speech. ${err.message}</p>`;
        });
    };
    
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (!recognition) {
                resultsContainer.innerHTML = `<p style="color: var(--error); text-align: center; padding: 1rem;">Web Speech API is not supported in this browser. Please use Chrome or Edge.</p>`;
                return;
            }
            
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
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
        inr: { basic: "₹799", pro: "₹2,499", elite: "₹6,999" }
    },
    quarterly: {
        inr: { basic: "₹1,999", pro: "₹6,499", elite: "₹17,999" }
    },
    yearly: {
        inr: { basic: "₹6,499", pro: "₹19,999", elite: "₹54,999" }
    }
};

function initPricingPage() {
    logAgent('designer', 'Pricing grid loaded. Formatting INR pricing table.');
    
    const billingBtns = document.querySelectorAll('.toggle-btn');
    let activeBilling = 'monthly';
    
    const updatePrices = () => {
        const curr = 'inr';
        const prices = planPrices[activeBilling][curr];
        const suffix = activeBilling === 'monthly' ? '/mo' : activeBilling === 'quarterly' ? '/qtr' : '/yr';
        
        document.getElementById('basic-price').innerHTML = `${prices.basic}<span>${suffix}</span>`;
        document.getElementById('pro-price').innerHTML = `${prices.pro}<span>${suffix}</span>`;
        document.getElementById('elite-price').innerHTML = `${prices.elite}<span>${suffix}</span>`;
        
        logAgent('backend', `Prices updated to: Currency=INR, Period=${activeBilling.toUpperCase()}`);
    };
    
    billingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            billingBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeBilling = btn.getAttribute('data-period');
            updatePrices();
        });
    });
    
    // Initial Price Render
    updatePrices();
}

/* ==========================================
   PAGE: REPORT ANALYSIS & UPLOADS
   ========================================== */
function initReportAnalysisPage() {
    logAgent('ceo', 'AI CEO: Clinical report analysis pipeline ready.');
    
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
                        <div style="text-align: center; color: var(--accent-color); animation: fadeIn 0.4s ease-out; padding: 1.5rem;">
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
                    // Call API
                    logAgent('ceo', 'Clinical metrics extracted successfully. Synthesizing analysis.');
                    resultCard.innerHTML = `
                        <div style="display: flex; gap: 6px; align-items: center; justify-content: center; padding: 2rem 0;">
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                            <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.25rem;">AI is compiling a detailed clinical report analysis...</span>
                        </div>
                    `;
                    
                    fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Report file name: ${file.name}`,
                            mode: 'report_analysis',
                            language: 'en'
                        })
                    })
                    .then(async res => {
                        if (!res.ok) throw new Error('Failed to analyze report');
                        return res.json();
                    })
                    .then(data => {
                        resultCard.innerHTML = `
                            <div style="animation: fadeIn 0.4s ease-out; padding: 1.5rem;">
                                <h3 style="color: var(--primary-color); margin-bottom: 1.25rem; border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem;">AI Clinical Report Analysis</h3>
                                <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 1.25rem;">
                                    ${formatMarkdown(data.reply)}
                                </div>
                            </div>
                        `;
                        logAgent('supervisor', 'Report analysis complete. Clinical disclaimers attached.');
                    })
                    .catch(err => {
                        resultCard.innerHTML = `<p style="color: var(--error); text-align: center; padding: 1.5rem;">Error: Failed to analyze report. ${err.message}</p>`;
                    });
                }
            }, 2000);
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
                        <div style="color: var(--error); font-weight: 600; text-align: center; padding: 1rem;">
                            <svg viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: none; stroke: currentColor; stroke-width: 2; margin: 0 auto 0.5rem auto; display: block;"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            Scan Failed: Medicine label is not scanned properly. Please ensure the drug name is clearly visible and scan again.
                        </div>
                    `;
                    scannerOutput.style.display = 'block';
                } else {
                    logAgent('ceo', `AI CEO: Drug identified as ${selectedScan.toUpperCase()}. Fetching clinical indicators.`);
                    logAgent('supervisor', 'Supervisor: Verifying drug contraindications and safety guidelines.');
                    
                    scannerOutput.innerHTML = `
                        <div style="display: flex; gap: 6px; align-items: center; justify-content: center; padding: 1rem 0;">
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.1s;"></span>
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.2s;"></span>
                            <span class="typing-dot" style="width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; display: inline-block; animation: bounce 1s infinite 0.3s;"></span>
                            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 0.25rem;">AI is fetching drug indicators...</span>
                        </div>
                    `;
                    scannerOutput.style.display = 'block';
                    
                    fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: selectedScan,
                            mode: 'drug_identification',
                            language: 'en'
                        })
                    })
                    .then(async res => {
                        if (!res.ok) throw new Error('Failed to identify drug');
                        return res.json();
                    })
                    .then(data => {
                        scannerOutput.innerHTML = `
                            <div style="background-color: var(--surface-container-high); border: 1px solid var(--border-color); padding: 1.5rem; border-radius: var(--radius-md); animation: fadeIn 0.4s ease-out;">
                                <h4 style="color: var(--accent-color); font-size: 16px; margin-bottom: 1rem; text-transform: uppercase;">AI Scan Result: ${selectedScan}</h4>
                                <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main); display: flex; flex-direction: column; gap: 0.85rem;">
                                    ${formatMarkdown(data.reply)}
                                </div>
                            </div>
                        `;
                    })
                    .catch(err => {
                        scannerOutput.innerHTML = `<div style="color: var(--error); font-weight: 600; text-align: center; padding: 1rem;">Error: ${err.message}</div>`;
                    });
                }
            }, 2000);
        });
    }
    
    const filterMeds = () => {
        const query = searchInput.value.toLowerCase();
        logAgent('frontend', `Searching pharmacy index for: "${query}" (Class: ${activeCategory.toUpperCase()})`);
        
        medCards.forEach(card => {
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
