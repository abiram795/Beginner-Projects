// Mock Login Logs Data
const INITIAL_LOGS = [
    { device: "Chrome / Windows 11", ip: "192.168.1.104", location: "Bengaluru, IN", status: "success" },
    { device: "Safari / iPhone 15", ip: "172.56.88.12", location: "San Francisco, US", status: "success" },
    { device: "Firefox / macOS Sequoia", ip: "198.51.100.4", location: "Berlin, DE", status: "failed" },
    { device: "Chrome / Android 14", ip: "192.168.1.201", location: "Bengaluru, IN", status: "success" }
];

// State
let logs = JSON.parse(localStorage.getItem('as_logs')) || INITIAL_LOGS;
let failedAttempts = parseInt(localStorage.getItem('as_failed')) || 1;
let logQuery = '';
let logStatusFilter = 'all';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const tabButtons = document.querySelectorAll('.auth-tab-btn');
const formPanels = document.querySelectorAll('.auth-form-panel');
const toastContainer = document.getElementById('toast-container');

// Forms DOM
const formLogin = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');
const formForgot = document.getElementById('form-forgot');

// Sign Up inputs
const suPassword = document.getElementById('su-password');
const suConfirm = document.getElementById('su-confirm');
const strengthLbl = document.getElementById('strength-lbl');
const segments = [
    document.getElementById('seg-1'),
    document.getElementById('seg-2'),
    document.getElementById('seg-3'),
    document.getElementById('seg-4')
];

// Stats DOM
const statSessions = document.getElementById('stat-sessions');
const statFailed = document.getElementById('stat-failed');

// Table Logs DOM
const logSearch = document.getElementById('log-search');
const logFilter = document.getElementById('log-filter');
const logsTableBody = document.getElementById('logs-table-body');

// Initialize
function init() {
    setupTheme();
    renderLogs();
    updateStatsUI();
    setupListeners();
}

function setupListeners() {
    // Tabs switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const target = btn.getAttribute('data-target');
            formPanels.forEach(p => {
                if (p.id === target) p.classList.add('active');
                else p.classList.remove('active');
            });
        });
    });

    // Password strength verification
    suPassword.addEventListener('input', () => {
        evaluatePasswordStrength(suPassword.value);
    });

    // Forms Submissions
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('li-email').value;
        showToast("Authentication successful! Loading dashboard...", "success");
        
        // Log Session audit success
        const newLog = {
            device: "Browser / Sandbox Environment",
            ip: "127.0.0.1 (Local)",
            location: "Local Simulation",
            status: "success"
        };
        logs.unshift(newLog);
        saveLogs();
        renderLogs();
        updateStatsUI();
        formLogin.reset();
    });

    formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = suPassword.value;
        const conf = suConfirm.value;

        if (pwd !== conf) {
            showToast("Passwords do not match!", "danger");
            return;
        }

        showToast("Account Created! Check email for verification link.", "success");
        formSignup.reset();
        evaluatePasswordStrength(""); // reset strength bars
    });

    formForgot.addEventListener('submit', (e) => {
        e.preventDefault();
        const captcha = parseInt(document.getElementById('fo-captcha').value);
        
        if (captcha !== 11) {
            showToast("Incorrect security captcha answer!", "danger");
            failedAttempts++;
            localStorage.setItem('as_failed', failedAttempts);
            updateStatsUI();
            return;
        }

        showToast("Recovery email dispatched! Check mock inbox.", "info");
        formForgot.reset();
    });

    // Search and Filters
    logSearch.addEventListener('input', (e) => {
        logQuery = e.target.value;
        renderLogs();
    });

    logFilter.addEventListener('change', (e) => {
        logStatusFilter = e.target.value;
        renderLogs();
    });
}

// Switch tabs programmatically
window.triggerTabSwap = function(targetPanelId) {
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-target') === targetPanelId) {
            btn.click();
        }
    });
};

// Evaluate password strength
function evaluatePasswordStrength(password) {
    let score = 0;
    if (!password) {
        strengthLbl.innerText = "Strength: None";
        strengthLbl.style.color = "var(--text-secondary)";
        segments.forEach(seg => seg.style.background = "var(--panel-border)");
        return;
    }

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Color mapper
    let color = "var(--danger)";
    let label = "Weak";
    
    if (score === 2) {
        color = "var(--warning)";
        label = "Fair";
    } else if (score === 3) {
        color = "var(--accent)";
        label = "Good";
    } else if (score === 4) {
        color = "var(--success)";
        label = "Strong";
    }

    strengthLbl.innerText = `Strength: ${label}`;
    strengthLbl.style.color = color;

    segments.forEach((seg, index) => {
        if (index < score) {
            seg.style.background = color;
        } else {
            seg.style.background = "var(--panel-border)";
        }
    });
}

// Trigger OAuth simulation
window.triggerOAuth = function(provider) {
    showToast(`Initiating OAuth authentication handshake via ${provider}...`, "info");
    setTimeout(() => {
        showToast(`${provider} Login Simulated Successfully!`, "success");
        // Log Session audit success
        const newLog = {
            device: `${provider} OAuth Integration`,
            ip: "10.88.22.4",
            location: "External Route",
            status: "success"
        };
        logs.unshift(newLog);
        saveLogs();
        renderLogs();
        updateStatsUI();
    }, 1200);
};

// Render sessions logs comparative table
function renderLogs() {
    logsTableBody.innerHTML = '';
    
    const filtered = logs.filter(log => {
        const matchesQuery = log.device.toLowerCase().includes(logQuery.toLowerCase()) || 
                             log.location.toLowerCase().includes(logQuery.toLowerCase());
        const matchesStatus = logStatusFilter === 'all' || log.status === logStatusFilter;
        return matchesQuery && matchesStatus;
    });

    if (filtered.length === 0) {
        logsTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; opacity:0.6;">No audit logs match criteria.</td></tr>`;
        return;
    }

    filtered.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${log.device}</strong></td>
            <td style="font-family: monospace;">${log.ip}</td>
            <td>${log.location}</td>
            <td><span class="badge ${log.status}">${log.status}</span></td>
        `;
        logsTableBody.appendChild(row);
    });
}

function updateStatsUI() {
    const activeCount = logs.filter(l => l.status === 'success').length;
    statSessions.innerText = `${activeCount} Active`;
    statFailed.innerText = `${failedAttempts} Failures`;
}

function saveLogs() {
    localStorage.setItem('as_logs', JSON.stringify(logs));
}

// Toast Engine
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'danger' ? 'failed' : type}`;
    toast.style.background = type === 'success' ? 'var(--success)' : (type === 'danger' ? 'var(--danger)' : 'var(--accent)');
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'danger' ? 'fa-circle-exclamation' : 'fa-circle-info')}"></i>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('as_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('as_theme', target);
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
