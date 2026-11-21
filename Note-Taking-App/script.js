// Initial Notes Mock Data
const INITIAL_NOTES = [
    {
        id: 1,
        title: "Workspace Aesthetic Checklist",
        body: "- Wipe down keyboard and mouse\n- Configure radial gradient desktop background\n- Clean desk glass panel blur\n- Organize wire routing hooks",
        tag: "Personal",
        color: "#10b981",
        date: "2026-07-20",
        pinned: true,
        archived: false
    },
    {
        id: 2,
        title: "Glassmorphism CSS Variables",
        body: "Ensure contrast metrics are met:\n--glass-bg: rgba(255, 255, 255, 0.4);\n--glass-border: rgba(255, 255, 255, 0.15);\n--glass-blur: blur(12px);\nUse backdrop-filter for reflections.",
        tag: "Work",
        color: "#3b82f6",
        date: "2026-07-19",
        pinned: true,
        archived: false
    },
    {
        id: 3,
        title: "Interactive Game Concepts",
        body: "A canvas-based memory game where cards have physics. Players drag cards to match category drawers. Uses LocalStorage to save high score streak counts.",
        tag: "Ideas",
        color: "#8b5cf6",
        date: "2026-07-15",
        pinned: false,
        archived: false
    }
];

// State
let notes = JSON.parse(localStorage.getItem('scribo_notes')) || INITIAL_NOTES;
let activeFolder = 'all';
let searchQuery = '';
let selectedColor = '#f59e0b'; // default yellow

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const foldersList = document.getElementById('folders-list');
const noteSearch = document.getElementById('note-search');
const btnNewNote = document.getElementById('btn-new-note');

const pinnedSection = document.getElementById('pinned-section');
const pinnedNotesContainer = document.getElementById('pinned-notes-container');
const notesContainer = document.getElementById('notes-container');

// Archive Table DOM
const archiveTableToggleBtn = document.getElementById('archive-table-toggle-btn');
const archiveTableSection = document.getElementById('archive-table-section');
const closeArchiveTableBtn = document.getElementById('close-archive-table-btn');
const archiveTableBody = document.getElementById('archive-table-body');

// Stats DOM
const statActive = document.getElementById('stat-active');
const statPinned = document.getElementById('stat-pinned');
const statArchived = document.getElementById('stat-archived');

// Modal DOM
const noteModal = document.getElementById('note-modal');
const noteForm = document.getElementById('note-form');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const formNoteId = document.getElementById('form-note-id');
const formTitle = document.getElementById('form-title');
const formTag = document.getElementById('form-tag');
const formBody = document.getElementById('form-body');
const colorSwatchGroup = document.getElementById('color-swatch-group');

// Initialize
function init() {
    setupTheme();
    renderNotes();
    renderArchiveTable();
    updateStatsUI();
    setupListeners();
}

function setupListeners() {
    // New Note click
    btnNewNote.addEventListener('click', () => {
        openNoteModal();
    });

    closeModalBtn.addEventListener('click', () => {
        noteModal.classList.remove('open');
        noteForm.reset();
    });

    // Swatches selection click
    colorSwatchGroup.querySelectorAll('.color-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            colorSwatchGroup.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            sw.classList.add('active');
            selectedColor = sw.getAttribute('data-color');
        });
    });

    // Form submit
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = formNoteId.value;

        if (idVal) {
            // Edit existing
            const noteObj = notes.find(n => n.id === parseInt(idVal));
            if (noteObj) {
                noteObj.title = formTitle.value.trim();
                noteObj.tag = formTag.value;
                noteObj.body = formBody.value.trim();
                noteObj.color = selectedColor;
            }
        } else {
            // Create new
            const newNote = {
                id: Date.now(),
                title: formTitle.value.trim(),
                tag: formTag.value,
                body: formBody.value.trim(),
                color: selectedColor,
                date: new Date().toISOString().substring(0, 10),
                pinned: false,
                archived: false
            };
            notes.unshift(newNote);
        }

        saveNotes();
        noteModal.classList.remove('open');
        noteForm.reset();
        
        renderNotes();
        renderArchiveTable();
        updateStatsUI();
    });

    // Search
    noteSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderNotes();
        renderArchiveTable();
    });

    // Folders Sidebar Filter
    foldersList.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', () => {
            foldersList.querySelectorAll('.folder-item').forEach(f => f.classList.remove('active'));
            item.classList.add('active');
            activeFolder = item.getAttribute('data-folder');
            
            // Auto open archive panel if selected
            if (activeFolder === 'archive') {
                archiveTableSection.style.display = 'block';
            } else {
                archiveTableSection.style.display = 'none';
            }

            renderNotes();
        });
    });

    // Archive panel toggle
    archiveTableToggleBtn.addEventListener('click', () => {
        const isHidden = archiveTableSection.style.display === 'none';
        archiveTableSection.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            archiveTableSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    closeArchiveTableBtn.addEventListener('click', () => {
        archiveTableSection.style.display = 'none';
    });
}

// Render active notes grid
function renderNotes() {
    pinnedNotesContainer.innerHTML = '';
    notesContainer.innerHTML = '';

    // Filter notes
    const isArchiveView = activeFolder === 'archive';
    const filtered = notes.filter(n => {
        const matchesFolder = isArchiveView ? n.archived : 
                              (!n.archived && (activeFolder === 'all' || n.tag === activeFolder));
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              n.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFolder && matchesSearch;
    });

    // Distinguish pinned vs normal
    const pinnedNotes = filtered.filter(n => n.pinned);
    const regularNotes = filtered.filter(n => !n.pinned);

    // Render Pinned
    if (pinnedNotes.length > 0 && !isArchiveView) {
        pinnedSection.style.display = 'flex';
        pinnedNotes.forEach(note => {
            pinnedNotesContainer.appendChild(createNoteCardElement(note));
        });
    } else {
        pinnedSection.style.display = 'none';
    }

    // Render Regular Feed
    if (regularNotes.length === 0 && pinnedNotes.length === 0) {
        notesContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; opacity: 0.6;">
                <i class="fa-regular fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No notes logged in this section.</p>
            </div>
        `;
        return;
    }

    regularNotes.forEach(note => {
        notesContainer.appendChild(createNoteCardElement(note));
    });
}

// Create Card DOM Node
function createNoteCardElement(note) {
    const card = document.createElement('div');
    card.className = 'note-card glass';
    card.style.borderLeftColor = note.color;
    card.innerHTML = `
        <div class="note-card-header">
            <span class="btn-primary" style="pointer-events:none; font-size:0.65rem; padding:0.15rem 0.4rem; border-radius:10px;">${note.tag.toUpperCase()}</span>
            <button class="btn-pin ${note.pinned ? 'active' : ''}" title="Pin Note">
                <i class="fa-${note.pinned ? 'solid' : 'regular'} fa-thumbtack"></i>
            </button>
        </div>
        <h4 class="note-card-title">${note.title}</h4>
        <p class="note-card-body">${note.body}</p>
        <div class="note-card-footer">
            <span>${note.date}</span>
            <div style="display:flex; gap:0.4rem;">
                <button class="btn-icon archive-btn" title="Archive Note" style="width:24px; height:24px; font-size:0.75rem;"><i class="fa-solid fa-box-archive"></i></button>
                <button class="btn-icon delete-btn" title="Delete Note" style="width:24px; height:24px; font-size:0.75rem; color:var(--danger);"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        </div>
    `;

    // Pin click
    card.querySelector('.btn-pin').addEventListener('click', (e) => {
        e.stopPropagation();
        note.pinned = !note.pinned;
        saveNotes();
        renderNotes();
        updateStatsUI();
    });

    // Archive click
    card.querySelector('.archive-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        note.archived = !note.archived;
        note.pinned = false; // clear pins on archive
        saveNotes();
        renderNotes();
        renderArchiveTable();
        updateStatsUI();
    });

    // Delete click
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(note.id);
    });

    // Edit click
    card.addEventListener('click', () => {
        openNoteModal(note.id);
    });

    return card;
}

// Delete Note helper
function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
    renderArchiveTable();
    updateStatsUI();
}

// Open Editor Modal Form
function openNoteModal(editId = null) {
    if (editId) {
        const noteObj = notes.find(n => n.id === editId);
        if (noteObj) {
            modalTitle.innerText = "Edit Note";
            formNoteId.value = noteObj.id;
            formTitle.value = noteObj.title;
            formTag.value = noteObj.tag;
            formBody.value = noteObj.body;
            selectedColor = noteObj.color;
            
            // Set active swatch class
            colorSwatchGroup.querySelectorAll('.color-swatch').forEach(sw => {
                if (sw.getAttribute('data-color') === selectedColor) sw.classList.add('active');
                else sw.classList.remove('active');
            });
        }
    } else {
        modalTitle.innerText = "Add New Note";
        formNoteId.value = '';
        noteForm.reset();
        selectedColor = '#f59e0b';
        colorSwatchGroup.querySelectorAll('.color-swatch').forEach((sw, idx) => {
            if (idx === 0) sw.classList.add('active');
            else sw.classList.remove('active');
        });
    }
    noteModal.classList.add('open');
}

// Render Archived Notes Table comparative list
function renderArchiveTable() {
    archiveTableBody.innerHTML = '';
    const archivedNotes = notes.filter(n => n.archived && 
        (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.body.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (archivedNotes.length === 0) {
        archiveTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; opacity:0.6; padding:1.5rem 0;">No archived logs available.</td></tr>`;
        return;
    }

    archivedNotes.forEach(note => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${note.date}</td>
            <td><strong>${note.title}</strong></td>
            <td><span class="btn-primary" style="pointer-events:none; font-size:0.65rem; padding:0.15rem 0.4rem; border-radius:10px;">${note.tag.toUpperCase()}</span></td>
            <td style="text-align:right;">
                <button class="btn-primary unarchive-btn" data-id="${note.id}" style="padding:0.25rem 0.65rem; font-size:0.75rem;">Restore</button>
                <button class="btn-icon delete-btn remove-arch" data-id="${note.id}" style="display:inline-flex; color:var(--danger); vertical-align:middle;"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;

        row.querySelector('.unarchive-btn').addEventListener('click', () => {
            note.archived = false;
            saveNotes();
            renderNotes();
            renderArchiveTable();
            updateStatsUI();
        });

        row.querySelector('.remove-arch').addEventListener('click', () => deleteNote(note.id));

        archiveTableBody.appendChild(row);
    });
}

function updateStatsUI() {
    const active = notes.filter(n => !n.archived).length;
    const pinned = notes.filter(n => n.pinned && !n.archived).length;
    const archived = notes.filter(n => n.archived).length;

    statActive.innerText = active;
    statPinned.innerText = pinned;
    statArchived.innerText = archived;
}

function saveNotes() {
    localStorage.setItem('scribo_notes', JSON.stringify(notes));
}

// Theme
function setupTheme() {
    const savedTheme = localStorage.getItem('scribo_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('scribo_theme', target);
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
