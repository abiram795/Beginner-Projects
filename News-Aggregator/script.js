// Mock News Feeds
const NEWS_ARTICLES = [
    {
        id: 1,
        title: "Quantum Decryption Milestones Achieved by Joint Lab Initiative",
        desc: "Researchers have successfully factored a 2048-bit equivalent cryptographic string using a semi-stable cooling state quantum array, years ahead of consensus industry roadmaps.",
        source: "Science Daily",
        date: "July 20, 2026",
        category: "science",
        img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60",
        trending: true
    },
    {
        id: 2,
        title: "Venture Velocity: Tech Startups Pivot Towards Edge Integrations",
        desc: "Capital grids shift towards local hardware edge layers. New seed valuations indicate massive investor appetite for offline micro-nodes rather than centralized cloud hosting models.",
        source: "TechCrunch",
        date: "July 20, 2026",
        category: "technology",
        img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 3,
        title: "Sovereign Debt Gauges Recalibrate After Treasury Rate Adjustments",
        desc: "Global bonds indicate sudden yield compression metrics. Economists suggest the rate adjustments will ease startup debt refinancing burdens in the second half of the fiscal cycle.",
        source: "Financial Times",
        date: "July 19, 2026",
        category: "business",
        img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 4,
        title: "Hyper-sonic Aerodynamics Redefines Regional Transport Prototypes",
        desc: "A carbon-fiber alloy airframe has completed continuous atmospheric glide trials at Mach 4.2. Commercial flight simulations indicate regional cross-continent times could drop by 60%.",
        source: "Aero Science",
        date: "July 18, 2026",
        category: "science",
        img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 5,
        title: "Sustainable Grid Integrations Hit Record 85% Efficiency Benchmarks",
        desc: "State energy boards report solar and wind micro-nodes managed to supply a record 85% of peak electrical demands without experiencing grid voltage instabilities.",
        source: "Clean Energy News",
        date: "July 17, 2026",
        category: "technology",
        img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 6,
        title: "Formula E-Championship Prototype Unveils Advanced Regenerative Rotors",
        desc: "Automotive engineers test a dual-action carbon stator motor which can recover up to 45% of braking kinetic energy, extending battery ranges in circuit races.",
        source: "Sports Tech Hub",
        date: "July 16, 2026",
        category: "sports",
        img: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 7,
        title: "Micro-Gravity Biological Crystallization Yields Advanced Therapeutics",
        desc: "Experiments conducted on space stations reveal that cell proteins crystallized in microgravity environments grow 5x larger, allowing targeted drug testing structures.",
        source: "Science Daily",
        date: "July 15, 2026",
        category: "science",
        img: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=500&auto=format&fit=crop&q=60",
        trending: false
    },
    {
        id: 8,
        title: "Wimbledon Final Sets Record Digital Broadcast Viewership Numbers",
        desc: "Wimbledon organizers report a record-shattering 45 million concurrent online video streams during the final sets, highlighting the growth of server-less stream routing grids.",
        source: "Sports Tech Hub",
        date: "July 14, 2026",
        category: "sports",
        img: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60",
        trending: false
    }
];

// State
let bookmarks = JSON.parse(localStorage.getItem('cn_bookmarks')) || [];
let activeCategory = 'all';
let searchQuery = '';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const newsSearch = document.getElementById('news-search');
const bookmarksToggleBtn = document.getElementById('bookmarks-toggle-btn');
const bookmarkBadge = document.getElementById('bookmark-badge');
const categoryItems = document.querySelectorAll('.category-item');

const trendingCard = document.getElementById('trending-card');
const newsGridContainer = document.getElementById('news-grid-container');
const lblNewsCount = document.getElementById('lbl-news-count');

// Stats Elements
const statTotalFeeds = document.getElementById('stat-total-feeds');
const statSavedFeeds = document.getElementById('stat-saved-feeds');

// Bookmarks DOM
const bookmarksSection = document.getElementById('bookmarks-section');
const closeBookmarksBtn = document.getElementById('close-bookmarks-btn');
const bookmarksTableBody = document.getElementById('bookmarks-table-body');

// Newsletter Form
const newsletterForm = document.getElementById('newsletter-form');

// Initialize
function init() {
    setupTheme();
    renderFeed();
    updateBookmarksUI();
    statTotalFeeds.innerText = NEWS_ARTICLES.length;
    setupListeners();
}

function setupListeners() {
    // Search
    newsSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderFeed();
    });

    // Category click
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.getAttribute('data-category');
            renderFeed();
        });
    });

    // Bookmarks Drawer Toggle
    bookmarksToggleBtn.addEventListener('click', () => {
        const isHidden = bookmarksSection.style.display === 'none';
        bookmarksSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            bookmarksSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    closeBookmarksBtn.addEventListener('click', () => {
        bookmarksSection.style.display = 'none';
    });

    // Newsletter Submit
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Simulating Subscription! Welcome to the Chronicle newsletter daily briefing service.");
        newsletterForm.reset();
    });
}

// Render News Feed cards
function renderFeed() {
    const filtered = NEWS_ARTICLES.filter(art => {
        const matchesCat = activeCategory === 'all' || art.category === activeCategory;
        const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              art.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    // Clear
    trendingCard.innerHTML = '';
    newsGridContainer.innerHTML = '';
    
    lblNewsCount.innerText = `Showing ${filtered.length} stories`;

    if (filtered.length === 0) {
        newsGridContainer.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:3rem; opacity:0.6;">
                <i class="fa-regular fa-newspaper" style="font-size:3rem; margin-bottom:1rem;"></i>
                <p>No stories found matching search parameters.</p>
            </div>
        `;
        trendingCard.style.display = 'none';
        return;
    }

    // Trending Banner (Hero landing layout - only if no active category and no search)
    let gridStartIndex = 0;
    if (activeCategory === 'all' && !searchQuery) {
        trendingCard.style.display = 'grid';
        const trend = NEWS_ARTICLES.find(a => a.trending) || filtered[0];
        gridStartIndex = 1;

        trendingCard.innerHTML = `
            <div class="trending-img" style="background-image: url('${trend.img}')"></div>
            <div class="trending-content">
                <span class="btn-primary" style="align-self:flex-start; pointer-events:none; font-size:0.7rem; padding:0.15rem 0.4rem; border-radius:10px;">TRENDING HEADLINE</span>
                <h2 style="font-family:var(--serif); font-size:1.65rem; line-height:1.25;">${trend.title}</h2>
                <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${trend.desc}</p>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); border-top:1px solid var(--panel-border); padding-top:0.75rem;">
                    <span>Source: <strong>${trend.source}</strong></span>
                    <span>${trend.date}</span>
                </div>
            </div>
        `;
        trendingCard.onclick = () => alert(`Opening Full Headline: "${trend.title}"\nSource: ${trend.source}`);
    } else {
        trendingCard.style.display = 'none';
    }

    // Render regular grid cards
    filtered.forEach((art, idx) => {
        // Skip index 0 if it was rendered as trending
        if (activeCategory === 'all' && !searchQuery && idx === 0) return;

        const isBookmarked = bookmarks.includes(art.id);
        const card = document.createElement('div');
        card.className = 'news-card glass';
        card.innerHTML = `
            <div class="news-card-img" style="background-image: url('${art.img}')">
                <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" data-id="${art.id}">
                    <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
            </div>
            <span style="font-size:0.7rem; color:var(--accent); font-weight:600; text-transform:uppercase;">${art.category}</span>
            <h3 class="news-card-title">${art.title}</h3>
            <p class="news-card-desc">${art.desc}</p>
            <div class="news-card-meta">
                <span><strong>${art.source}</strong></span>
                <span>${art.date}</span>
            </div>
        `;

        // Bookmark icon click
        card.querySelector('.btn-bookmark').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleBookmark(art.id);
        });

        // Details click
        card.addEventListener('click', () => alert(`Opening Story: "${art.title}"\nSource: ${art.source}`));

        newsGridContainer.appendChild(card);
    });
}

// Toggle Bookmark
function toggleBookmark(id) {
    const idx = bookmarks.indexOf(id);
    if (idx > -1) {
        bookmarks.splice(idx, 1);
    } else {
        bookmarks.push(id);
    }

    localStorage.setItem('cn_bookmarks', JSON.stringify(bookmarks));
    updateBookmarksUI();
    renderFeed();
}

// Update Bookmarks UI table ledger
function updateBookmarksUI() {
    bookmarkBadge.innerText = bookmarks.length;
    statSavedFeeds.innerText = bookmarks.length;
    bookmarksTableBody.innerHTML = '';

    if (bookmarks.length === 0) {
        bookmarksTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No bookmarked articles saved. Click bookmarks on news cards to display them here.</td></tr>`;
        return;
    }

    bookmarks.forEach(bookId => {
        const art = NEWS_ARTICLES.find(a => a.id === bookId);
        if (!art) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="font-family:var(--serif);">${art.title}</strong></td>
            <td>${art.source}</td>
            <td><span class="badge ${art.category}">${art.category}</span></td>
            <td>${art.date}</td>
            <td style="text-align:right;">
                <button class="btn-primary open-story" data-id="${art.id}" style="padding:0.3rem 0.65rem; font-size:0.75rem;">Open</button>
                <button class="btn-icon remove-book" data-id="${art.id}" style="display:inline-flex; color:var(--danger); vertical-align:middle;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        row.querySelector('.open-story').addEventListener('click', () => alert(`Opening Saved Story: "${art.title}"`));
        row.querySelector('.remove-book').addEventListener('click', () => toggleBookmark(art.id));

        bookmarksTableBody.appendChild(row);
    });
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('cn_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('cn_theme', target);
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
