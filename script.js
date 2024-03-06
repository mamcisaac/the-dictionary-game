document.addEventListener("DOMContentLoaded", function() {
    const clueList = document.getElementById("clue-list");
    const guessInput = document.getElementById("guess-input");
    const guessButton = document.getElementById("guess-button");
    const clueButton = document.getElementById("clue-button");
    const giveUpButton = document.getElementById("give-up-button");
    const startGameButton = document.getElementById("start-game-button");
    const inputContainer = document.getElementById("input-container");
		const messageDisplay = document.getElementById("message");
    const myword = document.getElementById("my-word");



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
        // Give an example sentence if not already given
        if (cluesGiven.includes('example') === false && puzzleData.examples.length > 0) {
            cluesGiven.push('example');
            return `Sample sentence: ${puzzleData.examples[0]}`;
        // Give a second example sentence if the first has been given, and a second is available
        } else if (cluesGiven.includes('example') && puzzleData.examples.length > 1 && !cluesGiven.includes('example2')) {
            cluesGiven.push('example2'); // Ensure the second example is uniquely identified
            return `Another sample sentence: ${puzzleData.examples[1]}`;
        // Give synonyms if not already given and available, limited to 5
        } else if (cluesGiven.includes('synonyms') === false && puzzleData.synonyms.length > 0) {
            const synonyms = puzzleData.synonyms.slice(0, 5).join(', ');
            cluesGiven.push('synonyms');
            return `Synonyms: ${synonyms}`;
        // Give antonyms if not already given and available, limited to 5
        } else if (cluesGiven.includes('antonyms') === false && puzzleData.antonyms.length > 0) {
            const antonyms = puzzleData.antonyms.slice(0, 5).join(', ');
            cluesGiven.push('antonyms');
            return `Antonyms: ${antonyms}`;
        // Reveal letters if other clues have been exhausted
        } else if (lettersRevealed < puzzleData.word.length - 1) {
            lettersRevealed++;
            cluesGiven.push(`letters${lettersRevealed}`); // Ensure unique entry for each state of letters revealed
            return `The word starts with: ${puzzleData.word.substring(0, lettersRevealed)}`;
        }
    } else {
        // Provide a secondary definition if the index is valid
        return `Secondary Definition: ${puzzleData.definitions[currentClueIndex++]}`;
    }
    return "No more clues available.";
}

function updateClueDisplay(newClue) {
    const clueItem = document.createElement("li");
    clueItem.textContent = newClue;
    clueItem.style.opacity = "0";
    clueItem.style.transition = "opacity 0.5s ease-in-out";
    clueList.appendChild(clueItem);
    
    // Animation to fade in the clue
    setTimeout(() => {
        clueItem.style.opacity = "1";
    }, 100);
}

function startGame() {
    gameStarted = true;
    guessButton.disabled = false;
    clueButton.disabled = false; 
		giveUpButton.disabled = false; 
		
    clueList.innerHTML = ''; // Clear the list for a new game
    inputContainer.style.display = "block"; // Show the input container
    myword.style.display = "block"; // Show the input container
    fetchPuzzle().then(() => {
        // Display the primary definition
        // Assuming puzzleData is already fetched and contains the word and primary definition
    const firstLetter = puzzleData.word[0]; // Get the first letter of the word
    const definition = puzzleData.definitions[0]; // Get the primary definition of the word
    
    // Display the formatted message in the primary-definition element
    document.getElementById("primary-definition").innerHTML = `${definition}`;
        document.getElementById("first-letter").innerHTML = `${firstLetter.toUpperCase()}`;

    // Clear the clue list for any previous game clues and reset other UI elements as needed
    document.getElementById("clue-list").innerHTML = '';
    document.getElementById("message").innerHTML = ''; // Clear any previous messages
    
        currentClueIndex = 1; // Start from the second definition for the next clue
				lettersRevealed = 1;

    });
}
    
			
function handleGuess() {
    if (!gameStarted) return;
    const guess = guessInput.value.trim().toLowerCase();
    
    if (guess === puzzleData.word.toLowerCase()) {
        messageDisplay.innerHTML = `Congratulations! The word was: ${puzzleData.word}. You've guessed it correctly!`;
        messageDisplay.style.color = "#81b29a"; // Success color
        gameStarted = false; // Indicate the game has ended
        guessButton.disabled = true; // Disable the Guess button
        clueButton.disabled = true; // Disable the Clue button
        giveUpButton.disabled = true; // Disable the Give Up button
    } else {
        messageDisplay.innerHTML = `Not quite. Try again!`;
        messageDisplay.style.color = "#e07a5f"; // Error color

        const newClue = getNextClue();
        if (newClue !== "No more clues available." || !cluesGiven.includes('no-more-clues')) {
            updateClueDisplay(newClue);
            if (newClue === "No more clues available.") {
                cluesGiven.push('no-more-clues');
            }
        }
    }
    
    // Animation for feedback message
    messageDisplay.style.transform = "scale(1.1)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);

    guessInput.value = ""; // Clear the guess input field
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


function addClueWithAnimation(clue) {
    const clueItem = document.createElement("li");
    clueItem.textContent = clue;
    clueItem.style.opacity = "0";
    clueList.appendChild(clueItem);
    setTimeout(() => {
        clueItem.style.opacity = "1";
    }, 100);
}

function displayMessageWithAnimation(message, isSuccess) {
    messageDisplay.style.color = isSuccess ? "#81b29a" : "#e07a5f";
    messageDisplay.textContent = message;
    messageDisplay.style.transform = "scale(1.05)";
    setTimeout(() => {
        messageDisplay.style.transform = "scale(1)";
    }, 150);
}
