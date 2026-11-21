// Mock Dishes Data
const INITIAL_DISHES = [
    {
        id: 1,
        name: "Garlic Tomato Bruschetta",
        category: "starters",
        price: 8.50,
        image: "https://images.unsplash.com/photo-1572656631137-7935297eff55?w=400&auto=format&fit=crop&q=60",
        desc: "Crisp artisanal ciabatta rubbed with garlic, virgin olive oil, vine-ripened tomatoes, and fresh sweet basil.",
        veg: true,
        spicy: false,
        inStock: true
    },
    {
        id: 2,
        name: "Penne Arrabbiata (Spicy)",
        category: "mains",
        price: 14.25,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=60",
        desc: "Penne pasta tossed in an intense sauce made from garlic, ripe tomatoes, and red chili peppers cooked in olive oil.",
        veg: true,
        spicy: true,
        inStock: true
    },
    {
        id: 3,
        name: "Pan-Seared Citrus Salmon",
        category: "mains",
        price: 21.50,
        image: "https://images.unsplash.com/photo-1485921325814-7d798785ed69?w=400&auto=format&fit=crop&q=60",
        desc: "Fresh wild-caught Atlantic salmon fillet crisped and finished with a zesty lemon orange honey reduction.",
        veg: false,
        spicy: false,
        inStock: true
    },
    {
        id: 4,
        name: "Classic Italian Tiramisu",
        category: "desserts",
        price: 7.75,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=60",
        desc: "Layers of sponge cake soaked in robust espresso coffee, layered with whipped mascarpone cream and dusted with cocoa.",
        veg: true,
        spicy: false,
        inStock: true
    },
    {
        id: 5,
        name: "Craft Mint Lemonade",
        category: "drinks",
        price: 4.50,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=60",
        desc: "Freshly squeezed lemon juice muddled with garden spearmint leaves, cane syrup, and carbonated soda water.",
        veg: true,
        spicy: false,
        inStock: true
    },
    {
        id: 6,
        name: "Spicy Volcano Chicken Wing",
        category: "starters",
        price: 9.99,
        image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=60",
        desc: "Succulent chicken drumlets roasted in dynamic habanero paste and honey glaze.",
        veg: false,
        spicy: true,
        inStock: false // starts out of stock to demonstrate stat widget
    }
];

// State
let dishes = JSON.parse(localStorage.getItem('bistro_dishes')) || INITIAL_DISHES;
let cart = {}; // maps dishId -> quantity
let activeCategory = 'all';
let searchQuery = '';
let isAdminMode = false;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const adminViewToggle = document.getElementById('admin-view-toggle');
const menuSearch = document.getElementById('menu-search');

const customerViewPanel = document.getElementById('customer-view-panel');
const adminViewPanel = document.getElementById('admin-view-panel');

const sidebarFilters = document.getElementById('sidebar-filters');
const categoryList = document.getElementById('category-list');
const customerCartWidget = document.getElementById('customer-cart-widget');
const cartItemCount = document.getElementById('cart-item-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const btnSubmitOrder = document.getElementById('btn-submit-order');

const customerMenuGrid = document.getElementById('customer-menu-grid');

// Admin Stats
const statTotalDishes = document.getElementById('stat-total-dishes');
const statAvgPrice = document.getElementById('stat-avg-price');
const statOutStock = document.getElementById('stat-out-stock');

// Admin Form
const menuEditForm = document.getElementById('menu-edit-form');
const formDishId = document.getElementById('form-dish-id');
const formName = document.getElementById('form-name');
const formPrice = document.getElementById('form-price');
const formCategory = document.getElementById('form-category');
const formImage = document.getElementById('form-image');
const formDesc = document.getElementById('form-desc');
const formChkVeg = document.getElementById('form-chk-veg');
const formChkSpicy = document.getElementById('form-chk-spicy');
const formSwitchStock = document.getElementById('form-switch-stock');
const formTitleLbl = document.getElementById('form-title-lbl');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

// Table DOM
const adminTableBody = document.getElementById('admin-table-body');
const toastContainer = document.getElementById('toast-container');

// Initialize
function init() {
    setupTheme();
    renderCustomerGrid();
    renderAdminView();
    updateCartUI();
    setupListeners();
}

function setupListeners() {
    // Mode Switch Toggle
    adminViewToggle.addEventListener('change', (e) => {
        isAdminMode = e.target.checked;
        if (isAdminMode) {
            customerViewPanel.classList.remove('active');
            adminViewPanel.classList.add('active');
            customerCartWidget.style.display = 'none';
        } else {
            adminViewPanel.classList.remove('active');
            customerViewPanel.classList.add('active');
            customerCartWidget.style.display = 'block';
        }
        renderCustomerGrid();
        renderAdminView();
    });

    // Sidebar Category Clicks
    categoryList.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            categoryList.querySelectorAll('.category-item').forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.getAttribute('data-category');
            renderCustomerGrid();
            renderAdminView();
        });
    });

    // Search input
    menuSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCustomerGrid();
        renderAdminView();
    });

    // Submit Order click
    btnSubmitOrder.addEventListener('click', () => {
        const keys = Object.keys(cart);
        if (keys.length === 0) {
            alert("Your table order is empty! Add dishes first.");
            return;
        }

        showToast("Table order sent! Bistro chef notified.", "success");
        cart = {};
        updateCartUI();
    });

    // Admin Form Save
    menuEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = formDishId.value;
        
        const name = formName.value.trim();
        const price = parseFloat(formPrice.value);
        const category = formCategory.value;
        let image = formImage.value.trim();
        const desc = formDesc.value.trim();
        const veg = formChkVeg.checked;
        const spicy = formChkSpicy.checked;
        const inStock = formSwitchStock.checked;

        if (!image) {
            image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60"; // fallback food
        }

        if (idVal) {
            // Edit existing
            const dish = dishes.find(d => d.id === parseInt(idVal));
            if (dish) {
                dish.name = name;
                dish.price = price;
                dish.category = category;
                dish.image = image;
                dish.desc = desc;
                dish.veg = veg;
                dish.spicy = spicy;
                dish.inStock = inStock;
            }
        } else {
            // Create new
            const newDish = {
                id: Date.now(),
                name,
                price,
                category,
                image,
                desc,
                veg,
                spicy,
                inStock
            };
            dishes.push(newDish);
        }

        saveDishes();
        resetAdminForm();
        renderCustomerGrid();
        renderAdminView();
    });

    // Cancel Edit
    btnCancelEdit.addEventListener('click', () => {
        resetAdminForm();
    });
}

// Render Customer Cards Grid
function renderCustomerGrid() {
    customerMenuGrid.innerHTML = '';
    
    const filtered = dishes.filter(d => {
        const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        customerMenuGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.6;">
                <i class="fa-solid fa-utensils" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No dishes found matching search parameters.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'menu-card glass';
        
        let badgesHTML = '';
        if (dish.veg) badgesHTML += `<span class="badge veg">VEG</span>`;
        if (dish.spicy) badgesHTML += `<span class="badge spicy">SPICY</span>`;
        if (!dish.inStock) badgesHTML += `<span class="badge stock-out" style="background:rgba(0,0,0,0.5); color:white;">OUT OF STOCK</span>`;

        card.innerHTML = `
            <div class="menu-card-img" style="background-image: url('${dish.image}')">
                <div style="position:absolute; top:10px; left:10px; display:flex; gap:0.25rem;">
                    ${badgesHTML}
                </div>
            </div>
            <div class="menu-card-content">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h4 class="menu-card-title">${dish.name}</h4>
                </div>
                <p class="menu-card-desc">${dish.desc}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">$${dish.price.toFixed(2)}</span>
                    <button class="btn-primary add-order-btn" data-id="${dish.id}" ${!dish.inStock ? 'disabled' : ''} style="padding:0.4rem 0.8rem; font-size:0.8rem;">
                        ${dish.inStock ? 'Add to Order' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.add-order-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            addToOrder(dish.id);
        });

        customerMenuGrid.appendChild(card);
    });
}

function addToOrder(id) {
    cart[id] = (cart[id] || 0) + 1;
    updateCartUI();
    showToast("Added item to order!", "info");
}

function updateCartUI() {
    let count = 0;
    let total = 0;

    Object.keys(cart).forEach(id => {
        const countVal = cart[id];
        const dish = dishes.find(d => d.id === parseInt(id));
        if (dish) {
            count += countVal;
            total += dish.price * countVal;
        }
    });

    cartItemCount.innerText = `${count} items`;
    cartTotalPrice.innerText = `$${total.toFixed(2)}`;
}

// Render Admin Statistics & Table
function renderAdminView() {
    statTotalDishes.innerText = dishes.length;
    
    let sum = 0;
    let outCount = 0;
    dishes.forEach(d => {
        sum += d.price;
        if (!d.inStock) outCount++;
    });

    const avg = dishes.length > 0 ? sum / dishes.length : 0;
    statAvgPrice.innerText = `$${avg.toFixed(2)}`;
    statOutStock.innerText = outCount;

    // Render Table Row
    adminTableBody.innerHTML = '';

    // Sort or filter table matches
    const filtered = dishes.filter(d => {
        const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No registered dishes.</td></tr>`;
        return;
    }

    filtered.forEach(dish => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="width:36px; height:36px; border-radius:50%; background-image:url('${dish.image}'); background-size:cover; background-position:center;"></div>
                    <strong>${dish.name}</strong>
                </div>
            </td>
            <td style="font-weight:700;">$${dish.price.toFixed(2)}</td>
            <td><span class="badge" style="background:rgba(0,0,0,0.05); color:var(--text-primary);">${dish.category.toUpperCase()}</span></td>
            <td>
                <div style="display:flex; gap:0.25rem;">
                    ${dish.veg ? '<i class="fa-solid fa-leaf" style="color:var(--success);" title="Vegetarian"></i>' : ''}
                    ${dish.spicy ? '<i class="fa-solid fa-fire" style="color:var(--danger);" title="Spicy"></i>' : ''}
                </div>
            </td>
            <td>
                <span class="badge ${dish.inStock ? 'stock-in' : 'stock-out'}">${dish.inStock ? 'In Stock' : 'Out of Stock'}</span>
            </td>
            <td style="text-align:right;">
                <button class="btn-icon-sm edit-dish-btn" data-id="${dish.id}" style="color:var(--accent);"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-icon-sm delete-dish-btn" data-id="${dish.id}" style="color:var(--danger);"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        row.querySelector('.edit-dish-btn').addEventListener('click', () => editDish(dish.id));
        row.querySelector('.delete-dish-btn').addEventListener('click', () => deleteDish(dish.id));

        adminTableBody.appendChild(row);
    });
}

function editDish(id) {
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;

    formDishId.value = dish.id;
    formName.value = dish.name;
    formPrice.value = dish.price;
    formCategory.value = dish.category;
    formImage.value = dish.image;
    formDesc.value = dish.desc;
    formChkVeg.checked = dish.veg;
    formChkSpicy.checked = dish.spicy;
    formSwitchStock.checked = dish.inStock;

    formTitleLbl.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--accent);"></i> Edit Menu Item`;
    btnCancelEdit.style.display = 'inline-block';
}

function deleteDish(id) {
    if (confirm("Delete this menu item?")) {
        dishes = dishes.filter(d => d.id !== id);
        saveDishes();
        renderCustomerGrid();
        renderAdminView();
    }
}

function resetAdminForm() {
    formDishId.value = '';
    menuEditForm.reset();
    formTitleLbl.innerHTML = `<i class="fa-solid fa-circle-plus" style="color:var(--accent);"></i> Add Menu Item`;
    btnCancelEdit.style.display = 'none';
}

function saveDishes() {
    localStorage.setItem('bistro_dishes', JSON.stringify(dishes));
}

// Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '20px';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.borderRadius = 'var(--radius-sm)';
    toast.style.color = 'white';
    toast.style.fontWeight = '500';
    toast.style.fontSize = '0.85rem';
    toast.style.background = type === 'success' ? 'var(--success)' : 'var(--accent)';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    toast.style.zIndex = '300';
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-info'}"></i> ${message}`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('bistro_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('bistro_theme', target);
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
