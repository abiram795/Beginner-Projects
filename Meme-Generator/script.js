// Preset Templates Data (Programmatic Canvas background builders to avoid CORS tainted errors)
const PRESETS = [
    {
        id: 1,
        title: "Developer Struggles",
        aesthetic: "Split Pane (Red & Orange)",
        ratio: "1:1 (Square)",
        draw: (ctx, w, h) => {
            // Draw left/right panels or top/bottom
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(0, 0, w, h/2);
            ctx.fillStyle = "#f97316";
            ctx.fillRect(0, h/2, w, h/2);
            // Draw separator line
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(0, h/2);
            ctx.lineTo(w, h/2);
            ctx.stroke();
        }
    },
    {
        id: 2,
        title: "Sunburst Victory",
        aesthetic: "Retro Blue Ray burst",
        ratio: "1:1 (Square)",
        draw: (ctx, w, h) => {
            // Radial background
            const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, w);
            grad.addColorStop(0, "#38bdf8");
            grad.addColorStop(1, "#1e3a8a");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
            
            // Draw some rays
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath();
            for(let i=0; i<360; i+=30) {
                const rad = i * Math.PI / 180;
                ctx.moveTo(w/2, h/2);
                ctx.arc(w/2, h/2, w, rad, rad + 0.25);
                ctx.closePath();
            }
            ctx.fill();
        }
    },
    {
        id: 3,
        title: "Neon Cyberpunk",
        aesthetic: "Dark grid with glow",
        ratio: "1:1 (Square)",
        draw: (ctx, w, h) => {
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, w, h);
            // Draw grid
            ctx.strokeStyle = "rgba(236,72,153,0.15)";
            ctx.lineWidth = 2;
            for(let i=0; i<w; i+=40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
            }
            // Draw subtle middle outline
            ctx.strokeStyle = "#ec4899";
            ctx.strokeRect(20, 20, w - 40, h - 40);
        }
    },
    {
        id: 4,
        title: "Golden Hour",
        aesthetic: "Warm linear gradient",
        ratio: "1:1 (Square)",
        draw: (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, "#f59e0b");
            grad.addColorStop(1, "#ea580c");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }
    }
];

// State
let activePresetId = 1;
let customImageElement = null; // Holds loaded custom Image object
let downloadedMemesCount = parseInt(localStorage.getItem('mg_download_count')) || 0;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const templatesGridList = document.getElementById('templates-grid-list');
const uploadBox = document.getElementById('upload-box');
const fileUploader = document.getElementById('file-uploader');

const txtTop = document.getElementById('txt-top');
const txtBottom = document.getElementById('txt-bottom');
const clrText = document.getElementById('clr-text');
const clrStroke = document.getElementById('clr-stroke');
const selectFont = document.getElementById('select-font');
const sizeFont = document.getElementById('size-font');
const yTop = document.getElementById('y-top');
const yBottom = document.getElementById('y-bottom');

const lblClrText = document.getElementById('lbl-clr-text');
const lblClrStroke = document.getElementById('lbl-clr-stroke');

const memeCanvas = document.getElementById('meme-canvas');
const ctx = memeCanvas.getContext('2d');
const btnDownload = document.getElementById('btn-download');

// Stats DOM
const statTemplates = document.getElementById('stat-templates');
const statGenerated = document.getElementById('stat-generated');
const statTextLen = document.getElementById('stat-text-len');

// Table DOM
const templatesTableBody = document.getElementById('templates-table-body');

// Initialize
function init() {
    setupTheme();
    renderPresetsList();
    renderComparisonTable();
    updateStatsUI();
    drawMeme();
    setupListeners();
}

function setupListeners() {
    // Input/Text value updates
    const redrawTriggers = [txtTop, txtBottom, clrText, clrStroke, selectFont, sizeFont, yTop, yBottom];
    redrawTriggers.forEach(el => {
        el.addEventListener('input', () => {
            if(el === clrText) lblClrText.innerText = clrText.value.toUpperCase();
            if(el === clrStroke) lblClrStroke.innerText = clrStroke.value.toUpperCase();
            drawMeme();
            updateAvgCharLen();
        });
    });

    // Custom File Loader Trigger
    uploadBox.addEventListener('click', () => fileUploader.click());
    
    // Drag & Drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = "var(--accent)";
        uploadBox.style.background = "var(--accent-light)";
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = "var(--panel-border)";
        uploadBox.style.background = "transparent";
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = "var(--panel-border)";
        uploadBox.style.background = "transparent";
        
        if (e.dataTransfer.files.length > 0) {
            handleFileLoad(e.dataTransfer.files[0]);
        }
    });

    fileUploader.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileLoad(e.target.files[0]);
        }
    });

    // Download click
    btnDownload.addEventListener('click', (e) => {
        // Prevent default navigation if not structured
        const url = memeCanvas.toDataURL("image/png");
        btnDownload.href = url;
        
        downloadedMemesCount++;
        localStorage.setItem('mg_download_count', downloadedMemesCount);
        updateStatsUI();
    });
}

// File Loader Processor
function handleFileLoad(file) {
    if (!file.type.match('image.*')) {
        alert("Please select a valid image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            customImageElement = img;
            activePresetId = null; // deactivate preset highlight
            
            // Remove active classes on presets
            document.querySelectorAll('.template-item').forEach(el => el.classList.remove('active'));
            
            drawMeme();
            updateStatsUI();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Draw meme to canvas
function drawMeme() {
    const w = memeCanvas.width;
    const h = memeCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Background
    if (customImageElement) {
        // Scale and center cover image
        const aspectImg = customImageElement.width / customImageElement.height;
        const aspectCanvas = w / h;
        let dx = 0, dy = 0, dWidth = w, dHeight = h;

        if (aspectImg > aspectCanvas) {
            // Image is wider than canvas
            const scaleWidth = h * aspectImg;
            dx = (w - scaleWidth) / 2;
            dWidth = scaleWidth;
        } else {
            // Image is taller than canvas
            const scaleHeight = w / aspectImg;
            dy = (h - scaleHeight) / 2;
            dHeight = scaleHeight;
        }
        ctx.drawImage(customImageElement, dx, dy, dWidth, dHeight);
    } else {
        const preset = PRESETS.find(p => p.id === activePresetId);
        if (preset) {
            preset.draw(ctx, w, h);
        }
    }

    // 2. Set Font Configurations
    const fontSize = sizeFont.value;
    const fontName = selectFont.value;
    ctx.font = `900 ${fontSize}px ${fontName}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Colors
    ctx.fillStyle = clrText.value;
    ctx.strokeStyle = clrStroke.value;
    ctx.lineWidth = Math.max(fontSize / 8, 3); // outline proportioned to size
    ctx.lineJoin = "round";

    // 3. Draw Top Text
    const topTextVal = txtTop.value.toUpperCase();
    const yTopPos = (yTop.value / 100) * h;
    wrapAndDrawText(ctx, topTextVal, w/2, yTopPos, w - 40, fontSize * 1.2);

    // 4. Draw Bottom Text
    const bottomTextVal = txtBottom.value.toUpperCase();
    const yBottomPos = (yBottom.value / 100) * h;
    wrapAndDrawText(ctx, bottomTextVal, w/2, yBottomPos, w - 40, fontSize * 1.2);
}

// Multiline text wrapper for Canvas
function wrapAndDrawText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    for (let n = 0; n < words.length; n++) {
        let testLine = currentLine + words[n] + " ";
        let metrics = ctx.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(currentLine.trim());
            currentLine = words[n] + " ";
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());

    // Draw lines offset to keep vertical center aligned
    const startY = y - ((lines.length - 1) * lineHeight / 2);
    lines.forEach((line, index) => {
        const drawY = startY + (index * lineHeight);
        ctx.strokeText(line, x, drawY);
        ctx.fillText(line, x, drawY);
    });
}

// Render presets scroll list
function renderPresetsList() {
    templatesGridList.innerHTML = '';
    PRESETS.forEach(p => {
        const item = document.createElement('div');
        item.className = `template-item ${p.id === activePresetId ? 'active' : ''}`;
        
        // Draw a miniature visual placeholder via CSS gradient/color
        if (p.id === 1) item.style.background = "linear-gradient(#ef4444 50%, #f97316 50%)";
        else if (p.id === 2) item.style.background = "radial-gradient(#38bdf8, #1e3a8a)";
        else if (p.id === 3) item.style.background = "#0f172a";
        else if (p.id === 4) item.style.background = "linear-gradient(135deg, #f59e0b, #ea580c)";

        item.addEventListener('click', () => {
            customImageElement = null; // clear custom uploads
            activePresetId = p.id;
            
            document.querySelectorAll('.template-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            drawMeme();
            updateStatsUI();
        });
        templatesGridList.appendChild(item);
    });
}

// Render Presets comparison index table
function renderComparisonTable() {
    templatesTableBody.innerHTML = '';
    PRESETS.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${p.title}</strong></td>
            <td>${p.aesthetic}</td>
            <td>${p.ratio}</td>
            <td style="text-align:right;">
                <button class="btn-secondary select-temp-btn" data-id="${p.id}" style="padding:0.25rem 0.65rem; font-size:0.75rem;">Use</button>
            </td>
        `;
        row.querySelector('.select-temp-btn').addEventListener('click', () => {
            customImageElement = null;
            activePresetId = p.id;
            document.querySelectorAll('.template-item').forEach(el => el.classList.remove('active'));
            // Set active class on match item
            const matchItem = templatesGridList.children[p.id - 1];
            if(matchItem) matchItem.classList.add('active');
            drawMeme();
            updateStatsUI();
        });
        templatesTableBody.appendChild(row);
    });
}

// Update stats
function updateStatsUI() {
    statTemplates.innerText = PRESETS.length;
    statGenerated.innerText = downloadedMemesCount;
    updateAvgCharLen();
}

function updateAvgCharLen() {
    const len = txtTop.value.length + txtBottom.value.length;
    statTextLen.innerText = len;
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('mg_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('mg_theme', target);
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
