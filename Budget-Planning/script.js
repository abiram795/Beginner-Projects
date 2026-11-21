// Initial Mock Budgets
const DEFAULT_BUDGETS = {
    Food: 600,
    Housing: 1600,
    Utilities: 400,
    Fun: 300,
    Shopping: 500,
    Transport: 300
};

// Initial Mock Expenses
const DEFAULT_EXPENSES = [
    { id: 1, title: "Whole Foods Market", category: "Food", amount: 155.20, date: "2026-07-18" },
    { id: 2, title: "Urban Living Rent payment", category: "Housing", amount: 1500.00, date: "2026-07-01" },
    { id: 3, title: "Concert tickets & drinks", category: "Fun", amount: 285.00, date: "2026-07-19" },
    { id: 4, title: "Monthly Metro transit card", category: "Transport", amount: 90.00, date: "2026-07-10" }
];

// State
let income = parseFloat(localStorage.getItem('bp_income')) || 5000.00;
let budgets = JSON.parse(localStorage.getItem('bp_budgets')) || DEFAULT_BUDGETS;
let expenses = JSON.parse(localStorage.getItem('bp_expenses')) || DEFAULT_EXPENSES;
let searchQuery = '';
let categoryFilter = 'all';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const inputIncome = document.getElementById('input-income');

// Stats DOM
const statAllocated = document.getElementById('stat-allocated');
const statSpent = document.getElementById('stat-spent');
const statBalance = document.getElementById('stat-balance');

// Forms DOM
const formSetBudget = document.getElementById('form-set-budget');
const budgetCategorySelect = document.getElementById('budget-category');
const budgetLimitValInput = document.getElementById('budget-limit-val');

const formAddExpense = document.getElementById('form-add-expense');
const expTitleInput = document.getElementById('exp-title');
const expCategorySelect = document.getElementById('exp-category');
const expAmountInput = document.getElementById('exp-amount');
const expDateInput = document.getElementById('exp-date');

// Visual meters DOM
const budgetMetersContainer = document.getElementById('budget-meters-container');

// Table DOM
const expSearchInput = document.getElementById('exp-search');
const filterExpCategorySelect = document.getElementById('filter-exp-category');
const expenseTableBody = document.getElementById('expense-table-body');

// Initialize
function init() {
    setupTheme();
    inputIncome.value = income;
    
    // Set default date today
    expDateInput.value = new Date().toISOString().substring(0, 10);
    
    renderAll();
    setupListeners();
}

function setupListeners() {
    // Income input update
    inputIncome.addEventListener('input', (e) => {
        income = parseFloat(e.target.value) || 0;
        localStorage.setItem('bp_income', income);
        renderBalances();
    });

    // Set Budget Limit submit
    formSetBudget.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = budgetCategorySelect.value;
        const lim = parseFloat(budgetLimitValInput.value) || 0;

        budgets[cat] = lim;
        saveBudgets();
        renderAll();
    });

    // Add Expense submit
    formAddExpense.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = expTitleInput.value.trim();
        const cat = expCategorySelect.value;
        const amt = parseFloat(expAmountInput.value) || 0;
        const date = expDateInput.value;

        const newExp = {
            id: Date.now(),
            title,
            category: cat,
            amount: amt,
            date
        };

        expenses.unshift(newExp);
        saveExpenses();
        
        // Reset fields
        expTitleInput.value = '';
        expAmountInput.value = '';
        expDateInput.value = new Date().toISOString().substring(0, 10);

        renderAll();
    });

    // Search and filters
    expSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderLedgerTable();
    });

    filterExpCategorySelect.addEventListener('change', (e) => {
        categoryFilter = e.target.value;
        renderLedgerTable();
    });
}

function renderAll() {
    renderBalances();
    renderProgressMeters();
    renderLedgerTable();
}

// Compute Balances stats
function renderBalances() {
    // Allocated Budgets sum
    let totalAlloc = 0;
    Object.values(budgets).forEach(v => totalAlloc += v);
    statAllocated.innerText = `$${totalAlloc.toLocaleString()}`;

    // Total actual expenses spent
    let totalSpent = 0;
    expenses.forEach(e => totalSpent += e.amount);
    statSpent.innerText = `$${totalSpent.toLocaleString()}`;

    // Safe to spend remainder (Income - spent)
    const remainder = income - totalSpent;
    statBalance.innerText = `$${remainder.toLocaleString()}`;
    
    if (remainder < 0) {
        statBalance.style.color = "var(--danger)";
    } else {
        statBalance.style.color = "var(--success)";
    }
}

// Render visual feedback bars
function renderProgressMeters() {
    budgetMetersContainer.innerHTML = '';

    const categories = Object.keys(budgets);

    categories.forEach(cat => {
        const limit = budgets[cat];
        
        // Sum expense in this category
        let spent = 0;
        expenses.forEach(e => {
            if (e.category === cat) spent += e.amount;
        });

        // Percentage
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        const displayPct = Math.min(Math.round(pct), 100);

        // Decide feedback warning color
        let colorClass = 'success';
        if (pct >= 70 && pct <= 90) {
            colorClass = 'warning';
        } else if (pct > 90) {
            colorClass = 'danger';
        }

        const meter = document.createElement('div');
        meter.className = 'meter-wrapper';
        meter.innerHTML = `
            <div class="meter-header">
                <span>${cat}</span>
                <span style="color: ${colorClass === 'danger' ? 'var(--danger)' : 'var(--text-secondary)'}; font-weight:700;">
                    $${spent.toFixed(2)} / $${limit.toFixed(2)} (${displayPct}%)
                </span>
            </div>
            <div class="meter-bar-outer">
                <div class="meter-bar-inner ${colorClass}" style="width: ${displayPct}%;"></div>
            </div>
        `;
        budgetMetersContainer.appendChild(meter);
    });
}

// Render ledger Table
function renderLedgerTable() {
    expenseTableBody.innerHTML = '';

    const filtered = expenses.filter(e => {
        const matchesQuery = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
        return matchesQuery && matchesCategory;
    });

    if (filtered.length === 0) {
        expenseTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No expense logs match filter settings.</td></tr>`;
        return;
    }

    filtered.forEach(exp => {
        // Find if this category has currently exceeded its limit
        let totalCatSpent = 0;
        expenses.forEach(e => {
            if (e.category === exp.category) totalCatSpent += e.amount;
        });
        const catLimit = budgets[exp.category] || 0;
        const isExceeded = totalCatSpent > catLimit;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.date}</td>
            <td><strong>${exp.title}</strong></td>
            <td><span class="badge" style="background:rgba(0,0,0,0.05); color:var(--text-primary);">${exp.category}</span></td>
            <td style="font-weight:700;">$${exp.amount.toFixed(2)}</td>
            <td>
                <span class="badge ${isExceeded ? 'danger' : 'safe'}">${isExceeded ? 'Limit Alert' : 'Safe'}</span>
            </td>
            <td style="text-align:right;">
                <button class="btn-icon delete-exp-btn" data-id="${exp.id}" style="display:inline-flex; color:var(--danger);"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        row.querySelector('.delete-exp-btn').addEventListener('click', () => {
            expenses = expenses.filter(item => item.id !== exp.id);
            saveExpenses();
            renderAll();
        });

        expenseTableBody.appendChild(row);
    });
}

function saveBudgets() {
    localStorage.setItem('bp_budgets', JSON.stringify(budgets));
}

function saveExpenses() {
    localStorage.setItem('bp_expenses', JSON.stringify(expenses));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('bp_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('bp_theme', target);
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
