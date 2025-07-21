import requests
import json
import re

# Removed nltk dependency - not needed for quality improvements

# Quality filtering configuration
FUNCTION_WORDS_TO_EXCLUDE = {
    'that', 'this', 'with', 'from', 'they', 'have', 'much', 'will', 'what', 'which', 'there',
    'their', 'when', 'where', 'would', 'could', 'should', 'these', 'those', 'then', 'than',
    'them', 'some', 'more', 'most', 'many', 'such', 'very', 'just', 'only', 'also', 'both',
    'each', 'even', 'here', 'how', 'may', 'now', 'said', 'she', 'two', 'way', 'who', 'its',
    'did', 'get', 'has', 'had', 'his', 'her', 'him', 'man', 'new', 'old', 'see', 'boy', 'let',
    'put', 'say', 'too', 'use'
}

TECHNICAL_PATTERNS = [
    'cardinality', 'multicellular', 'polynomial', 'ecclesiastical', 'orthogonal',
    'theological', 'liturgical', 'mathematical', 'topology', 'morphology',
    'etymology', 'phonetics', 'semantics', 'syntactic', 'lexical',
    'biochemistry', 'molecular', 'chromosome', 'genome', 'protein',
    'algorithm', 'computational', 'quantum', 'electromagnetic',
    'thermodynamic', 'kinetic', 'isotope', 'catalyst', 'enzyme',
    'derivative', 'integral', 'logarithm', 'trigonometric', 'calculus',
    'geometry', 'algebra', 'matrix', 'vector', 'scalar'
]

GRAMMATICAL_MARKERS = [
    '(degree)', '(demonstrative)', '(relative)', '(interrogative)',
    '(conjunction)', '(preposition)', '(determiner)', '(pronoun)',
    '(adverb)', '(adjective)', '(verb)', '(noun)'
]

MIN_WORD_LENGTH = 4
MAX_DEFINITION_LENGTH = 150
MIN_DEFINITION_LENGTH = 15

# Function to get all words from the file with quality filtering
def get_all_words(filename):
    with open(filename, "r") as file:
        words = []
        for word in file.readlines():
            word = word.strip().lower()
            if is_suitable_word(word):
                words.append(word)
    return words

# Function to check if a word is suitable for the game
def is_suitable_word(word):
    """Check if a word is suitable for the dictionary game"""
    # Basic length check
    if len(word) < MIN_WORD_LENGTH:
        return False
    
    # Exclude function words
    if word.lower() in FUNCTION_WORDS_TO_EXCLUDE:
        return False
    
    # Exclude words with non-alphabetic characters
    if not word.isalpha():
        return False
    
    # Exclude very short or very long words
    if len(word) < 4 or len(word) > 15:
        return False
    
    return True

# Function to check if a definition is suitable
def is_suitable_definition(definition):
    """Check if a definition is suitable for the game"""
    if not definition or len(definition) < MIN_DEFINITION_LENGTH:
        return False
    
    if len(definition) > MAX_DEFINITION_LENGTH:
        return False
    
    # Check for technical patterns
    definition_lower = definition.lower()
    if any(pattern in definition_lower for pattern in TECHNICAL_PATTERNS):
        return False
    
    return True

# Function to clean a definition
def clean_definition_text(definition):
    """Clean and improve definition quality"""
    if not definition:
        return None
    
    # Remove grammatical markers
    for marker in GRAMMATICAL_MARKERS:
        definition = definition.replace(marker, '')
    
    # Remove extra whitespace
    definition = re.sub(r'\s+', ' ', definition).strip()
    
    # Capitalize first letter
    if definition and definition[0].islower():
        definition = definition[0].upper() + definition[1:]
    
    return definition

# Function to check if an example is suitable
def is_suitable_example(example, word):
    """Check if an example is suitable for the game"""
    if not example:
        return False
    
    # Check for proper blank formatting
    blank_count = example.count('[blank]')
    if blank_count != 1:
        return False
    
    # Remove non-breaking spaces and normalize
    example = re.sub(r'\xa0', ' ', example)
    example = re.sub(r'\s+', ' ', example).strip()
    
    # Check length
    if len(example) < 10 or len(example) > 100:
        return False
    
    # Check that the word doesn't appear elsewhere in the example
    example_without_blank = example.replace('[blank]', '')
    if word.lower() in example_without_blank.lower():
        return False
    
    # Avoid examples that are just definitions
    definition_patterns = ['such as', 'for example', 'e.g.', 'i.e.', 'namely']
    example_lower = example.lower()
    if any(pattern in example_lower for pattern in definition_patterns):
        return False
    
    return True

# Function to call the dictionary API and fetch data 

def get_dictionary_data(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

# Function to clean and filter data with quality checks
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
                    
                    # Quality check for examples
                    if is_suitable_example(replaced_example, word):
                        examples.append(replaced_example)
                
                # Apply quality checks and cleaning to definitions
                if not word_root_pattern.search(clean_definition):
                    cleaned_def = clean_definition_text(clean_definition)
                    if cleaned_def and is_suitable_definition(cleaned_def):
                        filtered_definitions.append(cleaned_def)

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
            # Only create puzzle if we have quality definitions
            if len(definitions) >= 1:  # Reduced requirement from 2 to 1
                return {
                    "word": word,
                    "definitions": definitions[:8],  # Limit to 8 definitions
                    "synonyms": synonyms[:10],  # Limit synonyms
                    "antonyms": antonyms[:10],  # Limit antonyms
                    "examples": examples[:5]  # Limit examples
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
    successful_puzzles = 0
    total_words = len(words)
    
    print(f"Processing {total_words} words...")
    
    for i, word in enumerate(words):
        if i % 100 == 0:  # Progress indicator
            print(f"Progress: {i}/{total_words} words processed")
            
        puzzle = create_puzzle_for_word(word)
        if puzzle:
            append_puzzle_to_file(puzzle, 'puzzle.json')
            successful_puzzles += 1
    
    print(f"Created {successful_puzzles} puzzles from {total_words} words")
    return successful_puzzles

# Function to test the quality improvements
def test_word_quality(word):
    """Test a single word to see the quality improvements"""
    print(f"Testing word: {word}")
    
    if not is_suitable_word(word):
        print(f"  Word '{word}' rejected: not suitable for game")
        return None
    
    puzzle = create_puzzle_for_word(word)
    if puzzle:
        print(f"  Definitions: {len(puzzle['definitions'])}")
        print(f"  Examples: {len(puzzle['examples'])}")
        print(f"  Synonyms: {len(puzzle['synonyms'])}")
        print(f"  Sample definition: {puzzle['definitions'][0] if puzzle['definitions'] else 'None'}")
        print(f"  Sample example: {puzzle['examples'][0] if puzzle['examples'] else 'None'}")
    else:
        print(f"  No suitable puzzle could be created for '{word}'")
    
    return puzzle

if __name__ == "__main__":
    word_list_filename = "word_list.txt"  # Ensure this file exists with a list of words
    create_puzzles(word_list_filename)  
