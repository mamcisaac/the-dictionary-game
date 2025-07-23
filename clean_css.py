#!/usr/bin/env python3
"""Remove CSS related to Daily Challenge and Word History features"""

import re

# Read the CSS file
with open('style.css', 'r') as f:
    content = f.read()

# Remove daily challenge related selectors from grouped rules
content = re.sub(r'\.close-daily-challenge:hover,\n\.close-daily-challenge:focus,\n', '', content)
content = re.sub(r'\.close-daily-challenge,\n', '', content)
content = re.sub(r',\n\.close-daily-challenge', '', content)

# Remove word history related selectors from grouped rules
content = re.sub(r'\.close-word-history:hover,\n\.close-word-history:focus,?\n?', '', content)
content = re.sub(r'\.close-word-history,\n', '', content)
content = re.sub(r',\n\.close-word-history', '', content)

# Remove entire daily challenge style blocks
content = re.sub(r'/\* Daily Challenge Styles \*/\n\.daily-challenge-info \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.daily-challenge-buttons \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.daily-challenge-buttons button \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.daily-challenge-buttons button:hover \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'#leaderboard-list \{[\s\S]*?\}\n\n', '', content)

# Remove entire word history style blocks
content = re.sub(r'/\* Word History Styles \*/\n#word-history-controls \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'#word-history-stats \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'#word-history-list \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.word-history-item \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.word-history-item:hover \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.word-history-item:last-child \{[\s\S]*?\}\n\n', '', content)
content = re.sub(r'\.word-info \{[\s\S]*?\}\n\n', '', content)

# Remove from modal sizing rule
content = re.sub(r'#daily-challenge-modal \.modal-content,\n', '', content)
content = re.sub(r'#word-history-modal \.modal-content,?\n?', '', content)

# Remove specific responsive styles
content = re.sub(r'    #word-history-controls \{[\s\S]*?\}\n\n', '', content, flags=re.MULTILINE)
content = re.sub(r'    #word-history-stats \{[\s\S]*?\}\n\n', '', content, flags=re.MULTILINE)
content = re.sub(r'    \.word-history-item \{[\s\S]*?\}\n\n', '', content, flags=re.MULTILINE)
content = re.sub(r'    \.daily-challenge-buttons \{[\s\S]*?\}\n\n', '', content, flags=re.MULTILINE)

# Clean up any remaining references
content = re.sub(r'[^\n]*daily-challenge[^\n]*\n', '', content, flags=re.IGNORECASE)
content = re.sub(r'[^\n]*word-history[^\n]*\n', '', content, flags=re.IGNORECASE)

# Clean up extra blank lines
content = re.sub(r'\n\n\n+', '\n\n', content)

# Write the cleaned CSS
with open('style.css', 'w') as f:
    f.write(content)

print("Successfully cleaned CSS file of Daily Challenge and Word History styles")