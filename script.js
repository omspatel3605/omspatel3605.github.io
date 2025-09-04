document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const gameContainer = document.getElementById('game-container');
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
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

    // --- Game State Variables ---
    let currentPuzzle = 0;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerInterval;
    let hintsRemaining = 3;
    let livesRemaining = 5;

    // --- Puzzle Data (CORRECTED AND FINAL) ---
    const puzzles = [
        {
    // Puzzle 1: Hieroglyph Cipher
    html: `
    <div class="puzzle">
        <h2>Puzzle 1: The Hieroglyph Cipher</h2>
        <p class="puzzle-text">A papyrus scroll with a substitution cipher (Shift “-3”):</p>
        <p class="cipher-text">"WKH VXQ PDVNHV WKH WUXWK, EXW WKH S\UDPLG SRLQWV WKH ZDB."</p>
        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the decoded phrase">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "THE SUN MASKS THE TRUTH, BUT THE PYRAMID POINTS THE WAY",
    hint: "Think of ancient shifts."
},
{
    // Puzzle 2: The Scarab Math Puzzle
    html: `
    <div class="puzzle">
        <h2>Puzzle 2: The Scarab Math Puzzle</h2>
        <p class="puzzle-text">Sacred inscriptions reveal equations:</p>
        <div class="cipher-text" style="font-size: 1.8rem; line-height: 1.5;">
            <p>🪲 + 🪲 = 10</p>
            <p>🪲 × 🌞 = 30</p>
            <p>🌞 – 🪲 = 5</p>
        </div>
        <input type="number" id="puzzle-input" class="puzzle-input" placeholder="Enter the code">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "510", // Scarab=5, Sun=10
    hint: "Treat them as numbers."
},
{
    // Puzzle 3: Riddle of the Sphinx
    html: `
    <div class="puzzle">
        <h2>Puzzle 3: Riddle of the Sphinx</h2>
        <p class="puzzle-text">The great Sphinx challenges you with a riddle:</p>
        <blockquote class="riddle-text">"I walk on four in the morning, two in the day, and three at night. What am I?"</blockquote>
        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter your answer">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "HUMAN",
    hint: "The Sphinx guards the answer."
},
{
    // Puzzle 4: The Polybius Mystery
    html: `
    <div class="puzzle">
        <h2>Puzzle 4: The Polybius Mystery</h2>
        <p class="puzzle-text">Numbers carved into the stone:</p>
        <p class="cipher-text">43 35 23 24 33 53</p>
        <p class="puzzle-text">Each pair points to a row and column in a Polybius square (I/J combined).</p>
        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the decoded word">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "SPHINX",
    hint: "Each pair of numbers points to a row and column in a 5x5 grid."
}

];

    // --- Core Game Functions ---
    function showScreen(screen) {
        startScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        winScreen.classList.add('hidden');
        loseScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    }

    function startGame() {
        currentPuzzle = 0;
        timeLeft = 25 * 60;
        hintsRemaining = 3;
        livesRemaining = 5;
        hintButton.disabled = false;
        hintButton.style.opacity = '1';
        hintButton.style.cursor = 'pointer';
        updateHintDisplay();
        updateLivesDisplay();
        hintBox.classList.add('hidden');
        hintBox.textContent = '';
        showScreen(gameScreen);
        loadPuzzle(currentPuzzle);
        startTimer();
    }

    function loadPuzzle(puzzleIndex) {
        puzzleContainer.innerHTML = ''; // Clear previous puzzle
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
            gameWon();
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
        timerDisplay.textContent = `${minutes}:${seconds}`;
        if (timeLeft <= 30) {
            timerDisplay.style.color = timeLeft % 2 === 0 ? '#E74C3C' : '#F1C40F';
        } else {
            timerDisplay.style.color = 'var(--accent-color)';
        }
    }

    // --- Puzzle Logic Functions ---
    function checkAnswer() {
        const inputField = document.getElementById('puzzle-input');
        const userAnswer = inputField.value.trim().toUpperCase();
        const correctAnswer = puzzles[currentPuzzle].answer.toUpperCase();

        if (userAnswer === correctAnswer) {
            currentPuzzle++;
            hintBox.classList.add('hidden');
            loadPuzzle(currentPuzzle);
        } else {
            livesRemaining--;
            updateLivesDisplay();
            
            gameContainer.classList.add('shake');
            // Use a more specific selector if needed, but this should work
            inputField.style.borderBottom = '2px solid #E74C3C'; // Red for error
            setTimeout(() => {
                gameContainer.classList.remove('shake');
                inputField.style.borderBottom = '0.125rem solid var(--primary-color)'; // Revert to original
            }, 500);

            if (livesRemaining <= 0) {
                gameOver();
            }
        }
    }

    // --- Hint & Lives System Functions ---
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

    // --- Game Over/Win Functions ---
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
