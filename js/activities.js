/**
 * Interactive Activities for Edexcel GCSE Computer Science
 * Includes: Memory Match, Connection Wall, Category Sort, Logic Gates Builder
 */

// ==================== MEMORY MATCH GAME ====================
const memoryMatchData = {
    topic1: {
        title: 'Computational Thinking',
        pairs: [
            { term: 'Decomposition', definition: 'Breaking a problem into smaller parts' },
            { term: 'Abstraction', definition: 'Removing unnecessary details' },
            { term: 'Algorithm', definition: 'Step-by-step instructions to solve a problem' },
            { term: 'Linear Search', definition: 'Checking each item one at a time' },
            { term: 'Binary Search', definition: 'Dividing a sorted list in half repeatedly' },
            { term: 'Bubble Sort', definition: 'Swapping adjacent elements until sorted' },
            { term: 'AND Gate', definition: 'Output 1 only if both inputs are 1' },
            { term: 'OR Gate', definition: 'Output 1 if at least one input is 1' }
        ]
    },
    topic2: {
        title: 'Data Representation',
        pairs: [
            { term: 'Binary', definition: 'Base 2 number system (0s and 1s)' },
            { term: 'Hexadecimal', definition: 'Base 16 number system (0-9 and A-F)' },
            { term: 'ASCII', definition: '7-bit character encoding standard' },
            { term: 'Pixel', definition: 'Smallest element of a digital image' },
            { term: 'Sample Rate', definition: 'Number of audio samples per second' },
            { term: 'Bit Depth', definition: 'Number of bits per audio sample' },
            { term: 'Lossy Compression', definition: 'Reduces file size by removing some data' },
            { term: 'Lossless Compression', definition: 'Reduces file size without losing data' }
        ]
    },
    topic3: {
        title: 'Computer Systems',
        pairs: [
            { term: 'CPU', definition: 'The brain of the computer that executes instructions' },
            { term: 'RAM', definition: 'Volatile memory for temporary data storage' },
            { term: 'ROM', definition: 'Non-volatile memory containing boot instructions' },
            { term: 'Cache', definition: 'Fast memory between CPU and RAM' },
            { term: 'SSD', definition: 'Fast storage using flash memory chips' },
            { term: 'Operating System', definition: 'Software that manages hardware and applications' },
            { term: 'Compiler', definition: 'Translates entire source code before running' },
            { term: 'Interpreter', definition: 'Translates and executes code line by line' }
        ]
    },
    topic4: {
        title: 'Networks',
        pairs: [
            { term: 'LAN', definition: 'Network covering a small geographical area' },
            { term: 'WAN', definition: 'Network spanning large geographical distances' },
            { term: 'Router', definition: 'Directs data packets between networks' },
            { term: 'Switch', definition: 'Connects devices within a network' },
            { term: 'TCP/IP', definition: 'Protocol suite for internet communication' },
            { term: 'Encryption', definition: 'Scrambling data to prevent unauthorized access' },
            { term: 'Firewall', definition: 'Monitors and filters network traffic' },
            { term: 'DNS', definition: 'Converts domain names to IP addresses' }
        ]
    }
};

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
    }

    init() {
        const data = memoryMatchData[this.topic];
        if (!data) return;

        // Create cards array (each pair creates 2 cards)
        this.cards = [];
        data.pairs.forEach((pair, index) => {
            this.cards.push({ id: index * 2, type: 'term', content: pair.term, pairId: index });
            this.cards.push({ id: index * 2 + 1, type: 'definition', content: pair.definition, pairId: index });
        });

        // Shuffle cards
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
        const data = memoryMatchData[this.topic];

        this.container.innerHTML = `
            <div class="memory-game-header">
                <h3>${data.title} Memory Match</h3>
                <div class="game-stats">
                    <span class="stat"><i class="fas fa-mouse-pointer"></i> Moves: <span id="moveCount">0</span></span>
                    <span class="stat"><i class="fas fa-clock"></i> Time: <span id="timeCount">0:00</span></span>
                    <span class="stat"><i class="fas fa-check-circle"></i> Matched: <span id="matchCount">0</span>/${data.pairs.length}</span>
                </div>
            </div>
            <div class="memory-grid">
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
                    <i class="fas fa-redo"></i> Reset Game
                </button>
                <select id="topicSelect" onchange="memoryGame.changeTopic(this.value)">
                    <option value="topic1" ${this.topic === 'topic1' ? 'selected' : ''}>Topic 1: Computational Thinking</option>
                    <option value="topic2" ${this.topic === 'topic2' ? 'selected' : ''}>Topic 2: Data</option>
                    <option value="topic3" ${this.topic === 'topic3' ? 'selected' : ''}>Topic 3: Computers</option>
                    <option value="topic4" ${this.topic === 'topic4' ? 'selected' : ''}>Topic 4: Networks</option>
                </select>
            </div>
        `;

        // Add click listeners
        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
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
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            document.getElementById('matchCount').textContent = this.matchedPairs;

            if (this.matchedPairs === memoryMatchData[this.topic].pairs.length) {
                this.gameComplete();
            }

            this.flippedCards = [];
        } else {
            // No match
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
            alert(`Congratulations! You completed the game in ${this.moves} moves and ${mins}:${secs.toString().padStart(2, '0')}!`);
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
        this.reset();
        this.init();
    }
}


// ==================== CONNECTION WALL (Only Connect Style) ====================
const connectionWallData = {
    set1: {
        title: 'Computer Science Mix',
        groups: [
            { name: 'Types of Memory', items: ['RAM', 'ROM', 'Cache', 'Registers'], color: '#8b5cf6' },
            { name: 'Network Topologies', items: ['Star', 'Bus', 'Mesh', 'Ring'], color: '#3b82f6' },
            { name: 'Logic Gates', items: ['AND', 'OR', 'NOT', 'XOR'], color: '#10b981' },
            { name: 'Data Types', items: ['Integer', 'String', 'Boolean', 'Float'], color: '#f59e0b' }
        ]
    },
    set2: {
        title: 'Programming & Data',
        groups: [
            { name: 'Control Structures', items: ['IF', 'WHILE', 'FOR', 'SWITCH'], color: '#8b5cf6' },
            { name: 'Image Properties', items: ['Resolution', 'Colour Depth', 'Pixel', 'Metadata'], color: '#3b82f6' },
            { name: 'Sorting Algorithms', items: ['Bubble', 'Merge', 'Quick', 'Insertion'], color: '#10b981' },
            { name: 'Security Threats', items: ['Phishing', 'Malware', 'Brute Force', 'SQL Injection'], color: '#f59e0b' }
        ]
    },
    set3: {
        title: 'Hardware & Networks',
        groups: [
            { name: 'Input Devices', items: ['Keyboard', 'Mouse', 'Microphone', 'Webcam'], color: '#8b5cf6' },
            { name: 'Output Devices', items: ['Monitor', 'Printer', 'Speakers', 'Projector'], color: '#3b82f6' },
            { name: 'Network Hardware', items: ['Router', 'Switch', 'NIC', 'Hub'], color: '#10b981' },
            { name: 'Storage Devices', items: ['SSD', 'HDD', 'USB', 'Optical'], color: '#f59e0b' }
        ]
    }
};

class ConnectionWall {
    constructor(containerId, setName = 'set1') {
        this.container = document.getElementById(containerId);
        this.setName = setName;
        this.items = [];
        this.selectedItems = [];
        this.foundGroups = [];
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    init() {
        const data = connectionWallData[this.setName];
        if (!data) return;

        // Flatten all items
        this.items = [];
        data.groups.forEach(group => {
            group.items.forEach(item => {
                this.items.push({ text: item, group: group.name, color: group.color });
            });
        });

        // Shuffle items
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
        const data = connectionWallData[this.setName];

        this.container.innerHTML = `
            <div class="connection-wall-header">
                <h3>${data.title}</h3>
                <p>Find the 4 groups of 4 connected items!</p>
                <div class="game-stats">
                    <span class="stat"><i class="fas fa-bullseye"></i> Groups Found: <span id="groupsFound">${this.foundGroups.length}</span>/4</span>
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
                    <i class="fas fa-check"></i> Check Selection
                </button>
                <button class="btn btn-secondary" onclick="connectionWall.clearSelection()">
                    <i class="fas fa-times"></i> Clear
                </button>
                <button class="btn btn-secondary" onclick="connectionWall.reset()">
                    <i class="fas fa-redo"></i> New Game
                </button>
                <select id="wallSetSelect" onchange="connectionWall.changeSet(this.value)">
                    <option value="set1" ${this.setName === 'set1' ? 'selected' : ''}>Set 1: Computer Science Mix</option>
                    <option value="set2" ${this.setName === 'set2' ? 'selected' : ''}>Set 2: Programming & Data</option>
                    <option value="set3" ${this.setName === 'set3' ? 'selected' : ''}>Set 3: Hardware & Networks</option>
                </select>
            </div>
        `;

        // Add click listeners
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
            // Correct!
            const groupName = groups[0];
            const groupData = connectionWallData[this.setName].groups.find(g => g.name === groupName);
            this.foundGroups.push({
                name: groupName,
                items: this.selectedItems.map(i => i.dataset.text),
                color: groupData.color
            });

            if (this.foundGroups.length === 4) {
                setTimeout(() => {
                    alert('Congratulations! You found all 4 groups!');
                }, 300);
            }

            this.selectedItems = [];
            this.render();
        } else {
            // Wrong
            this.attempts++;
            this.selectedItems.forEach(item => {
                item.classList.add('wrong');
                setTimeout(() => item.classList.remove('wrong'), 500);
            });

            if (this.attempts >= this.maxAttempts) {
                setTimeout(() => {
                    alert('Game Over! The groups were:\n' +
                        connectionWallData[this.setName].groups.map(g => `${g.name}: ${g.items.join(', ')}`).join('\n'));
                    this.reset();
                }, 600);
            } else {
                document.getElementById('livesLeft').textContent = this.maxAttempts - this.attempts;
            }

            this.clearSelection();
        }
    }

    reset() {
        this.selectedItems = [];
        this.foundGroups = [];
        this.attempts = 0;
        this.shuffleItems();
        this.render();
    }

    changeSet(setName) {
        this.setName = setName;
        this.selectedItems = [];
        this.foundGroups = [];
        this.attempts = 0;
        this.init();
    }
}


// ==================== CATEGORY SORT (Drag & Drop) ====================
const categorySortData = {
    hardware: {
        title: 'Hardware Components',
        categories: {
            'Input Devices': ['Keyboard', 'Mouse', 'Microphone', 'Scanner', 'Webcam'],
            'Output Devices': ['Monitor', 'Printer', 'Speakers', 'Headphones', 'Projector'],
            'Storage Devices': ['SSD', 'HDD', 'USB Drive', 'SD Card', 'Optical Drive']
        }
    },
    networks: {
        title: 'Network Concepts',
        categories: {
            'Network Hardware': ['Router', 'Switch', 'NIC', 'WAP', 'Firewall'],
            'Protocols': ['TCP/IP', 'HTTP', 'FTP', 'SMTP', 'DNS'],
            'Security': ['Encryption', 'Authentication', 'Firewall', 'VPN', 'Antivirus']
        }
    },
    programming: {
        title: 'Programming Concepts',
        categories: {
            'Data Types': ['Integer', 'String', 'Boolean', 'Float', 'Character'],
            'Control Structures': ['IF statement', 'FOR loop', 'WHILE loop', 'SWITCH', 'TRY/EXCEPT'],
            'Operators': ['Addition (+)', 'Modulus (%)', 'Equal to (==)', 'AND', 'OR']
        }
    }
};

class CategorySort {
    constructor(containerId, setName = 'hardware') {
        this.container = document.getElementById(containerId);
        this.setName = setName;
        this.items = [];
        this.correctPlacements = 0;
        this.totalItems = 0;
    }

    init() {
        const data = categorySortData[this.setName];
        if (!data) return;

        // Flatten all items and shuffle
        this.items = [];
        Object.entries(data.categories).forEach(([category, items]) => {
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
        const data = categorySortData[this.setName];
        const categories = Object.keys(data.categories);

        this.container.innerHTML = `
            <div class="category-sort-header">
                <h3>${data.title}</h3>
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
                    <div class="category-box" data-category="${cat}">
                        <h4>${cat}</h4>
                        <div class="category-dropzone" data-category="${cat}"></div>
                    </div>
                `).join('')}
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" onclick="categorySort.checkAll()">
                    <i class="fas fa-check-circle"></i> Check Answers
                </button>
                <button class="btn btn-secondary" onclick="categorySort.reset()">
                    <i class="fas fa-redo"></i> Reset
                </button>
                <select id="categorySetSelect" onchange="categorySort.changeSet(this.value)">
                    <option value="hardware" ${this.setName === 'hardware' ? 'selected' : ''}>Hardware Components</option>
                    <option value="networks" ${this.setName === 'networks' ? 'selected' : ''}>Network Concepts</option>
                    <option value="programming" ${this.setName === 'programming' ? 'selected' : ''}>Programming Concepts</option>
                </select>
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
                e.dataTransfer.setData('text/plain', item.outerHTML);
                e.dataTransfer.setData('category', item.dataset.category);
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

            if (parentZone) {
                const zoneCategory = parentZone.dataset.category;
                if (itemCategory === zoneCategory) {
                    item.classList.add('correct');
                    item.classList.remove('incorrect');
                    correct++;
                } else {
                    item.classList.add('incorrect');
                    item.classList.remove('correct');
                }
            } else {
                item.classList.remove('correct', 'incorrect');
            }
        });

        this.correctPlacements = correct;
        document.getElementById('correctCount').textContent = correct;

        if (correct === this.totalItems) {
            setTimeout(() => {
                alert('Excellent! All items sorted correctly!');
            }, 300);
        }
    }

    reset() {
        this.correctPlacements = 0;
        this.shuffleItems();
        this.render();
    }

    changeSet(setName) {
        this.setName = setName;
        this.init();
    }
}


// ==================== LOGIC GATES BUILDER ====================
class LogicGatesGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentQuestion = 0;
        this.score = 0;
        this.questions = this.generateQuestions();
    }

    generateQuestions() {
        return [
            { gate: 'AND', inputs: [0, 0], answer: 0 },
            { gate: 'AND', inputs: [1, 1], answer: 1 },
            { gate: 'OR', inputs: [0, 1], answer: 1 },
            { gate: 'OR', inputs: [0, 0], answer: 0 },
            { gate: 'NOT', inputs: [1], answer: 0 },
            { gate: 'NOT', inputs: [0], answer: 1 },
            { gate: 'XOR', inputs: [1, 1], answer: 0 },
            { gate: 'XOR', inputs: [0, 1], answer: 1 },
            { gate: 'NAND', inputs: [1, 1], answer: 0 },
            { gate: 'NOR', inputs: [0, 0], answer: 1 }
        ];
    }

    init() {
        this.shuffleQuestions();
        this.render();
    }

    shuffleQuestions() {
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    render() {
        const q = this.questions[this.currentQuestion];

        this.container.innerHTML = `
            <div class="logic-game-header">
                <h3>Logic Gates Challenge</h3>
                <div class="game-stats">
                    <span class="stat">Question: ${this.currentQuestion + 1}/${this.questions.length}</span>
                    <span class="stat">Score: ${this.score}</span>
                </div>
            </div>
            <div class="logic-question">
                <div class="gate-display">
                    <div class="gate-box ${q.gate.toLowerCase()}">
                        <span class="gate-name">${q.gate}</span>
                    </div>
                </div>
                <div class="inputs-display">
                    ${q.inputs.map((input, i) => `
                        <div class="input-value">
                            Input ${q.inputs.length > 1 ? String.fromCharCode(65 + i) : ''}: <strong>${input}</strong>
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
            feedback.innerHTML = '<p class="correct-feedback"><i class="fas fa-check-circle"></i> Correct!</p>';
            feedback.className = 'feedback correct';
        } else {
            feedback.innerHTML = `<p class="incorrect-feedback"><i class="fas fa-times-circle"></i> Incorrect. The answer was ${q.answer}</p>`;
            feedback.className = 'feedback incorrect';
        }

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.render();
            } else {
                this.showResults();
            }
        }, 1500);
    }

    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);
        let message = '';
        if (percentage >= 80) message = 'Excellent work!';
        else if (percentage >= 60) message = 'Good job!';
        else message = 'Keep practising!';

        this.container.innerHTML = `
            <div class="results-container">
                <h3>Game Complete!</h3>
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
        this.questions = this.generateQuestions();
        this.shuffleQuestions();
        this.render();
    }
}


// ==================== SEQUENCE BUILDER ====================
const sequenceData = {
    linearSearch: {
        title: 'Linear Search Algorithm',
        steps: [
            'Start at the first item in the list',
            'Compare current item with target value',
            'If they match, return the position',
            'If not, move to the next item',
            'Repeat until found or end of list',
            'If end reached, return "not found"'
        ]
    },
    binarySearch: {
        title: 'Binary Search Algorithm',
        steps: [
            'Find the middle item of the sorted list',
            'Compare middle item with target value',
            'If they match, return the position',
            'If target is less than middle, search left half',
            'If target is greater than middle, search right half',
            'Repeat until found or no items left'
        ]
    },
    bubbleSort: {
        title: 'Bubble Sort Algorithm',
        steps: [
            'Start at the beginning of the list',
            'Compare the first two adjacent items',
            'If they are in wrong order, swap them',
            'Move to the next pair and repeat',
            'Continue until end of list (one pass)',
            'Repeat passes until no swaps are made'
        ]
    },
    fetchExecute: {
        title: 'Fetch-Execute Cycle',
        steps: [
            'PC sends address to MAR',
            'Address sent to RAM via address bus',
            'Instruction fetched from RAM to MDR',
            'Instruction copied from MDR to CIR',
            'PC is incremented',
            'CU decodes the instruction',
            'ALU executes the instruction'
        ]
    }
};

class SequenceBuilder {
    constructor(containerId, algorithm = 'linearSearch') {
        this.container = document.getElementById(containerId);
        this.algorithm = algorithm;
        this.shuffledSteps = [];
        this.userOrder = [];
    }

    init() {
        const data = sequenceData[this.algorithm];
        if (!data) return;

        this.shuffledSteps = [...data.steps];
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
        const data = sequenceData[this.algorithm];

        this.container.innerHTML = `
            <div class="sequence-header">
                <h3>${data.title}</h3>
                <p>Drag and arrange the steps in the correct order!</p>
            </div>
            <div class="sequence-steps" id="sequenceSteps">
                ${this.shuffledSteps.map((step, idx) => `
                    <div class="sequence-step" draggable="true" data-original="${data.steps.indexOf(step)}">
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
                <select id="algorithmSelect" onchange="sequenceBuilder.changeAlgorithm(this.value)">
                    <option value="linearSearch" ${this.algorithm === 'linearSearch' ? 'selected' : ''}>Linear Search</option>
                    <option value="binarySearch" ${this.algorithm === 'binarySearch' ? 'selected' : ''}>Binary Search</option>
                    <option value="bubbleSort" ${this.algorithm === 'bubbleSort' ? 'selected' : ''}>Bubble Sort</option>
                    <option value="fetchExecute" ${this.algorithm === 'fetchExecute' ? 'selected' : ''}>Fetch-Execute Cycle</option>
                </select>
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
            step.addEventListener('dragstart', (e) => {
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
        const draggableElements = [...container.querySelectorAll('.sequence-step:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
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

    reset() {
        this.shuffleSteps();
        this.render();
    }

    changeAlgorithm(algorithm) {
        this.algorithm = algorithm;
        this.init();
    }
}


// Initialize games when DOM is ready
let memoryGame, connectionWall, categorySort, logicGame, sequenceBuilder;

document.addEventListener('DOMContentLoaded', function() {
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
