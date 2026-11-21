// Mock Data Models
const INITIAL_COURSES = [
    { code: "CS301", name: "Data Structures & Algorithms", type: "core", credits: 4, instructor: "Dr. Alan Turing", progress: 85, attendance: 95 },
    { code: "CS304", name: "Modern Web Engineering", type: "core", credits: 3, instructor: "Prof. Tim Berners-Lee", progress: 92, attendance: 100 },
    { code: "CS305", name: "Cyber Security Fundamentals", type: "core", credits: 3, instructor: "Dr. Grace Hopper", progress: 78, attendance: 88 },
    { code: "CS308", name: "Agile Software Engineering", type: "elective", credits: 3, instructor: "Prof. Martin Fowler", progress: 65, attendance: 90 },
    { code: "MTH32", name: "Calculus & Linear Algebra", type: "elective", credits: 4, instructor: "Dr. Ada Lovelace", progress: 50, attendance: 90 }
];

const INITIAL_ATTENDANCE = [
    { date: "2026-07-19", course: "CS301", instructor: "Dr. Alan Turing", status: "present", activity: "Lecture on Graph Traversals" },
    { date: "2026-07-18", course: "CS304", instructor: "Prof. Tim Berners-Lee", status: "present", activity: "Lab on CSS Transitions" },
    { date: "2026-07-17", course: "CS305", instructor: "Dr. Grace Hopper", status: "present", activity: "Lecture on RSA Cryptography" },
    { date: "2026-07-16", course: "CS308", instructor: "Prof. Martin Fowler", status: "late", activity: "Lecture on Scrum Framework" },
    { date: "2026-07-15", course: "MTH32", instructor: "Dr. Ada Lovelace", status: "absent", activity: "Lecture on Eigenvalues" },
    { date: "2026-07-14", course: "CS301", instructor: "Dr. Alan Turing", status: "present", activity: "Lecture on Tree Balancing" },
    { date: "2026-07-13", course: "CS304", instructor: "Prof. Tim Berners-Lee", status: "present", activity: "Lab on Flexbox layouts" },
    { date: "2026-07-10", course: "CS305", instructor: "Dr. Grace Hopper", status: "present", activity: "Lab on Port Scanning" }
];

const INITIAL_MARKS = [
    { course: "CS301 - Data Structures", midterm: 88, final: 92, quizzes: 85 },
    { course: "CS304 - Web Engineering", midterm: 95, final: 96, quizzes: 90 },
    { course: "CS305 - Cyber Security", midterm: 76, final: 82, quizzes: 80 },
    { code: "CS308", course: "CS308 - Software Engineering", midterm: 82, final: 85, quizzes: 88 },
    { course: "MTH32 - Calculus & Algebra", midterm: 70, final: 78, quizzes: 72 }
];

// App State
let studentProfile = JSON.parse(localStorage.getItem('eg_profile')) || {
    name: "Abiram S",
    id: "20268593",
    semester: 5,
    major: "Computer Science"
};

let courses = INITIAL_COURSES;
let attendanceLog = JSON.parse(localStorage.getItem('eg_attendance')) || INITIAL_ATTENDANCE;
let marks = INITIAL_MARKS;

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const tabPanels = document.querySelectorAll('.tab-panel');

// Profile Elements
const profileName = document.getElementById('profile-name');
const profileAvatar = document.getElementById('profile-avatar');
const headerAvatar = document.getElementById('header-avatar');
const headerUsername = document.getElementById('header-username');
const profileAcademicDetails = document.getElementById('profile-academic-details');
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');
const inputProfileName = document.getElementById('input-profile-name');
const inputProfileSem = document.getElementById('input-profile-sem');
const inputProfileMajor = document.getElementById('input-profile-major');

// Courses Elements
const coursesContainer = document.getElementById('courses-container');
const courseSearch = document.getElementById('course-search');

// Attendance Elements
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceFilter = document.getElementById('attendance-filter');
const btnRequestLeave = document.getElementById('btn-request-leave');
const leaveModal = document.getElementById('leave-modal');
const closeLeaveModal = document.getElementById('close-leave-modal');
const leaveRequestForm = document.getElementById('leave-request-form');
const dashAttendance = document.getElementById('dash-attendance');

// Marks Elements
const marksTableBody = document.getElementById('marks-table-body');
const btnEstimateGpa = document.getElementById('btn-estimate-gpa');
const gpaEstimateResult = document.getElementById('gpa-estimate-result');
const gpaEstimateVal = document.getElementById('gpa-estimate-val');

// Init
function init() {
    setupTheme();
    setupTabs();
    renderProfile();
    renderCourses();
    renderAttendance();
    renderMarks();
    setupEventListeners();
    recalculateAttendanceMeter();
}

// Setup Event Listeners
function setupEventListeners() {
    // Profile Modal
    editProfileBtn.addEventListener('click', () => {
        inputProfileName.value = studentProfile.name;
        inputProfileSem.value = studentProfile.semester;
        inputProfileMajor.value = studentProfile.major;
        profileModal.classList.add('open');
    });

    closeProfileModal.addEventListener('click', () => {
        profileModal.classList.remove('open');
    });

    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        studentProfile.name = inputProfileName.value;
        studentProfile.semester = parseInt(inputProfileSem.value);
        studentProfile.major = inputProfileMajor.value;
        localStorage.setItem('eg_profile', JSON.stringify(studentProfile));
        renderProfile();
        profileModal.classList.remove('open');
    });

    // Courses Search
    courseSearch.addEventListener('input', (e) => {
        renderCourses(e.target.value);
    });

    // Attendance Filter
    attendanceFilter.addEventListener('change', () => {
        renderAttendance();
    });

    // Leave Request Modal
    btnRequestLeave.addEventListener('click', () => {
        leaveModal.classList.add('open');
    });

    closeLeaveModal.addEventListener('click', () => {
        leaveModal.classList.remove('open');
    });

    leaveRequestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateInput = document.getElementById('leave-date').value;
        const courseInput = document.getElementById('leave-course').value;
        const reasonInput = document.getElementById('leave-reason').value;

        const targetCourse = courses.find(c => c.code === courseInput);

        const newLog = {
            date: dateInput,
            course: courseInput,
            instructor: targetCourse ? targetCourse.instructor : "Instructor",
            status: "absent",
            activity: `Excused Leave: ${reasonInput}`
        };

        attendanceLog.unshift(newLog);
        localStorage.setItem('eg_attendance', JSON.stringify(attendanceLog));
        renderAttendance();
        recalculateAttendanceMeter();
        leaveModal.classList.remove('open');
        leaveRequestForm.reset();
    });

    // GPA Calculator
    btnEstimateGpa.addEventListener('click', () => {
        const currentGPA = parseFloat(document.getElementById('calc-current-gpa').value);
        const completedCredits = parseInt(document.getElementById('calc-completed-credits').value);
        const targetTermGrade = parseFloat(document.getElementById('calc-term-grade').value);
        const termCredits = 15; // standard term credits

        const newGPA = ((currentGPA * completedCredits) + (targetTermGrade * termCredits)) / (completedCredits + termCredits);
        gpaEstimateVal.innerText = newGPA.toFixed(2);
        gpaEstimateResult.style.display = 'block';
    });

    // Timetable Slots details alert
    document.querySelectorAll('.timetable-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            const courseCode = slot.getAttribute('data-course');
            if (courseCode) {
                const targetCourse = courses.find(c => c.code === courseCode);
                if (targetCourse) {
                    alert(`${targetCourse.name} (${courseCode})\nInstructor: ${targetCourse.instructor}\nClass: ${slot.querySelector('.slot-room').innerText}`);
                }
            }
        });
    });
}

// Render Profile
function renderProfile() {
    const initials = studentProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    profileAvatar.innerText = initials;
    headerAvatar.innerText = initials;
    
    profileName.innerText = studentProfile.name;
    headerUsername.innerText = studentProfile.name;
    profileAcademicDetails.innerText = `ID: ${studentProfile.id} • ${studentProfile.major} Major • Semester ${studentProfile.semester}`;
}

// Render Courses Grid
function renderCourses(query = '') {
    coursesContainer.innerHTML = '';
    const filtered = courses.filter(c => {
        return c.name.toLowerCase().includes(query.toLowerCase()) || 
               c.code.toLowerCase().includes(query.toLowerCase());
    });

    if (filtered.length === 0) {
        coursesContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:2rem; opacity:0.6;">No courses found matching "${query}".</div>`;
        return;
    }

    filtered.forEach(c => {
        const card = document.createElement('div');
        card.className = 'course-card glass';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:var(--accent); font-size:1.15rem;">${c.code}</span>
                <span class="badge ${c.type === 'core' ? 'core' : 'elective'}">${c.type}</span>
            </div>
            <h3 style="font-weight:600; font-size:1.05rem;">${c.name}</h3>
            <div style="font-size:0.85rem; color:var(--text-secondary);">
                <div>Instructor: <strong>${c.instructor}</strong></div>
                <div>Credits: <strong>${c.credits} Units</strong></div>
            </div>
            <div>
                <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.35rem;">
                    <span>Course Progress</span>
                    <strong>${c.progress}%</strong>
                </div>
                <div style="width:100%; height:6px; background:var(--panel-border); border-radius:3px; overflow:hidden;">
                    <div style="width:${c.progress}%; height:100%; background:var(--accent);"></div>
                </div>
            </div>
        `;
        coursesContainer.appendChild(card);
    });
}

// Render Attendance Table
function renderAttendance() {
    attendanceTableBody.innerHTML = '';
    const filterVal = attendanceFilter.value;
    const filtered = attendanceLog.filter(log => filterVal === 'all' || log.status === filterVal);

    if (filtered.length === 0) {
        attendanceTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; opacity:0.6;">No records found.</td></tr>`;
        return;
    }

    filtered.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="font-weight: 500;">${log.date}</td>
            <td>
                <strong>${log.course}</strong>
            </td>
            <td>${log.instructor}</td>
            <td><span class="badge ${log.status}">${log.status}</span></td>
            <td style="font-size:0.85rem; color:var(--text-secondary); max-width: 250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${log.activity}</td>
        `;
        attendanceTableBody.appendChild(row);
    });
}

// Recalculate Attendance percentage
function recalculateAttendanceMeter() {
    if (attendanceLog.length === 0) return;
    const total = attendanceLog.length;
    const presentOrLate = attendanceLog.filter(log => log.status === 'present' || log.status === 'late').length;
    const percent = Math.round((presentOrLate / total) * 1000) / 10;
    dashAttendance.innerText = `${percent}%`;
}

// Render Marks Ledger
function renderMarks() {
    marksTableBody.innerHTML = '';
    marks.forEach(m => {
        const weightedTotal = Math.round((m.midterm * 0.3) + (m.final * 0.5) + (m.quizzes * 0.2));
        let grade = 'F';
        if (weightedTotal >= 90) grade = 'A';
        else if (weightedTotal >= 80) grade = 'B';
        else if (weightedTotal >= 70) grade = 'C';
        else if (weightedTotal >= 60) grade = 'D';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${m.course}</strong></td>
            <td>${m.midterm}%</td>
            <td>${m.final}%</td>
            <td>${m.quizzes}%</td>
            <td style="font-weight:700; color:var(--accent);">${weightedTotal}%</td>
            <td><strong style="color:${weightedTotal >= 60 ? 'var(--success)' : 'var(--danger)'};">${grade}</strong></td>
        `;
        marksTableBody.appendChild(row);
    });
}

// Tabs setup
function setupTabs() {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetTab = link.getAttribute('data-tab');
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });
}

// Theme Setup
function setupTheme() {
    const savedTheme = localStorage.getItem('eg_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('eg_theme', target);
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
