const levelSelector = document.getElementById('levelSelector');
const gameWrapper = document.getElementById('gameWrapper');
const levelBtns = document.querySelectorAll('.level-btn');

const gameAreaDiv = document.getElementById('gameArea');
const questionTextEl = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const factBox = document.getElementById('factBox');
const nextButton = document.getElementById('nextButton');
const currentQSpan = document.getElementById('currentQ');
const totalQSpan = document.getElementById('totalQ');
const scoreSpan = document.getElementById('scoreValue');
const questionImageEl = document.getElementById('questionImage');
const feedbackArea = document.getElementById('feedbackArea');
const quizLayout = document.getElementById('quizLayout');
const statsDiv = document.querySelector('.stats');

const completionOverlay = document.getElementById('completionOverlay');
const completionMessage = document.getElementById('completionMessage');
const completionScore = document.getElementById('completionScore');
const completionRestartBtn = document.getElementById('completionRestartBtn');
const completionLevelsBtn = document.getElementById('completionLevelsBtn');

const levelBadge = document.getElementById('levelBadge');
const backBtn = document.getElementById('backBtn');

let currentQuizData = [];
let TOTAL = 0;
let currentIndex = 0;
let correctCount = 0;
let isAnswered = false;
let currentShuffledOptions = [];
let currentCorrectAnswerText = '';

const backArrowLevel = document.getElementById('backArrowLevel');
const backToMainMenuFromComplete = document.getElementById('backToMainMenuFromComplete');

if (backArrowLevel) backArrowLevel.addEventListener('click', goToMainMenu);
if (backToMainMenuFromComplete) backToMainMenuFromComplete.addEventListener('click', goToMainMenu);

function generateStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    container.innerHTML = '';
    const starCount = 300;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        const size = Math.random() * 3 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 1}s`);
        star.style.setProperty('--delay', `${Math.random() * 5}s`);
        container.appendChild(star);
    }
}

function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateScoreUI() {
    scoreSpan.innerText = correctCount;
}

function resetFeedbackStyle() {
    feedbackArea.classList.remove('correct-feedback', 'incorrect-feedback');
}

function setOptionsEnabled(enabled) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        if (enabled) {
            btn.removeAttribute('disabled');
            btn.classList.remove('disabled-opt');
        } else {
            btn.setAttribute('disabled', 'disabled');
            btn.classList.add('disabled-opt');
        }
    });
}

function updateImage(questionData) {
    if (questionImageEl) {
        const imageValue = questionData.image || '🚀';
        if (imageValue.match(/\.(png|jpg|jpeg|svg)$/i)) {
            let maxWidth = '200px'; 
            if (questionData.imageZoom) {
                maxWidth = '320px'; 
            }
            questionImageEl.innerHTML = `<img src="${imageValue}" alt="Иллюстрация" style="width:100%; height:auto; max-width: ${maxWidth};">`;
        } else {
            questionImageEl.innerHTML = imageValue;
            questionImageEl.style.fontSize = '12rem';
        }
        questionImageEl.style.transform = 'scale(1)';
    }
}

function setFeedback(isCorrect, message) {
    factBox.style.animation = 'none';
    factBox.offsetHeight;
    if (isCorrect === true) {
        factBox.innerHTML = `<span>✅ Верно</span><br>${message}`;
    } else if (isCorrect === false) {
        factBox.innerHTML = `<span>❌ Неверно</span><br>${message}`;
    } else {
        factBox.innerHTML = `❓ ${message}`;
    }
    factBox.style.animation = 'fadeSlideUp 0.3s ease-out';
}

function handleCorrect(question) {
    if (isAnswered) return;
    isAnswered = true;
    correctCount++;
    updateScoreUI();
    resetFeedbackStyle();
    feedbackArea.classList.add('correct-feedback');
    setFeedback(true, question.fact);
    if (questionImageEl) {
        questionImageEl.style.transform = 'scale(1.1)';
        setTimeout(() => { if(questionImageEl) questionImageEl.style.transform = ''; }, 300);
    }
    setOptionsEnabled(false);
    nextButton.disabled = false;
}

function handleIncorrect(question) {
    if (isAnswered) return;
    isAnswered = true;
    resetFeedbackStyle();
    feedbackArea.classList.add('incorrect-feedback');
    setFeedback(false, question.fact);
    const card = document.querySelector('.question-card');
    if (card) {
        card.style.transform = 'translateX(4px)';
        setTimeout(() => card.style.transform = '', 100);
        setTimeout(() => card.style.transform = 'translateX(-2px)', 120);
        setTimeout(() => card.style.transform = '', 200);
    }
    setOptionsEnabled(false);
    nextButton.disabled = false;
}

function loadCurrentQuestion() {
    isAnswered = false;
    resetFeedbackStyle();
    nextButton.disabled = true;
    const q = currentQuizData[currentIndex];
    if (!q) return;
    const shuffled = shuffleArray(q.options);
    currentShuffledOptions = shuffled;
    currentCorrectAnswerText = q.options[q.correctIndex];
    setFeedback(null, 'Выбери вариант ответа');
    questionTextEl.innerText = q.text;
    currentQSpan.innerText = currentIndex + 1;
    totalQSpan.innerText = TOTAL;
    updateImage(q);
    optionsContainer.innerHTML = '';
    currentShuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = '⭐ ' + opt;
        btn.addEventListener('click', () => {
            if (isAnswered) return;
            if (opt === currentCorrectAnswerText) {
                handleCorrect(q);
            } else {
                handleIncorrect(q);
            }
        });
        optionsContainer.appendChild(btn);
    });
    setOptionsEnabled(true);
}

function goToNext() {
    if (!isAnswered) return;
    if (currentIndex + 1 < TOTAL) {
        currentIndex++;
        loadCurrentQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    completionOverlay.classList.remove('hidden');
    completionMessage.classList.remove('hidden');
    completionScore.innerText = `${correctCount} / ${TOTAL}`;
    if (backBtn) backBtn.classList.add('hidden');
}

function resetGame() {
    currentIndex = 0;
    correctCount = 0;
    isAnswered = false;
    updateScoreUI();
    completionOverlay.classList.add('hidden');
    completionMessage.classList.add('hidden');
    loadCurrentQuestion();
    nextButton.disabled = true;
    if (backBtn) backBtn.classList.remove('hidden');
}

function returnToLevelSelection() {
    gameWrapper.classList.add('hidden');
    completionOverlay.classList.add('hidden');
    completionMessage.classList.add('hidden');
    levelSelector.classList.remove('hidden');
    currentQuizData = [];
    TOTAL = 0;
    currentIndex = 0;
    correctCount = 0;
    isAnswered = false;
    updateScoreUI();
    questionTextEl.innerText = 'Загрузка...';
    optionsContainer.innerHTML = '';
    factBox.innerHTML = '❓ Выбери уровень сложности';
    if (levelBadge) levelBadge.innerHTML = 'УРОВЕНЬ: <span>—</span>';
    if (backBtn) backBtn.classList.add('hidden');
}

async function loadQuestions(level) {
    let url = '';
    if (level === 'junior') url = 'questions_junior.json';
    else if (level === 'middle') url = 'questions_middle.json';
    else url = 'questions_senior.json';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        currentQuizData = await response.json();
        TOTAL = currentQuizData.length;
        
        let levelText = '';
        if (level === 'junior') levelText = 'НОВИЧОК';
        else if (level === 'middle') levelText = 'ИСПЫТАТЕЛЬ';
        else levelText = 'КАПИТАН';
        if (levelBadge) levelBadge.innerHTML = `УРОВЕНЬ: <span>${levelText}</span>`;
        
        levelSelector.classList.add('hidden');
        gameWrapper.classList.remove('hidden');
        
        if (backBtn) backBtn.classList.remove('hidden');
        
        currentIndex = 0;
        correctCount = 0;
        isAnswered = false;
        updateScoreUI();
        loadCurrentQuestion();
        nextButton.disabled = true;
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        alert('Не удалось загрузить вопросы. Проверьте, что файлы JSON находятся в той же папке, и запустите игру через локальный сервер (Live Server).');
    }
}

levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const level = btn.getAttribute('data-level');
        loadQuestions(level);
    });
});

nextButton.addEventListener('click', goToNext);
completionRestartBtn.addEventListener('click', resetGame);
completionLevelsBtn.addEventListener('click', returnToLevelSelection);

if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (currentQuizData.length === 0) return;
        returnToLevelSelection();
    });
}

generateStars();

console.log('Игра "Космическая викторина" загружена!');