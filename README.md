# The Dictionary Game

A modern web-based word guessing game featuring an advanced difficulty-aware scoring system, accessibility features, and engaging user experience.

## 🎮 How to Play

1. **Start** — Click "New Game" to see the word's first letter and one definition
2. **Guess** — Enter any word beginning with that letter and press Enter
3. **Get Clues** — Click "Get a Clue" to see available hint types with dynamic costs
4. **Win** — Guess correctly to earn points based on difficulty and efficiency!

## 🏆 Advanced Scoring System

### Difficulty-Aware Scoring
- Each word has a **difficulty score (0-1)** based on:
  - **Length**: Longer words = higher difficulty
  - **Frequency**: Rare words = higher base score  
  - **Complexity**: Limited definitions/examples = higher difficulty
- **Base scores**: 300-600 points depending on word difficulty

### Information-Theoretic Clue Costs
Clue costs are calculated using information theory principles:

| Clue Type | Typical Cost | Information Removed |
|-----------|-------------|---------------------|
| Additional Definition | ~10 pts | 0.8 bits |
| Word Length | ~13 pts | 1.1 bits |
| Example Sentence | ~18 pts | 1.5 bits |
| Synonyms/Antonyms | ~20 pts | 1.7 bits |
| Letter Reveal | ~56 pts | 4.7 bits (decreases) |

### Skill-Revealing Mechanics
- **First Guess Bonus**: +50 points for perfect insight
- **Progressive Penalties**: 
  - Guesses 1-5: Free
  - Guess 6+: -5 points each
- **Time Decay**: Gentle quadratic decay (0.001 × t²) capped at 200 points

### Normalized Final Scores
- All scores normalized to **0-1000 scale**
- Formula: `1000 × raw_score / 600`
- Perfect comparability across words and sessions

## 🎯 Key Features

### Game Design
- **875 carefully curated words** with definitions, examples, and semantic relationships
- **Dynamic clue pricing** based on information value
- **Responsive grid layout** optimized for desktop and mobile
- **Component-based architecture** with reusable UI elements

### Accessibility & Inclusive Design
- **WCAG AA compliant** color contrast (≥4.5:1 ratio)
- **Keyboard navigation** with proper tab order and Escape key handling
- **Screen reader support** with ARIA live regions and semantic HTML
- **Skip-to-content** link for keyboard users
- **Focus management** with visible indicators

### Visual Design
- **Inter geometric sans-serif** typography for clean, professional look
- **Design token system** with consistent spacing, colors, and typography
- **Motion system** with accessibility preferences support
- **Component library** with prop-driven styling variants

### Technical Implementation
- **Vanilla JavaScript** with modern ES6+ features
- **CSS Grid & Flexbox** for responsive layouts
- **LocalStorage persistence** for game statistics and progress
- **Information architecture** with heat-map calendar for win tracking
- **Internationalization ready** with externalized strings

## 📊 Statistics & Analytics

### Game Statistics
- Games played/won with win rate calculation
- Average and best scores tracking
- Current and best streak monitoring
- Heat-map calendar showing daily win activity

### Score Breakdown
Victory screens show detailed analysis:
- Base score from word difficulty
- First guess bonus earned
- Total clue costs incurred
- Guess penalties applied
- Time decay deducted
- Final normalized score (0-1000)

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Fonts**: Inter (headers), system fonts (body)
- **Storage**: LocalStorage for persistence
- **Architecture**: Component-based with separation of concerns
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design approach

## 🎨 Design System

### Color Palette
- **Primary**: #0F766E (teal)
- **Accent**: #12A174 (green)
- **Warning**: #D97706 (orange)
- **Text Primary**: #1F2937 (dark gray, 4.85:1 contrast)
- **Success**: #059669 (green)

### Typography Scale
- **H1**: 36px (clamp responsive)
- **H2**: 32px
- **Body**: 16px
- **Small**: 14px
- **Caption**: 12px

### Component Variants
- **GuessCard**: default, success, error states
- **ClueStripe**: hint-taken, available, purchased variants
- **ScoreMeter**: default, danger variants based on usage
- **Buttons**: primary, secondary, ghost styles

## 🚀 Performance Features

- **Lazy loading** for external libraries (confetti)
- **RequestAnimationFrame** for smooth animations
- **Efficient DOM updates** with minimal reflows
- **Optimized scoring calculations** with caching
- **Progressive enhancement** with graceful degradation

## 📱 Mobile Optimization

- **Touch-friendly** 44px+ button targets
- **Collapsible sidebar** for mobile layouts
- **Optimized input handling** prevents zoom on iOS
- **Responsive grid** adapts to screen sizes
- **Gesture support** for modal interactions

## 🔧 Development

### File Structure
```
├── index.html          # Main game interface
├── style.css          # Component styles and design system
├── script.js          # Game logic and interactions
├── scoring.js         # Advanced scoring system
├── i18n.js           # Internationalization strings
├── puzzle.json       # Word database with metadata
└── README.md         # Documentation
```

### Key Classes
- `GameScoring`: Core scoring logic with difficulty analysis
- `Components`: UI component library with animation support
- Game state management with persistent storage
- Event handling with keyboard and accessibility support

## 🎯 Game Balance

The scoring system is calibrated so that:
- **75% of players** score in the 300-700 range
- **Expert players** can differentiate with 800+ scores
- **Perfect games** on hardest words approach 1000 points
- **Casual players** can still complete games and improve

## 🌟 Future Enhancements

- **Multiplayer modes** with real-time competition
- **Daily challenges** with community leaderboards
- **Achievement system** with skill-based unlocks
- **Word pack expansions** with themed collections
- **Analytics dashboard** for performance tracking

---

**Built with ❤️ using modern web standards and accessibility best practices.**