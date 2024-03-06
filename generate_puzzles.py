import requests
import json
import re

from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Initialize the WordNet Lemmatizer
lemmatizer = WordNetLemmatizer()

# Function to get all words from the file
def get_all_words(filename):
    with open(filename, "r") as file:
        words = [word.strip() for word in file.readlines() if len(word.strip()) >= 4]
    return words

# Function to call the dictionary API and fetch data 

def get_dictionary_data(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Function to clean and filter data
def clean_and_filter_data(data, word):
    # Initialize containers for the filtered data
    filtered_definitions = []
    synonyms = set()
    antonyms = set()
    examples = []

    # Assuming data is a list of dictionary entries, and you're interested in the first one
    if isinstance(data, list) and len(data) > 0:
        entry = data[0]  # The dictionary API returns a list of entries; we take the first
        meanings = entry.get("meanings", [])

        non_regular_char_pattern = re.compile(r'[^\w\s.,;!?()]', re.UNICODE)
        word_root_pattern = re.compile(r'\b' + re.escape(word[:4]), re.I)
        word_variation_pattern = re.compile(r'\b' + re.escape(word), re.I)

        for meaning in meanings:
            for definition in meaning.get("definitions", []):
                clean_definition = non_regular_char_pattern.sub('', definition.get("definition", ""))
                
                # Process synonyms, antonyms, and examples regardless of word_root_pattern
                # Filter out synonyms that are variations of the word
                definition_synonyms = [syn for syn in definition.get("synonyms", []) if not word_variation_pattern.search(syn)]
                synonyms.update(definition_synonyms)

                if "antonyms" in definition:
                    antonyms.update(definition["antonyms"])
                
                if "example" in definition:
                    clean_example = non_regular_char_pattern.sub('', definition["example"])
                    pattern = re.compile(r'(\w*)' + re.escape(word) + r'(\w*)', re.IGNORECASE)
                    replaced_example = pattern.sub(lambda match: match.group(1) + "[blank]" + match.group(2), clean_example)
                    examples.append(replaced_example)
                
                # Append definitions only if they pass the word_root_pattern.search test
                if not word_root_pattern.search(clean_definition):
                    filtered_definitions.append(clean_definition)

    # Convert sets to lists for JSON serialization
    synonyms = list(synonyms)
    antonyms = list(antonyms)

    # Ensure a tuple is returned even if no data was processed
    return filtered_definitions, synonyms, antonyms, examples

# Function to create a puzzle for a given word

def create_puzzle_for_word(word):
    data = get_dictionary_data(word)
    if data:
        # Ensure data is not None and is a list (API returns a list of dictionary entries)
        if isinstance(data, list) and len(data) > 0:
            definitions, synonyms, antonyms, examples = clean_and_filter_data(data, word)  # Assuming you want the first entry
            if len(definitions) > 2:
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

# Updated main function to create puzzles for all words in the file
def create_puzzles(filename):
    words = get_all_words(filename)  # Get all words instead of a random sample
    for word in words:
        puzzle = create_puzzle_for_word(word)
        if puzzle:
            append_puzzle_to_file(puzzle, 'puzzle.json')

if __name__ == "__main__":
    word_list_filename = "word_list.txt"  # Ensure this file exists with a list of words
    create_puzzles(word_list_filename)  
