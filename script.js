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
    const livesDisplay = document.getElementById('lives-display'); // New element reference

    // --- Game State Variables ---
    let currentPuzzle = 0;
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerInterval;
    let hintsRemaining = 3;
    let livesRemaining = 5; // New state for lives

    // --- Puzzle Data (Expanded & More Challenging) ---
    const puzzles = [
        {
        html: `
        <div id="puzzle-1" class="puzzle">
            <h2>Trial 1: The Hieroglyph Cipher</h2>
            <p class="puzzle-text">An ancient papyrus scroll reveals a coded message. The inscription whispers of an ancient Roman shift...</p>
            <p class="cipher-text">"Wkh vxq pdvnhv wkh wuxwk, exw wkh sludp<span class="highlight">LG</span> sr<span class="highlight">L</span>qwv wkh zdb."</p>
            <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the key word">
            <button class="btn submit-btn">Submit Answer</button>
        </div>
        `,
        answer: "PYRAMID",   // Caesar shift key solution
        hint: "Think about Caesar’s cipher — shift the letters back by 3."
},
{
    // Puzzle 2: Symbol Math (Logic)
    html: `
    <div class="puzzle">
        <h2>Trial 2: The Scarab's Value</h2>
        <p class="puzzle-text">The next chamber is sealed by a numerical lock. An inscription on the wall shows three equations using sacred symbols.</p>
        <div class="cipher-text" style="font-size: 1.8rem; line-height: 1.5;">
            <p>𓋹 + 𓋹 + 𓋹 = 21</p>
            <p>𓂀 × 𓋹 = 49</p>
            <p>𓂀 - 𓆣 = 𓋹</p>
        </div>
        <p class="puzzle-text">What is the three-digit code from the values of 𓋹 (Ankh), 𓂀 (Eye of Horus), and 𓆣 (Scarab)?</p>
        <input type="number" id="puzzle-input" class="puzzle-input" placeholder="Enter the 3-digit code">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "770", // Ankh=7, Eye=7, Scarab=0
    hint: "Solve the equations from top to bottom. The first line reveals the value of the Ankh (𓋹)."
},
{
    // Puzzle 3: Riddle (Lateral Thinking)
    html: `
    <div class="puzzle">
        <h2>Trial 3: Riddle of the Sphinx</h2>
        <p class="puzzle-text">A great stone Sphinx blocks your path. Its voice echoes in your mind, not with a question of creatures, but of existence.</p>
        <blockquote class="riddle-text">"I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?"</blockquote>
        <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter your answer">
        <button class="btn submit-btn">Submit Answer</button>
    </div>
    `,
    answer: "MAP",
    hint: "Think about representations of the real world, not the world itself."
},
{
        html: `
        <div id="puzzle-3" class="puzzle">
            <h2>Trial 3: The Riddle of the Sphinx</h2>
            <p class="puzzle-text">A statue of a great Sphinx blocks the path. Its stone lips speak a single, timeless riddle.</p>
            <blockquote class="riddle-text">"I walk on four feet in the morning, two in the afternoon, and three in the evening. What am I?"</blockquote>
            <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter your answer">
            <button class="btn submit-btn">Submit Answer</button>
        </div>
        `,
        answer: "HUMAN",
        hint: "Think of life stages: crawling, walking, cane."
},
{
  html: `
  <div class="puzzle">
    <h2>Final Trial: The Pharaoh's Lock</h2>

    <p class="puzzle-text">
      A heavy bronze plaque hangs over the final gate. Four carved lines read:
    </p>

    <div class="cipher-text" style="font-size:1.05rem; line-height:1.5;">
      <p>1. I am a wartime shelter, dug out of earth and line of sight.</p>
      <p>2. Take letters <b>1, 3, and 4</b> of my name — they spell a number.</p>
      <p>3. Add the letter <b>I</b> to my last three letters and you get a common unit of length.</p>
      <p>4. I guard the approach; to pass you must go <em>through</em> me.</p>
    </div>

    <p class="puzzle-text">Enter the six-letter password to unlock the gate.</p>

    <input type="text" id="puzzle-input" class="puzzle-input" placeholder="Enter the final password">
    <button class="btn submit-btn">Submit Answer</button>
  </div>
  `,
  answer: "TRENCH",
  hint: "Letters 1,3,4 = T, E, N → a number. Last three letters + 'I' → INCH."
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
        livesRemaining = 5; // Reset lives on start
        hintButton.disabled = false;
        hintButton.style.opacity = '1';
        hintButton.style.cursor = 'pointer';
        updateHintDisplay();
        updateLivesDisplay(); // Update display on start
        hintBox.classList.add('hidden');
        hintBox.textContent = '';
        showScreen(gameScreen);
        loadPuzzle(currentPuzzle);
        startTimer();
    }

    function loadPuzzle(puzzleIndex) {
        if (puzzleIndex < puzzles.length) {
            puzzleContainer.innerHTML = puzzles[puzzleIndex].html;
            const submitButton = puzzleContainer.querySelector('.submit-btn');
            submitButton.addEventListener('click', checkAnswer);
            const inputField = puzzleContainer.querySelector('#puzzle-input');
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
            livesRemaining--; // Decrement lives on wrong answer
            updateLivesDisplay(); // Update the display
            
            gameContainer.classList.add('shake');
            inputField.style.border = '2px solid var(--accent-color)';
            setTimeout(() => {
                gameContainer.classList.remove('shake');
                inputField.style.border = '2px solid var(--primary-color)';
            }, 500);

            if (livesRemaining <= 0) { // Check if game is over
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

    // New function to update lives display
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
