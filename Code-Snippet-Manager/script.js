// Mock snippets Database
const INITIAL_SNIPPETS = [
    {
        id: 1,
        title: "Center a Div (CSS Flexbox)",
        desc: "The ultimate modern standard utility to center any child node inside its parent grid container.",
        language: "css",
        code: ".parent-container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}",
        date: "2026-07-20"
    },
    {
        id: 2,
        title: "Debounce Search Input (JS)",
        desc: "Prevents rapid consecutive network calls by delaying execution until the user stops typing.",
        language: "javascript",
        code: "function debounce(func, delay = 300) {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => {\n      func.apply(this, args);\n    }, delay);\n  };\n}",
        date: "2026-07-19"
    },
    {
        id: 3,
        title: "HTTP JSON Fetch (Python)",
        desc: "Performs standard GET request parsing response data as JSON using built-in urllib module.",
        language: "python",
        code: "import urllib.request, json\n\nurl = 'https://api.domain.com/data'\nwith urllib.request.urlopen(url) as response:\n    data = json.loads(response.read().decode())\n    print(data)",
        date: "2026-07-18"
    },
    {
        id: 4,
        title: "Join Two Tables (SQL)",
        desc: "Merges rows from order and user databases mapping key indexes.",
        language: "sql",
        code: "SELECT orders.id, users.username, orders.total\nFROM orders\nINNER JOIN users\nON orders.user_id = users.id\nORDER BY orders.total DESC;",
        date: "2026-07-15"
    }
];

// Language Meta for Comparative Table
const LANG_META = [
    { lang: "javascript", title: "JavaScript", difficulty: "Moderate", ext: ".js" },
    { lang: "python", title: "Python", difficulty: "Easy", ext: ".py" },
    { lang: "css", title: "CSS3", difficulty: "Easy", ext: ".css" },
    { lang: "html", title: "HTML5", difficulty: "Easy", ext: ".html" },
    { lang: "sql", title: "SQL", difficulty: "Easy", ext: ".sql" }
];

// State
let snippets = JSON.parse(localStorage.getItem('sb_snippets')) || INITIAL_SNIPPETS;
let copyCount = parseInt(localStorage.getItem('sb_copy_count')) || 12;
let activeLang = 'all';
let searchQuery = '';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const languagesSidebarList = document.getElementById('languages-sidebar-list');
const snippetSearch = document.getElementById('snippet-search');
const btnNewSnippet = document.getElementById('btn-new-snippet');
const snippetsContainer = document.getElementById('snippets-container');

// Stats DOM
const statTotal = document.getElementById('stat-total');
const statFavorite = document.getElementById('stat-favorite');
const statCopies = document.getElementById('stat-copies');

// Table DOM
const languagesTableBody = document.getElementById('languages-table-body');

// Modal DOM
const snippetModal = document.getElementById('snippet-modal');
const snippetForm = document.getElementById('snippet-form');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const formSnippetId = document.getElementById('form-snippet-id');
const formTitle = document.getElementById('form-title');
const formLanguage = document.getElementById('form-language');
const formDesc = document.getElementById('form-desc');
const formCode = document.getElementById('form-code');

// Initialize
function init() {
    setupTheme();
    renderSnippets();
    renderLanguagesTable();
    updateStatsUI();
    setupListeners();
}

function setupListeners() {
    // New snippet click
    btnNewSnippet.addEventListener('click', () => {
        openSnippetModal();
    });

    closeModalBtn.addEventListener('click', () => {
        snippetModal.classList.remove('open');
        snippetForm.reset();
    });

    // Form submit (create / edit)
    snippetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = formSnippetId.value;

        if (idVal) {
            // Edit existing
            const snipObj = snippets.find(s => s.id === parseInt(idVal));
            if (snipObj) {
                snipObj.title = formTitle.value.trim();
                snipObj.language = formLanguage.value;
                snipObj.desc = formDesc.value.trim();
                snipObj.code = formCode.value;
            }
        } else {
            // Create new
            const newSnip = {
                id: Date.now(),
                title: formTitle.value.trim(),
                desc: formDesc.value.trim(),
                language: formLanguage.value,
                code: formCode.value,
                date: new Date().toISOString().substring(0, 10)
            };
            snippets.unshift(newSnip);
        }

        saveSnippets();
        snippetModal.classList.remove('open');
        snippetForm.reset();
        
        renderSnippets();
        renderLanguagesTable();
        updateStatsUI();
    });

    // Search input
    snippetSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderSnippets();
    });

    // Sidebar Category Filter
    languagesSidebarList.querySelectorAll('.lang-item').forEach(item => {
        item.addEventListener('click', () => {
            languagesSidebarList.querySelectorAll('.lang-item').forEach(l => l.classList.remove('active'));
            item.classList.add('active');
            activeLang = item.getAttribute('data-lang');
            renderSnippets();
        });
    });
}

// Render snippets grid
function renderSnippets() {
    snippetsContainer.innerHTML = '';
    
    const filtered = snippets.filter(s => {
        const matchesLang = activeLang === 'all' || s.language === activeLang;
        const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLang && matchesSearch;
    });

    if (filtered.length === 0) {
        snippetsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.6;">
                <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No code snippets found matching search parameters.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(snip => {
        const card = document.createElement('div');
        card.className = 'snippet-card glass';
        
        // Build Syntax Codeblock lines dynamically
        const codeLines = snip.code.split('\n');
        let codeblockLinesHTML = '';
        codeLines.forEach((line, idx) => {
            codeblockLinesHTML += `
                <div class="code-line">
                    <span class="line-num">${idx + 1}</span>
                    <span class="code-content">${escapeHTML(line)}</span>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="snippet-header">
                <span class="badge ${snip.language}">${snip.language.toUpperCase()}</span>
                <div style="display:flex; gap:0.4rem;">
                    <button class="btn-icon copy-btn" title="Copy Code" style="width:24px; height:24px; font-size:0.75rem;"><i class="fa-regular fa-copy"></i></button>
                    <button class="btn-icon edit-btn" title="Edit Snippet" style="width:24px; height:24px; font-size:0.75rem; color:var(--accent);"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon delete-btn" title="Delete Snippet" style="width:24px; height:24px; font-size:0.75rem; color:var(--danger);"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
            <h4 class="snippet-title">${snip.title}</h4>
            <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${snip.desc}</p>
            <div class="codeblock-box">
                ${codeblockLinesHTML}
            </div>
            <div style="font-size: 0.7rem; color:var(--text-secondary); text-align:right;">Added: ${snip.date}</div>
        `;

        // Copy action click
        const copyBtn = card.querySelector('.copy-btn');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(snip.code);
            copyCount++;
            localStorage.setItem('sb_copy_count', copyCount);
            updateStatsUI();
            
            const icon = copyBtn.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => icon.className = 'fa-regular fa-copy', 1500);
        });

        // Edit action click
        card.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openSnippetModal(snip.id);
        });

        // Delete action click
        card.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSnippet(snip.id);
        });

        // Click card also opens editor
        card.addEventListener('click', () => {
            openSnippetModal(snip.id);
        });

        snippetsContainer.appendChild(card);
    });
}

// Delete Snippet
function deleteSnippet(id) {
    if (confirm("Are you sure you want to delete this snippet?")) {
        snippets = snippets.filter(s => s.id !== id);
        saveSnippets();
        renderSnippets();
        renderLanguagesTable();
        updateStatsUI();
    }
}

// Open Editor Modal Form
function openSnippetModal(editId = null) {
    if (editId) {
        const snip = snippets.find(s => s.id === editId);
        if (snip) {
            modalTitle.innerText = "Edit Snippet Details";
            formSnippetId.value = snip.id;
            formTitle.value = snip.title;
            formLanguage.value = snip.language;
            formDesc.value = snip.desc;
            formCode.value = snip.code;
        }
    } else {
        modalTitle.innerText = "Add New Code Snippet";
        formSnippetId.value = '';
        snippetForm.reset();
    }
    snippetModal.classList.add('open');
}

// Render comparative catalog table
function renderLanguagesTable() {
    languagesTableBody.innerHTML = '';
    
    LANG_META.forEach(meta => {
        const count = snippets.filter(s => s.language === meta.lang).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${meta.title}</strong></td>
            <td style="font-weight:700;">${count} Snippets</td>
            <td><span class="badge ${meta.lang}">${meta.difficulty}</span></td>
            <td style="font-family:monospace;">${meta.ext}</td>
            <td style="text-align:right;">
                <button class="btn-secondary filter-sidebar-trigger" data-lang="${meta.lang}" style="padding:0.25rem 0.65rem; font-size:0.75rem;">View Grid</button>
            </td>
        `;

        row.querySelector('.filter-sidebar-trigger').addEventListener('click', () => {
            // Trigger active sidebar item click
            languagesSidebarList.querySelectorAll('.lang-item').forEach(item => {
                if (item.getAttribute('data-lang') === meta.lang) {
                    item.click();
                    item.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        languagesTableBody.appendChild(row);
    });
}

function updateStatsUI() {
    statTotal.innerText = snippets.length;
    statCopies.innerText = copyCount;

    // Most used language
    const counts = {};
    snippets.forEach(s => {
        counts[s.language] = (counts[s.language] || 0) + 1;
    });

    let fav = "JS";
    let max = -1;
    Object.keys(counts).forEach(lang => {
        if (counts[lang] > max) {
            max = counts[lang];
            fav = lang.toUpperCase();
        }
    });
    statFavorite.innerText = fav;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function saveSnippets() {
    localStorage.setItem('sb_snippets', JSON.stringify(snippets));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('sb_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('sb_theme', target);
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
