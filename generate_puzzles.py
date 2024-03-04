import requests
import random
import json
import re

from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Initialize the WordNet Lemmatizer
lemmatizer = WordNetLemmatizer()

# Function to get a random word from the file
def get_random_words(filename, n):
    with open(filename, "r") as file:
        words = [word.strip() for word in file.readlines() if len(word.strip()) >= 4]
    return random.sample(words, min(n, len(words)))

# Function to call the dictionary API and fetch data
def get_dictionary_data(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Function to clean and filter the data fetched from the API
def clean_and_filter_data(data, word):
    # Initialize containers for the filtered data
    filtered_definitions = []
    synonyms = set()
    antonyms = set()
    examples = []

    # Compile a regex pattern to match non-regular characters and the word or its root
    non_regular_char_pattern = re.compile(r'', re.UNICODE)
    word_root_pattern = re.compile(r'\b' + re.escape(word[:4]), re.I)

    # Go through each meaning and its definitions
    for meaning in data[0]["meanings"]:
        for definition in meaning["definitions"]:
            clean_definition = non_regular_char_pattern.sub('', definition["definition"])
            if not word_root_pattern.search(clean_definition):
                filtered_definitions.append(clean_definition)
                if "synonyms" in definition:
                    synonyms.update(definition["synonyms"])
                if "antonyms" in definition:
                    antonyms.update(definition["antonyms"])
                if "example" in definition:
                    clean_example = non_regular_char_pattern.sub('', definition["example"])
                    # Tokenize the example sentence
                    tokens = word_tokenize(clean_example)

                    # Lemmatize each word and replace occurrences of the lemma
                    for i, token in enumerate(tokens):
                        lemma = lemmatizer.lemmatize(token.lower())  # Use lower() for case-insensitive matching
                        if lemma == word.lower():  # Check if lemma matches the target word
                            tokens[i] = '[blank]'  # Replace with '[blank]'

                    # Join the tokens back into a sentence
                    replaced_example = ' '.join(tokens)

                    examples.append(replaced_example)

    # Convert sets to lists for JSON serialization
    synonyms = list(synonyms)
    antonyms = list(antonyms)

    return filtered_definitions, synonyms, antonyms, examples

# Function to create a puzzle for a given word
def create_puzzle_for_word(word):
    data = get_dictionary_data(word)
    if data:
        definitions, synonyms, antonyms, examples = clean_and_filter_data(data, word)
        if len(definitions) >= 2:
            return {
                "word": word,
                "definitions": definitions,
                "synonyms": synonyms,
                "antonyms": antonyms,
                "examples": examples
            }
    return None

# Function to append a puzzle to a JSON file
def append_puzzle_to_file(puzzle, filename):
    try:
        with open(filename, "r+") as file:
            # Go to the end of the file
            file.seek(0, 2)
            # Go backwards to find the position just before the closing bracket ']'
            position = file.tell() - 1
            while position:
                file.seek(position)
                if file.read(1) == "]":
                    break
                position -= 1
            if position == 0:  # If the file is empty, initialize as a list
                file.write(json.dumps([puzzle], indent=4))
            else:
                # Go back two characters to overwrite the closing bracket and newline
                file.seek(position - 1)
                # Append a comma, newline, and the new puzzle, then close the list
                file.write(",\n" + json.dumps(puzzle, indent=4) + "\n]")
    except FileNotFoundError:
        # If the file doesn't exist, create it and write the first puzzle
        with open(filename, "w") as file:
            json.dump([puzzle], file, indent=4)

# Main function to create puzzles for n words
def create_puzzles(filename, n):
    words = get_random_words(filename, n)
    for word in words:
        puzzle = create_puzzle_for_word(word)
        if puzzle:
            append_puzzle_to_file(puzzle, 'puzzle.json')

if __name__ == "__main__":
    word_list_filename = "word_list.txt"  # Ensure this file exists with a list of words
    number_of_words = 500  # Specify the number of words you want to generate puzzles for
    create_puzzles(word_list_filename, number_of_words)
