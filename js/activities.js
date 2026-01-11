/**
 * Interactive Activities for Edexcel GCSE Computer Science
 * Template-based system loading data from activities-data.json
 * Includes: Memory Match, Connection Wall, Category Sort, Logic Gates, Sequence Builder
 */

// Global data store
let activitiesData = null;

// Load activities data from JSON
async function loadActivitiesData() {
    if (activitiesData) return activitiesData;

    try {
        const response = await fetch('../js/activities-data.json');
        if (!response.ok) {
            // Try alternative path (for when page is in root)
            const altResponse = await fetch('js/activities-data.json');
            if (!altResponse.ok) throw new Error('Failed to load activities data');
            activitiesData = await altResponse.json();
        } else {
            activitiesData = await response.json();
        }
        return activitiesData;
    } catch (error) {
        console.error('Error loading activities data:', error);
        return null;
    }
}

// Get topic info
function getTopicInfo(topicId) {
    if (!activitiesData || !activitiesData.topics) return null;
    return activitiesData.topics[topicId];
}

// Get all topics as array for dropdowns
function getAllTopics() {
    if (!activitiesData || !activitiesData.topics) return [];
    return Object.values(activitiesData.topics);
}

// Create topic selector dropdown HTML
function createTopicSelector(currentTopic, onChangeCallback, selectorId = 'topicSelect') {
    const topics = getAllTopics();
    return `
        <select id="${selectorId}" class="topic-selector" onchange="${onChangeCallback}(this.value)">
            ${topics.map(topic => `
                <option value="${topic.id}" ${topic.id === currentTopic ? 'selected' : ''}>
                    ${topic.name}
                </option>
            `).join('')}
        </select>
    `;
}


// ==================== MEMORY MATCH GAME ====================
class MemoryMatch {
    constructor(containerId, topic = 'topic1') {
        this.container = document.getElementById(containerId);
        this.topic = topic;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.timer = null;
        this.seconds = 0;
        this.maxPairs = 8; // Limit to 8 pairs for better gameplay
    }

    async init() {
        await loadActivitiesData();
        if (!activitiesData) {
            this.container.innerHTML = '<p class="error">Failed to load game data</p>';
            return;
        }
        this.setupGame();
    }

    setupGame() {
        const data = activitiesData.memoryMatch[this.topic];
        if (!data) return;

        // Get pairs (limit to maxPairs for better gameplay)
        const allPairs = data.pairs.slice(0, this.maxPairs);

        // Create cards array (each pair creates 2 cards)
        this.cards = [];
        allPairs.forEach((pair, index) => {
            this.cards.push({ id: index * 2, type: 'term', content: pair.term, pairId: index });
            this.cards.push({ id: index * 2 + 1, type: 'definition', content: pair.definition, pairId: index });
        });

        this.shuffleCards();
        this.render();
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    render() {
        const topicInfo = getTopicInfo(this.topic);
        const totalPairs = this.cards.length / 2;

        this.container.innerHTML = `
            <div class="memory-game-header">
                <h3><i class="fas ${topicInfo?.icon || 'fa-brain'}"></i> ${topicInfo?.name || 'Memory Match'}</h3>
                <div class="game-stats">
                    <span class="stat"><i class="fas fa-mouse-pointer"></i> Moves: <span id="moveCount">0</span></span>
                    <span class="stat"><i class="fas fa-clock"></i> Time: <span id="timeCount">0:00</span></span>
                    <span class="stat"><i class="fas fa-check-circle"></i> Matched: <span id="matchCount">0</span>/${totalPairs}</span>
                </div>
            </div>
            <div class="memory-grid" style="--topic-color: ${topicInfo?.color || '#8b5cf6'}">
                ${this.cards.map(card => `
                    <div class="memory-card" data-id="${card.id}" data-pair="${card.pairId}">
                        <div class="card-inner">
                            <div class="card-front">
                                <i class="fas fa-question"></i>
                            </div>
                            <div class="card-back ${card.type}">
                                ${card.content}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" onclick="memoryGame.reset()">
                    <i class="fas fa-redo"></i> Reset
                </button>
                ${createTopicSelector(this.topic, 'memoryGame.changeTopic', 'memoryTopicSelect')}
            </div>
        `;

        // Update card front color based on topic
        const cardFronts = this.container.querySelectorAll('.card-front');
        cardFronts.forEach(front => {
            front.style.background = `linear-gradient(135deg, ${topicInfo?.color || '#8b5cf6'} 0%, ${this.darkenColor(topicInfo?.color || '#8b5cf6', 20)} 100%)`;
        });

        // Add click listeners
        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    flipCard(card) {
        if (!this.gameStarted) {
            this.startTimer();
            this.gameStarted = true;
        }

        if (this.flippedCards.length >= 2) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            document.getElementById('moveCount').textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const pair1 = card1.dataset.pair;
        const pair2 = card2.dataset.pair;

        if (pair1 === pair2) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            document.getElementById('matchCount').textContent = this.matchedPairs;

            if (this.matchedPairs === this.cards.length / 2) {
                this.gameComplete();
            }
            this.flippedCards = [];
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
            }, 1000);
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            const mins = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            document.getElementById('timeCount').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }, 1000);
    }

    gameComplete() {
        clearInterval(this.timer);
        setTimeout(() => {
            const mins = Math.floor(this.seconds / 60);
            const secs = this.seconds % 60;
            alert(`Congratulations! Completed in ${this.moves} moves and ${mins}:${secs.toString().padStart(2, '0')}!`);
        }, 500);
    }

    reset() {
        clearInterval(this.timer);
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.seconds = 0;
        this.gameStarted = false;
        this.shuffleCards();
        this.render();
    }

    changeTopic(topic) {
        this.topic = topic;
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.seconds = 0;
        this.gameStarted = false;
        clearInterval(this.timer);
        this.setupGame();
    }
}


// ==================== CONNECTION WALL ====================
class ConnectionWall {
    constructor(containerId, topic = 'topic1') {
        this.container = document.getElementById(containerId);
        this.topic = topic;
        this.currentSetIndex = 0;
        this.items = [];
        this.selectedItems = [];
        this.foundGroups = [];
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    async init() {
        await loadActivitiesData();
        if (!activitiesData) {
            this.container.innerHTML = '<p class="error">Failed to load game data</p>';
            return;
        }
        this.setupGame();
    }

    setupGame() {
        const topicData = activitiesData.connectionWall[this.topic];
        if (!topicData || !topicData.sets || topicData.sets.length === 0) return;

        const currentSet = topicData.sets[this.currentSetIndex];

        // Flatten all items
        this.items = [];
        currentSet.groups.forEach(group => {
            group.items.forEach(item => {
                this.items.push({ text: item, group: group.name, color: group.color });
            });
        });

        this.shuffleItems();
        this.render();
    }

    shuffleItems() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    render() {
        const topicInfo = getTopicInfo(this.topic);
        const topicData = activitiesData.connectionWall[this.topic];
        const currentSet = topicData.sets[this.currentSetIndex];

        this.container.innerHTML = `
            <div class="connection-wall-header">
                <h3><i class="fas ${topicInfo?.icon || 'fa-th-large'}"></i> ${currentSet.title}</h3>
                <p>Find the 4 groups of 4 connected items!</p>
                <div class="game-stats">
                    <span class="stat"><i class="fas fa-bullseye"></i> Groups: <span id="groupsFound">${this.foundGroups.length}</span>/4</span>
                    <span class="stat"><i class="fas fa-heart"></i> Lives: <span id="livesLeft">${this.maxAttempts - this.attempts}</span></span>
                </div>
            </div>
            <div class="found-groups">
                ${this.foundGroups.map(group => `
                    <div class="found-group" style="background: ${group.color};">
                        <strong>${group.name}:</strong> ${group.items.join(', ')}
                    </div>
                `).join('')}
            </div>
            <div class="connection-grid">
                ${this.items.filter(item => !this.foundGroups.some(g => g.items.includes(item.text)))
                    .map(item => `
                    <div class="connection-item" data-group="${item.group}" data-text="${item.text}">
                        ${item.text}
                    </div>
                `).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="submitGuess" onclick="connectionWall.checkSelection()" disabled>
                    <i class="fas fa-check"></i> Check
                </button>
                <button class="btn btn-secondary" onclick="connectionWall.clearSelection()">
                    <i class="fas fa-times"></i> Clear
                </button>
                <button class="btn btn-secondary" onclick="connectionWall.reset()">
                    <i class="fas fa-redo"></i> New Game
                </button>
                ${createTopicSelector(this.topic, 'connectionWall.changeTopic', 'wallTopicSelect')}
                ${topicData.sets.length > 1 ? `
                    <button class="btn btn-secondary" onclick="connectionWall.nextSet()">
                        <i class="fas fa-forward"></i> Next Set
                    </button>
                ` : ''}
            </div>
        `;

        this.container.querySelectorAll('.connection-item').forEach(item => {
            item.addEventListener('click', () => this.selectItem(item));
        });
    }

    selectItem(item) {
        if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            this.selectedItems = this.selectedItems.filter(i => i !== item);
        } else if (this.selectedItems.length < 4) {
            item.classList.add('selected');
            this.selectedItems.push(item);
        }
        document.getElementById('submitGuess').disabled = this.selectedItems.length !== 4;
    }

    clearSelection() {
        this.selectedItems.forEach(item => item.classList.remove('selected'));
        this.selectedItems = [];
        document.getElementById('submitGuess').disabled = true;
    }

    checkSelection() {
        if (this.selectedItems.length !== 4) return;

        const groups = this.selectedItems.map(item => item.dataset.group);
        const allSameGroup = groups.every(g => g === groups[0]);

        if (allSameGroup) {
            const groupName = groups[0];
            const groupData = this.items.find(i => i.group === groupName);
            this.foundGroups.push({
                name: groupName,
                items: this.selectedItems.map(i => i.dataset.text),
                color: groupData.color
            });

            if (this.foundGroups.length === 4) {
                setTimeout(() => alert('Congratulations! You found all 4 groups!'), 300);
            }
            this.selectedItems = [];
            this.render();
        } else {
            this.attempts++;
            this.selectedItems.forEach(item => {
                item.classList.add('wrong');
                setTimeout(() => item.classList.remove('wrong'), 500);
            });

            if (this.attempts >= this.maxAttempts) {
                const topicData = activitiesData.connectionWall[this.topic];
                const currentSet = topicData.sets[this.currentSetIndex];
                setTimeout(() => {
                    alert('Game Over! The groups were:\n' +
                        currentSet.groups.map(g => `${g.name}: ${g.items.join(', ')}`).join('\n'));
                    this.reset();
                }, 600);
            } else {
                document.getElementById('livesLeft').textContent = this.maxAttempts - this.attempts;
            }
            this.clearSelection();
        }
    }

    nextSet() {
        const topicData = activitiesData.connectionWall[this.topic];
        this.currentSetIndex = (this.currentSetIndex + 1) % topicData.sets.length;
        this.reset();
    }

    reset() {
        this.selectedItems = [];
        this.foundGroups = [];
        this.attempts = 0;
        this.setupGame();
    }

    changeTopic(topic) {
        this.topic = topic;
        this.currentSetIndex = 0;
        this.reset();
    }
}


// ==================== CATEGORY SORT ====================
class CategorySort {
    constructor(containerId, topic = 'topic1') {
        this.container = document.getElementById(containerId);
        this.topic = topic;
        this.currentSetIndex = 0;
        this.items = [];
        this.totalItems = 0;
    }

    async init() {
        await loadActivitiesData();
        if (!activitiesData) {
            this.container.innerHTML = '<p class="error">Failed to load game data</p>';
            return;
        }
        this.setupGame();
    }

    setupGame() {
        const topicData = activitiesData.categorySort[this.topic];
        if (!topicData || !topicData.sets || topicData.sets.length === 0) return;

        const currentSet = topicData.sets[this.currentSetIndex];

        // Flatten all items and shuffle
        this.items = [];
        Object.entries(currentSet.categories).forEach(([category, items]) => {
            items.forEach(item => {
                this.items.push({ text: item, category: category });
            });
        });
        this.totalItems = this.items.length;
        this.shuffleItems();
        this.render();
    }

    shuffleItems() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    render() {
        const topicInfo = getTopicInfo(this.topic);
        const topicData = activitiesData.categorySort[this.topic];
        const currentSet = topicData.sets[this.currentSetIndex];
        const categories = Object.keys(currentSet.categories);

        this.container.innerHTML = `
            <div class="category-sort-header">
                <h3><i class="fas ${topicInfo?.icon || 'fa-layer-group'}"></i> ${currentSet.title}</h3>
                <p>Drag and drop items into the correct categories!</p>
                <div class="game-stats">
                    <span class="stat"><i class="fas fa-check"></i> Correct: <span id="correctCount">0</span>/${this.totalItems}</span>
                </div>
            </div>
            <div class="items-pool" id="itemsPool">
                <h4>Items to Sort:</h4>
                <div class="pool-items">
                    ${this.items.map((item, idx) => `
                        <div class="sortable-item" draggable="true" data-category="${item.category}" data-index="${idx}">
                            ${item.text}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="categories-container">
                ${categories.map(cat => `
                    <div class="category-box">
                        <h4>${cat}</h4>
                        <div class="category-dropzone" data-category="${cat}"></div>
                    </div>
                `).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" onclick="categorySort.checkAll()">
                    <i class="fas fa-check-circle"></i> Check
                </button>
                <button class="btn btn-secondary" onclick="categorySort.reset()">
                    <i class="fas fa-redo"></i> Reset
                </button>
                ${createTopicSelector(this.topic, 'categorySort.changeTopic', 'categoryTopicSelect')}
                ${topicData.sets.length > 1 ? `
                    <button class="btn btn-secondary" onclick="categorySort.nextSet()">
                        <i class="fas fa-forward"></i> Next Set
                    </button>
                ` : ''}
            </div>
        `;

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const items = this.container.querySelectorAll('.sortable-item');
        const dropzones = this.container.querySelectorAll('.category-dropzone');
        const pool = this.container.querySelector('.pool-items');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });

        [...dropzones, pool].forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const dragging = this.container.querySelector('.dragging');
                if (dragging) {
                    zone.appendChild(dragging);
                    dragging.classList.remove('correct', 'incorrect');
                }
            });
        });
    }

    checkAll() {
        let correct = 0;
        const items = this.container.querySelectorAll('.category-dropzone .sortable-item, .pool-items .sortable-item');

        items.forEach(item => {
            const itemCategory = item.dataset.category;
            const parentZone = item.closest('.category-dropzone');

            if (parentZone && itemCategory === parentZone.dataset.category) {
                item.classList.add('correct');
                item.classList.remove('incorrect');
                correct++;
            } else if (parentZone) {
                item.classList.add('incorrect');
                item.classList.remove('correct');
            } else {
                item.classList.remove('correct', 'incorrect');
            }
        });

        document.getElementById('correctCount').textContent = correct;

        if (correct === this.totalItems) {
            setTimeout(() => alert('Excellent! All items sorted correctly!'), 300);
        }
    }

    nextSet() {
        const topicData = activitiesData.categorySort[this.topic];
        this.currentSetIndex = (this.currentSetIndex + 1) % topicData.sets.length;
        this.setupGame();
    }

    reset() {
        this.shuffleItems();
        this.render();
    }

    changeTopic(topic) {
        this.topic = topic;
        this.currentSetIndex = 0;
        this.setupGame();
    }
}


// ==================== LOGIC GATES GAME ====================
class LogicGatesGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [];
    }

    async init() {
        await loadActivitiesData();
        if (!activitiesData) {
            this.container.innerHTML = '<p class="error">Failed to load game data</p>';
            return;
        }
        this.questions = [...activitiesData.logicGates.questions];
        this.shuffleQuestions();
        this.render();
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
        // Limit to 10 questions per game
        this.questions = this.questions.slice(0, 10);
    }

    render() {
        const q = this.questions[this.currentQuestion];
        const gateColors = {
            'AND': '#10b981', 'OR': '#3b82f6', 'NOT': '#ef4444',
            'XOR': '#f59e0b', 'NAND': '#8b5cf6', 'NOR': '#ec4899'
        };

        this.container.innerHTML = `
            <div class="logic-game-header">
                <h3><i class="fas fa-microchip"></i> Logic Gates Challenge</h3>
                <div class="game-stats">
                    <span class="stat">Question: ${this.currentQuestion + 1}/${this.questions.length}</span>
                    <span class="stat">Score: ${this.score}/${this.currentQuestion}</span>
                </div>
            </div>
            <div class="logic-question">
                <div class="gate-display">
                    <div class="gate-box" style="background: ${gateColors[q.gate] || '#8b5cf6'}">
                        <span class="gate-name">${q.gate}</span>
                    </div>
                </div>
                <div class="inputs-display">
                    ${q.inputs.map((input, i) => `
                        <div class="input-value">
                            ${q.inputs.length > 1 ? `Input ${String.fromCharCode(65 + i)}` : 'Input'}: <strong>${input}</strong>
                        </div>
                    `).join('')}
                </div>
                <div class="output-question">
                    <p>What is the output?</p>
                    <div class="answer-buttons">
                        <button class="btn btn-lg" onclick="logicGame.checkAnswer(0)">0</button>
                        <button class="btn btn-lg" onclick="logicGame.checkAnswer(1)">1</button>
                    </div>
                </div>
            </div>
            <div id="feedback" class="feedback"></div>
        `;
    }

    checkAnswer(answer) {
        const q = this.questions[this.currentQuestion];
        const feedback = document.getElementById('feedback');

        if (answer === q.answer) {
            this.score++;
            feedback.innerHTML = `<p class="correct-feedback"><i class="fas fa-check-circle"></i> Correct! ${q.explanation}</p>`;
            feedback.className = 'feedback correct';
        } else {
            feedback.innerHTML = `<p class="incorrect-feedback"><i class="fas fa-times-circle"></i> Incorrect. The answer was ${q.answer}. ${q.explanation}</p>`;
            feedback.className = 'feedback incorrect';
        }

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.render();
            } else {
                this.showResults();
            }
        }, 2000);
    }

    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        let message = percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practising!';
        let emoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪';

        this.container.innerHTML = `
            <div class="results-container">
                <h3>Game Complete! ${emoji}</h3>
                <div class="final-score">${this.score}/${this.questions.length}</div>
                <p class="percentage">${percentage}%</p>
                <p class="message">${message}</p>
                <button class="btn btn-primary" onclick="logicGame.reset()">
                    <i class="fas fa-redo"></i> Play Again
                </button>
            </div>
        `;
    }

    reset() {
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = [...activitiesData.logicGates.questions];
        this.shuffleQuestions();
        this.render();
    }
}


// ==================== SEQUENCE BUILDER ====================
class SequenceBuilder {
    constructor(containerId, topic = 'topic1') {
        this.container = document.getElementById(containerId);
        this.topic = topic;
        this.currentSequenceIndex = 0;
        this.shuffledSteps = [];
    }

    async init() {
        await loadActivitiesData();
        if (!activitiesData) {
            this.container.innerHTML = '<p class="error">Failed to load game data</p>';
            return;
        }
        this.setupGame();
    }

    setupGame() {
        const topicData = activitiesData.sequenceBuilder[this.topic];
        if (!topicData || !topicData.sequences || topicData.sequences.length === 0) return;

        const currentSequence = topicData.sequences[this.currentSequenceIndex];
        this.shuffledSteps = [...currentSequence.steps];
        this.shuffleSteps();
        this.render();
    }

    shuffleSteps() {
        for (let i = this.shuffledSteps.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledSteps[i], this.shuffledSteps[j]] = [this.shuffledSteps[j], this.shuffledSteps[i]];
        }
    }

    render() {
        const topicInfo = getTopicInfo(this.topic);
        const topicData = activitiesData.sequenceBuilder[this.topic];
        const currentSequence = topicData.sequences[this.currentSequenceIndex];

        this.container.innerHTML = `
            <div class="sequence-header">
                <h3><i class="fas ${topicInfo?.icon || 'fa-sort-numeric-down'}"></i> ${currentSequence.title}</h3>
                <p>Drag and arrange the steps in the correct order!</p>
            </div>
            <div class="sequence-steps" id="sequenceSteps">
                ${this.shuffledSteps.map((step, idx) => `
                    <div class="sequence-step" draggable="true" data-original="${currentSequence.steps.indexOf(step)}">
                        <span class="step-number">${idx + 1}</span>
                        <span class="step-text">${step}</span>
                        <i class="fas fa-grip-vertical drag-handle"></i>
                    </div>
                `).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" onclick="sequenceBuilder.checkOrder()">
                    <i class="fas fa-check"></i> Check Order
                </button>
                <button class="btn btn-secondary" onclick="sequenceBuilder.reset()">
                    <i class="fas fa-redo"></i> Shuffle
                </button>
                ${createTopicSelector(this.topic, 'sequenceBuilder.changeTopic', 'sequenceTopicSelect')}
                ${topicData.sequences.length > 1 ? `
                    <button class="btn btn-secondary" onclick="sequenceBuilder.nextSequence()">
                        <i class="fas fa-forward"></i> Next
                    </button>
                ` : ''}
            </div>
            <div id="sequenceFeedback" class="feedback"></div>
        `;

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const container = document.getElementById('sequenceSteps');
        const steps = container.querySelectorAll('.sequence-step');
        let draggedItem = null;

        steps.forEach(step => {
            step.addEventListener('dragstart', () => {
                draggedItem = step;
                step.classList.add('dragging');
            });

            step.addEventListener('dragend', () => {
                step.classList.remove('dragging');
                this.updateNumbers();
            });

            step.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(container, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggedItem);
                } else {
                    container.insertBefore(draggedItem, afterElement);
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggables = [...container.querySelectorAll('.sequence-step:not(.dragging)')];
        return draggables.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            }
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateNumbers() {
        const steps = this.container.querySelectorAll('.sequence-step');
        steps.forEach((step, idx) => {
            step.querySelector('.step-number').textContent = idx + 1;
        });
    }

    checkOrder() {
        const steps = this.container.querySelectorAll('.sequence-step');
        let correct = 0;

        steps.forEach((step, idx) => {
            const originalPos = parseInt(step.dataset.original);
            if (originalPos === idx) {
                step.classList.add('correct');
                step.classList.remove('incorrect');
                correct++;
            } else {
                step.classList.add('incorrect');
                step.classList.remove('correct');
            }
        });

        const feedback = document.getElementById('sequenceFeedback');
        if (correct === steps.length) {
            feedback.innerHTML = '<p class="correct-feedback"><i class="fas fa-check-circle"></i> Perfect! All steps in correct order!</p>';
            feedback.className = 'feedback correct';
        } else {
            feedback.innerHTML = `<p class="incorrect-feedback"><i class="fas fa-times-circle"></i> ${correct}/${steps.length} steps correct. Keep trying!</p>`;
            feedback.className = 'feedback incorrect';
        }
    }

    nextSequence() {
        const topicData = activitiesData.sequenceBuilder[this.topic];
        this.currentSequenceIndex = (this.currentSequenceIndex + 1) % topicData.sequences.length;
        this.setupGame();
    }

    reset() {
        this.shuffleSteps();
        this.render();
    }

    changeTopic(topic) {
        this.topic = topic;
        this.currentSequenceIndex = 0;
        this.setupGame();
    }
}


// ==================== INITIALIZE GAMES ====================
let memoryGame, connectionWall, categorySort, logicGame, sequenceBuilder;

document.addEventListener('DOMContentLoaded', async function() {
    // Pre-load data
    await loadActivitiesData();

    // Initialize games if their containers exist
    if (document.getElementById('memory-game')) {
        memoryGame = new MemoryMatch('memory-game');
        memoryGame.init();
    }

    if (document.getElementById('connection-wall')) {
        connectionWall = new ConnectionWall('connection-wall');
        connectionWall.init();
    }

    if (document.getElementById('category-sort')) {
        categorySort = new CategorySort('category-sort');
        categorySort.init();
    }

    if (document.getElementById('logic-game')) {
        logicGame = new LogicGatesGame('logic-game');
        logicGame.init();
    }

    if (document.getElementById('sequence-builder')) {
        sequenceBuilder = new SequenceBuilder('sequence-builder');
        sequenceBuilder.init();
    }
});
