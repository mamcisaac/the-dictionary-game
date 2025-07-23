#!/usr/bin/env python3
"""Remove Daily Challenge and Word History features from script.js"""

import re

# Read the original file
with open('script.js', 'r') as f:
    content = f.read()

# Define patterns to remove
patterns_to_remove = [
    # Remove daily challenge variable declarations
    r'const dailyChallengeButton = .*?;\n',
    r'const dailyChallengeModal = .*?;\n',
    r'const closeDailyChallengeModal = .*?;\n',
    r'const startDailyChallengeButton = .*?;\n',
    
    # Remove word history variable declarations
    r'const wordHistoryButton = .*?;\n',
    r'const wordHistoryModal = .*?;\n',
    r'const closeWordHistoryModal = .*?;\n',
    
    # Remove daily challenge modal event listeners
    r'// Daily Challenge Modal\nif \(dailyChallengeButton\) \{[\s\S]*?\n\}\n',
    r'if \(closeDailyChallengeModal\) \{[\s\S]*?\n\}\n',
    r'if \(startDailyChallengeButton\) \{[\s\S]*?\n\}\n',
    
    # Remove word history modal event listeners
    r'// Word History Modal\nif \(wordHistoryButton\) \{[\s\S]*?\n\}\n',
    r'if \(closeWordHistoryModal\) \{[\s\S]*?\n\}\n',
    
    # Remove word history search/filter event listeners
    r'// Word History search and filter\n.*?\n.*?\n',
    r'if \(wordSearch\) \{[\s\S]*?\n\}\n',
    r'if \(wordFilter\) \{[\s\S]*?\n\}\n',
    
    # Remove daily challenge system
    r'// Daily Challenge System\nconst dailyChallengeData = \{[\s\S]*?\};\n',
    r'// Load daily challenge data\nfunction loadDailyChallengeData\(\) \{[\s\S]*?\n\}\n',
    r'// Save daily challenge data\nfunction saveDailyChallengeData\(\) \{[\s\S]*?\n\}\n',
    r'// Get today\'s date string\nfunction getTodayString\(\) \{[\s\S]*?\n\}\n',
    r'// Get daily word index\nfunction getDailyWord\(dateString\) \{[\s\S]*?\n\}\n',
    r'// Check if daily challenge completed\nfunction isDailyChallengeCompleted\(dateString\) \{[\s\S]*?\n\}\n',
    r'// Get simulated leaderboard\nfunction getSimulatedLeaderboard\(\) \{[\s\S]*?\n\}\n',
    r'// Record daily challenge result\nfunction recordDailyChallengeResult\(score, won\) \{[\s\S]*?\n\}\n',
    r'function updateDailyChallengeModal\(\) \{[\s\S]*?\n\}\n',
    r'function startDailyChallenge\(\) \{[\s\S]*?\n\}\n',
    
    # Remove word history system
    r'// Word History and Favorites System\nconst wordHistoryData = \{[\s\S]*?\};\n',
    r'function loadWordHistory\(\) \{[\s\S]*?\n\}\n',
    r'function saveWordHistory\(\) \{[\s\S]*?\n\}\n',
    r'function recordWordInHistory\(.*?\) \{[\s\S]*?\n\}\n',
    r'// Toggle word favorite status\nfunction toggleWordFavorite\(word\) \{[\s\S]*?\n\}\n',
    r'// Check if word is favorited\nfunction isWordFavorited\(word\) \{[\s\S]*?\n\}\n',
    r'function updateWordHistoryModal\(\) \{[\s\S]*?\n\}\n',
    r'function updateWordHistoryDisplay\(\) \{[\s\S]*?\n\}\n',
    r'function replayWord\(word\) \{[\s\S]*?\n\}\n',
    
    # Remove isDailyChallengeMode variable and references
    r'// Track daily challenge mode\nlet isDailyChallengeMode = false;\n',
    r'isDailyChallengeMode = true;\n',
    r'isDailyChallengeMode = false;.*?\n',
    
    # Remove loading calls
    r'loadDailyChallengeData\(\);\n',
    r'loadWordHistory\(\);\n',
    
    # Clean up modal references in window click handler
    r'const dailyChallengeModal = document\.getElementById.*?;\n',
    r'const wordHistoryModal = document\.getElementById.*?;\n',
    r'if \(event\.target === dailyChallengeModal\) \{[\s\S]*?\}\n',
    r'if \(event\.target === wordHistoryModal\) \{[\s\S]*?\}\n',
]

# Apply all removals
for pattern in patterns_to_remove:
    content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Clean up extra blank lines
content = re.sub(r'\n\n\n+', '\n\n', content)

# Fix specific references in checkAchievements
content = content.replace(
    'achievement.condition(gameStats, wordHistoryData.history, dailyChallengeData)',
    'achievement.condition(gameStats)'
)

# Fix recordGameResult function
content = re.sub(
    r'// Override the original recordGameResult.*?\n.*?= function\(won, score = 0\) \{[\s\S]*?originalRecordGameResult\(won, score\);\n.*?\n\};\n',
    '',
    content,
    flags=re.MULTILINE
)

# Remove daily challenge mode references from UI
content = content.replace(
    'startGameButton.textContent = isDailyChallengeMode ? "New Daily Challenge" : "New Game";',
    'startGameButton.textContent = "New Game";'
)

content = content.replace(
    'console.log(`Started ${isDailyChallengeMode ? \'daily challenge\' : \'game\'} with word: ${puzzleData.word}`);',
    'console.log(`Started game with word: ${puzzleData.word}`);'
)

# Remove references in recordWordInHistory calls
content = re.sub(
    r'recordWordInHistory\(.*?\);\n',
    '',
    content
)

# Update console log at the end
content = content.replace(
    'console.log("Phase 1 features loaded: Daily Challenge, Achievements, Word History, Dark Mode");',
    'console.log("Phase 1 features loaded: Achievements, Dark Mode");'
)

# Write the cleaned content
with open('script.js', 'w') as f:
    f.write(content)

print("Successfully removed Daily Challenge and Word History features from script.js")