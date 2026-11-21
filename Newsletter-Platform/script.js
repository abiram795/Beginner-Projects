// Preset Email Templates Data
const PRESET_TEMPLATES = {
    briefing: {
        subject: "Chronicle Weekly Digest - July 2026",
        body: "Hello Reader,\n\nHere are the top three curated technology and science milestones this week:\n\n1. Quantum Cryptography: semi-stable cooling achievements.\n2. Sustainable Grids: Solar micro-nodes hit 85% peak efficiency.\n3. Regional Aerodynamics: regional transportation trial runs at Mach 4.\n\nThank you for reading the Chronicle weekly dispatch!\n\nBest Regards,\nThe Chronicle Team"
    },
    promo: {
        subject: "Exclusive Premium Tooling discount code: SHIELD-20",
        body: "Hello Developer,\n\nTo thank you for being a part of our security sandbox portfolio program, we are offering an exclusive 20% discount on all premium subscription tiers.\n\nEnter code SHIELD-20 during billing checkout to apply savings.\n\nBest,\nAuthShield Security"
    },
    product: {
        subject: "MailGrid Version 2.0 Launch Announcement",
        body: "Dear Customer,\n\nWe are thrilled to announce MailGrid v2.0 is now live in your sandbox environment. Key upgrades include:\n\n- Real-time campaign stats updates.\n- Seamless LocalStorage subscriber ledger backups.\n- Filterable subscriber database tables.\n\nCheck out the updates today!\n\nCheers,\nMailGrid team"
    }
};

// Initial Subscribers List
const INITIAL_SUBSCRIBERS = [
    { id: 1, name: "Alice Patel", email: "alice.patel@gmail.com", status: "active", date: "2026-07-02" },
    { id: 2, name: "David Kim", email: "david.kim@outlook.com", status: "active", date: "2026-07-12" },
    { id: 3, name: "Sofia Silva", email: "sofia.s@domain.com", status: "pending", date: "2026-07-18" },
    { id: 4, name: "Marcus Brown", email: "marcus.b@gmail.com", status: "unsubscribed", date: "2026-07-20" }
];

// State
let subscribers = JSON.parse(localStorage.getItem('ng_subscribers')) || INITIAL_SUBSCRIBERS;
let campaignsSentCount = parseInt(localStorage.getItem('ng_campaigns_count')) || 0;
let activePreset = 'briefing';
let searchQuery = '';
let statusFilter = 'all';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const templatesPresetGrid = document.getElementById('templates-preset-grid');

// Campaign Form DOM
const campaignComposerForm = document.getElementById('campaign-composer-form');
const campaignSubject = document.getElementById('campaign-subject');
const campaignBody = document.getElementById('campaign-body');
const btnDispatchCampaign = document.getElementById('btn-dispatch-campaign');

// Subscriber Form DOM
const subscriberAddForm = document.getElementById('subscriber-add-form');
const subNameInput = document.getElementById('sub-name');
const subEmailInput = document.getElementById('sub-email');
const subStatusSelect = document.getElementById('sub-status');

// Stats DOM
const statSubscribers = document.getElementById('stat-subscribers');
const statDispatched = document.getElementById('stat-dispatched');

// Table DOM
const subSearchInput = document.getElementById('sub-search');
const filterSubStatusSelect = document.getElementById('filter-sub-status');
const subscriberTableBody = document.getElementById('subscriber-table-body');
const toastContainer = document.getElementById('toast-container');

// Initialize
function init() {
    setupTheme();
    loadTemplatePreset('briefing');
    renderTable();
    updateStatsUI();
    setupListeners();
}

function setupListeners() {
    // Preset Template Grid Click
    templatesPresetGrid.querySelectorAll('.template-card-item').forEach(card => {
        card.addEventListener('click', () => {
            templatesPresetGrid.querySelectorAll('.template-card-item').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const presetKey = card.getAttribute('data-preset');
            activePreset = presetKey;
            loadTemplatePreset(presetKey);
        });
    });

    // Campaign Send submit
    campaignComposerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        btnDispatchCampaign.disabled = true;
        btnDispatchCampaign.innerText = "Dispatching campaign queue...";
        
        // Count active subscribers
        const activeSubCount = subscribers.filter(s => s.status === 'active').length;

        setTimeout(() => {
            campaignsSentCount++;
            localStorage.setItem('ng_campaigns_count', campaignsSentCount);
            
            showToast(`Campaign sent successfully to ${activeSubCount} active subscriber(s)!`, "success");
            
            btnDispatchCampaign.disabled = false;
            btnDispatchCampaign.innerText = "Simulate Send Campaign";
            
            updateStatsUI();
        }, 1500);
    });

    // Add Subscriber submit
    subscriberAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = subNameInput.value.trim();
        const email = subEmailInput.value.trim();
        const status = subStatusSelect.value;

        // Check duplicates
        const exists = subscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            alert("This subscriber email is already registered.");
            return;
        }

        const newSub = {
            id: Date.now(),
            name,
            email,
            status,
            date: new Date().toISOString().substring(0, 10)
        };

        subscribers.unshift(newSub);
        saveSubscribers();
        
        // Reset form
        subNameInput.value = '';
        subEmailInput.value = '';
        subStatusSelect.value = 'active';

        renderTable();
        updateStatsUI();
    });

    // Search and filters
    subSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTable();
    });

    filterSubStatusSelect.addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
    });
}

function loadTemplatePreset(key) {
    const data = PRESET_TEMPLATES[key];
    if (data) {
        campaignSubject.value = data.subject;
        campaignBody.value = data.body;
    }
}

// Render Subscriber Table comparative logs
function renderTable() {
    subscriberTableBody.innerHTML = '';

    const filtered = subscribers.filter(s => {
        const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesQuery && matchesStatus;
    });

    if (filtered.length === 0) {
        subscriberTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No subscriber records matching current filter configurations.</td></tr>`;
        return;
    }

    filtered.forEach(sub => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="font-weight:700;">${sub.name}</div>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${sub.email}</div>
            </td>
            <td><span class="badge ${sub.status}">${sub.status}</span></td>
            <td>${sub.date}</td>
            <td style="text-align:right;">
                <button class="btn-primary cycle-status-btn" data-id="${sub.id}" style="padding:0.25rem 0.65rem; font-size:0.75rem;">Cycle</button>
                <button class="btn-icon delete-sub-btn" data-id="${sub.id}" style="display:inline-flex; color:var(--danger); vertical-align:middle;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        // Cycle Status button click (active -> pending -> unsubscribed)
        row.querySelector('.cycle-status-btn').addEventListener('click', () => {
            const nextStatus = {
                active: "pending",
                pending: "unsubscribed",
                unsubscribed: "active"
            };
            sub.status = nextStatus[sub.status] || "active";
            saveSubscribers();
            renderTable();
            updateStatsUI();
        });

        // Delete subscriber
        row.querySelector('.delete-sub-btn').addEventListener('click', () => {
            subscribers = subscribers.filter(item => item.id !== sub.id);
            saveSubscribers();
            renderTable();
            updateStatsUI();
        });

        subscriberTableBody.appendChild(row);
    });
}

function updateStatsUI() {
    statSubscribers.innerText = subscribers.length;
    statDispatched.innerText = campaignsSentCount;
}

function saveSubscribers() {
    localStorage.setItem('ng_subscribers', JSON.stringify(subscribers));
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('ng_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('ng_theme', target);
    updateThemeIcon(target);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

init();
