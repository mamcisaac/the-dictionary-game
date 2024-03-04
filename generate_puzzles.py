import requests
import random
import json

def get_random_word():
    with open("google-10000-english-no-swears.txt", "r") as file:
        words = [word.strip() for word in file if len(word.strip()) >= 4]
    return random.choice(words)

def get_definitions(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        definitions = []
        for meaning in data[0]["meanings"]:
            for definition in meaning["definitions"]:
                definitions.append(definition["definition"])
        return definitions
    else:
        return None

def create_puzzle():
    while True:
        word = get_random_word()
        definitions = get_definitions(word)
        if definitions:
            return {"word": word, "definitions": definitions}

def save_puzzle(puzzle, filename):
    with open(filename, "w") as file:
        json.dump(puzzle, file)

if __name__ == "__main__":
    puzzle = create_puzzle()
    save_puzzle(puzzle, "puzzle.json")

