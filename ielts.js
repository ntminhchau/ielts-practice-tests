document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const homePage = document.getElementById('home-page');
    const testPage = document.getElementById('test-page');
    const resultsPage = document.getElementById('results-page');
    const testTitleEl = document.getElementById('test-title');
    const timerDisplay = document.getElementById('timer-display');
    const readingPanel = document.getElementById('reading-panel');
    const questionsPanel = document.getElementById('questions-panel');
    const questionNavigationContainer = document.getElementById('question-navigation-container');
    const footerToggle = document.getElementById('footer-toggle');
    const finalScoreEl = document.getElementById('final-score');
    const timeTakenEl = document.getElementById('time-taken');
    const bandScoreEl = document.getElementById('band-score');
    const reviewContainer = document.getElementById('review-container');
    const resultsReadingPanel = document.getElementById('results-reading-panel');
    
    // Highlighter
    const highlighterToolbar = document.getElementById('highlighter-toolbar');
    const eraserBtn = document.getElementById('eraser-btn');

    // Dictionary & Phrasebook
    const dictionaryModal = document.getElementById('dictionary-modal');
    const phrasebookBtn = document.getElementById('phrasebook-btn');
    const phrasebookModal = document.getElementById('phrasebook-modal');

    // --- STATE VARIABLES ---
    let currentTest = null;
    let userAnswers = [];
    let timerInterval = null;
    let secondsElapsed = 0;
    let isTimed = false;
    let activeHighlightColor = 'yellow';
    let phrasebook = JSON.parse(localStorage.getItem('ieltsPhrasebook')) || [];
    
    // A small, sample dictionary for the lookup feature
    const sampleDictionary = {
        "tram": { en: "A public transport vehicle, powered by electricity, that runs on rails along public roads.", vn: "Xe điện, một phương tiện giao thông công cộng chạy bằng điện trên đường ray." },
        "vending machine": { en: "A machine that dispenses items such as snacks or tickets when a coin or token is inserted.", vn: "Máy bán hàng tự động, bán các mặt hàng như đồ ăn nhẹ hoặc vé." },
        "obstruct": { en: "To block a road, passage, or view.", vn: "Làm cản trở, chặn một con đường, lối đi hoặc tầm nhìn." },
        "sweater": { en: "A knitted garment worn on the upper part of the body.", vn: "Áo len, một loại áo dệt kim mặc ở phần trên của cơ thể." },
        "resign": { en: "To voluntarily leave a job or other position.", vn: "Từ chức, tự nguyện rời bỏ một công việc hoặc vị trí." },
        "courtesy": { en: "The showing of politeness in one's attitude and behavior toward others.", vn: "Sự lịch sự, nhã nhặn trong thái độ và hành vi đối với người khác." }
    };

    // --- HELPER FUNCTIONS ---

    // THIS IS THE MISSING FUNCTION
    function showPage(pageId) {
        homePage.classList.add('hidden');
        testPage.classList.add('hidden');
        resultsPage.classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    // --- INITIAL SETUP & EVENT LISTENERS ---
    
    window.addEventListener('load', () => {
        const params = new URLSearchParams(window.location.search);
        const testToLoad = params.get('test');
        if (testToLoad) {
            loadTest(testToLoad, true);
        }
    });

    document.querySelectorAll('.start-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const testFile = e.target.closest('.test-card').dataset.testFile;
            isTimed = e.target.classList.contains('timed');
            loadTest(testFile, isTimed);
        });
    });

    document.getElementById('end-test-btn').addEventListener('click', endTest);
    footerToggle.addEventListener('click', () => {
        questionNavigationContainer.classList.toggle('collapsed');
        const icon = footerToggle.querySelector('i');
        const text = footerToggle.querySelector('span');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
        text.textContent = questionNavigationContainer.classList.contains('collapsed') ? 'Show Navigation' : 'Hide Navigation';
    });

    document.getElementById('back-to-home-btn').addEventListener('click', () => showPage('home-page'));

    // --- TEST LOGIC ---

    async function loadTest(testFile, timed) {
        try {
            const response = await fetch(`tests/${testFile}`);
            if (!response.ok) throw new Error('Network response was not ok');
            currentTest = await response.json();
            
            userAnswers = new Array(40).fill(null);
            setupTestUI(timed);
            showPage('test-page');
        } catch (error) {
            console.error('Failed to load test:', error);
            alert('Error: Could not load the test file.');
        }
    }

    function setupTestUI(timed) {
        testTitleEl.textContent = currentTest.title;
        renderReadingPassages();
        renderQuestions();
        renderNavigation();
        
        secondsElapsed = 0;
        clearInterval(timerInterval);
        if (timed) {
            timerDisplay.style.visibility = 'visible';
            startTimer();
        } else {
            timerDisplay.style.visibility = 'hidden';
        }
    }

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
                alert("Time's up!");
                endTest();
            }
        }, 1000);
    }

    function endTest() {
        clearInterval(timerInterval);
        calculateResults();
        showPage('results-page');
    }

    // --- UI RENDERING ---

    function renderReadingPassages() {
        let passageHTML = '';
        currentTest.sections.forEach((section, index) => {
            passageHTML += `<div id="section-passage-${index+1}">`;
            passageHTML += `<h3>Reading Section ${index + 1}</h3>`;
            passageHTML += section.readingPassage;
            passageHTML += `</div>`;
        });
        readingPanel.innerHTML = passageHTML;
    }

    function renderQuestions() {
        let questionHTML = '';
        let questionCounter = 0;
        currentTest.sections.forEach((section, secIndex) => {
            questionHTML += `<h3 id="section-questions-${secIndex+1}">Section ${secIndex + 1}</h3>`;
            section.questionGroups.forEach(group => {
                questionHTML += `<div class="question-group">`;
                questionHTML += `<div class="instructions">${group.instructions}</div>`;
                group.questions.forEach(q => {
                    const qIndex = questionCounter;
                    questionHTML += `<div class="question" id="q-${qIndex}">`;
                    questionHTML += `<p><strong>${qIndex + 1}.</strong> ${q.questionText || ''}</p>`;
                    
                    switch(group.type) {
                        case 'fill-in-the-blanks':
                            questionHTML += `<input type="text" id="q-input-${qIndex}" data-q-index="${qIndex}">`;
                            break;
                        case 'true-false-not-given':
                            questionHTML += `<div class="horizontal-options">`;
                            ['True', 'False', 'Not Given'].forEach(opt => {
                                questionHTML += `<div><input type="radio" name="q-${qIndex}" value="${opt}" id="q-radio-${qIndex}-${opt}" data-q-index="${qIndex}"><label for="q-radio-${qIndex}-${opt}"> ${opt}</label></div>`;
                            });
                            questionHTML += `</div>`;
                            break;
                        case 'matching':
                             questionHTML += `<select id="q-select-${qIndex}" data-q-index="${qIndex}"><option value="">Select...</option>`;
                             group.options.forEach(opt => {
                                 questionHTML += `<option value="${opt}">${opt}</option>`;
                             });
                             questionHTML += `</select>`;
                            break;
                    }
                    questionHTML += `</div>`;
                    questionCounter++;
                });
                questionHTML += `</div>`;
            });
        });
        questionsPanel.innerHTML = questionHTML;
        addAnswerListeners();
    }

    function renderNavigation() {
        let navHTML = '';
        let questionCounter = 0;
        currentTest.sections.forEach((section, index) => {
            navHTML += `<div class="nav-section"><span class="nav-section-title">Section ${index + 1}:</span>`;
            const sectionQuestions = section.questionGroups.flatMap(g => g.questions).length;
            for (let i = 0; i < sectionQuestions; i++) {
                navHTML += `<button class="nav-btn" data-q-index="${questionCounter}">${questionCounter + 1}</button>`;
                questionCounter++;
            }
            navHTML += `</div>`;
        });
        questionNavigationContainer.innerHTML = navHTML;
        addNavListeners();
        updateActiveQuestion(0);
    }

    // --- ANSWER & NAVIGATION HANDLING ---

    function addAnswerListeners() {
        questionsPanel.querySelectorAll('input, select').forEach(input => {
            const eventType = (input.type === 'text') ? 'input' : 'change';
            input.addEventListener(eventType, (e) => {
                const index = parseInt(e.target.dataset.qIndex);
                userAnswers[index] = e.target.value.trim().toLowerCase();
                document.querySelector(`.nav-btn[data-q-index="${index}"]`).classList.add('answered');
            });
        });
    }
    
    function addNavListeners() {
        questionNavigationContainer.querySelectorAll('.nav-btn').forEach(btn => {
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

    // --- RESULTS PAGE LOGIC ---
    
    function calculateResults() {
        let score = 0;
        const allQuestions = currentTest.sections.flatMap(s => s.questionGroups.flatMap(g => g.questions));
        userAnswers.forEach((answer, index) => {
            const correctAnswers = allQuestions[index].answer.map(a => a.toLowerCase());
            if (answer && correctAnswers.includes(answer)) {
                score++;
            }
        });

        finalScoreEl.textContent = `${score} / 40`;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timeTakenEl.textContent = isTimed ? `${60 - minutes - 1}m ${60 - seconds}s remaining` : `${minutes}m ${seconds}s`;
        
        bandScoreEl.textContent = getBandScore(score, currentTest.type);
        renderReview(allQuestions);
    }
    
    function getBandScore(score, testType) {
        const gtBands = { 40: "9.0", 39: "8.5", 38: "8.0", 37: "7.5", 36: "7.0", 34: "6.5", 32: "6.0", 30: "5.5", 27: "5.0", 23: "4.5", 19: "4.0", 15: "3.5" };
        const acBands = { 40: "9.0", 39: "8.5", 37: "8.0", 35: "7.5", 32: "7.0", 30: "6.5", 27: "6.0", 23: "5.5", 19: "5.0", 15: "4.5", 13: "4.0", 10: "3.5" };

        const bands = testType === 'General Training' ? gtBands : acBands;
        let band = "Below 3.5";
        const sortedScores = Object.keys(bands).map(Number).sort((a, b) => b - a);
        for (const s of sortedScores) {
            if (score >= s) {
                band = bands[s];
                break;
            }
        }
        return band;
    }

    function renderReview(allQuestions) {
        let passageHTML = '';
        currentTest.sections.forEach((section, index) => {
            passageHTML += `<h3>Reading Section ${index + 1}</h3>`;
            let sectionPassage = section.readingPassage;
            section.questionGroups.flatMap(g => g.questions).forEach((q) => {
                const globalIndex = allQuestions.indexOf(q);
                if (q.evidence) {
                    sectionPassage = sectionPassage.replace(q.evidence, `<mark id="evidence-${globalIndex}">${q.evidence}</mark>`);
                }
            });
            passageHTML += sectionPassage;
        });
        resultsReadingPanel.innerHTML = passageHTML;

        let reviewHTML = '<h3>Answer Review</h3>';
        allQuestions.forEach((q, index) => {
            const userAnswer = userAnswers[index] || "No Answer";
            const correctAnswers = q.answer;
            const isCorrect = correctAnswers.map(a => a.toLowerCase()).includes(userAnswer);

            reviewHTML += `<div class="review-item" data-evidence-id="evidence-${index}">`;
            reviewHTML += `<p><strong>Question ${index + 1}:</strong> ${q.questionText || q.instruction}</p>`;
            reviewHTML += `<p>Your Answer: <span class="${isCorrect ? 'correct-answer' : 'incorrect-answer'}">${userAnswer}</span></p>`;
            if (!isCorrect) {
                 reviewHTML += `<p>Correct Answer: <span class="correct-answer">${correctAnswers.join(' / ')}</span></p>`;
            }
            reviewHTML += `<div class="explanation"><p><strong>Explanation:</strong> ${q.explanation}</p></div>`;
            reviewHTML += `</div>`;
        });
        reviewContainer.innerHTML = reviewHTML;

        reviewContainer.querySelectorAll('.review-item').forEach(item => {
            item.addEventListener('click', () => {
                const evidenceId = item.dataset.evidenceId;
                const evidenceEl = resultsReadingPanel.querySelector(`#${evidenceId}`);
                if (evidenceEl) {
                    evidenceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    // --- HIGHLIGHTER LOGIC ---

    readingPanel.addEventListener('mouseup', (e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (selectedText.length > 0 && !dictionaryModal.contains(e.target)) {
            highlighterToolbar.style.left = `${e.pageX}px`;
            highlighterToolbar.style.top = `${e.pageY - 40}px`;
            highlighterToolbar.classList.remove('hidden');
        } else {
            highlighterToolbar.classList.add('hidden');
        }
    });
    
    document.addEventListener('mousedown', (e) => {
        if (!highlighterToolbar.contains(e.target) && !readingPanel.contains(e.target)) {
            highlighterToolbar.classList.add('hidden');
        }
    });

    highlighterToolbar.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', () => {
            highlighterToolbar.querySelector('.active').classList.remove('active');
            box.classList.add('active');
            activeHighlightColor = box.dataset.color;
            applyHighlight(activeHighlightColor);
        });
    });

    eraserBtn.addEventListener('click', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let parent = selection.getRangeAt(0).commonAncestorContainer;
            if (parent.nodeType !== 1) parent = parent.parentNode;
            if (parent.classList.contains('highlight')) {
                const text = document.createTextNode(parent.innerHTML);
                parent.parentNode.replaceChild(text, parent);
                window.getSelection().removeAllRanges();
                highlighterToolbar.classList.add('hidden');
            }
        }
    });

    function applyHighlight(color) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = `highlight ${color}`;
            span.appendChild(range.extractContents());
            range.insertNode(span);
        }
        selection.removeAllRanges();
        highlighterToolbar.classList.add('hidden');
    }
    
    // --- DICTIONARY & PHRASEBOOK LOGIC ---
    
    readingPanel.addEventListener('dblclick', (e) => {
        if (isTimed) return;
        const selectedText = window.getSelection().toString().trim().toLowerCase();
        if (selectedText.length > 2 && selectedText.length < 30) {
            const definition = sampleDictionary[selectedText];
            if (definition) {
                document.getElementById('selected-text').textContent = selectedText;
                document.getElementById('en-definition').textContent = definition.en;
                document.getElementById('vn-translation').textContent = definition.vn;
                dictionaryModal.classList.remove('hidden');
            }
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => dictionaryModal.classList.add('hidden'));

    document.getElementById('add-to-phrasebook-btn').addEventListener('click', () => {
        const text = document.getElementById('selected-text').textContent;
        if (text && !phrasebook.includes(text)) {
            phrasebook.push(text);
            localStorage.setItem('ieltsPhrasebook', JSON.stringify(phrasebook));
            alert(`'${text}' added to your phrasebook.`);
        }
        dictionaryModal.classList.add('hidden');
    });
    
    phrasebookBtn.addEventListener('click', () => {
        const list = document.getElementById('phrasebook-list');
        list.innerHTML = '';
        if (phrasebook.length > 0) {
            phrasebook.forEach(word => {
                const div = document.createElement('div');
                div.textContent = word;
                list.appendChild(div);
            });
        } else {
            list.innerHTML = '<p>Your phrasebook is empty.</p>';
        }
        phrasebookModal.classList.remove('hidden');
    });
    
    document.getElementById('close-phrasebook-btn').addEventListener('click', () => phrasebookModal.classList.add('hidden'));
    document.getElementById('clear-phrasebook-btn').addEventListener('click', () => {
        if(confirm('Are you sure you want to clear your entire phrasebook?')) {
            phrasebook = [];
            localStorage.removeItem('ieltsPhrasebook');
            document.getElementById('phrasebook-list').innerHTML = '<p>Your phrasebook is empty.</p>';
        }
    });


    // --- PANEL RESIZER LOGIC ---
    function enableResizer(resizerEl, panel1, panel2) {
        let isResizing = false;
        resizerEl.addEventListener('mousedown', () => { isResizing = true; });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const container = resizerEl.parentElement;
            const totalWidth = container.offsetWidth;
            const leftPanelWidth = e.clientX - container.offsetLeft;
            const leftPercentage = (leftPanelWidth / totalWidth) * 100;
            if (leftPercentage > 20 && leftPercentage < 80) {
                panel1.style.flex = `${leftPercentage}%`;
                panel2.style.flex = `${100 - leftPercentage}%`;
            }
        });
        document.addEventListener('mouseup', () => { isResizing = false; });
    }
    enableResizer(document.getElementById('resizer'), readingPanel, questionsPanel);
    enableResizer(document.getElementById('results-resizer'), resultsReadingPanel, reviewContainer);
});
