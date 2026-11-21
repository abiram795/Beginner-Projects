// Mock Finance Data
const INITIAL_TRANSACTIONS = [
    { id: 1, desc: "Monthly Salary Paycheck", amount: 3200.00, type: "income", category: "Salary", date: "2026-07-01" },
    { id: 2, desc: "Apartment Rent Payment", amount: 1200.00, type: "expense", category: "Housing", date: "2026-07-02" },
    { id: 3, desc: "Supermarket Groceries Basket", amount: 165.50, type: "expense", category: "Groceries", date: "2026-07-05" },
    { id: 4, desc: "Electricity & Internet Bill", amount: 95.00, type: "expense", category: "Utilities", date: "2026-07-10" },
    { id: 5, desc: "Gas Station Refuel", amount: 55.00, type: "expense", category: "Transport", date: "2026-07-12" },
    { id: 6, desc: "Weekend Cinema Tickets", amount: 45.00, type: "expense", category: "Entertainment", date: "2026-07-15" }
];

// Category Colors Map
const CATEGORY_COLORS = {
    Housing: "#f59e0b",
    Groceries: "#10b981",
    Utilities: "#3b82f6",
    Transport: "#8b5cf6",
    Entertainment: "#ec4899",
    Salary: "#06b6d4",
    Other: "#94a3b8"
};

// State
let transactions = JSON.parse(localStorage.getItem('sw_transactions')) || INITIAL_TRANSACTIONS;
let filters = { search: "", type: "all", category: "all" };

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const form = document.getElementById('transaction-form');
const txDesc = document.getElementById('tx-desc');
const txAmount = document.getElementById('tx-amount');
const txType = document.getElementById('tx-type');
const txCategory = document.getElementById('tx-category');
const txDate = document.getElementById('tx-date');

// Stats DOM
const valBalance = document.getElementById('val-balance');
const valSavingsRate = document.getElementById('val-savings-rate');
const valIncome = document.getElementById('val-income');
const valExpense = document.getElementById('val-expense');
const valExpenseCount = document.getElementById('val-expense-count');

// Table + Chart DOM
const txTableBody = document.getElementById('tx-table-body');
const txSearch = document.getElementById('tx-search');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const donutSvg = document.getElementById('donut-svg');
const donutLegend = document.getElementById('donut-legend');

// Initialize
function init() {
    setupTheme();
    // Default Date to today
    txDate.value = new Date().toISOString().substring(0, 10);
    
    renderStats();
    renderChart();
    renderTransactions();
    setupListeners();
}

function setupListeners() {
    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTx = {
            id: Date.now(),
            desc: txDesc.value.trim(),
            amount: parseFloat(txAmount.value),
            type: txType.value,
            category: txType.value === 'income' ? 'Salary' : txCategory.value,
            date: txDate.value
        };

        transactions.unshift(newTx);
        saveTransactions();
        
        txDesc.value = '';
        txAmount.value = '';
        txDate.value = new Date().toISOString().substring(0, 10);

        renderStats();
        renderChart();
        renderTransactions();
    });

    // Income/Expense Type Selection Form Change (Salary is only for income)
    txType.addEventListener('change', (e) => {
        if (e.target.value === 'income') {
            txCategory.value = 'Salary';
            txCategory.disabled = true;
        } else {
            txCategory.value = 'Housing';
            txCategory.disabled = false;
        }
    });

    // Filters
    txSearch.addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderTransactions();
    });

    filterType.addEventListener('change', (e) => {
        filters.type = e.target.value;
        renderTransactions();
    });

    filterCategory.addEventListener('change', (e) => {
        filters.category = e.target.value;
        renderTransactions();
    });
}

// Render balances
function renderStats() {
    let incomeSum = 0;
    let expenseSum = 0;
    let expenseCount = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            incomeSum += t.amount;
        } else {
            expenseSum += t.amount;
            expenseCount++;
        }
    });

    const balance = incomeSum - expenseSum;
    valBalance.innerText = `$${balance.toFixed(2)}`;
    
    if (balance < 0) {
        valBalance.style.color = "var(--danger)";
    } else {
        valBalance.style.color = "var(--text-primary)";
    }

    valIncome.innerText = `$${incomeSum.toFixed(2)}`;
    valExpense.innerText = `$${expenseSum.toFixed(2)}`;
    valExpenseCount.innerText = `${expenseCount} Expense Transactions`;

    // Savings Rate Math
    let rate = 0;
    if (incomeSum > 0) {
        rate = Math.round((balance / incomeSum) * 100);
    }
    valSavingsRate.innerText = `Savings Rate: ${rate >= 0 ? rate : 0}%`;
}

// Render dynamic SVG Donut Chart
function renderChart() {
    donutSvg.innerHTML = '';
    donutLegend.innerHTML = '';

    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group Expense category totals
    const groupTotals = {};
    let totalExpense = 0;

    expenses.forEach(t => {
        groupTotals[t.category] = (groupTotals[t.category] || 0) + t.amount;
        totalExpense += t.amount;
    });

    // If no expenses, draw a hollow neutral grey placeholder ring
    if (totalExpense === 0) {
        donutSvg.innerHTML = `
            <circle cx="70" cy="70" r="50" fill="transparent" stroke="var(--panel-border)" stroke-width="20"></circle>
            <text x="70" y="75" text-anchor="middle" font-size="10" fill="var(--text-secondary)" font-family="var(--font)">No Expenses</text>
        `;
        donutLegend.innerHTML = `<span style="font-size:0.85rem; opacity:0.6;">Add expenses to see metrics breakdown.</span>`;
        return;
    }

    // Donut SVG circumference = 2 * PI * r = 2 * 3.14159 * 50 = 314.16
    const circumference = 314.16;
    let cumulativePercent = 0;

    Object.keys(groupTotals).forEach(cat => {
        const val = groupTotals[cat];
        const percent = val / totalExpense;
        const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

        // Draw ring stroke segment
        const strokeDashOffset = circumference - (percent * circumference);
        const rotationAngle = cumulativePercent * 360 - 90; // offset by 90deg to start top center

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "70");
        circle.setAttribute("cy", "70");
        circle.setAttribute("r", "50");
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-width", "20");
        circle.setAttribute("stroke-dasharray", circumference);
        circle.setAttribute("stroke-dashoffset", strokeDashOffset);
        circle.setAttribute("transform", `rotate(${rotationAngle} 70 70)`);
        circle.style.transition = "stroke-dashoffset 0.5s ease";
        
        donutSvg.appendChild(circle);

        // Add Legend Item
        const pctText = Math.round(percent * 100);
        const legItem = document.createElement('div');
        legItem.className = 'legend-item';
        legItem.innerHTML = `
            <div class="legend-color" style="background: ${color}"></div>
            <strong style="width: 100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${cat}</strong>
            <span style="opacity: 0.8; margin-left: auto;">$${val.toFixed(2)} (${pctText}%)</span>
        `;
        donutLegend.appendChild(legItem);

        cumulativePercent += percent;
    });

    // Insert Center Text Indicator
    const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textNode.setAttribute("x", "70");
    textNode.setAttribute("y", "75");
    textNode.setAttribute("text-anchor", "middle");
    textNode.setAttribute("font-family", "var(--font)");
    textNode.setAttribute("font-size", "11");
    textNode.setAttribute("font-weight", "700");
    textNode.setAttribute("fill", "var(--text-primary)");
    textNode.textContent = "Expense Breakdown";
    donutSvg.appendChild(textNode);
}

// Render ledger history list
function renderTransactions() {
    txTableBody.innerHTML = '';

    const filtered = transactions.filter(t => {
        const matchesSearch = t.desc.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type === 'all' || t.type === filters.type;
        const matchesCategory = filters.category === 'all' || t.category === filters.category;
        return matchesSearch && matchesType && matchesCategory;
    });

    if (filtered.length === 0) {
        txTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.6;">No transaction records found matching filters.</td></tr>`;
        return;
    }

    filtered.forEach(t => {
        const isIncome = t.type === 'income';
        const sign = isIncome ? '+' : '-';
        const amtClass = isIncome ? 'amt-income' : 'amt-expense';
        const badgeClass = isIncome ? 'income' : 'expense';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${t.date}</td>
            <td style="font-weight: 500;">${t.desc}</td>
            <td>${t.category}</td>
            <td><span class="badge ${badgeClass}">${t.type}</span></td>
            <td class="${amtClass}">${sign}$${t.amount.toFixed(2)}</td>
            <td style="text-align:right;">
                <button class="btn-delete remove-tx" data-id="${t.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        row.querySelector('.remove-tx').addEventListener('click', () => deleteTransaction(t.id));
        txTableBody.appendChild(row);
    });
}

// Delete
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderStats();
    renderChart();
    renderTransactions();
}

function saveTransactions() {
    localStorage.setItem('sw_transactions', JSON.stringify(transactions));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('sw_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('sw_theme', target);
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
