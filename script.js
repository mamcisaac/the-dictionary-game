document.addEventListener("DOMContentLoaded", function() {
    const clueList = document.getElementById("clue-list");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    const clueButton = document.getElementById("clue-button");
    const giveUpButton = document.getElementById("give-up-button");
    const startGameButton = document.getElementById("start-game-button");
    const inputContainer = document.getElementById("input-container");
		const messageDisplay = document.getElementById("message");



    // Event listener for pressing 'Enter' in the guess input
    guessInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && gameStarted) {
            event.preventDefault(); // Avoid form submission or other default actions
            handleGuess();
        }
    });

		let lettersRevealed = 1; 
    let currentClueIndex = 0;
    let puzzleData = null;
    let gameStarted = false;
    let cluesGiven = [];

    // Initially hide the input container until the game starts
    inputContainer.style.display = "none";

    async function fetchPuzzle() {
        const response = await fetch("puzzle.json");
        puzzleData = await response.json();
        var randomIndex = Math.floor(Math.random() * puzzleData.length);

        puzzleData = puzzleData[randomIndex]; // For this example, we're using the first puzzle
    }

function getNextClue() {
    if (currentClueIndex >= puzzleData.definitions.length || currentClueIndex > 2) {
        if (cluesGiven.includes('synonyms') === false && puzzleData.synonyms.length > 0) {
            cluesGiven.push('synonyms');
            return `Synonyms: ${puzzleData.synonyms.join(', ')}`;
        } else if (cluesGiven.includes('antonyms') === false && puzzleData.antonyms.length > 0) {
            cluesGiven.push('antonyms');
            return `Antonyms: ${puzzleData.antonyms.join(', ')}`;
        } else if (cluesGiven.includes('example') === false && puzzleData.examples.length > 0) {
            cluesGiven.push('example');
            return `Sample sentence: ${puzzleData.examples[0]}`;
        } else if (lettersRevealed < puzzleData.word.length - 1) {
            // Increment lettersRevealed up to the first 3 letters
            lettersRevealed++;
            cluesGiven.push(`letters${lettersRevealed}`); // Ensure unique entry for each state of letters revealed
            return `The word starts with: ${puzzleData.word.substring(0, lettersRevealed)}`;
        }
    } else {
        return `Secondary Definition: ${puzzleData.definitions[currentClueIndex++]}`;
    }
    return "No more clues available.";
}

    function updateClueDisplay(newClue) {
        let clueItem = document.createElement("li");
        clueItem.textContent = newClue;
        clueList.appendChild(clueItem);
    }

function startGame() {
    gameStarted = true;
    guessButton.disabled = false;
    clueButton.disabled = false; 
		giveUpButton.disabled = false; 
		
    clueList.innerHTML = ''; // Clear the list for a new game
    inputContainer.style.display = "block"; // Show the input container
    fetchPuzzle().then(() => {
        // Display the primary definition
        // Assuming puzzleData is already fetched and contains the word and primary definition
    const firstLetter = puzzleData.word[0]; // Get the first letter of the word
    const definition = puzzleData.definitions[0]; // Get the primary definition of the word
    
    // Format the message with the first letter and primary definition
const message = `I am thinking of a word. <br>Can you guess what it is?<br><br>My word begins with the letter ${firstLetter.toUpperCase()}. <br>My word is defined as: ${definition}<br><br>`;
    
    // Display the formatted message in the primary-definition element
    document.getElementById("primary-definition").innerHTML = message;
    
    // Clear the clue list for any previous game clues and reset other UI elements as needed
    document.getElementById("clue-list").innerHTML = '';
    document.getElementById("message").innerHTML = ''; // Clear any previous messages
    
        currentClueIndex = 1; // Start from the second definition for the next clue
    });
}
    
			// Function to reset the game
			function resetGame() {
			    gameStarted = false;
			    startGameButton.style.display = "block";
			    newGameButton.style.display = "none";
			    inputContainer.style.display = "none";
			    clueList.innerHTML = '';
			    cluesGiven = [];
			    // Reset other necessary parts of your game state here
			    lettersRevealed = 1;
			}
			
    function handleGuess() {
        if (!gameStarted) return;
        const guess = guessInput.value.trim().toLowerCase();
        if (guess === puzzleData.word.toLowerCase()) {
    messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You've guessed it correctly!`;
        	gameStarted = false; // Indicate the game has ended
			    guessButton.disabled = true; // Optionally disable the Guess button
			    clueButton.disabled = true; // Optionally disable the Clue button
					giveUpButton.disabled = true; 

						} else {
						messageDisplay.innerHTML = `Not quite. Try again!`;

						const newClue = getNextClue();
						if (newClue !== "No more clues available." || !cluesGiven.includes('no-more-clues')) {
						updateClueDisplay(newClue);
						if (newClue === "No more clues available.") {
						cluesGiven.push('no-more-clues');
						}
						}
						}
						guessInput.value = "";
						}

guessButton.addEventListener("click", handleGuess);
clueButton.addEventListener("click", () => {
    if (gameStarted) {
        const newClue = getNextClue();
        if (newClue !== "No more clues available." || !cluesGiven.includes('no-more-clues')) {
            updateClueDisplay(newClue);
            if (newClue === "No more clues available.") {
                cluesGiven.push('no-more-clues');
            }
        }
    }
});

giveUpButton.addEventListener("click", () => {
    if (gameStarted) {
        updateClueDisplay(`The word was: ${puzzleData.word}`);
        guessButton.disabled = true; // Optionally disable the Guess button
        clueButton.disabled = true; // Optionally disable the Clue button
        giveUpButton.disabled = true; 
      	gameStarted = false; // Indicate the game has ended

    }
});

startGameButton.addEventListener("click", startGame);
});

document.getElementById('help-button').addEventListener('click', function() {
  alert('Guess the word based on the clues provided. You can ask for additional clues, guess the word, or give up to see the answer. The game starts by revealing the first letter of the word and its definition. Good luck!');
});
