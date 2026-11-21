// Default Recipe Catalog
const DEFAULT_CATALOG = [
    { name: "Oatmeal Banana Bowl", category: "breakfast", cals: 320, carbs: 48, protein: 12, fats: 6, ingredients: ["Oats", "Milk", "Banana", "Honey"] },
    { name: "Greek Yogurt & Berries", category: "breakfast", cals: 220, carbs: 18, protein: 20, fats: 3, ingredients: ["Greek Yogurt", "Strawberries", "Blueberries", "Granola"] },
    { name: "Grilled Chicken Salad", category: "lunch", cals: 450, carbs: 12, protein: 38, fats: 16, ingredients: ["Chicken Breast", "Mixed Greens", "Cucumber", "Olive Oil"] },
    { name: "Turkey Avocado Wrap", category: "lunch", cals: 380, carbs: 32, protein: 24, fats: 12, ingredients: ["Turkey Breast", "Avocado", "Tortilla", "Tomato"] },
    { name: "Baked Salmon & Broccoli", category: "dinner", cals: 520, carbs: 15, protein: 42, fats: 22, ingredients: ["Salmon Fillet", "Broccoli", "Carrots", "Lemon"] },
    { name: "Beef & Quinoa Bowl", category: "dinner", cals: 580, carbs: 45, protein: 35, fats: 18, ingredients: ["Lean Beef", "Quinoa", "Spinach", "Garlic"] }
];

// Initial Weekly Schedule
const INITIAL_PLANNER = {
    Monday: { breakfast: DEFAULT_CATALOG[0], lunch: DEFAULT_CATALOG[2], dinner: DEFAULT_CATALOG[4] },
    Tuesday: { breakfast: DEFAULT_CATALOG[1], lunch: null, dinner: null },
    Wednesday: { breakfast: null, lunch: DEFAULT_CATALOG[3], dinner: null },
    Thursday: { breakfast: null, lunch: null, dinner: DEFAULT_CATALOG[5] },
    Friday: { breakfast: null, lunch: null, dinner: null },
    Saturday: { breakfast: null, lunch: null, dinner: null },
    Sunday: { breakfast: null, lunch: null, dinner: null }
};

// Days helper
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// State
let planner = JSON.parse(localStorage.getItem('mp_planner')) || INITIAL_PLANNER;
let catalog = JSON.parse(localStorage.getItem('mp_catalog')) || DEFAULT_CATALOG;
let groceryChecked = JSON.parse(localStorage.getItem('mp_grocery_checked')) || [];
let activeSelection = null; // { day, period }
let grocerySearch = '';
let catalogSearch = '';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const weeklyCalendarContainer = document.getElementById('weekly-calendar-container');

// Nutrition DOM
const selectNutritionDay = document.getElementById('select-nutrition-day');
const nutriCals = document.getElementById('nutri-cals');
const nutriCarbs = document.getElementById('nutri-carbs');
const nutriProtein = document.getElementById('nutri-protein');
const nutriFats = document.getElementById('nutri-fats');

// Custom Dish DOM
const recipeAddForm = document.getElementById('recipe-add-form');

// Shopping List DOM
const shoppingListBody = document.getElementById('shopping-list-body');
const grocerySearchInput = document.getElementById('grocery-search');

// Modal DOM
const recipeSelectModal = document.getElementById('recipe-select-modal');
const modalSelectTitle = document.getElementById('modal-select-title');
const closeSelectModal = document.getElementById('close-select-modal');
const recipeCatalogSearch = document.getElementById('recipe-catalog-search');
const recipeCatalogList = document.getElementById('recipe-catalog-list');

// Initialize
function init() {
    setupTheme();
    renderCalendar();
    renderNutritionSummary();
    renderShoppingList();
    setupListeners();
}

function setupListeners() {
    // Nutrition Day Selector Change
    selectNutritionDay.addEventListener('change', () => {
        renderNutritionSummary();
    });

    // Custom Dish Form Submit
    recipeAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('form-dish-name').value.trim();
        const category = document.getElementById('form-dish-tag').value;
        const cals = parseInt(document.getElementById('form-dish-cals').value);
        const carbs = parseInt(document.getElementById('form-dish-carbs').value);
        const protein = parseInt(document.getElementById('form-dish-protein').value);
        const fats = parseInt(document.getElementById('form-dish-fats').value);
        const ingVal = document.getElementById('form-dish-ingredients').value;

        const newDish = {
            name,
            category,
            cals,
            carbs,
            protein,
            fats,
            ingredients: ingVal.split(',').map(i => i.trim()).filter(Boolean)
        };

        catalog.unshift(newDish);
        saveCatalog();
        recipeAddForm.reset();
        alert(`Saved "${name}" to recipe catalog!`);
    });

    // Modal Close
    closeSelectModal.addEventListener('click', () => {
        recipeSelectModal.classList.remove('open');
        activeSelection = null;
    });

    // Catalog Search in Modal
    recipeCatalogSearch.addEventListener('input', (e) => {
        catalogSearch = e.target.value;
        renderCatalogSelectorList();
    });

    // Grocery Search
    grocerySearchInput.addEventListener('input', (e) => {
        grocerySearch = e.target.value;
        renderShoppingList();
    });
}

// Render Calendar Rows
function renderCalendar() {
    weeklyCalendarContainer.innerHTML = '';

    DAYS.forEach(day => {
        const row = document.createElement('div');
        row.className = 'calendar-day-row';
        
        row.innerHTML = `
            <span class="day-header-lbl">${day}</span>
            <div class="meal-time-block" id="block-${day}-breakfast" data-day="${day}" data-period="breakfast"></div>
            <div class="meal-time-block" id="block-${day}-lunch" data-day="${day}" data-period="lunch"></div>
            <div class="meal-time-block" id="block-${day}-dinner" data-day="${day}" data-period="dinner"></div>
        `;
        
        weeklyCalendarContainer.appendChild(row);

        // Populate blocks
        const periods = ["breakfast", "lunch", "dinner"];
        periods.forEach(p => {
            const block = row.querySelector(`#block-${day}-${p}`);
            const meal = planner[day] ? planner[day][p] : null;

            if (meal) {
                block.className = 'meal-time-block filled glass';
                block.innerHTML = `
                    <span class="meal-time-period-lbl">${p}</span>
                    <h4 class="meal-time-title" title="${meal.name}">${meal.name}</h4>
                    <span class="meal-time-cals">${meal.cals} kcal</span>
                    <button class="btn-remove-meal" data-day="${day}" data-period="${p}"><i class="fa-solid fa-trash-can"></i></button>
                `;

                // Remove meal action
                block.querySelector('.btn-remove-meal').addEventListener('click', (e) => {
                    e.stopPropagation();
                    removeMeal(day, p);
                });
            } else {
                block.className = 'meal-time-block';
                block.innerHTML = `
                    <span class="meal-time-period-lbl">${p}</span>
                    <span style="opacity:0.4; font-size:0.75rem;"><i class="fa-solid fa-plus"></i> Empty Block</span>
                `;
            }

            // Assign block click modal open
            block.addEventListener('click', () => {
                activeSelection = { day, period: p };
                modalSelectTitle.innerText = `Assign ${day} ${p.toUpperCase()}`;
                catalogSearch = '';
                recipeCatalogSearch.value = '';
                renderCatalogSelectorList();
                recipeSelectModal.classList.add('open');
            });
        });
    });
}

function removeMeal(day, period) {
    if (planner[day]) {
        planner[day][period] = null;
        savePlanner();
        renderCalendar();
        renderNutritionSummary();
        renderShoppingList();
    }
}

// Render recipe options lists in Modal
function renderCatalogSelectorList() {
    recipeCatalogList.innerHTML = '';
    
    // Filter recipes by period type or show all
    const filtered = catalog.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(catalogSearch.toLowerCase());
        const matchesCategory = activeSelection ? r.category === activeSelection.period : true;
        return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        recipeCatalogList.innerHTML = `<p style="opacity:0.6; font-size:0.85rem; text-align:center; padding:1.5rem 0;">No recipes matching search query.</p>`;
        return;
    }

    filtered.forEach(recipe => {
        const item = document.createElement('div');
        item.className = 'recipe-select-item glass';
        item.innerHTML = `
            <strong>${recipe.name}</strong>
            <span style="font-size:0.8rem; color:var(--accent); font-weight:700;">${recipe.cals} kcal</span>
        `;
        
        item.addEventListener('click', () => {
            if (activeSelection) {
                const { day, period } = activeSelection;
                if (!planner[day]) planner[day] = { breakfast: null, lunch: null, dinner: null };
                
                planner[day][period] = recipe;
                savePlanner();
                
                recipeSelectModal.classList.remove('open');
                activeSelection = null;
                
                renderCalendar();
                renderNutritionSummary();
                renderShoppingList();
            }
        });

        recipeCatalogList.appendChild(item);
    });
}

// Render nutrition summary counts
function renderNutritionSummary() {
    const day = selectNutritionDay.value;
    const dayPlan = planner[day];

    let cals = 0;
    let carbs = 0;
    let protein = 0;
    let fats = 0;

    if (dayPlan) {
        const meals = [dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner];
        meals.forEach(m => {
            if (m) {
                cals += m.cals;
                carbs += m.carbs;
                protein += m.protein;
                fats += m.fats;
            }
        });
    }

    nutriCals.innerText = cals;
    nutriCarbs.innerText = `${carbs}g`;
    nutriProtein.innerText = `${protein}g`;
    nutriFats.innerText = `${fats}g`;
}

// Render compiled shopping list
function renderShoppingList() {
    shoppingListBody.innerHTML = '';
    
    // Aggregate ingredients from all planned meals
    const listMap = {};

    DAYS.forEach(day => {
        const dayPlan = planner[day];
        if (dayPlan) {
            const meals = [dayPlan.breakfast, dayPlan.lunch, dayPlan.dinner];
            meals.forEach(m => {
                if (m && m.ingredients) {
                    m.ingredients.forEach(ing => {
                        const norm = ing.trim().toLowerCase();
                        if (norm) {
                            listMap[norm] = {
                                name: ing.trim(),
                                recipe: m.name
                            };
                        }
                    });
                }
            });
        }
    });

    const ingredientsList = Object.values(listMap).filter(item => {
        return item.name.toLowerCase().includes(grocerySearch.toLowerCase());
    });

    if (ingredientsList.length === 0) {
        shoppingListBody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No ingredients to shop. Assign meals to generate list.</td></tr>`;
        return;
    }

    ingredientsList.forEach(item => {
        const isChecked = groceryChecked.includes(item.name.toLowerCase());
        const row = document.createElement('tr');
        
        if (isChecked) row.className = 'checked-row';

        row.innerHTML = `
            <td>
                <input type="checkbox" class="chk-shopping-item" data-name="${item.name.toLowerCase()}" ${isChecked ? 'checked' : ''}>
            </td>
            <td><strong>${item.name}</strong></td>
            <td style="text-align:right; font-size:0.75rem; color:var(--text-secondary);">${item.recipe}</td>
        `;

        // Checkbox click event
        row.querySelector('.chk-shopping-item').addEventListener('change', (e) => {
            const name = e.target.getAttribute('data-name');
            if (e.target.checked) {
                if (!groceryChecked.includes(name)) groceryChecked.push(name);
            } else {
                groceryChecked = groceryChecked.filter(g => g !== name);
            }
            saveGroceryChecked();
            renderShoppingList();
        });

        shoppingListBody.appendChild(row);
    });
}

function savePlanner() {
    localStorage.setItem('mp_planner', JSON.stringify(planner));
}

function saveCatalog() {
    localStorage.setItem('mp_catalog', JSON.stringify(catalog));
}

function saveGroceryChecked() {
    localStorage.setItem('mp_grocery_checked', JSON.stringify(groceryChecked));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('mp_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('mp_theme', target);
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
