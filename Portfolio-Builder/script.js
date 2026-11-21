// Initial Mock Data Schema
const MOCK_SCHEMA = {
    profile: {
        name: "Abiram S",
        title: "Full Stack Engineer & Creative Innovator",
        bio: "Passionate developer specialized in constructing high-performance glassmorphic user interfaces and responsive web applications. Enthusiastic about clean code structures, UX design systems, and frontend optimizations.",
        email: "abiram@gate.edu",
        location: "Bengaluru, India"
    },
    skills: ["HTML5", "CSS3", "JavaScript", "TypeScript", "UI/UX Design", "Git", "Webpack", "Responsive Architecture"],
    experiences: [
        {
            id: 1,
            company: "Google Dev Club",
            role: "Frontend Lead",
            year: "2025 - Present",
            desc: "Orchestrated development cycles for responsive campus event web hubs, yielding a 40% enhancement in user engagements."
        },
        {
            id: 2,
            company: "TechOps Solutions",
            role: "Software Intern",
            year: "Summer 2024",
            desc: "Designed reusable responsive dashboard card elements, streamlined API rendering speeds, and managed asset folders."
        }
    ],
    projects: [
        {
            id: 1,
            title: "Novella Bookstore Portal",
            desc: "Curated modern glassmorphic online marketplace featuring catalog filters, shopping drawer carts, and wishlists.",
            tech: ["HTML", "CSS", "Vanilla JS"],
            link: "https://novellabooks.dev"
        },
        {
            id: 2,
            title: "Brainiac Quiz Hub",
            desc: "Gamified learning card deck application incorporating SVG progress trackers, MCQs, and countdown timers.",
            tech: ["CSS", "SVG Canvas", "LocalStorage"],
            link: "https://brainiacquiz.net"
        }
    ],
    theme: "modern"
};

// App State
let state = JSON.parse(localStorage.getItem('portfolify_state')) || {
    profile: { name: "", title: "", bio: "", email: "", location: "" },
    skills: [],
    experiences: [],
    projects: [],
    theme: "modern"
};

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const selectTheme = document.getElementById('select-portfolio-theme');
const previewFrame = document.getElementById('preview-window-frame');
const prevSearchInput = document.getElementById('prev-search-input');

// Profile Form Elements
const inputName = document.getElementById('p-name');
const inputTitle = document.getElementById('p-title');
const inputBio = document.getElementById('p-bio');
const inputEmail = document.getElementById('p-email');
const inputLocation = document.getElementById('p-location');

// Skills
const inputSkillTag = document.getElementById('input-skill-tag');
const btnAddSkill = document.getElementById('btn-add-skill');
const skillsEditorContainer = document.getElementById('skills-editor-container');

// Experiences
const expCompany = document.getElementById('exp-company');
const expRole = document.getElementById('exp-role');
const expYear = document.getElementById('exp-year');
const expDesc = document.getElementById('exp-desc');
const btnAddExperience = document.getElementById('btn-add-experience');
const experienceTableBody = document.getElementById('experience-table-body');

// Projects
const projTitle = document.getElementById('proj-title');
const projDesc = document.getElementById('proj-desc');
const projTech = document.getElementById('proj-tech');
const projLink = document.getElementById('proj-link');
const btnAddProject = document.getElementById('btn-add-project');
const projectsTableBody = document.getElementById('projects-table-body');

// Actions
const btnLoadMock = document.getElementById('btn-import-schema');
const btnExportJSON = document.getElementById('btn-export-json');
const btnPrintPreview = document.getElementById('btn-print-preview');
const jsonModal = document.getElementById('json-modal');
const jsonModalTitle = document.getElementById('json-modal-title');
const jsonTextarea = document.getElementById('json-textarea');
const closeJsonModal = document.getElementById('close-json-modal');
const btnJsonAction = document.getElementById('btn-json-action');

// Stats Elements
const completionGauge = document.getElementById('completion-gauge');
const completionPercent = document.getElementById('completion-percent');
const completionStatus = document.getElementById('completion-status');

// Init
function init() {
    setupAppTheme();
    syncFormInputs();
    renderEditorLists();
    renderPreview();
    updateCompletionMeter();
    setupListeners();
}

function setupListeners() {
    // Input Event mappings
    const inputs = [
        { el: inputName, key: 'name' },
        { el: inputTitle, key: 'title' },
        { el: inputBio, key: 'bio' },
        { el: inputEmail, key: 'email' },
        { el: inputLocation, key: 'location' }
    ];

    inputs.forEach(mapping => {
        mapping.el.addEventListener('input', (e) => {
            state.profile[mapping.key] = e.target.value;
            saveState();
            renderPreview();
            updateCompletionMeter();
        });
    });

    selectTheme.addEventListener('change', (e) => {
        state.theme = e.target.value;
        saveState();
        renderPreview();
    });

    // Add Skill
    btnAddSkill.addEventListener('click', addSkillTag);
    inputSkillTag.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addSkillTag();
    });

    // Add Experience
    btnAddExperience.addEventListener('click', () => {
        const company = expCompany.value.trim();
        const role = expRole.value.trim();
        const year = expYear.value.trim();
        const desc = expDesc.value.trim();

        if (!company || !role) {
            alert("Please input Company and Role details.");
            return;
        }

        const newExp = {
            id: Date.now(),
            company,
            role,
            year,
            desc
        };

        state.experiences.push(newExp);
        saveState();
        renderEditorLists();
        renderPreview();
        updateCompletionMeter();
        
        // Reset inputs
        expCompany.value = '';
        expRole.value = '';
        expYear.value = '';
        expDesc.value = '';
    });

    // Add Project
    btnAddProject.addEventListener('click', () => {
        const title = projTitle.value.trim();
        const desc = projDesc.value.trim();
        const techVal = projTech.value.trim();
        const link = projLink.value.trim();

        if (!title) {
            alert("Please input Project Title.");
            return;
        }

        const newProj = {
            id: Date.now(),
            title,
            desc,
            tech: techVal ? techVal.split(',').map(t => t.trim()) : [],
            link
        };

        state.projects.push(newProj);
        saveState();
        renderEditorLists();
        renderPreview();
        updateCompletionMeter();

        // Reset
        projTitle.value = '';
        projDesc.value = '';
        projTech.value = '';
        projLink.value = '';
    });

    // Preview search box
    prevSearchInput.addEventListener('input', () => {
        renderPreview();
    });

    // Import/Mock Action
    btnLoadMock.addEventListener('click', () => {
        state = JSON.parse(JSON.stringify(MOCK_SCHEMA));
        saveState();
        syncFormInputs();
        renderEditorLists();
        renderPreview();
        updateCompletionMeter();
    });

    // JSON Model Handlers
    btnExportJSON.addEventListener('click', () => {
        jsonModalTitle.innerText = "Export Schema JSON";
        jsonTextarea.value = JSON.stringify(state, null, 2);
        btnJsonAction.innerText = "Copy to Clipboard";
        jsonModal.classList.add('open');
    });

    closeJsonModal.addEventListener('click', () => {
        jsonModal.classList.remove('open');
    });

    btnJsonAction.addEventListener('click', () => {
        navigator.clipboard.writeText(jsonTextarea.value);
        btnJsonAction.innerText = "Copied!";
        setTimeout(() => jsonModal.classList.remove('open'), 1000);
    });

    btnPrintPreview.addEventListener('click', () => {
        alert("Simulating PDF Print... Click OK to open browser print parameters.");
        window.print();
    });
}

// Sync Editor form inputs to current state
function syncFormInputs() {
    inputName.value = state.profile.name || '';
    inputTitle.value = state.profile.title || '';
    inputBio.value = state.profile.bio || '';
    inputEmail.value = state.profile.email || '';
    inputLocation.value = state.profile.location || '';
    selectTheme.value = state.theme || 'modern';
}

// Save state
function saveState() {
    localStorage.setItem('portfolify_state', JSON.stringify(state));
}

// Add Skill Helper
function addSkillTag() {
    const val = inputSkillTag.value.trim();
    if (val && !state.skills.includes(val)) {
        state.skills.push(val);
        saveState();
        renderEditorLists();
        renderPreview();
        updateCompletionMeter();
    }
    inputSkillTag.value = '';
}

// Remove Skill Helper
function removeSkillTag(skill) {
    state.skills = state.skills.filter(s => s !== skill);
    saveState();
    renderEditorLists();
    renderPreview();
    updateCompletionMeter();
}

// Remove Experience
function removeExperience(id) {
    state.experiences = state.experiences.filter(exp => exp.id !== id);
    saveState();
    renderEditorLists();
    renderPreview();
    updateCompletionMeter();
}

// Remove Project
function removeProject(id) {
    state.projects = state.projects.filter(proj => proj.id !== id);
    saveState();
    renderEditorLists();
    renderPreview();
    updateCompletionMeter();
}

// Render Editor lists
function renderEditorLists() {
    // 1. Render Skill editor badges
    skillsEditorContainer.innerHTML = '';
    state.skills.forEach(s => {
        const badge = document.createElement('span');
        badge.className = 'btn-select selected';
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '0.35rem';
        badge.style.padding = '0.35rem 0.65rem';
        badge.style.fontSize = '0.8rem';
        badge.innerHTML = `
            ${s} <i class="fa-solid fa-xmark" style="cursor:pointer; opacity:0.7;"></i>
        `;
        badge.querySelector('i').addEventListener('click', () => removeSkillTag(s));
        skillsEditorContainer.appendChild(badge);
    });

    // 2. Render Experience list table
    experienceTableBody.innerHTML = '';
    if (state.experiences.length === 0) {
        experienceTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.6;">No items added yet.</td></tr>`;
    } else {
        state.experiences.forEach(exp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${exp.role}</strong><br><span style="opacity:0.8;">${exp.company}</span></td>
                <td>${exp.year}</td>
                <td style="text-align:right;">
                    <button class="btn-danger remove-exp" data-id="${exp.id}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            row.querySelector('.remove-exp').addEventListener('click', () => removeExperience(exp.id));
            experienceTableBody.appendChild(row);
        });
    }

    // 3. Render Projects list table
    projectsTableBody.innerHTML = '';
    if (state.projects.length === 0) {
        projectsTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; opacity:0.6;">No items added yet.</td></tr>`;
    } else {
        state.projects.forEach(proj => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${proj.title}</strong></td>
                <td><a href="${proj.link || '#'}" target="_blank" style="color:var(--accent); text-decoration:none; max-width:120px; overflow:hidden; text-overflow:ellipsis; display:block;">Link</a></td>
                <td style="text-align:right;">
                    <button class="btn-danger remove-proj" data-id="${proj.id}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            `;
            row.querySelector('.remove-proj').addEventListener('click', () => removeProject(proj.id));
            projectsTableBody.appendChild(row);
        });
    }
}

// Render Preview sandbox frame
function renderPreview() {
    const q = prevSearchInput.value.trim().toLowerCase();
    previewFrame.className = `preview-window-frame theme-${state.theme}`;

    // Filter project list inside preview only
    const filteredProjects = state.projects.filter(p => {
        return p.title.toLowerCase().includes(q) || 
               p.desc.toLowerCase().includes(q) ||
               p.tech.some(t => t.toLowerCase().includes(q));
    });

    const name = state.profile.name || "Your Name";
    const title = state.profile.title || "Your Professional Title";
    const bio = state.profile.bio || "Fill out the editor to construct your personal bio description.";
    const email = state.profile.email || "hello@example.com";
    const location = state.profile.location || "City, Country";

    // Skills
    let skillsHTML = '';
    state.skills.forEach(s => {
        skillsHTML += `<span class="prev-tag">${s}</span> `;
    });
    if (state.skills.length === 0) {
        skillsHTML = '<span style="opacity:0.6; font-size:0.9rem;">Skills list is empty.</span>';
    }

    // Experiences
    let expHTML = '';
    state.experiences.forEach(exp => {
        expHTML += `
            <div class="prev-card">
                <div style="display:flex; justify-content:space-between; flex-wrap:wrap; font-weight:600; margin-bottom:0.25rem;">
                    <strong>${exp.role}</strong>
                    <span style="opacity:0.7; font-size:0.85rem;">${exp.year}</span>
                </div>
                <div style="color:var(--accent); font-size:0.85rem; font-weight:600; margin-bottom:0.5rem;">${exp.company}</div>
                <p style="font-size:0.85rem; opacity:0.9; line-height:1.4;">${exp.desc}</p>
            </div>
        `;
    });
    if (state.experiences.length === 0) {
        expHTML = '<p style="opacity:0.6; font-size:0.9rem;">Experience entries are empty.</p>';
    }

    // Projects
    let projHTML = '';
    filteredProjects.forEach(proj => {
        let techBadges = '';
        proj.tech.forEach(t => {
            techBadges += `<span class="prev-tag" style="margin-right:0.25rem;">${t}</span>`;
        });
        projHTML += `
            <div class="prev-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <strong style="font-size:1.05rem;">${proj.title}</strong>
                    ${proj.link ? `<a href="${proj.link}" target="_blank" style="font-size:0.8rem; color:var(--accent); text-decoration:none;"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                </div>
                <p style="font-size:0.85rem; opacity:0.85; margin-bottom:0.75rem; line-height:1.4;">${proj.desc}</p>
                <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">${techBadges}</div>
            </div>
        `;
    });
    if (filteredProjects.length === 0) {
        projHTML = `<p style="opacity:0.6; font-size:0.9rem;">${q ? 'No projects matching filter query.' : 'Project catalog is empty.'}</p>`;
    }

    previewFrame.innerHTML = `
        <div class="prev-header">
            <h1 class="prev-title">${name}</h1>
            <div class="prev-subtitle">${title}</div>
            <div style="display:flex; gap:1rem; font-size:0.8rem; margin-top:0.75rem; opacity:0.8; flex-wrap:wrap;">
                <span><i class="fa-solid fa-envelope"></i> ${email}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${location}</span>
            </div>
        </div>

        <div>
            <div class="prev-sec-title">About Me</div>
            <p style="font-size:0.9rem; line-height:1.6; opacity:0.95;">${bio}</p>
        </div>

        <div>
            <div class="prev-sec-title">Expertise & Skills</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;">
                ${skillsHTML}
            </div>
        </div>

        <div>
            <div class="prev-sec-title">Professional Experience</div>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${expHTML}
            </div>
        </div>

        <div>
            <div class="prev-sec-title">Featured Portfolios</div>
            <div class="prev-grid">
                ${projHTML}
            </div>
        </div>
    `;
}

// Completion score logic
function updateCompletionMeter() {
    let score = 0;
    
    if (state.profile.name.trim()) score += 20;
    if (state.profile.title.trim()) score += 20;
    if (state.profile.bio.trim()) score += 15;
    if (state.profile.email.trim()) score += 10;
    if (state.profile.location.trim()) score += 10;
    if (state.skills.length > 0) score += 10;
    if (state.experiences.length > 0) score += 10;
    if (state.projects.length > 0) score += 5;

    completionPercent.innerText = `${score}%`;

    // SVG dashoffset calculation: circumference = 238.76
    const dashOffset = 238.76 - (238.76 * (score / 100));
    completionGauge.style.strokeDashoffset = dashOffset;

    let statusText = "Start adding details below!";
    if (score >= 90) statusText = "Ready to download! Complete.";
    else if (score >= 60) statusText = "Looking sharp! Add some projects.";
    else if (score >= 30) statusText = "Getting there, fill out your bio.";
    
    completionStatus.innerText = statusText;
}

// App Light/Dark toggle
function setupAppTheme() {
    const saved = localStorage.getItem('portfolify_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const target = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('portfolify_theme', target);
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
