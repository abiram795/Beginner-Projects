// Mock Bookstore Data
const BOOKS = [
    {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        category: "fiction",
        price: 14.99,
        rating: 4.8,
        color: "#4f46e5"
    },
    {
        id: 2,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "technology",
        price: 35.50,
        rating: 4.9,
        color: "#0d9488"
    },
    {
        id: 3,
        title: "Brief Answers to the Big Questions",
        author: "Stephen Hawking",
        category: "science",
        price: 18.00,
        rating: 4.7,
        color: "#be185d"
    },
    {
        id: 4,
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        category: "business",
        price: 16.50,
        rating: 4.6,
        color: "#b45309"
    },
    {
        id: 5,
        title: "Dune",
        author: "Frank Herbert",
        category: "fiction",
        price: 12.99,
        rating: 4.7,
        color: "#1e3a8a"
    },
    {
        id: 6,
        title: "You Don't Know JS Yet",
        author: "Kyle Simpson",
        category: "technology",
        price: 24.99,
        rating: 4.8,
        color: "#0369a1"
    },
    {
        id: 7,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "science",
        price: 15.20,
        rating: 4.9,
        color: "#4d7c0f"
    },
    {
        id: 8,
        title: "Zero to One",
        author: "Peter Thiel",
        category: "business",
        price: 19.99,
        rating: 4.5,
        color: "#6d28d9"
    },
    {
        id: 9,
        title: "The Alchemist",
        author: "Paulo Coelho",
        category: "fiction",
        price: 11.50,
        rating: 4.8,
        color: "#c2410c"
    },
    {
        id: 10,
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        category: "technology",
        price: 42.00,
        rating: 4.9,
        color: "#111827"
    },
    {
        id: 11,
        title: "Cosmos",
        author: "Carl Sagan",
        category: "science",
        price: 21.00,
        rating: 4.9,
        color: "#4338ca"
    },
    {
        id: 12,
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "business",
        price: 22.80,
        rating: 4.6,
        color: "#0f766e"
    }
];

// App State
let cart = JSON.parse(localStorage.getItem('novella_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('novella_wishlist')) || [];
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const booksContainer = document.getElementById('books-container');
const categoryItems = document.querySelectorAll('.category-item');
const searchInput = document.getElementById('search-input');
const resultsCount = document.getElementById('results-count');
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartBadge = document.getElementById('cart-badge');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const wishlistToggle = document.getElementById('wishlist-toggle');
const wishlistBadge = document.getElementById('wishlist-badge');
const wishlistSection = document.getElementById('wishlist-section');
const closeWishlistBtn = document.getElementById('close-wishlist-view');
const wishlistTableBody = document.getElementById('wishlist-table-body');
const themeToggle = document.getElementById('theme-toggle');
const checkoutBtn = document.getElementById('btn-checkout');
const checkoutModal = document.getElementById('checkout-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const toastContainer = document.getElementById('toast-container');
const statTotalBooks = document.getElementById('stat-total-books');

// Initialize App
function init() {
    renderBooks();
    updateCartUI();
    updateWishlistUI();
    setupTheme();
    statTotalBooks.innerText = BOOKS.length;
}

// Render Book Catalog
function renderBooks() {
    booksContainer.innerHTML = '';
    const filtered = BOOKS.filter(book => {
        const matchesCategory = currentCategory === 'all' || book.category === currentCategory;
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              book.author.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    resultsCount.innerText = `Showing ${filtered.length} books`;

    if (filtered.length === 0) {
        booksContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.6;">
                <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No books found matching your criteria.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(book => {
        const isWishlisted = wishlist.includes(book.id);
        const card = document.createElement('div');
        card.className = 'book-card glass';
        card.innerHTML = `
            <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-id="${book.id}">
                <i class="fa-${isWishlisted ? 'solid' : 'regular'} fa-heart"></i>
            </button>
            <div class="book-cover-container">
                <div class="book-cover-mock" style="background: ${book.color}">
                    <div class="book-cover-title">${book.title}</div>
                    <div class="book-cover-author">${book.author}</div>
                </div>
            </div>
            <span class="book-tag">${book.category.toUpperCase()}</span>
            <h3 class="book-title" title="${book.title}">${book.title}</h3>
            <div class="book-author">by ${book.author}</div>
            <div class="book-footer">
                <span class="book-price">$${book.price.toFixed(2)}</span>
                <button class="btn-add-cart" data-id="${book.id}">
                    <i class="fa-solid fa-cart-plus"></i> Add
                </button>
            </div>
        `;
        booksContainer.appendChild(card);
    });

    // Attach Event Listeners to cards
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.getAttribute('data-id')));
        });
    });

    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleWishlist(parseInt(btn.getAttribute('data-id')));
        });
    });
}

// Shopping Cart Functions
function addToCart(bookId) {
    const book = BOOKS.find(b => b.id === bookId);
    const existing = cart.find(item => item.id === bookId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...book, quantity: 1 });
    }

    localStorage.setItem('novella_cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`Added "${book.title}" to cart!`, 'success');
}

function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    let totalItems = 0;
    let subtotal = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;

        const cartElement = document.createElement('div');
        cartElement.className = 'cart-item';
        cartElement.innerHTML = `
            <div class="cart-item-cover" style="background: ${item.color}">Cover</div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-author">${item.author}</div>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="btn-quantity dec-qty" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="btn-quantity inc-qty" data-id="${item.id}">+</button>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartElement);
    });

    cartBadge.innerText = totalItems;
    cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    cartTotal.innerText = `$${subtotal.toFixed(2)}`;

    // Add listeners for cart item actions
    document.querySelectorAll('.inc-qty').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(parseInt(btn.getAttribute('data-id')), 1));
    });
    document.querySelectorAll('.dec-qty').forEach(btn => {
        btn.addEventListener('click', () => changeQuantity(parseInt(btn.getAttribute('data-id')), -1));
    });
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => removeCartItem(parseInt(btn.getAttribute('data-id'))));
    });
}

function changeQuantity(id, val) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += val;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('novella_cart', JSON.stringify(cart));
    updateCartUI();
}

function removeCartItem(id) {
    const item = cart.find(i => i.id === id);
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('novella_cart', JSON.stringify(cart));
    updateCartUI();
    showToast(`Removed "${item.title}" from cart.`, 'info');
}

// Wishlist Functions
function toggleWishlist(bookId) {
    const idx = wishlist.indexOf(bookId);
    const book = BOOKS.find(b => b.id === bookId);

    if (idx > -1) {
        wishlist.splice(idx, 1);
        showToast(`Removed "${book.title}" from wishlist.`, 'info');
    } else {
        wishlist.push(bookId);
        showToast(`Added "${book.title}" to wishlist!`, 'success');
    }

    localStorage.setItem('novella_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    renderBooks();
}

function updateWishlistUI() {
    wishlistBadge.innerText = wishlist.length;
    wishlistTableBody.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; opacity: 0.6;">
                    Your wishlist is empty. Like books in the gallery to display them here.
                </td>
            </tr>
        `;
        return;
    }

    wishlist.forEach(bookId => {
        const book = BOOKS.find(b => b.id === bookId);
        if (!book) return;

        const row = document.createElement('tr');
        row.style.borderBottom = "1px solid var(--panel-border)";
        row.innerHTML = `
            <td style="padding: 1rem 0.5rem;">
                <div style="width: 40px; height: 55px; background: ${book.color}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.4rem; font-weight: bold;">
                    Cover
                </div>
            </td>
            <td style="padding: 1rem 0.5rem;">
                <strong style="display:block; font-size:0.95rem;">${book.title}</strong>
                <span style="font-size:0.8rem; color: var(--text-secondary);">by ${book.author}</span>
            </td>
            <td style="padding: 1rem 0.5rem; font-weight: 600;">$${book.price.toFixed(2)}</td>
            <td style="padding: 1rem 0.5rem;"><span style="color:var(--success); font-weight:500; font-size:0.85rem;"><i class="fa-solid fa-circle-check"></i> In Stock</span></td>
            <td style="padding: 1rem 0.5rem; text-align: right;">
                <button class="btn-add-cart" data-id="${book.id}" style="display:inline-flex; padding:0.4rem 0.8rem;">Add to Cart</button>
                <button class="btn-icon remove-wishlist" data-id="${book.id}" style="display:inline-flex; color: var(--danger); vertical-align:middle;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        wishlistTableBody.appendChild(row);
    });

    document.querySelectorAll('.remove-wishlist').forEach(btn => {
        btn.addEventListener('click', () => toggleWishlist(parseInt(btn.getAttribute('data-id'))));
    });
}

// Toast System
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Search and Filter Events
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderBooks();
});

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(c => c.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.getAttribute('data-category');
        renderBooks();
    });
});

// UI Toggles
cartToggle.addEventListener('click', () => cartDrawer.classList.toggle('open'));
cartCloseBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

wishlistToggle.addEventListener('click', () => {
    const isHidden = wishlistSection.style.display === 'none';
    wishlistSection.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        wishlistSection.scrollIntoView({ behavior: 'smooth' });
    }
});
closeWishlistBtn.addEventListener('click', () => {
    wishlistSection.style.display = 'none';
});

// Theme Management
function setupTheme() {
    const savedTheme = localStorage.getItem('novella_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('novella_theme', target);
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

// Checkout simulation
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast("Your cart is empty!", "danger");
        return;
    }
    checkoutModal.classList.add('open');
});

modalCloseBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
    cart = [];
    localStorage.setItem('novella_cart', JSON.stringify(cart));
    updateCartUI();
    cartDrawer.classList.remove('open');
});

// Run
init();
