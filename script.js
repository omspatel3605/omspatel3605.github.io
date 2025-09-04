document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const chestScreen = document.getElementById('chest-screen');
    const winScreen = document.getElementById('win-screen');
    const loseScreen = document.getElementById('lose-screen');

    const startButton = document.getElementById('start-button');
    const restartButtonWin = document.getElementById('restart-button-win');
    const restartButtonLose = document.getElementById('restart-button-lose');

    const timerDisplay = document.getElementById('timer-display');
    const puzzleContainer = document.getElementById('puzzle-container');
    const hintButton = document.getElementById('hint-button');
    const hintDisplay = document.getElementById('hint-display');
    const hintBox = document.getElementById('hint-box');
    const livesDisplay = document.getElementById('lives-display');
    const lockDisplay = document.getElementById('lock-display');

    let currentPuzzle = 0;
    let timeLeft = 30 * 60;
    let timerInterval;
    let hintsRemaining = 3;
    let livesRemaining = 5;
    let chestCodeProgress = ["_", "_", "_", "_"];
    const chestCodeParts = ["7", "510", "5", "6"];

    const puzzles = [
        {
            html: `
                <div class="puzzle">
                    <h2>Puzzle 1: The Hieroglyph Cipher</h2>
                    <p class="puzzle-text">A papyrus scroll with a substitution cipher (Shift “-3”):</p>
                    <p class="cipher-text">"WKH VXQ PDVNHV WKH WUXWK, EXW WKH S\UDPLG SRLQWV WKH ZDB."</p>
                    <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the keyword">
                    <button class="btn submit-btn">Submit Answer</button>
                </div>
            `,
            answer: "PYRAMID",
            codePart: "7",
            hint: "Think of ancient shifts."
        },
        {
            html: `
                <div class="puzzle">
                    <h2>Puzzle 2: The Scarab Math Puzzle</h2>
                    <p class="puzzle-text">Sacred inscriptions reveal equations:</p>
                    <div class="cipher-text" style="font-size: 1.8rem; line-height: 1.5;">
                        <p>🪲 + 🪲 = 10</p>
                        <p>🪲 × 🌞 = 50</p>
                        <p>🌞 – 🪲 = 5</p>
                    </div>
                    <input type="number" id="puzzle-input" class="puzzle-input" placeholder="Enter the code">
                    <button class="btn submit-btn">Submit Answer</button>
                </div>
            `,
            answer: "510",
            codePart: "510",
            hint: "Treat them as numbers."
        },
        {
            html: `
                <div class="puzzle">
                    <h2>Puzzle 3: The Riddle of the Sphinx</h2>
                    <p class="puzzle-text">The great Sphinx challenges you:</p>
                    <blockquote class="riddle-text">"I walk on four in the morning, two in the day, and three at night. What am I?"</blockquote>
                    <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter your answer">
                    <button class="btn submit-btn">Submit Answer</button>
                </div>
            `,
            answer: "HUMAN",
            codePart: "5",
            hint: "The Sphinx guards the answer."
        },
        {
            html: `
                <div class="puzzle">
                    <h2>Puzzle 4: The Polybius Mystery</h2>
                    <p class="puzzle-text">Numbers carved into the stone:</p>
                    <p class="cipher-text">43 35 23 24 33 53</p>
                    <p class="puzzle-text">Each pair points to a row and column in a Polybius square (I/J combined).</p>
                    
                    <table class="polybius-table">
                        <tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
                        <tr><th>1</th><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td></tr>
                        <tr><th>2</th><td>F</td><td>G</td><td>H</td><td>I/J</td><td>K</td></tr>
                        <tr><th>3</th><td>L</td><td>M</td><td>N</td><td>O</td><td>P</td></tr>
                        <tr><th>4</th><td>Q</td><td>R</td><td>S</td><td>T</td><td>U</td></tr>
                        <tr><th>5</th><td>V</td><td>W</td><td>X</td><td>Y</td><td>Z</td></tr>
                    </table>

                                        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the decoded word">
                    <button class="btn submit-btn">Submit Answer</button>
                </div>
            `,
            answer: "SPHINX",
            codePart: "6",
            hint: "Each pair of numbers points to a row and column in the 5x5 grid."
        }
    ];

    // --- Screen Handling ---
    function showScreen(screen) {
        startScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        chestScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        loseScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    }

    // --- Start Game ---
    function startGame() {
        currentPuzzle = 0;
        timeLeft = 30 * 60;
        hintsRemaining = 3;
        livesRemaining = 5;
        chestCodeProgress = ["_", "_", "_", "_"];
        updateLockDisplay();
        updateHintDisplay();
        updateLivesDisplay();
        hintBox.classList.add('hidden');
        hintBox.textContent = '';
        showScreen(gameScreen);
        loadPuzzle(currentPuzzle);
        startTimer();
    }

    // --- Load Puzzle ---
    function loadPuzzle(puzzleIndex) {
        puzzleContainer.innerHTML = ''; 
        if (puzzleIndex < puzzles.length) {
            puzzleContainer.innerHTML = puzzles[puzzleIndex].html;
            const submitButton = puzzleContainer.querySelector('.submit-btn');
            const inputField = puzzleContainer.querySelector('#puzzle-input');
            
            submitButton.addEventListener('click', checkAnswer);
            inputField.addEventListener('keyup', function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    submitButton.click();
                }
            });
            inputField.focus();
        } else {
            // Instead of auto-winning → go to chest screen
            showScreen(chestScreen);
        }
    }

    // --- Timer Functions ---
    function startTimer() {
        clearInterval(timerInterval);
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                timeLeft = 0;
                updateTimerDisplay();
                gameOver();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        timerDisplay.textContent = `Time Left: ${minutes}:${seconds}`;
    }

    // --- Puzzle Checking ---
    function checkAnswer() {
        const inputField = document.getElementById('puzzle-input');
        const userAnswer = inputField.value.trim().toUpperCase();
        const correctAnswer = puzzles[currentPuzzle].answer.toUpperCase();

        if (userAnswer === correctAnswer) {
            chestCodeProgress[currentPuzzle] = puzzles[currentPuzzle].codePart;
            updateLockDisplay();

            currentPuzzle++;
            hintBox.classList.add('hidden');
            loadPuzzle(currentPuzzle);
        } else {
            livesRemaining--;
            updateLivesDisplay();

            gameContainer.classList.add('shake');
            inputField.style.borderBottom = '2px solid #E74C3C'; 
            setTimeout(() => {
                gameContainer.classList.remove('shake');
                inputField.style.borderBottom = '0.125rem solid var(--primary-color)'; 
            }, 500);

            if (livesRemaining <= 0) {
                gameOver();
            }
        }
    }

    // --- Hint & Lives ---
    function showHint() {
        if (hintsRemaining > 0) {
            hintBox.textContent = puzzles[currentPuzzle].hint;
            hintBox.classList.remove('hidden');
            hintsRemaining--;
            updateHintDisplay();
            if (hintsRemaining === 0) {
                hintButton.disabled = true;
                hintButton.style.opacity = '0.5';
                hintButton.style.cursor = 'not-allowed';
            }
        }
    }

    function updateHintDisplay() {
        hintDisplay.textContent = `Hints Left: ${hintsRemaining}`;
    }

    function updateLivesDisplay() {
        livesDisplay.textContent = '❤️'.repeat(livesRemaining);
    }

    function updateLockDisplay() {
        lockDisplay.textContent = chestCodeProgress.join(" - ");
    }

    // --- Final Chest Unlock ---
    document.getElementById('final-code-submit').addEventListener('click', () => {
        const boxes = document.querySelectorAll('.code-box');
        const inputCode = Array.from(boxes).map(b => b.value.trim()).join("");
        const chestEl = document.querySelector('.chest');

        if (inputCode === "751056") {
            chestEl.classList.add('rumble');
            setTimeout(() => {
                chestEl.classList.remove('rumble');
                chestEl.classList.add('open');
                setTimeout(gameWon, 2500);
            }, 1000);
        } else {
            gameContainer.classList.add('shake');
            setTimeout(() => gameContainer.classList.remove('shake'), 500);
        }
    });

    // Auto move to next box when typing
    document.querySelectorAll('.code-box').forEach((box, i, arr) => {
        box.addEventListener('input', () => {
            box.value = box.value.replace(/[^0-9]/g, ''); // only digits
            if (box.value.length === 1 && i < arr.length - 1) {
                arr[i + 1].focus();
            }
        });
    });



    // --- Game End ---
    function gameWon() {
        clearInterval(timerInterval);
        showScreen(winScreen);
    }

    function gameOver() {
        clearInterval(timerInterval);
        showScreen(loseScreen);
    }
    
    // --- Event Listeners ---
    startButton.addEventListener('click', startGame);
    restartButtonWin.addEventListener('click', startGame);
    restartButtonLose.addEventListener('click', startGame);
    hintButton.addEventListener('click', showHint);
});

