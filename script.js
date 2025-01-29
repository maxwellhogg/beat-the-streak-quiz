document.addEventListener("DOMContentLoaded", () => {
    const questionElement = document.getElementById("question");
    const answerButtons = document.getElementById("answer-buttons");
    const nextButton = document.getElementById("next-question");
    const bankButton = document.getElementById("bank-points");
    const restartButton = document.getElementById("restart-game");
    const quitButton = document.getElementById("quit-game");
    const timerElement = document.getElementById("timer");
    const questionNumberElement = document.getElementById("question-number");
    
    const player1 = {
        element: document.getElementById("player1"),
        currentScore: document.getElementById("player1-current-score"),
        streak: document.getElementById("player1-streak-length"),
        overallScore: document.getElementById("player1-overall-score"),
        isActive: true
    };
    
    const player2 = {
        element: document.getElementById("player2"),
        currentScore: document.getElementById("player2-current-score"),
        streak: document.getElementById("player2-streak-length"),
        overallScore: document.getElementById("player2-overall-score"),
        isActive: false
    };

    let questions = [];
    let currentQuestionIndex = 0;
    let timer;
    let questionCount = 0;

    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function initializeGame() {
        questionElement.textContent = "Build up your streak to beat your opponent. Click NEXT QUESTION to begin.";
        answerButtons.style.display = "none";

        // Reset player styles
        player1.element.classList.remove("winner", "loser");
        player2.element.classList.remove("winner", "loser");

        fetchQuestions();
        resetPlayers();
    }

	function fetchQuestions() {
    	if (typeof window.questions === "undefined" || !Array.isArray(window.questions) || window.questions.length === 0) {
       	 	return;
    	}

    	questions = shuffleArray([...window.questions]);
	}

    function resetPlayers() {
        player1.isActive = true;
        player2.isActive = false;
        updatePlayerUI();
        updateScores(player1, 0, 0, 0);
        updateScores(player2, 0, 0, 0);
        questionCount = 0;
    }

    function updatePlayerUI() {
        if (player1.isActive) {
            player1.element.style.border = "6px solid rgb(39, 203, 39)";
            player2.element.style.border = "6px solid #bddff0";
        } else {
            player2.element.style.border = "6px solid rgb(39, 203, 39)";
            player1.element.style.border = "6px solid #bddff0";
        }
    }

    function updateScores(player, currentScore, streak, overallScore) {
        player.currentScore.textContent = currentScore;
        player.streak.textContent = streak;
        player.overallScore.textContent = overallScore;
    }
	
    function startTimer() {
        let timeLeft = 30; // Reset timer to 30 seconds
        timerElement.textContent = timeLeft;

        // Stop any existing timer to avoid overlapping intervals
        clearInterval(timer);

        // Start a new timer only if questions are being answered
        timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft === 0) {
                clearInterval(timer);
                handleTimeOut(); // Trigger timeout logic when the timer reaches 0
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
        timerElement.textContent = ""; // Clear the timer display
    }
	
	function handleTimeOut() {
    	const activePlayer = player1.isActive ? player1 : player2;

    // Reset current score and streak
    	updateScores(activePlayer, 0, 0, parseInt(activePlayer.overallScore.textContent));

    // Display timeout message
    	questionElement.textContent = `You ran out of time and lost your streak! ${player1.isActive ? "Player 2" : "Player 1"} must click NEXT QUESTION to begin a new streak!!`;

    // Switch active player
    	switchPlayer();

    // Ensure answer buttons are hidden until NEXT QUESTION is clicked
    	answerButtons.style.display = "none";
	}

    function stopTimer() {
        clearInterval(timer);
    }

    function showNextQuestion() {
        if (isGameOver()) {
            endGame();
            return;
        }

        resetButtonFlashing(); // Clear flashing effects and re-enable buttons
        answerButtons.style.display = "grid";

        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;

        const shuffledAnswers = shuffleArray([
            { text: currentQuestion.option1, correct: currentQuestion.answer === 1 },
            { text: currentQuestion.option2, correct: currentQuestion.answer === 2 },
            { text: currentQuestion.option3, correct: currentQuestion.answer === 3 },
            { text: currentQuestion.option4, correct: currentQuestion.answer === 4 }
        ]);

        answerButtons.innerHTML = "";
        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.classList.add("answer-button");
            button.textContent = answer.text;
            button.dataset.correct = answer.correct ? "true" : "false";
            button.dataset.index = index;
            button.addEventListener("click", () => handleAnswer(answer.correct, button));
            answerButtons.appendChild(button);
        });

        // Disable bank button at the start of a new question
        bankButton.disabled = true;

        startTimer(); // Start the timer only when a question is actively being answered
        questionNumberElement.textContent = ++questionCount;
        currentQuestionIndex++;
    }

    function handleAnswer(isCorrect, selectedButton) {
        stopTimer();

        // Identify the correct button explicitly
        const correctButton = Array.from(answerButtons.children).find(
            button => button.dataset.correct === "true"
        );

        // Clear previous flashing
        resetButtonFlashing();

        // Flash the correct answer green
        correctButton.classList.add("flash-green");

        if (isCorrect) {
            selectedButton.classList.add("flash-green");
            const activePlayer = player1.isActive ? player1 : player2;
            activePlayer.streak.textContent = parseInt(activePlayer.streak.textContent) + 1;
            activePlayer.currentScore.textContent = parseInt(activePlayer.currentScore.textContent) + 10;

            // Enable bank button after a correct answer
            bankButton.disabled = false;
        } else {
            selectedButton.classList.add("flash-red");
            
            // Reset current score and streak of the previous active player
            const activePlayer = player1.isActive ? player1 : player2;
            updateScores(activePlayer, 0, 0, parseInt(activePlayer.overallScore.textContent));

            // Display incorrect answer message
            const nextPlayer = player1.isActive ? "Player 2" : "Player 1";
            questionElement.textContent = `Wrong answer!! ${nextPlayer} must click NEXT QUESTION to start a new streak!!`;

            // Disable bank button after an incorrect answer
            bankButton.disabled = true;

            // Switch player
            switchPlayer();
        }

        // Disable all buttons to prevent further interactions
        Array.from(answerButtons.children).forEach(button => {
            button.disabled = true;
        });
    }
        
    function resetButtonFlashing() {
        Array.from(answerButtons.children).forEach(button => {
            button.classList.remove("flash-green", "flash-red");
            button.disabled = false; // Re-enable buttons for the next question
        });
    }

        function handleIncorrectAnswer() {
            switchPlayer();
            showNextQuestion();
        }

        function switchPlayer() {
            player1.isActive = !player1.isActive;
            player2.isActive = !player2.isActive;
            updatePlayerUI();
        }

    function handleBankPoints() {
        if (bankButton.disabled) {
            alert("You cannot bank points at this time! You must answer a question correctly first.");
            return;
        }

        const activePlayer = player1.isActive ? player1 : player2;
        activePlayer.overallScore.textContent =
            parseInt(activePlayer.overallScore.textContent) +
            parseInt(activePlayer.currentScore.textContent) * parseInt(activePlayer.streak.textContent);
        updateScores(activePlayer, 0, 0, parseInt(activePlayer.overallScore.textContent));

        // Reset bank button after banking points
        bankButton.disabled = true;

        switchPlayer();
    }

    function isGameOver() {
        const player1Score = parseInt(player1.overallScore.textContent);
        const player2Score = parseInt(player2.overallScore.textContent);

        // Determine leading and trailing players
        const leadingPlayerScore = Math.max(player1Score, player2Score);
        const trailingPlayerScore = Math.min(player1Score, player2Score);

        // Calculate remaining questions
        const remainingQuestions = 250 - questionCount;

        // Calculate maximum possible points from streaks
        // Total points for a perfect streak of N questions: 10 * (1 + 2 + ... + N) = 10 * (N * (N + 1)) / 2 -- May need to look at this again
        const maxPossiblePoints = 10 * (remainingQuestions * (remainingQuestions + 1)) / 2;

        // Check if the trailing player can mathematically overtake the leader
        const canCatchUp = trailingPlayerScore + maxPossiblePoints >= leadingPlayerScore;

        // End the game only if all questions are answered or catching up is impossible
        return questionCount >= 250 || !canCatchUp;
    }

    function endGame() {
        stopTimer(); // Stop the timer
        answerButtons.style.display = "none"; // Hide answer buttons

        const player1Score = parseInt(player1.overallScore.textContent);
        const player2Score = parseInt(player2.overallScore.textContent);

        if (player1Score > player2Score) {
            player1.element.classList.add("winner");
            player2.element.classList.add("loser");
            questionElement.textContent = `Game Over! Player 1 wins with ${player1Score} points!`;
        } else {
            player2.element.classList.add("winner");
            player1.element.classList.add("loser");
            questionElement.textContent = `Game Over! Player 2 wins with ${player2Score} points!`;
        }
    }

        nextButton.addEventListener("click", showNextQuestion);
        bankButton.addEventListener("click", handleBankPoints);
        restartButton.addEventListener("click", () => {
            stopTimer(); // Stop the timer
            initializeGame(); // Reset the game state
        });
        quitButton.addEventListener("click", () => {
            stopTimer(); // Stop the timer
            questionElement.textContent = "You have chosen to quit the game. Click RESTART GAME to try again.";
            answerButtons.style.display = "none"; // Hide answer buttons

        // Reset player styles
            player1.element.classList.remove("winner", "loser");
            player2.element.classList.remove("winner", "loser");
        });

        initializeGame();
    
});

// ------------ FIX --------------
// Clicking next question allows player to skip questions and still retain their streak. Button must be disabled during active question