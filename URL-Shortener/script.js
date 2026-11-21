// Mock Shortener Data
const INITIAL_LINKS = [
    { id: 1, longUrl: "https://github.com/abiram795/her-launch", domain: "shrk.it", alias: "codebase", shortUrl: "shrk.it/codebase", clicks: 142, date: "2026-07-15" },
    { id: 2, longUrl: "https://figma.com/file/premium-glassmorphic-design-system", domain: "lnkd.in", alias: "figma-ui", shortUrl: "lnkd.in/figma-ui", clicks: 88, date: "2026-07-18" },
    { id: 3, longUrl: "https://unsplash.com/photos/curated-developer-workspace-placeholders", domain: "bit.ly", alias: "workspace-img", shortUrl: "bit.ly/workspace-img", clicks: 35, date: "2026-07-20" }
];

// State
let links = JSON.parse(localStorage.getItem('shrink_links')) || INITIAL_LINKS;
let filters = { search: "", domain: "all" };

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const form = document.getElementById('shortener-form');
const inputLongUrl = document.getElementById('long-url');
const selectDomain = document.getElementById('select-domain');
const inputCustomAlias = document.getElementById('custom-alias');

const resultBox = document.getElementById('result-box');
const resultUrl = document.getElementById('result-url');
const btnCopyResult = document.getElementById('btn-copy-result');

// Stats DOM
const statLinks = document.getElementById('stat-links');
const statClicks = document.getElementById('stat-clicks');
const statTopDomain = document.getElementById('stat-top-domain');

// Ledger Table DOM
const linkSearch = document.getElementById('link-search');
const filterDomain = document.getElementById('filter-domain');
const linksTableBody = document.getElementById('links-table-body');

// Initialize
function init() {
    setupTheme();
    renderStats();
    renderTable();
    setupListeners();
}

function setupListeners() {
    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const longUrl = inputLongUrl.value.trim();
        const domain = selectDomain.value;
        let alias = inputCustomAlias.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');

        // If no alias, generate random 6 char alphanumeric
        if (!alias) {
            alias = Math.random().toString(36).substring(2, 8);
        }

        // Check duplicate alias
        const isDuplicate = links.some(l => l.domain === domain && l.alias === alias);
        if (isDuplicate) {
            alert("This custom alias is already registered for this domain. Please choose another.");
            return;
        }

        const shortUrl = `${domain}/${alias}`;
        const newLink = {
            id: Date.now(),
            longUrl,
            domain,
            alias,
            shortUrl,
            clicks: 0,
            date: new Date().toISOString().substring(0, 10)
        };

        links.unshift(newLink);
        saveLinks();

        // Render Generated result
        resultUrl.innerText = shortUrl;
        resultBox.classList.add('active');
        
        // Reset inputs
        inputLongUrl.value = '';
        inputCustomAlias.value = '';

        renderStats();
        renderTable();
    });

    // Copy Result Button
    btnCopyResult.addEventListener('click', () => {
        const urlText = resultUrl.innerText;
        navigator.clipboard.writeText(urlText);
        btnCopyResult.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        setTimeout(() => {
            btnCopyResult.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;
        }, 1500);
    });

    // History Filters
    linkSearch.addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderTable();
    });

    filterDomain.addEventListener('change', (e) => {
        filters.domain = e.target.value;
        renderTable();
    });
}

// Render click stats
function renderStats() {
    statLinks.innerText = links.length;
    
    let clickTotal = 0;
    const domainCounts = {};

    links.forEach(l => {
        clickTotal += l.clicks;
        domainCounts[l.domain] = (domainCounts[l.domain] || 0) + 1;
    });

    statClicks.innerText = clickTotal.toLocaleString();

    // Top domain used
    let top = "None";
    let max = -1;
    Object.keys(domainCounts).forEach(d => {
        if (domainCounts[d] > max) {
            max = domainCounts[d];
            top = d;
        }
    });
    statTopDomain.innerText = top;
}

// Render history ledger list
function renderTable() {
    linksTableBody.innerHTML = '';

    const filtered = links.filter(l => {
        const matchesSearch = l.alias.toLowerCase().includes(filters.search.toLowerCase()) || 
                              l.longUrl.toLowerCase().includes(filters.search.toLowerCase());
        const matchesDomain = filters.domain === 'all' || l.domain === filters.domain;
        return matchesSearch && matchesDomain;
    });

    if (filtered.length === 0) {
        linksTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.6;">No shortened links registered.</td></tr>`;
        return;
    }

    filtered.forEach(l => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${l.date}</td>
            <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${l.longUrl}">
                <a href="${l.longUrl}" target="_blank" style="color:var(--text-primary); text-decoration:none;">${l.longUrl}</a>
            </td>
            <td><strong>${l.shortUrl}</strong></td>
            <td style="font-weight:700; color:var(--accent);">${l.clicks} Clicks</td>
            <td>
                <button class="btn-action simulate-visit" data-id="${l.id}"><i class="fa-solid fa-arrow-pointer"></i> Visit (+1)</button>
            </td>
            <td style="text-align:right;">
                <button class="btn-icon copy-link" data-url="${l.shortUrl}" style="display:inline-flex; vertical-align:middle;"><i class="fa-solid fa-copy"></i></button>
                <button class="btn-icon delete-link" data-id="${l.id}" style="display:inline-flex; color:var(--danger); vertical-align:middle;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        // Click simulation
        row.querySelector('.simulate-visit').addEventListener('click', () => {
            l.clicks++;
            saveLinks();
            renderStats();
            renderTable();
        });

        // Copy action in row
        const copyBtn = row.querySelector('.copy-link');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(l.shortUrl);
            const icon = copyBtn.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => icon.className = 'fa-solid fa-copy', 1200);
        });

        // Delete
        row.querySelector('.delete-link').addEventListener('click', () => {
            links = links.filter(item => item.id !== l.id);
            saveLinks();
            renderStats();
            renderTable();
        });

        linksTableBody.appendChild(row);
    });
}

function saveLinks() {
    localStorage.setItem('shrink_links', JSON.stringify(links));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('shrink_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('shrink_theme', target);
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
