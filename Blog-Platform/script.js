// Initial Blog Mock Data
const INITIAL_ARTICLES = [
    {
        id: 1,
        title: "The Future of Web Engineering with Glassmorphic Frameworks",
        content: "Glassmorphism is more than just a passing design trend; it represents a paradigm shift in how we approach layered interface depth. By utilising CSS variables alongside the backdrop-filter property, developers can simulate natural reflections and focal blur without sacrificing page speed.\n\nIn this article, we explore how to construct highly scalable, accessible user interfaces using semi-transparent variables. Layering is key: start with a background gradient that has enough contrast, overlay it with a blurred glass panel, and complete the design with a thin border highlight. This approach not only looks premium but also mimics real-world materials, easing user interactions through contextual depth.",
        category: "technology",
        readTime: 6,
        author: "Alex Mercer",
        date: "July 19, 2026",
        likes: 42,
        comments: [
            { author: "Sarah Connor", date: "July 19, 2026", text: "This is a fantastic breakdown! The code snippets really helped." },
            { author: "Bruce Banner", date: "July 20, 2026", text: "Excellent point on depth perception. What about performance on older mobile screens?" }
        ],
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "Curating a Minimalist Creative Workspace",
        content: "Minimalism is not about empty space; it's about removing the noise so that your creative goals can take center stage. When designing a physical workspace, focus on natural light, ergonomic structures, and cohesive aesthetics. Keep cords hidden and select a palette that calms the senses.\n\nDigital workspaces require the same attention. Simplify your desktop grids, consolidate your folders, and restrict notifications to only critical alerts. Decluttering your environment naturally opens up focus channels, allowing deep work periods to happen effortlessly.",
        category: "design",
        readTime: 4,
        author: "Emma Watson",
        date: "July 18, 2026",
        likes: 28,
        comments: [
            { author: "Tony Stark", date: "July 19, 2026", text: "Minimalism is great, but a clean desk is a sign of a cluttered drawer!" }
        ],
        img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        title: "The Ethics of AI in Modern Software Architecture",
        content: "As artificial intelligence integrates deeper into code repositories, architectural patterns must evolve to maintain data privacy and integrity. Developers must build systems that respect data boundaries, offer transparent feedback logs, and prioritize user safety above automated velocity.\n\nDesigning modular APIs that can intercept and check AI generations before they hit database stores is a great starting pattern. Establishing strict verification schemes ensures that autonomous layers act within expected limits, preventing model drift and data leaks.",
        category: "philosophy",
        readTime: 8,
        author: "Linus Torvalds",
        date: "July 15, 2026",
        likes: 56,
        comments: [],
        img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60"
    }
];

// App State
let articles = JSON.parse(localStorage.getItem('scribble_articles')) || INITIAL_ARTICLES;
let userLiked = JSON.parse(localStorage.getItem('scribble_user_liked')) || [];
let activeCategory = 'all';
let searchQuery = '';

// DOM Elements
const logoHome = document.getElementById('logo-home');
const feedSearch = document.getElementById('feed-search');
const btnWriteArticle = document.getElementById('btn-write-article');
const btnToggleStudio = document.getElementById('btn-toggle-studio');
const btnExitStudio = document.getElementById('btn-exit-studio');
const themeToggle = document.getElementById('theme-toggle');

const feedContainer = document.getElementById('feed-container');
const studioContainer = document.getElementById('studio-container');
const catLinks = document.querySelectorAll('.cat-link');
const featuredCard = document.getElementById('featured-article-card');
const articlesGrid = document.getElementById('articles-grid-container');

// Studio Analytics
const statTotalPosts = document.getElementById('stat-total-posts');
const statTotalLikes = document.getElementById('stat-total-likes');
const statTotalComments = document.getElementById('stat-total-comments');
const studioTableBody = document.getElementById('studio-articles-table-body');

// Reader Modal
const readerModalOverlay = document.getElementById('reader-modal-overlay');
const btnCloseReader = document.getElementById('btn-close-reader');
const readerAuthorAvatar = document.getElementById('reader-author-avatar');
const readerAuthorName = document.getElementById('reader-author-name');
const readerPublishDate = document.getElementById('reader-publish-date');
const readerCategory = document.getElementById('reader-category');
const readerTitle = document.getElementById('reader-title-heading');
const readerBannerImg = document.getElementById('reader-banner-img');
const readerBodyText = document.getElementById('reader-body-paragraph');
const btnReaderLike = document.getElementById('btn-reader-like');
const readerLikeCount = document.getElementById('reader-like-count');
const likeIconState = document.getElementById('like-icon-state');
const commentsHeadingCount = document.getElementById('comments-heading-count');
const commentTextarea = document.getElementById('comment-textarea');
const btnPostComment = document.getElementById('btn-post-comment');
const readerCommentsList = document.getElementById('reader-comments-list');
let currentActiveReaderArticleId = null;

// Editor Modal
const editorModalOverlay = document.getElementById('editor-modal-overlay');
const editorForm = document.getElementById('editor-form');
const editorModalTitle = document.getElementById('editor-modal-title');
const btnCloseEditor = document.getElementById('btn-close-editor');
const formArticleId = document.getElementById('edit-article-id');
const formArticleTitle = document.getElementById('form-article-title');
const formArticleCategory = document.getElementById('form-article-category');
const formArticleReadTime = document.getElementById('form-article-readtime');
const formArticleImg = document.getElementById('form-article-img');
const formArticleContent = document.getElementById('form-article-content');

// Init Setup
function init() {
    setupTheme();
    renderFeed();
    renderStudioTable();
    updateAnalytics();
    setupEventListeners();
}

function setupEventListeners() {
    // Navigation home
    logoHome.addEventListener('click', (e) => {
        e.preventDefault();
        showFeed();
    });

    // Write button
    btnWriteArticle.addEventListener('click', () => {
        openEditor();
    });

    // Studio Toggles
    btnToggleStudio.addEventListener('click', showStudio);
    btnExitStudio.addEventListener('click', showFeed);

    // Search feed input
    feedSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderFeed();
    });

    // Categories filter
    catLinks.forEach(link => {
        link.addEventListener('click', () => {
            catLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            activeCategory = link.getAttribute('data-category');
            renderFeed();
        });
    });

    // Modal Close triggers
    btnCloseReader.addEventListener('click', () => {
        readerModalOverlay.classList.remove('open');
        currentActiveReaderArticleId = null;
    });

    btnCloseEditor.addEventListener('click', () => {
        editorModalOverlay.classList.remove('open');
        editorForm.reset();
    });

    // Like Action inside reader
    btnReaderLike.addEventListener('click', () => {
        if (!currentActiveReaderArticleId) return;
        toggleArticleLike(currentActiveReaderArticleId);
    });

    // Post Comment Action
    btnPostComment.addEventListener('click', () => {
        const text = commentTextarea.value.trim();
        if (!text || !currentActiveReaderArticleId) return;

        const article = articles.find(a => a.id === currentActiveReaderArticleId);
        if (article) {
            const newComment = {
                author: "Abiram S", // Simulated logged in user
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                text: text
            };

            article.comments.push(newComment);
            saveArticles();
            commentTextarea.value = '';
            renderReaderComments(article);
            renderFeed();
            renderStudioTable();
            updateAnalytics();
        }
    });

    // Editor Form Submit (Create / Edit)
    editorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const editId = formArticleId.value;

        if (editId) {
            // Edit existing
            const article = articles.find(a => a.id === parseInt(editId));
            if (article) {
                article.title = formArticleTitle.value.trim();
                article.category = formArticleCategory.value;
                article.readTime = parseInt(formArticleReadTime.value);
                article.img = formArticleImg.value.trim() || getDefaultImage(article.category);
                article.content = formArticleContent.value.trim();
            }
        } else {
            // Create new
            const newArticle = {
                id: Date.now(),
                title: formArticleTitle.value.trim(),
                category: formArticleCategory.value,
                readTime: parseInt(formArticleReadTime.value),
                author: "Abiram S", // Mock author
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                likes: 0,
                comments: [],
                img: formArticleImg.value.trim() || getDefaultImage(formArticleCategory.value),
                content: formArticleContent.value.trim()
            };
            articles.unshift(newArticle);
        }

        saveArticles();
        editorModalOverlay.classList.remove('open');
        editorForm.reset();
        
        renderFeed();
        renderStudioTable();
        updateAnalytics();
    });
}

// Render News Feed
function renderFeed() {
    const filtered = articles.filter(art => {
        const matchesCat = activeCategory === 'all' || art.category === activeCategory;
        const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              art.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    // Clear Containers
    featuredCard.innerHTML = '';
    articlesGrid.innerHTML = '';

    if (filtered.length === 0) {
        articlesGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; opacity:0.6;"><i class="fa-regular fa-folder-open" style="font-size:3rem; margin-bottom:1rem;"></i><p>No stories found matching your filter criteria.</p></div>`;
        featuredCard.style.display = 'none';
        return;
    }

    // Determine if we should show featured layout (only on 'all' category and empty search)
    let feedStartIndex = 0;
    if (activeCategory === 'all' && !searchQuery) {
        featuredCard.style.display = 'grid';
        const feat = filtered[0];
        feedStartIndex = 1;

        featuredCard.innerHTML = `
            <div class="featured-img-container">
                <div class="featured-img-mock" style="background-image: url('${feat.img}')"></div>
            </div>
            <div class="featured-content">
                <span class="btn-primary" style="align-self:flex-start; pointer-events:none; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:12px;">FEATURED • ${feat.category.toUpperCase()}</span>
                <h2 style="font-family:var(--serif); font-size:1.85rem; font-weight:700; line-height:1.25;">${feat.title}</h2>
                <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.5;">${feat.content.substring(0, 160)}...</p>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-secondary); border-top:1px solid var(--panel-border); padding-top:0.75rem;">
                    <span>by <strong>${feat.author}</strong></span>
                    <span>${feat.date} • ${feat.readTime} min read</span>
                </div>
            </div>
        `;
        featuredCard.onclick = () => openReader(feat.id);
    } else {
        featuredCard.style.display = 'none';
    }

    // Render regular grid items
    for (let i = feedStartIndex; i < filtered.length; i++) {
        const art = filtered[i];
        const card = document.createElement('div');
        card.className = 'article-card glass';
        card.innerHTML = `
            <div class="card-img-placeholder" style="background-image: url('${art.img}')"></div>
            <span class="btn-primary" style="align-self:flex-start; pointer-events:none; font-size:0.7rem; padding:0.15rem 0.4rem; border-radius:10px;">${art.category.toUpperCase()}</span>
            <h3 class="card-title">${art.title}</h3>
            <p class="card-desc">${art.content.substring(0, 100)}...</p>
            <div class="card-meta">
                <span>by <strong>${art.author}</strong></span>
                <div style="display:flex; gap:0.75rem; align-items:center;">
                    <span><i class="fa-solid fa-heart" style="color:var(--danger);"></i> ${art.likes}</span>
                    <span><i class="fa-regular fa-comment"></i> ${art.comments.length}</span>
                </div>
            </div>
        `;
        card.onclick = () => openReader(art.id);
        articlesGrid.appendChild(card);
    }
}

// Render Studio list
function renderStudioTable() {
    studioTableBody.innerHTML = '';
    const myArticles = articles.filter(a => a.author === "Abiram S");

    if (myArticles.length === 0) {
        studioTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6;">You have not published any stories yet.</td></tr>`;
        return;
    }

    myArticles.forEach(art => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong style="font-family:var(--serif); font-size:0.95rem;">${art.title}</strong></td>
            <td>${art.date}</td>
            <td><span class="btn-primary" style="pointer-events:none; font-size:0.7rem; padding:0.15rem 0.4rem; border-radius:10px;">${art.category.toUpperCase()}</span></td>
            <td>${art.likes}</td>
            <td style="text-align:right;">
                <button class="btn-icon edit-art" data-id="${art.id}" style="display:inline-flex; color:var(--accent);"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon delete-art" data-id="${art.id}" style="display:inline-flex; color:var(--danger);"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        row.querySelector('.edit-art').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditor(art.id);
        });
        row.querySelector('.delete-art').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteArticle(art.id);
        });
        studioTableBody.appendChild(row);
    });
}

// Update Dashboard Statistics indicators
function updateAnalytics() {
    const myArticles = articles.filter(a => a.author === "Abiram S");
    let totalLikes = 0;
    let totalComments = 0;

    myArticles.forEach(a => {
        totalLikes += a.likes;
        totalComments += a.comments.length;
    });

    statTotalPosts.innerText = myArticles.length;
    statTotalLikes.innerText = totalLikes;
    statTotalComments.innerText = totalComments;
}

// Open Reader
function openReader(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    currentActiveReaderArticleId = articleId;

    // Set author initials
    const initials = article.author.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    readerAuthorAvatar.innerText = initials;
    readerAuthorName.innerText = article.author;
    readerPublishDate.innerText = `${article.date} • ${article.readTime} min read`;
    readerCategory.innerText = article.category.toUpperCase();
    readerTitle.innerText = article.title;
    
    // Banner Mock
    readerBannerImg.style.backgroundImage = `url('${article.img}')`;
    readerBodyText.innerText = article.content;

    // Likes state
    updateLikesButtonUI(article);
    
    // Render comments list
    renderReaderComments(article);

    readerModalOverlay.classList.add('open');
}

function renderReaderComments(article) {
    commentsHeadingCount.innerText = `${article.comments.length} Responses`;
    readerCommentsList.innerHTML = '';

    if (article.comments.length === 0) {
        readerCommentsList.innerHTML = `<p style="opacity:0.6; font-size:0.85rem; text-align:center; padding:1rem 0;">No responses yet. Be the first to share your thoughts!</p>`;
        return;
    }

    article.comments.forEach(com => {
        const item = document.createElement('div');
        item.className = 'comment-item glass';
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; margin-bottom:0.5rem;">
                <strong>${com.author}</strong>
                <span style="opacity:0.6;">${com.date}</span>
            </div>
            <p style="font-size:0.9rem; line-height:1.4;">${com.text}</p>
        `;
        readerCommentsList.appendChild(item);
    });
}

function updateLikesButtonUI(article) {
    readerLikeCount.innerText = `${article.likes} Likes`;
    const isLiked = userLiked.includes(article.id);
    if (isLiked) {
        likeIconState.className = 'fa-solid fa-heart';
        likeIconState.style.color = 'var(--danger)';
    } else {
        likeIconState.className = 'fa-regular fa-heart';
        likeIconState.style.color = 'var(--text-secondary)';
    }
}

// Toggle Like
function toggleArticleLike(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;

    const idx = userLiked.indexOf(id);
    if (idx > -1) {
        // Unlike
        userLiked.splice(idx, 1);
        article.likes--;
    } else {
        // Like
        userLiked.push(id);
        article.likes++;
    }

    localStorage.setItem('scribble_user_liked', JSON.stringify(userLiked));
    saveArticles();
    updateLikesButtonUI(article);
    renderFeed();
    renderStudioTable();
    updateAnalytics();
}

// Delete Article
function deleteArticle(id) {
    if (confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
        articles = articles.filter(a => a.id !== id);
        saveArticles();
        renderFeed();
        renderStudioTable();
        updateAnalytics();
    }
}

// Open Editor Form (Create / Edit)
function openEditor(editId = null) {
    if (editId) {
        const article = articles.find(a => a.id === editId);
        if (article) {
            editorModalTitle.innerText = "Update Story Draft";
            formArticleId.value = article.id;
            formArticleTitle.value = article.title;
            formArticleCategory.value = article.category;
            formArticleReadTime.value = article.readTime;
            formArticleImg.value = article.img;
            formArticleContent.value = article.content;
            document.getElementById('btn-save-article').innerText = "Update Story";
        }
    } else {
        editorModalTitle.innerText = "Draft a New Story";
        formArticleId.value = '';
        editorForm.reset();
        document.getElementById('btn-save-article').innerText = "Publish Story";
    }
    editorModalOverlay.classList.add('open');
}

// Helper defaults
function getDefaultImage(cat) {
    const categoryImages = {
        technology: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
        design: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&auto=format&fit=crop&q=60",
        philosophy: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=60",
        lifestyle: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=60"
    };
    return categoryImages[cat] || categoryImages.technology;
}

function saveArticles() {
    localStorage.setItem('scribble_articles', JSON.stringify(articles));
}

// Navigation Tab Swaps
function showFeed() {
    studioContainer.style.display = 'none';
    feedContainer.style.display = 'flex';
}

function showStudio() {
    feedContainer.style.display = 'none';
    studioContainer.style.display = 'flex';
    renderStudioTable();
    updateAnalytics();
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('scribble_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('scribble_theme', target);
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

// Run
init();
