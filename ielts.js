document.addEventListener('DOMContentLoaded', () => {
    const homePage = document.getElementById('home-page');
    const testPage = document.getElementById('test-page');
    const resultsPage = document.getElementById('results-page');

    const testTitleEl = document.getElementById('test-title');
    const timerDisplay = document.getElementById('timer-display');
    const readingPanel = document.getElementById('reading-panel');
    const questionsPanel = document.getElementById('questions-panel');
    const questionNavigation = document.getElementById('question-navigation');
    
    const finalScoreEl = document.getElementById('final-score');
    const timeTakenEl = document.getElementById('time-taken');
    const bandScoreEl = document.getElementById('band-score');
    const reviewContainer = document.getElementById('review-container');

    let currentTest = null;
    let userAnswers = [];
    let timerInterval = null;
    let secondsElapsed = 0;

    // --- Event Listeners ---
    document.querySelectorAll('.start-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const testCard = e.target.closest('.test-card');
            const testFile = testCard.dataset.testFile;
            const isTimed = e.target.classList.contains('timed');
            loadTest(testFile, isTimed);
        });
    });

    document.getElementById('end-test-btn').addEventListener('click', endTest);
    document.getElementById('back-to-home-btn').addEventListener('click', () => {
        showPage('home-page');
    });

    // --- Page Navigation ---
    function showPage(pageId) {
        homePage.classList.add('hidden');
        testPage.classList.add('hidden');
        resultsPage.classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    // --- Test Loading and Setup ---
    async function loadTest(testFile, isTimed) {
        try {
            const response = await fetch(`tests/${testFile}`);
            if (!response.ok) throw new Error('Network response was not ok');
            currentTest = await response.json();
            
            userAnswers = new Array(currentTest.questions.length).fill(null);
            setupTestUI(isTimed);
            showPage('test-page');
        } catch (error) {
            console.error('Failed to load test:', error);
            alert('Error: Could not load the test file.');
        }
    }
    
    function setupTestUI(isTimed) {
        testTitleEl.textContent = currentTest.title;
        readingPanel.innerHTML = currentTest.readingPassage;
        renderQuestions();
        renderNavigation();
        
        secondsElapsed = 0;
        if (isTimed) {
            timerDisplay.style.display = 'block';
            startTimer();
        } else {
            timerDisplay.style.display = 'none';
        }
    }

    // --- Rendering ---
    function renderQuestions() {
        let questionHTML = '';
        currentTest.questions.forEach((q, index) => {
            questionHTML += `<div class="question" id="q-${index}">`;
            questionHTML += `<p><strong>Question ${index + 1}:</strong> ${q.instruction}</p>`;
            
            switch(q.type) {
                case 'fill-in-the-blanks':
                    questionHTML += `<label for="q-input-${index}">${q.questionText}</label>`;
                    questionHTML += `<input type="text" id="q-input-${index}" data-q-index="${index}">`;
                    break;
                case 'multiple-choice':
                    questionHTML += `<p>${q.questionText}</p>`;
                    q.options.forEach(opt => {
                        questionHTML += `<div><input type="radio" name="q-${index}" value="${opt}" id="q-radio-${index}-${opt}" data-q-index="${index}"><label for="q-radio-${index}-${opt}"> ${opt}</label></div>`;
                    });
                    break;
                case 'true-false-not-given':
                     questionHTML += `<p>${q.questionText}</p>`;
                     ['True', 'False', 'Not Given'].forEach(opt => {
                         questionHTML += `<div><input type="radio" name="q-${index}" value="${opt}" id="q-radio-${index}-${opt}" data-q-index="${index}"><label for="q-radio-${index}-${opt}"> ${opt}</label></div>`;
                     });
                    break;
            }
            questionHTML += `</div>`;
        });
        questionsPanel.innerHTML = questionHTML;
        addAnswerListeners();
    }

    function renderNavigation() {
        let navHTML = '';
        for (let i = 0; i < currentTest.questions.length; i++) {
            navHTML += `<button class="nav-btn" data-q-index="${i}">${i + 1}</button>`;
        }
        questionNavigation.innerHTML = navHTML;
        addNavListeners();
        updateActiveQuestion(0);
    }
    
    // --- User Interaction ---
    function addAnswerListeners() {
        questionsPanel.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.qIndex);
                userAnswers[index] = e.target.value.trim().toLowerCase();
                document.querySelector(`.nav-btn[data-q-index="${index}"]`).classList.add('answered');
            });
        });
    }
    
    function addNavListeners() {
        questionNavigation.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.qIndex);
                document.getElementById(`q-${index}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
                updateActiveQuestion(index);
            });
        });
    }
    
    function updateActiveQuestion(index) {
        document.querySelectorAll('.nav-btn.current').forEach(btn => btn.classList.remove('current'));
        document.querySelector(`.nav-btn[data-q-index="${index}"]`).classList.add('current');
    }

    // --- Timer ---
    function startTimer() {
        const testDuration = 60 * 60; // 60 minutes
        let timeRemaining = testDuration;
        
        timerInterval = setInterval(() => {
            secondsElapsed++;
            timeRemaining--;
            
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeRemaining <= 0) {
                endTest();
            }
        }, 1000);
    }

    // --- Test Completion and Results ---
    function endTest() {
        clearInterval(timerInterval);
        calculateResults();
        showPage('results-page');
    }
    
    function calculateResults() {
        let score = 0;
        userAnswers.forEach((answer, index) => {
            const correctAnswers = currentTest.questions[index].answer.map(a => a.toLowerCase());
            if (answer && correctAnswers.includes(answer)) {
                score++;
            }
        });

        finalScoreEl.textContent = `${score} / ${currentTest.questions.length}`;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timeTakenEl.textContent = `${minutes}m ${seconds}s`;
        
        bandScoreEl.textContent = getBandScore(score, currentTest.type);
        renderReview(score);
    }
    
    function getBandScore(score, testType) {
        const gtBands = { 40: "9.0", 39: "8.5", 38: "8.0", 37: "7.5", 36: "7.0", 35: "6.5", 34: "6.5", 32: "6.0", 30: "5.5", 27: "5.0", 23: "4.5", 19: "4.0", 15: "3.5", 12: "3.0" };
        const acBands = { 40: "9.0", 39: "8.5", 38: "8.0", 37: "7.5", 35: "7.0", 33: "6.5", 30: "6.0", 27: "5.5", 23: "5.0", 20: "4.5", 16: "4.0", 13: "3.5", 10: "3.0" };

        const bands = testType === 'General Training' ? gtBands : acBands;
        let band = "N/A";
        for (let s in bands) {
            if (score >= s) {
                band = bands[s];
                break;
            }
        }
        return band;
    }

    function renderReview() {
        let reviewHTML = '<h3>Answer Review</h3>';
        currentTest.questions.forEach((q, index) => {
            const userAnswer = userAnswers[index] || "No Answer";
            const correctAnswers = q.answer;
            const isCorrect = correctAnswers.map(a => a.toLowerCase()).includes(userAnswer);

            reviewHTML += `<div class="review-item">`;
            reviewHTML += `<p><strong>Question ${index + 1}:</strong> ${q.questionText || q.instruction}</p>`;
            reviewHTML += `<p>Your Answer: <span class="${isCorrect ? 'correct-answer' : 'incorrect-answer'}">${userAnswer}</span></p>`;
            if (!isCorrect) {
                 reviewHTML += `<p>Correct Answer: <span class="correct-answer">${correctAnswers.join(' / ')}</span></p>`;
            }
            reviewHTML += `<div class="explanation"><p><strong>Explanation:</strong> ${q.explanation}</p></div>`;
            reviewHTML += `</div>`;
        });
        reviewContainer.innerHTML = reviewHTML;
    }

    // --- Panel Resizer Logic ---
    const resizer = document.getElementById('resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        const container = document.querySelector('.test-container');
        const totalWidth = container.offsetWidth;
        const leftPanelWidth = e.clientX - container.offsetLeft;
        
        const leftPercentage = (leftPanelWidth / totalWidth) * 100;
        
        if (leftPercentage > 20 && leftPercentage < 80) { // Set min/max width
            readingPanel.style.flexBasis = `${leftPercentage}%`;
            questionsPanel.style.flexBasis = `${100 - leftPercentage}%`;
        }
    }
});
