// Mock Fitness Data
const INITIAL_WORKOUTS = [
    { id: 1, activity: "Running", duration: 45, calories: 450, date: "2026-07-20" },
    { id: 2, activity: "Weightlifting", duration: 60, calories: 300, date: "2026-07-19" },
    { id: 3, activity: "Cycling", duration: 30, calories: 240, date: "2026-07-18" },
    { id: 4, activity: "Yoga", duration: 40, calories: 120, date: "2026-07-17" },
    { id: 5, activity: "Swimming", duration: 50, calories: 500, date: "2026-07-16" },
    { id: 6, activity: "Running", duration: 30, calories: 310, date: "2026-07-15" }
];

// Activity Icons
const ACTIVITY_ICONS = {
    Running: "fa-running",
    Cycling: "fa-cycling",
    Weightlifting: "fa-dumbbell",
    Swimming: "fa-swimming-pool",
    Yoga: "fa-spa",
    Walking: "fa-walking"
};

// State
let workouts = JSON.parse(localStorage.getItem('fp_workouts')) || INITIAL_WORKOUTS;
let goals = JSON.parse(localStorage.getItem('fp_goals')) || { steps: 5000, water: 1000 };
let activeActivityFilter = 'all';

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const workoutForm = document.getElementById('workout-form');
const wActivity = document.getElementById('w-activity');
const wDuration = document.getElementById('w-duration');
const wCalories = document.getElementById('w-calories');
const wDate = document.getElementById('w-date');

// BMI DOM
const bmiForm = document.getElementById('bmi-form');
const bmiHeight = document.getElementById('bmi-height');
const bmiWeight = document.getElementById('bmi-weight');
const bmiResultBox = document.getElementById('bmi-result-box');
const bmiVal = document.getElementById('bmi-val');
const bmiStatus = document.getElementById('bmi-status');
const bmiAdvice = document.getElementById('bmi-advice');

// Goals DOM
const btnAddSteps = document.getElementById('btn-add-steps');
const btnAddWater = document.getElementById('btn-add-water');
const valSteps = document.getElementById('val-steps');
const valWater = document.getElementById('val-water');
const lblStepsPct = document.getElementById('lbl-steps-pct');
const lblWaterPct = document.getElementById('lbl-water-pct');
const circleSteps = document.getElementById('circle-steps');
const circleWater = document.getElementById('circle-water');

// Stats DOM
const valCalories = document.getElementById('val-calories');
const lblCaloriesAvg = document.getElementById('lbl-calories-avg');
const valMinutes = document.getElementById('val-minutes');

// Chart & Logs DOM
const barChartContainer = document.getElementById('bar-chart-container');
const filterActivity = document.getElementById('filter-activity');
const workoutTableBody = document.getElementById('workout-table-body');
const lblLogCount = document.getElementById('lbl-log-count');

const circleCircumference = 188.5; // 2 * PI * 30

// Initialize
function init() {
    setupTheme();
    // Default Date to today
    wDate.value = new Date().toISOString().substring(0, 10);

    updateGoalsUI();
    renderStats();
    renderChart();
    renderTable();
    setupListeners();
}

function setupListeners() {
    // Goals increment click
    btnAddSteps.addEventListener('click', () => {
        goals.steps = (goals.steps || 0) + 1000;
        if (goals.steps > 20000) goals.steps = 20000; // cap
        saveGoals();
        updateGoalsUI();
    });

    btnAddWater.addEventListener('click', () => {
        goals.water = (goals.water || 0) + 250;
        if (goals.water > 5000) goals.water = 5000; // cap
        saveGoals();
        updateGoalsUI();
    });

    // Form Submit
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newWorkout = {
            id: Date.now(),
            activity: wActivity.value,
            duration: parseInt(wDuration.value),
            calories: parseInt(wCalories.value),
            date: wDate.value
        };

        workouts.unshift(newWorkout);
        saveWorkouts();
        
        wDuration.value = '';
        wCalories.value = '';
        wDate.value = new Date().toISOString().substring(0, 10);

        renderStats();
        renderChart();
        renderTable();
    });

    // BMI Calculator
    bmiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const height = parseFloat(bmiHeight.value);
        const weight = parseFloat(bmiWeight.value);

        if (height > 0 && weight > 0) {
            const heightM = height / 100;
            const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
            
            bmiVal.innerText = bmi;
            let status = "Normal";
            let advice = "You maintain a healthy weight index range. Keep up the active steps!";
            let color = "var(--success)";

            if (bmi < 18.5) {
                status = "Underweight";
                advice = "Consider building caloric intake with healthy protein meals.";
                color = "var(--warning)";
            } else if (bmi >= 25 && bmi < 29.9) {
                status = "Overweight";
                advice = "Slightly elevated weight range. Focus on moderate cardio sessions.";
                color = "var(--warning)";
            } else if (bmi >= 30) {
                status = "Obese";
                advice = "High weight index. Consult with a trainer to formulate a steady calorie burn plan.";
                color = "var(--danger)";
            }

            bmiStatus.innerText = status;
            bmiStatus.style.color = color;
            bmiAdvice.innerText = advice;
            
            bmiResultBox.style.display = 'flex';
            bmiResultBox.style.borderColor = color;
            bmiResultBox.style.background = `rgba(${color === 'var(--danger)' ? '239,68,68' : (color === 'var(--warning)' ? '245,158,11' : '16,185,129')}, 0.1)`;
        }
    });

    // Log filters
    filterActivity.addEventListener('change', (e) => {
        activeActivityFilter = e.target.value;
        renderTable();
    });
}

// Update Step & Water goals indicators
function updateGoalsUI() {
    // 1. Steps (Goal: 10,000)
    const stepGoal = 10000;
    const stepPct = Math.min(Math.round((goals.steps / stepGoal) * 100), 100);
    lblStepsPct.innerText = `${stepPct}%`;
    valSteps.innerText = `${goals.steps.toLocaleString()} / 10k`;
    
    const stepsOffset = circleCircumference - (stepPct / 100 * circleCircumference);
    circleSteps.style.strokeDashoffset = stepsOffset;

    // 2. Water (Goal: 2,500ml)
    const waterGoal = 2500;
    const waterPct = Math.min(Math.round((goals.water / waterGoal) * 100), 100);
    lblWaterPct.innerText = `${waterPct}%`;
    valWater.innerText = `${(goals.water / 1000).toFixed(2)}L / 2.5L`;

    const waterOffset = circleCircumference - (waterPct / 100 * circleCircumference);
    circleWater.style.strokeDashoffset = waterOffset;
}

// Render overall stats
function renderStats() {
    let totalCalories = 0;
    let totalMinutes = 0;
    const uniqueDays = new Set();

    workouts.forEach(w => {
        totalCalories += w.calories;
        totalMinutes += w.duration;
        uniqueDays.add(w.date);
    });

    valCalories.innerText = `${totalCalories.toLocaleString()} kcal`;
    valMinutes.innerText = `${totalMinutes} mins`;

    const daysCount = uniqueDays.size || 1;
    const avgCal = Math.round(totalCalories / daysCount);
    lblCaloriesAvg.innerText = `Daily Avg: ${avgCal} kcal`;
}

// Render dynamic weekly bar chart
function renderChart() {
    barChartContainer.innerHTML = '';
    
    // Group calories by day of week for the past 7 days (or mock a static Mon-Sun calendar grid)
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dailyTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    workouts.forEach(w => {
        const dateObj = new Date(w.date);
        let dayIndex = dateObj.getDay(); // 0 is Sunday, 1 is Monday...
        // Map: 0 -> Sun (index 6), 1 -> Mon (index 0)...
        const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayMap[dayIndex];
        if (dailyTotals[dayName] !== undefined) {
            dailyTotals[dayName] += w.calories;
        }
    });

    const maxBurn = Math.max(...Object.values(dailyTotals)) || 1;

    weekdays.forEach(day => {
        const val = dailyTotals[day];
        const heightPct = Math.round((val / maxBurn) * 100);
        const barHeight = Math.max(Math.round((heightPct / 100) * 120), 5); // max height 120px

        const barWrapper = document.createElement('div');
        barWrapper.className = 'chart-bar-wrapper';
        barWrapper.innerHTML = `
            <div class="chart-bar" style="height: ${barHeight}px;" data-val="${val}"></div>
            <span class="chart-bar-lbl">${day}</span>
        `;
        barChartContainer.appendChild(barWrapper);
    });
}

// Render Table Logs
function renderTable() {
    workoutTableBody.innerHTML = '';
    const filtered = workouts.filter(w => {
        return activeActivityFilter === 'all' || w.activity === activeActivityFilter;
    });

    lblLogCount.innerText = `${filtered.length} items logged`;

    if (filtered.length === 0) {
        workoutTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6;">No activity logs recorded.</td></tr>`;
        return;
    }

    filtered.forEach(w => {
        const icon = ACTIVITY_ICONS[w.activity] || "fa-running";
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${w.date}</td>
            <td style="font-weight: 600;"><i class="fa-solid ${icon}" style="color:var(--accent); margin-right:0.4rem;"></i> ${w.activity}</td>
            <td>${w.duration} mins</td>
            <td style="font-weight:700;">${w.calories} kcal</td>
            <td style="text-align:right;">
                <button class="btn-delete remove-workout" data-id="${w.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        row.querySelector('.remove-workout').addEventListener('click', () => deleteWorkout(w.id));
        workoutTableBody.appendChild(row);
    });
}

function deleteWorkout(id) {
    workouts = workouts.filter(w => w.id !== id);
    saveWorkouts();
    renderStats();
    renderChart();
    renderTable();
}

function saveWorkouts() {
    localStorage.setItem('fp_workouts', JSON.stringify(workouts));
}

function saveGoals() {
    localStorage.setItem('fp_goals', JSON.stringify(goals));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('fp_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('fp_theme', target);
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
