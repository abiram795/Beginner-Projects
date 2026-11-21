// Quiz Questions Database
const QUESTIONS = {
    javascript: [
        {
            q: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
            options: ["var", "let", "constant", "global"],
            correct: 1,
            exp: "'let' declares block-scoped variables, unlike 'var' which is function-scoped."
        },
        {
            q: "What is the output of typeof null in JavaScript?",
            options: ["'null'", "'undefined'", "'object'", "'string'"],
            correct: 2,
            exp: "This is a historical bug in JavaScript, where null is treated as an object type."
        },
        {
            q: "Which method is used to write a message to the browser console?",
            options: ["console.print()", "console.log()", "console.write()", "console.display()"],
            correct: 1,
            exp: "'console.log()' writes logs to the developer web debugger console."
        },
        {
            q: "Which array method creates a new array with all elements that pass a test?",
            options: ["map()", "filter()", "reduce()", "forEach()"],
            correct: 1,
            exp: "'filter()' creates a shallow copy of a portion of a given array, filtered down to elements that pass the test."
        },
        {
            q: "What does DOM stand for in web development?",
            options: ["Document Object Model", "Desktop Object Mode", "Data Orientation Model", "Digital Office Media"],
            correct: 0,
            exp: "DOM stands for Document Object Model, which represents the XML/HTML document structure."
        }
    ],
    science: [
        {
            q: "What is the chemical symbol for gold?",
            options: ["Gd", "Au", "Ag", "Fe"],
            correct: 1,
            exp: "Au comes from the Latin word for gold, 'aurum'."
        },
        {
            q: "What is the approximate speed of light?",
            options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"],
            correct: 0,
            exp: "Light travels at roughly 299,792 kilometers per second in a vacuum."
        },
        {
            q: "Which planet in our solar system is known as the Red Planet?",
            options: ["Venus", "Jupiter", "Mars", "Saturn"],
            correct: 2,
            exp: "Mars has a red appearance due to iron oxide (rust) on its surface."
        },
        {
            q: "What is the powerhouse of the cell?",
            options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"],
            correct: 2,
            exp: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
        },
        {
            q: "Which gas do plants absorb from the atmosphere for photosynthesis?",
            options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            correct: 1,
            exp: "Plants absorb Carbon Dioxide (CO2) and release Oxygen during photosynthesis."
        }
    ],
    history: [
        {
            q: "Who was the first President of the United States?",
            options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
            correct: 2,
            exp: "George Washington served as the first president of the United States from 1789 to 1797."
        },
        {
            q: "In which year did World War II end?",
            options: ["1918", "1945", "1939", "1953"],
            correct: 1,
            exp: "World War II ended in 1945 with the formal signing of surrender documents."
        },
        {
            q: "Which empire built the Colosseum in Rome?",
            options: ["Greek Empire", "Roman Empire", "Ottoman Empire", "Persian Empire"],
            correct: 1,
            exp: "The Colosseum was built by the Roman Empire, completed in 80 AD under Emperor Titus."
        },
        {
            q: "Who was the first human to walk on the moon?",
            options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Michael Collins"],
            correct: 1,
            exp: "Neil Armstrong stepped onto the lunar surface on July 20, 1969."
        },
        {
            q: "What ancient civilization built the pyramids of Giza?",
            options: ["Mayans", "Romans", "Egyptians", "Mesopotamians"],
            correct: 2,
            exp: "The Great Pyramids were built by the Ancient Egyptians during the Old Kingdom period."
        }
    ],
    geography: [
        {
            q: "What is the capital city of France?",
            options: ["London", "Berlin", "Rome", "Paris"],
            correct: 3,
            exp: "Paris is the capital and most populous city of France."
        },
        {
            q: "Which is the largest ocean on Earth?",
            options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
            correct: 3,
            exp: "The Pacific Ocean is the largest and deepest of Earth's oceanic divisions."
        },
        {
            q: "What is the longest river in the world?",
            options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
            correct: 1,
            exp: "The Nile River is traditionally considered the longest, though Amazon is the largest by water volume."
        },
        {
            q: "Which country is home to the Kangaroo?",
            options: ["Austria", "Australia", "South Africa", "Brazil"],
            correct: 1,
            exp: "Kangaroos are indigenous, marsupial animals native to Australia."
        },
        {
            q: "What is the tallest mountain peak on Earth?",
            options: ["Mount K2", "Mount Kilimanjaro", "Mount Everest", "Mount Blanc"],
            correct: 2,
            exp: "Mount Everest in the Himalayas rises to 8,848 meters (29,029 ft) above sea level."
        }
    ]
};

// State Variables
let activeCategory = 'javascript';
let activeDifficulty = 'easy'; // easy = 15s, medium = 10s
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let userAnswers = []; // Logs: { question, options, correctIdx, chosenIdx, status }
const circleCircumference = 2 * Math.PI * 26; // = 163.36

// DOM Selection
const themeToggle = document.getElementById('theme-toggle');
const configPanel = document.getElementById('config-panel');
const quizPanel = document.getElementById('quiz-panel');
const resultPanel = document.getElementById('result-panel');
const categoryGroup = document.getElementById('category-group');
const difficultyGroup = document.getElementById('difficulty-group');
const btnStart = document.getElementById('btn-start');
const btnNext = document.getElementById('btn-next');
const btnRestart = document.getElementById('btn-restart');
const btnHome = document.getElementById('btn-home');

const progressText = document.getElementById('progress-text');
const categoryBadge = document.getElementById('category-badge');
const progressBarFill = document.getElementById('progress-bar-fill');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const timerVal = document.getElementById('timer-val');
const timerIndicator = document.getElementById('timer-indicator');

const resScore = document.getElementById('res-score');
const resPercentage = document.getElementById('res-percentage');
const resGrade = document.getElementById('res-grade');
const reviewsContainer = document.getElementById('reviews-container');
const highScoresList = document.getElementById('high-scores-list');

// Initialize SVG Circle Dash
timerIndicator.style.strokeDasharray = circleCircumference;
timerIndicator.style.strokeDashoffset = 0;

// Init Setup
function init() {
    setupTheme();
    setupConfigButtons();
    renderHighScores();
}

// Config Panel Controls
function setupConfigButtons() {
    categoryGroup.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', () => {
            categoryGroup.querySelectorAll('.btn-select').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            activeCategory = btn.getAttribute('data-value');
        });
    });

    difficultyGroup.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyGroup.querySelectorAll('.btn-select').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            activeDifficulty = btn.getAttribute('data-value');
        });
    });

    btnStart.addEventListener('click', startQuiz);
    btnNext.addEventListener('click', goToNextQuestion);
    btnRestart.addEventListener('click', restartQuiz);
    btnHome.addEventListener('click', showConfigPanel);
}

// Start Quiz
function startQuiz() {
    configPanel.classList.remove('active');
    quizPanel.classList.add('active');
    resultPanel.classList.remove('active');

    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    loadQuestion();
}

// Load Question Details
function loadQuestion() {
    btnNext.style.display = 'none';
    const questionsList = QUESTIONS[activeCategory];
    const currentQ = questionsList[currentQuestionIndex];

    categoryBadge.innerText = activeCategory.toUpperCase();
    progressText.innerText = `Question ${currentQuestionIndex + 1} of ${questionsList.length}`;
    
    const progressPercent = ((currentQuestionIndex) / questionsList.length) * 100;
    progressBarFill.style.width = `${progressPercent}%`;

    questionText.innerText = currentQ.q;
    optionsContainer.innerHTML = '';

    currentQ.options.forEach((opt, idx) => {
        const charCode = String.fromCharCode(65 + idx); // A, B, C, D
        const card = document.createElement('div');
        card.className = 'option-card';
        card.innerHTML = `
            <span>${opt}</span>
            <div class="option-letter">${charCode}</div>
        `;
        card.addEventListener('click', () => handleOptionClick(idx));
        optionsContainer.appendChild(card);
    });

    // Start Timer
    resetTimer();
}

// Timer Logic
function resetTimer() {
    clearInterval(timer);
    timeLeft = activeDifficulty === 'easy' ? 15 : 10;
    timerVal.innerText = timeLeft;
    
    // Reset SVG Circle
    timerIndicator.style.strokeDashoffset = 0;
    
    timer = setInterval(() => {
        timeLeft--;
        timerVal.innerText = timeLeft;
        
        // Progress dash offset logic
        const maxTime = activeDifficulty === 'easy' ? 15 : 10;
        const progressOffset = circleCircumference * (1 - (timeLeft / maxTime));
        timerIndicator.style.strokeDashoffset = progressOffset;

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

// Handle Option Click
function handleOptionClick(selectedIndex) {
    clearInterval(timer);
    const questionsList = QUESTIONS[activeCategory];
    const currentQ = questionsList[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQ.correct;

    const cards = optionsContainer.querySelectorAll('.option-card');
    
    // Disable all option clicks
    cards.forEach((card, idx) => {
        card.style.pointerEvents = 'none';
        if (idx === currentQ.correct) {
            card.classList.add('correct');
        } else if (idx === selectedIndex) {
            card.classList.add('wrong');
        }
    });

    if (isCorrect) {
        score++;
    }

    // Log answer review
    userAnswers.push({
        question: currentQ.q,
        options: currentQ.options,
        correctIdx: currentQ.correct,
        chosenIdx: selectedIndex,
        status: isCorrect ? 'correct' : 'incorrect',
        exp: currentQ.exp
    });

    btnNext.style.display = 'block';
}

// Handle Time Out
function handleTimeOut() {
    const questionsList = QUESTIONS[activeCategory];
    const currentQ = questionsList[currentQuestionIndex];
    
    const cards = optionsContainer.querySelectorAll('.option-card');
    cards.forEach((card, idx) => {
        card.style.pointerEvents = 'none';
        if (idx === currentQ.correct) {
            card.classList.add('correct');
        }
    });

    userAnswers.push({
        question: currentQ.q,
        options: currentQ.options,
        correctIdx: currentQ.correct,
        chosenIdx: -1,
        status: 'incorrect',
        exp: currentQ.exp
    });

    btnNext.style.display = 'block';
}

// Go to next question
function goToNextQuestion() {
    const questionsList = QUESTIONS[activeCategory];
    currentQuestionIndex++;

    if (currentQuestionIndex < questionsList.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

// Display results screen
function showResults() {
    quizPanel.classList.remove('active');
    resultPanel.classList.add('active');

    const totalQ = QUESTIONS[activeCategory].length;
    resScore.innerText = `${score}/${totalQ}`;
    
    const percentage = Math.round((score / totalQ) * 100);
    resPercentage.innerText = `${percentage}%`;

    let grade = 'F';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    resGrade.innerText = grade;

    // Render Answers Review
    reviewsContainer.innerHTML = '';
    userAnswers.forEach((ans, idx) => {
        const statusIcon = ans.status === 'correct' ? '<i class="fa-solid fa-circle-check" style="color:var(--success);"></i>' : '<i class="fa-solid fa-circle-xmark" style="color:var(--danger);"></i>';
        const chosenText = ans.chosenIdx === -1 ? 'Time Expired' : ans.options[ans.chosenIdx];
        const correctText = ans.options[ans.correctIdx];

        const item = document.createElement('div');
        item.className = `review-item glass ${ans.status}`;
        item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; font-weight:600;">
                <span>Question ${idx + 1}</span>
                ${statusIcon}
            </div>
            <p style="font-size:0.95rem; margin-bottom:0.5rem;">${ans.question}</p>
            <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:0.25rem;">
                <div><span style="opacity:0.7;">Your Answer:</span> <strong style="color: ${ans.status === 'correct' ? 'var(--success)' : 'var(--danger)'};">${chosenText}</strong></div>
                <div><span style="opacity:0.7;">Correct Answer:</span> <strong style="color: var(--success);">${correctText}</strong></div>
                <div style="margin-top:0.4rem; padding-top:0.4rem; border-top: 1px solid var(--panel-border); font-style: italic; opacity:0.85;">${ans.exp}</div>
            </div>
        `;
        reviewsContainer.appendChild(item);
    });

    // Save High Score
    saveHighScore(percentage);
}

// High score management
function saveHighScore(percentage) {
    const scores = JSON.parse(localStorage.getItem('brainiac_highscores')) || [];
    const newRecord = {
        category: activeCategory,
        difficulty: activeDifficulty,
        score: percentage,
        date: new Date().toLocaleDateString()
    };
    
    scores.push(newRecord);
    // Sort descending and cap at 5
    scores.sort((a,b) => b.score - a.score);
    const trimmed = scores.slice(0, 5);
    localStorage.setItem('brainiac_highscores', JSON.stringify(trimmed));
    renderHighScores();
}

function renderHighScores() {
    highScoresList.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('brainiac_highscores')) || [];
    
    if (scores.length === 0) {
        highScoresList.innerHTML = `<li style="opacity:0.6; font-size:0.85rem; padding:0.5rem 0; text-align:center;">No high scores logged yet. Be the first!</li>`;
        return;
    }

    scores.forEach((s) => {
        const item = document.createElement('li');
        item.className = 'high-score-item';
        item.innerHTML = `
            <strong>${s.category.toUpperCase()} (${s.difficulty.toUpperCase()})</strong>
            <span style="color: var(--accent); font-weight:700;">${s.score}%</span>
            <span style="opacity: 0.6; font-size: 0.8rem;">${s.date}</span>
        `;
        highScoresList.appendChild(item);
    });
}

// Navigation Controllers
function restartQuiz() {
    startQuiz();
}

function showConfigPanel() {
    configPanel.classList.add('active');
    quizPanel.classList.remove('active');
    resultPanel.classList.remove('active');
}

// Theme setup
function setupTheme() {
    const savedTheme = localStorage.getItem('brainiac_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
    localStorage.setItem('brainiac_theme', target);
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

// Initialize Application
init();
