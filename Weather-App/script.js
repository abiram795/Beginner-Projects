// Weather Database
const WEATHER_DB = {
    "new york": {
        name: "New York",
        country: "United States",
        temp: 28,
        status: "sunny",
        feelsLike: 30,
        wind: 12,
        humidity: 58,
        uv: "6 (High)",
        forecast: [
            { day: "Tue", status: "sunny", temp: 29 },
            { day: "Wed", status: "cloudy", temp: 26 },
            { day: "Thu", status: "rainy", temp: 23 },
            { day: "Fri", status: "sunny", temp: 27 },
            { day: "Sat", status: "sunny", temp: 29 }
        ]
    },
    "london": {
        name: "London",
        country: "United Kingdom",
        temp: 19,
        status: "rainy",
        feelsLike: 18,
        wind: 22,
        humidity: 82,
        uv: "2 (Low)",
        forecast: [
            { day: "Tue", status: "rainy", temp: 18 },
            { day: "Wed", status: "stormy", temp: 17 },
            { day: "Thu", status: "cloudy", temp: 20 },
            { day: "Fri", status: "sunny", temp: 21 },
            { day: "Sat", status: "cloudy", temp: 19 }
        ]
    },
    "tokyo": {
        name: "Tokyo",
        country: "Japan",
        temp: 26,
        status: "cloudy",
        feelsLike: 28,
        wind: 8,
        humidity: 71,
        uv: "4 (Moderate)",
        forecast: [
            { day: "Tue", status: "cloudy", temp: 27 },
            { day: "Wed", status: "sunny", temp: 30 },
            { day: "Thu", status: "sunny", temp: 31 },
            { day: "Fri", status: "rainy", temp: 25 },
            { day: "Sat", status: "cloudy", temp: 26 }
        ]
    },
    "sydney": {
        name: "Sydney",
        country: "Australia",
        temp: 16,
        status: "sunny",
        feelsLike: 15,
        wind: 18,
        humidity: 52,
        uv: "3 (Moderate)",
        forecast: [
            { day: "Tue", status: "sunny", temp: 17 },
            { day: "Wed", status: "cloudy", temp: 16 },
            { day: "Thu", status: "sunny", temp: 18 },
            { day: "Fri", status: "sunny", temp: 19 },
            { day: "Sat", status: "cloudy", temp: 17 }
        ]
    },
    "paris": {
        name: "Paris",
        country: "France",
        temp: 23,
        status: "cloudy",
        feelsLike: 24,
        wind: 10,
        humidity: 60,
        uv: "5 (Moderate)",
        forecast: [
            { day: "Tue", status: "sunny", temp: 25 },
            { day: "Wed", status: "sunny", temp: 26 },
            { day: "Thu", status: "cloudy", temp: 23 },
            { day: "Fri", status: "rainy", temp: 21 },
            { day: "Sat", status: "sunny", temp: 24 }
        ]
    }
};

// SVG Animated Weather Badges Map
const WEATHER_SVGS = {
    sunny: `
        <svg class="svg-weather-icon sun-pulse" viewBox="0 0 64 64" width="80" height="80">
            <circle cx="32" cy="32" r="13" fill="#f59e0b" />
            <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
                <line x1="32" y1="8" x2="32" y2="14" />
                <line x1="32" y1="50" x2="32" y2="56" />
                <line x1="8" y1="32" x2="14" y2="32" />
                <line x1="50" y1="32" x2="56" y2="32" />
                <line x1="15" y1="15" x2="20" y2="20" />
                <line x1="44" y1="44" x2="49" y2="49" />
                <line x1="15" y1="49" x2="20" y2="44" />
                <line x1="44" y1="20" x2="49" y2="15" />
            </g>
        </svg>
    `,
    cloudy: `
        <svg class="svg-weather-icon cloud-bounce" viewBox="0 0 64 64" width="80" height="80">
            <path d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18a10 10 0 0 1 0-20z" fill="#94a3b8" />
            <path d="M26 40a8 8 0 0 1 8-8 11 11 0 0 1 20 2 8 8 0 0 1-3 15H26a8 8 0 0 1 0-16z" fill="#cbd5e1" opacity="0.8" transform="translate(-6, -4)" />
        </svg>
    `,
    rainy: `
        <svg class="svg-weather-icon" viewBox="0 0 64 64" width="80" height="80">
            <path class="cloud-bounce" d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18a10 10 0 0 1 0-20z" fill="#64748b" />
            <line class="rain-drop" x1="26" y1="46" x2="22" y2="54" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
            <line class="rain-drop-2" x1="38" y1="46" x2="34" y2="54" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
            <line class="rain-drop" x1="48" y1="46" x2="44" y2="54" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
        </svg>
    `,
    stormy: `
        <svg class="svg-weather-icon" viewBox="0 0 64 64" width="80" height="80">
            <path class="cloud-bounce" d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18a10 10 0 0 1 0-20z" fill="#334155" />
            <polygon class="lightning-flash" points="30,44 22,54 28,54 24,62 36,50 30,50" fill="#f59e0b" />
        </svg>
    `
};

// Mini SVG maps for Forecast rows
const MINI_SVGS = {
    sunny: `<svg class="sun-pulse" width="24" height="24" viewBox="0 0 64 64"><circle cx="32" cy="32" r="14" fill="#f59e0b"/></svg>`,
    cloudy: `<svg class="cloud-bounce" width="24" height="24" viewBox="0 0 64 64"><path d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18z" fill="#94a3b8"/></svg>`,
    rainy: `<svg width="24" height="24" viewBox="0 0 64 64"><path d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18z" fill="#64748b"/><line x1="28" y1="46" x2="24" y2="54" stroke="#3b82f6" stroke-width="4"/></svg>`,
    stormy: `<svg width="24" height="24" viewBox="0 0 64 64"><path d="M18 36a10 10 0 0 1 10-10 14 14 0 0 1 26 3 10 10 0 0 1-4 19H18z" fill="#334155"/><polygon points="30,44 24,54 28,54 26,60 34,50" fill="#f59e0b"/></svg>`
};

// Dynamic search simulated caches
let simulatedCache = {};

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const searchForm = document.getElementById('search-form');
const citySearchInput = document.getElementById('city-search-input');
const presetsList = document.getElementById('presets-list');
const currentTimeLbl = document.getElementById('current-time-lbl');

// Stats Elements
const statMaxTemp = document.getElementById('stat-max-temp');
const statAvgHumidity = document.getElementById('stat-avg-humidity');
const statWindAlert = document.getElementById('stat-wind-alert');

// Current Dashboard DOM
const currCityName = document.getElementById('curr-city-name');
const currDateLbl = document.getElementById('curr-date-lbl');
const currTempVal = document.getElementById('curr-temp-val');
const currStatusBadge = document.getElementById('curr-status-badge');
const currWeatherIconContainer = document.getElementById('curr-weather-icon-container');

// Details DOM
const detFeelsLike = document.getElementById('det-feels-like');
const detWind = document.getElementById('det-wind');
const detHumidity = document.getElementById('det-humidity');
const detUv = document.getElementById('det-uv');

// Forecast Container
const forecastContainer = document.getElementById('forecast-container');

// Comparison Table
const comparisonTableBody = document.getElementById('comparison-table-body');

// Initialize
function init() {
    setupTheme();
    updateClock();
    setInterval(updateClock, 60000); // tick minutes

    renderCityWeather("New York");
    renderComparisonTable();
    calculateGlobalSummary();
    setupListeners();
}

function setupListeners() {
    // Preset city click
    presetsList.querySelectorAll('.city-preset-item').forEach(item => {
        item.addEventListener('click', () => {
            presetsList.querySelectorAll('.city-preset-item').forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            renderCityWeather(item.getAttribute('data-city'));
        });
    });

    // Search query submit
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = citySearchInput.value.trim();
        if (query) {
            // Remove active presets class
            presetsList.querySelectorAll('.city-preset-item').forEach(p => p.classList.remove('active'));
            renderCityWeather(query);
            citySearchInput.value = '';
        }
    });
}

// Render active city metrics
function renderCityWeather(cityName) {
    const norm = cityName.trim().toLowerCase();
    let cityData = WEATHER_DB[norm] || simulatedCache[norm];

    // If city is not registered, simulate generating realistic details!
    if (!cityData) {
        cityData = generateSimulatedWeather(cityName);
        simulatedCache[norm] = cityData;
    }

    // Update Current info
    currCityName.innerText = `${cityData.name}, ${cityData.country}`;
    currTempVal.innerText = `${cityData.temp}°C`;
    
    // Status Badge & SVG icon
    currStatusBadge.innerText = cityData.status.toUpperCase();
    currStatusBadge.className = `badge ${cityData.status}`;
    currWeatherIconContainer.innerHTML = WEATHER_SVGS[cityData.status] || WEATHER_SVGS.sunny;

    // Update details panel
    detFeelsLike.innerText = `${cityData.feelsLike}°C`;
    detWind.innerText = `${cityData.wind} km/h`;
    detHumidity.innerText = `${cityData.humidity}%`;
    detUv.innerText = cityData.uv;

    // Render Forecast Rows
    forecastContainer.innerHTML = '';
    cityData.forecast.forEach(item => {
        const miniSvg = MINI_SVGS[item.status] || MINI_SVGS.sunny;
        const row = document.createElement('div');
        row.className = 'forecast-item glass';
        row.innerHTML = `
            <span class="forecast-day">${item.day}</span>
            <div style="display:flex; align-items:center; justify-content:center;">${miniSvg}</div>
            <span style="font-size:0.8rem; text-transform:uppercase; opacity:0.8; width: 60px; text-align:center;">${item.status}</span>
            <span class="forecast-temp">${item.temp}°C</span>
        `;
        forecastContainer.appendChild(row);
    });
}

// Generate random weather details
function generateSimulatedWeather(cityName) {
    const statuses = ["sunny", "cloudy", "rainy", "stormy"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    let temp = 15;
    if (status === 'sunny') temp = Math.floor(Math.random() * 12) + 22; // 22-34
    else if (status === 'cloudy') temp = Math.floor(Math.random() * 10) + 16; // 16-26
    else if (status === 'rainy') temp = Math.floor(Math.random() * 8) + 12; // 12-20
    else if (status === 'stormy') temp = Math.floor(Math.random() * 10) + 14; // 14-24

    const feelsLike = temp + (status === 'sunny' ? 2 : -2);
    const wind = Math.floor(Math.random() * 25) + 5; // 5-30
    const humidity = Math.floor(Math.random() * 50) + 40; // 40-90
    const uvVal = Math.floor(Math.random() * 9) + 1; // 1-10

    const days = ["Tue", "Wed", "Thu", "Fri", "Sat"];
    const forecast = days.map(d => {
        const stat = statuses[Math.floor(Math.random() * statuses.length)];
        return {
            day: d,
            status: stat,
            temp: temp + Math.floor(Math.random() * 4) - 2
        };
    });

    return {
        name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        country: "Region Indicator",
        temp,
        status,
        feelsLike,
        wind,
        humidity,
        uv: `${uvVal} (${uvVal >= 7 ? 'Very High' : (uvVal >= 4 ? 'Moderate' : 'Low')})`,
        forecast
    };
}

// Render Comparison Index Table
function renderComparisonTable() {
    comparisonTableBody.innerHTML = '';
    const presetNames = ["New York", "London", "Tokyo", "Sydney", "Paris"];
    
    presetNames.forEach(name => {
        const data = WEATHER_DB[name.toLowerCase()];
        if (!data) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${data.name}</strong></td>
            <td>${data.country}</td>
            <td style="font-weight:700;">${data.temp}°C</td>
            <td><span class="badge ${data.status}">${data.status}</span></td>
            <td>${data.humidity}%</td>
            <td>${data.wind} km/h</td>
        `;
        comparisonTableBody.appendChild(row);
    });
}

// Calculate Global Summary in presets
function calculateGlobalSummary() {
    const cities = Object.values(WEATHER_DB);
    let max = -99;
    let humSum = 0;
    let highWindAlert = "None";

    cities.forEach(c => {
        if (c.temp > max) max = c.temp;
        humSum += c.humidity;
        if (c.wind > 20) {
            highWindAlert = `Windy in ${c.name}`;
        }
    });

    statMaxTemp.innerText = `${max}°C`;
    statAvgHumidity.innerText = `${Math.round(humSum / cities.length)}%`;
    statWindAlert.innerText = highWindAlert;
}

// Update Header local clock
function updateClock() {
    const now = new Date();
    currentTimeLbl.innerText = `Local Time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    currDateLbl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('nimbus_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('nimbus_theme', target);
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
