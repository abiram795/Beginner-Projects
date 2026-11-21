// Initial Recipe Database
const INITIAL_RECIPES = [
    {
        id: 1,
        title: "Classic Tomato Pasta",
        category: "dinner",
        time: 25,
        servings: 4,
        img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
        ingredients: [
            { name: "Spaghetti Pasta", qty: "400g" },
            { name: "Canned Cherry Tomatoes", qty: "2 Cans" },
            { name: "Fresh Garlic Cloves", qty: "3 minced" },
            { name: "Extra Virgin Olive Oil", qty: "3 Tbsp" },
            { name: "Fresh Basil Leaves", qty: "A handful" }
        ],
        steps: [
            "Boil spaghetti pasta in salted water until al dente.",
            "In a large skillet, heat olive oil and sauté minced garlic for 1 minute.",
            "Pour in cherry tomatoes and simmer for 15 minutes until thickened.",
            "Drain pasta and toss directly into the tomato sauce skillet.",
            "Garnish with fresh basil leaves and serve hot."
        ],
        fav: true
    },
    {
        id: 2,
        title: "Fluffy Blueberry Pancakes",
        category: "breakfast",
        time: 15,
        servings: 2,
        img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60",
        ingredients: [
            { name: "All-purpose Flour", qty: "1 Cup" },
            { name: "Baking Powder", qty: "1 tsp" },
            { name: "Fresh Blueberries", qty: "1/2 Cup" },
            { name: "Milk", qty: "3/4 Cup" },
            { name: "Egg", qty: "1 Large" },
            { name: "Melted Butter", qty: "2 Tbsp" }
        ],
        steps: [
            "Whisk flour, baking powder, and sugar in a large mixing bowl.",
            "Combine milk, egg, and melted butter; pour into the dry mix and stir gently.",
            "Fold in fresh blueberries carefully.",
            "Heat a greased griddle over medium heat and pour batter rounds.",
            "Flip when bubbles appear on the surface; cook until golden brown."
        ],
        fav: false
    },
    {
        id: 3,
        title: "Avocado Strawberry Salad",
        category: "vegan",
        time: 10,
        servings: 3,
        img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
        ingredients: [
            { name: "Fresh Baby Spinach", qty: "150g" },
            { name: "Ripe Avocado", qty: "1 sliced" },
            { name: "Fresh Strawberries", qty: "1 Cup sliced" },
            { name: "Walnuts toasted", qty: "1/4 Cup" },
            { name: "Balsamic Vinaigrette", qty: "3 Tbsp" }
        ],
        steps: [
            "Wash and spin dry baby spinach leaves.",
            "Slice strawberries and avocado into neat segments.",
            "In a large salad bowl, combine spinach, avocado, strawberries, and walnuts.",
            "Drizzle balsamic vinaigrette dressing over salad.",
            "Toss gently and serve immediately."
        ],
        fav: true
    }
];

// App State
let recipes = JSON.parse(localStorage.getItem('zest_recipes')) || INITIAL_RECIPES;
let activeCategory = 'all';
let prepTimeMax = 120;
let searchQuery = '';

// Form temp lists
let tempIngredients = [];
let tempSteps = [];

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const recipeSearch = document.getElementById('recipe-search');
const btnWriteRecipe = document.getElementById('btn-write-recipe');
const prepTimeRange = document.getElementById('prep-time-range');
const rangeValLbl = document.getElementById('range-val-lbl');
const categoryItems = document.querySelectorAll('.category-item');

const recipesGridContainer = document.getElementById('recipes-grid-container');
const recipeCountLbl = document.getElementById('recipe-count-lbl');

// Stats DOM
const statTotal = document.getElementById('stat-total');
const statQuickest = document.getElementById('stat-quickest');
const statAvg = document.getElementById('stat-avg');

// Details Modal DOM
const detailsModal = document.getElementById('recipe-details-modal');
const closeDetailsModal = document.getElementById('close-details-modal');
const detTitle = document.getElementById('det-title');
const detImg = document.getElementById('det-img');
const detTime = document.getElementById('det-time');
const detServings = document.getElementById('det-servings');
const detCategory = document.getElementById('det-category');
const detIngredientsBody = document.getElementById('det-ingredients-body');
const detInstructionsList = document.getElementById('det-instructions-list');

// Form Modal DOM
const recipeFormModal = document.getElementById('recipe-form-modal');
const recipeAddForm = document.getElementById('recipe-add-form');
const btnFormAddIng = document.getElementById('btn-form-add-ing');
const btnFormAddStep = document.getElementById('btn-form-add-step');
const closeRecipeForm = document.getElementById('close-recipe-form');
const formIngList = document.getElementById('form-ing-list');
const formStepList = document.getElementById('form-step-list');

// Init
function init() {
    setupTheme();
    renderRecipes();
    calculateStats();
    setupListeners();
}

function setupListeners() {
    // Add recipe click
    btnWriteRecipe.addEventListener('click', () => {
        tempIngredients = [];
        tempSteps = [];
        renderFormLists();
        recipeFormModal.classList.add('open');
    });

    closeRecipeForm.addEventListener('click', () => {
        recipeFormModal.classList.remove('open');
        recipeAddForm.reset();
    });

    // Close details
    closeDetailsModal.addEventListener('click', () => {
        detailsModal.classList.remove('open');
    });

    // Search
    recipeSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderRecipes();
    });

    // Range duration slider
    prepTimeRange.addEventListener('input', (e) => {
        prepTimeMax = parseInt(e.target.value);
        rangeValLbl.innerText = `Max: ${prepTimeMax}m`;
        renderRecipes();
    });

    // Category click
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            categoryItems.forEach(c => c.classList.remove('active'));
            item.classList.add('active');
            activeCategory = item.getAttribute('data-category');
            renderRecipes();
        });
    });

    // Add ingredient to form temp list
    btnFormAddIng.addEventListener('click', () => {
        const nameEl = document.getElementById('form-ing-name');
        const qtyEl = document.getElementById('form-ing-qty');
        const name = nameEl.value.trim();
        const qty = qtyEl.value.trim();

        if (name && qty) {
            tempIngredients.push({ name, qty });
            nameEl.value = '';
            qtyEl.value = '';
            renderFormLists();
        }
    });

    // Add step to form temp list
    btnFormAddStep.addEventListener('click', () => {
        const descEl = document.getElementById('form-step-desc');
        const desc = descEl.value.trim();

        if (desc) {
            tempSteps.push(desc);
            descEl.value = '';
            renderFormLists();
        }
    });

    // Form submit
    recipeAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (tempIngredients.length === 0) {
            alert("Please add at least one ingredient.");
            return;
        }
        if (tempSteps.length === 0) {
            alert("Please add at least one instruction step.");
            return;
        }

        const name = document.getElementById('form-name').value.trim();
        const category = document.getElementById('form-category').value;
        const time = parseInt(document.getElementById('form-time').value);
        const servings = parseInt(document.getElementById('form-servings').value);
        const imgVal = document.getElementById('form-image').value.trim();
        
        const defaultImg = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=60";
        const newRecipe = {
            id: Date.now(),
            title: name,
            category,
            time,
            servings,
            img: imgVal || defaultImg,
            ingredients: tempIngredients,
            steps: tempSteps,
            fav: false
        };

        recipes.unshift(newRecipe);
        saveRecipes();
        recipeFormModal.classList.remove('open');
        recipeAddForm.reset();
        
        renderRecipes();
        calculateStats();
    });
}

// Render form temporary sub-lists
function renderFormLists() {
    // 1. Ingredients
    formIngList.innerHTML = '';
    tempIngredients.forEach((ing, idx) => {
        const badge = document.createElement('div');
        badge.className = 'glass';
        badge.style.display = 'flex';
        badge.style.justifyContent = 'space-between';
        badge.style.alignItems = 'center';
        badge.style.padding = '0.35rem 0.75rem';
        badge.style.borderRadius = '4px';
        badge.style.fontSize = '0.85rem';
        badge.innerHTML = `
            <span><strong>${ing.name}</strong> - ${ing.qty}</span>
            <i class="fa-solid fa-trash-can" style="color:var(--danger); cursor:pointer;" onclick="removeTempIngredient(${idx})"></i>
        `;
        formIngList.appendChild(badge);
    });

    // 2. Steps
    formStepList.innerHTML = '';
    tempSteps.forEach((step, idx) => {
        const li = document.createElement('li');
        li.style.fontSize = '0.85rem';
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; width: 100%;">
                <span>${step}</span>
                <i class="fa-solid fa-trash-can" style="color:var(--danger); cursor:pointer; flex-shrink:0;" onclick="removeTempStep(${idx})"></i>
            </div>
        `;
        formStepList.appendChild(li);
    });
}

window.removeTempIngredient = function(index) {
    tempIngredients.splice(index, 1);
    renderFormLists();
};

window.removeTempStep = function(index) {
    tempSteps.splice(index, 1);
    renderFormLists();
};

// Render recipes grid
function renderRecipes() {
    recipesGridContainer.innerHTML = '';
    const filtered = recipes.filter(rec => {
        const matchesCat = activeCategory === 'all' || rec.category === activeCategory;
        const matchesTime = rec.time <= prepTimeMax;
        const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              rec.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCat && matchesTime && matchesSearch;
    });

    recipeCountLbl.innerText = `Showing ${filtered.length} recipes`;

    if (filtered.length === 0) {
        recipesGridContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.6;">
                <i class="fa-solid fa-bowl-food" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No dishes found matching your preferences.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(rec => {
        const card = document.createElement('div');
        card.className = 'recipe-card glass';
        card.innerHTML = `
            <div class="recipe-card-img" style="background-image: url('${rec.img}')">
                <button class="btn-fav ${rec.fav ? 'active' : ''}" data-id="${rec.id}">
                    <i class="fa-${rec.fav ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>
            <div class="recipe-card-content">
                <span style="font-size:0.75rem; color:var(--accent); font-weight:600; text-transform:uppercase;">${rec.category}</span>
                <h3 class="recipe-card-title">${rec.title}</h3>
                <div class="recipe-card-meta">
                    <span><i class="fa-regular fa-clock"></i> ${rec.time} mins</span>
                    <span><i class="fa-solid fa-user-group"></i> ${rec.servings} serving</span>
                </div>
            </div>
        `;
        
        // Favorite toggle click
        card.querySelector('.btn-fav').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(rec.id);
        });

        // Details click
        card.addEventListener('click', () => openDetails(rec.id));

        recipesGridContainer.appendChild(card);
    });
}

// Toggle Fav
function toggleFavorite(id) {
    const rec = recipes.find(r => r.id === id);
    if (rec) {
        rec.fav = !rec.fav;
        saveRecipes();
        renderRecipes();
        calculateStats();
    }
}

// Open Details Modal
function openDetails(id) {
    const rec = recipes.find(r => r.id === id);
    if (!rec) return;

    detTitle.innerText = rec.title;
    detImg.style.backgroundImage = `url('${rec.img}')`;
    detTime.innerText = `${rec.time} mins`;
    detServings.innerText = `${rec.servings} portions`;
    detCategory.innerText = rec.category.toUpperCase();

    // Render Ingredients Checklist Table
    detIngredientsBody.innerHTML = '';
    rec.ingredients.forEach((ing, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <label class="checklist-label">
                    <input type="checkbox" id="chk-ing-${index}">
                    <span>${ing.name}</span>
                </label>
            </td>
            <td style="font-weight:600;">${ing.qty}</td>
        `;
        detIngredientsBody.appendChild(row);
    });

    // Render Directions list
    detInstructionsList.innerHTML = '';
    rec.steps.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        detInstructionsList.appendChild(li);
    });

    detailsModal.classList.add('open');
}

// Calculate Dashboard Stats
function calculateStats() {
    statTotal.innerText = recipes.length;
    
    if (recipes.length === 0) {
        statQuickest.innerText = "None";
        statAvg.innerText = "0m";
        return;
    }

    // Quickest
    const sorted = [...recipes].sort((a, b) => a.time - b.time);
    statQuickest.innerText = `${sorted[0].title} (${sorted[0].time}m)`;

    // Average
    const sum = recipes.reduce((a, b) => a + b.time, 0);
    statAvg.innerText = `${Math.round(sum / recipes.length)}m`;
}

function saveRecipes() {
    localStorage.setItem('zest_recipes', JSON.stringify(recipes));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('zest_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('zest_theme', target);
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
