// ============================================
// EDEXCEL GCSE COMPUTER SCIENCE - MAIN JS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Mobile dropdown toggle
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            navMenu.classList.remove('active');
            dropdowns.forEach(d => d.classList.remove('active'));
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Initialize any activity that's on the page
    initMemoryMatch();
    initConnectionWall();
    initSequenceBuilder();
    initCodeBreaker();
    initLogicGates();
    initCookieQuizzer();
    initCategorySort();
});

// ============================================
// MEMORY MATCH GAME
// ============================================

function initMemoryMatch() {
    const memoryGrid = document.querySelector('.memory-grid');
    if (!memoryGrid) return;

    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let gameStarted = false;
    let timerInterval;
    let seconds = 0;

    // Get current topic data
    const topicSelect = document.getElementById('topic-select');
    let currentTopic = topicSelect ? topicSelect.value : 'topic1a';

    // Memory match data by topic
    const memoryData = {
        'topic1a': [
            { term: 'Algorithm', definition: 'A step-by-step set of instructions to solve a problem' },
            { term: 'Decomposition', definition: 'Breaking a complex problem into smaller parts' },
            { term: 'Abstraction', definition: 'Removing unnecessary details to focus on important aspects' },
            { term: 'Linear Search', definition: 'Checking each item one by one until found' },
            { term: 'Binary Search', definition: 'Dividing sorted data in half repeatedly' },
            { term: 'Bubble Sort', definition: 'Comparing adjacent pairs and swapping if needed' },
            { term: 'Merge Sort', definition: 'Dividing list, sorting halves, then merging' },
            { term: 'Pseudocode', definition: 'Plain language description of algorithm steps' }
        ],
        'topic1b': [
            { term: 'AND Gate', definition: 'Output 1 only when both inputs are 1' },
            { term: 'OR Gate', definition: 'Output 1 when at least one input is 1' },
            { term: 'NOT Gate', definition: 'Inverts the input (0 becomes 1, 1 becomes 0)' },
            { term: 'XOR Gate', definition: 'Output 1 when inputs are different' },
            { term: 'NAND Gate', definition: 'NOT AND - opposite of AND gate' },
            { term: 'NOR Gate', definition: 'NOT OR - opposite of OR gate' },
            { term: 'Truth Table', definition: 'Shows all possible input/output combinations' },
            { term: 'Boolean', definition: 'Data type with only True or False values' }
        ],
        'topic2a': [
            { term: 'Binary', definition: 'Number system using only 0 and 1' },
            { term: 'Denary', definition: 'Base-10 number system (0-9)' },
            { term: 'Hexadecimal', definition: 'Base-16 number system (0-9, A-F)' },
            { term: 'Bit', definition: 'Single binary digit (0 or 1)' },
            { term: 'Byte', definition: '8 bits grouped together' },
            { term: 'Nibble', definition: '4 bits (half a byte)' },
            { term: 'Overflow', definition: 'Result too large for available bits' },
            { term: 'Binary Shift', definition: 'Moving bits left or right to multiply/divide' }
        ],
        'topic2b': [
            { term: 'ASCII', definition: '7-bit character encoding standard' },
            { term: 'Unicode', definition: 'Universal character encoding for all languages' },
            { term: 'Bitmap', definition: 'Image made of pixels stored as binary' },
            { term: 'Resolution', definition: 'Number of pixels in an image' },
            { term: 'Colour Depth', definition: 'Number of bits per pixel' },
            { term: 'Sample Rate', definition: 'How often sound is measured per second' },
            { term: 'Lossy Compression', definition: 'Reduces file size by removing data permanently' },
            { term: 'Lossless Compression', definition: 'Reduces file size without losing any data' }
        ],
        'topic3a': [
            { term: 'CPU', definition: 'Central Processing Unit - brain of the computer' },
            { term: 'RAM', definition: 'Volatile memory for running programs' },
            { term: 'ROM', definition: 'Non-volatile memory with permanent data' },
            { term: 'ALU', definition: 'Arithmetic Logic Unit - performs calculations' },
            { term: 'Control Unit', definition: 'Manages fetch-decode-execute cycle' },
            { term: 'Cache', definition: 'Fast memory between CPU and RAM' },
            { term: 'Register', definition: 'Tiny, fast storage inside CPU' },
            { term: 'Clock Speed', definition: 'How many cycles CPU performs per second' }
        ],
        'topic4': [
            { term: 'LAN', definition: 'Local Area Network - small geographic area' },
            { term: 'WAN', definition: 'Wide Area Network - large geographic area' },
            { term: 'Protocol', definition: 'Rules for data communication' },
            { term: 'IP Address', definition: 'Unique identifier for device on network' },
            { term: 'MAC Address', definition: 'Unique hardware identifier for NIC' },
            { term: 'Router', definition: 'Directs data between different networks' },
            { term: 'Firewall', definition: 'Monitors and filters network traffic' },
            { term: 'Encryption', definition: 'Converting data to unreadable format' }
        ]
    };

    function createCards() {
        memoryGrid.innerHTML = '';
        const data = memoryData[currentTopic] || memoryData['topic1a'];

        // Create pairs array with both terms and definitions
        let cards = [];
        data.forEach((item, index) => {
            cards.push({ type: 'term', content: item.term, pairId: index });
            cards.push({ type: 'definition', content: item.definition, pairId: index });
        });

        // Shuffle cards
        cards = shuffleArray(cards);

        // Create card elements
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.pairId = card.pairId;
            cardElement.dataset.type = card.type;
            cardElement.innerHTML = `
                <div class="memory-card-inner">
                    <div class="memory-card-front"><i class="fas fa-question"></i></div>
                    <div class="memory-card-back">${card.content}</div>
                </div>
            `;
            cardElement.addEventListener('click', () => flipCard(cardElement));
            memoryGrid.appendChild(cardElement);
        });

        // Reset stats
        matchedPairs = 0;
        moves = 0;
        seconds = 0;
        updateStats();
    }

    function flipCard(card) {
        if (flippedCards.length >= 2) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;

        if (!gameStarted) {
            gameStarted = true;
            startTimer();
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            updateStats();
            checkMatch();
        }
    }

    function checkMatch() {
        const [card1, card2] = flippedCards;
        const match = card1.dataset.pairId === card2.dataset.pairId &&
                      card1.dataset.type !== card2.dataset.type;

        if (match) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            flippedCards = [];

            if (matchedPairs === (memoryData[currentTopic] || memoryData['topic1a']).length) {
                endGame();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            updateStats();
        }, 1000);
    }

    function updateStats() {
        const movesEl = document.getElementById('moves');
        const timerEl = document.getElementById('timer');
        const pairsEl = document.getElementById('pairs');

        if (movesEl) movesEl.textContent = moves;
        if (timerEl) timerEl.textContent = formatTime(seconds);
        if (pairsEl) pairsEl.textContent = `${matchedPairs}/${(memoryData[currentTopic] || memoryData['topic1a']).length}`;
    }

    function formatTime(secs) {
        const mins = Math.floor(secs / 60);
        const s = secs % 60;
        return `${mins}:${s.toString().padStart(2, '0')}`;
    }

    function endGame() {
        clearInterval(timerInterval);
        gameStarted = false;

        setTimeout(() => {
            alert(`Congratulations! You completed the game in ${moves} moves and ${formatTime(seconds)}!`);
        }, 500);
    }

    // Topic select handler
    if (topicSelect) {
        topicSelect.addEventListener('change', (e) => {
            currentTopic = e.target.value;
            resetGame();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGame);
    }

    function resetGame() {
        clearInterval(timerInterval);
        gameStarted = false;
        flippedCards = [];
        createCards();
    }

    // Initialize game
    createCards();
}

// ============================================
// CONNECTION WALL GAME
// ============================================

function initConnectionWall() {
    const connectionGrid = document.querySelector('.connection-grid');
    if (!connectionGrid) return;

    let selectedItems = [];
    let solvedGroups = [];
    let attempts = 0;

    const connectionData = {
        'topic1': {
            groups: [
                { name: 'Searching Algorithms', items: ['Linear Search', 'Binary Search', 'Sequential', 'Ordered List'], color: 'group-1' },
                { name: 'Sorting Algorithms', items: ['Bubble Sort', 'Merge Sort', 'Insertion Sort', 'Quick Sort'], color: 'group-2' },
                { name: 'Computational Thinking', items: ['Decomposition', 'Abstraction', 'Pattern Recognition', 'Algorithm Design'], color: 'group-3' },
                { name: 'Logic Gates', items: ['AND', 'OR', 'NOT', 'XOR'], color: 'group-4' }
            ]
        },
        'topic2': {
            groups: [
                { name: 'Number Systems', items: ['Binary', 'Denary', 'Hexadecimal', 'Octal'], color: 'group-1' },
                { name: 'Data Units', items: ['Bit', 'Byte', 'Kilobyte', 'Megabyte'], color: 'group-2' },
                { name: 'Image Properties', items: ['Resolution', 'Colour Depth', 'Pixel', 'Metadata'], color: 'group-3' },
                { name: 'Compression Types', items: ['Lossy', 'Lossless', 'RLE', 'Huffman'], color: 'group-4' }
            ]
        },
        'topic3': {
            groups: [
                { name: 'CPU Components', items: ['ALU', 'Control Unit', 'Registers', 'Cache'], color: 'group-1' },
                { name: 'Storage Types', items: ['HDD', 'SSD', 'Optical', 'Flash'], color: 'group-2' },
                { name: 'Memory', items: ['RAM', 'ROM', 'Virtual Memory', 'BIOS'], color: 'group-3' },
                { name: 'Software Types', items: ['Operating System', 'Utility', 'Application', 'Firmware'], color: 'group-4' }
            ]
        },
        'topic4': {
            groups: [
                { name: 'Network Types', items: ['LAN', 'WAN', 'PAN', 'MAN'], color: 'group-1' },
                { name: 'Topologies', items: ['Star', 'Bus', 'Ring', 'Mesh'], color: 'group-2' },
                { name: 'Security Threats', items: ['Malware', 'Phishing', 'SQL Injection', 'DDoS'], color: 'group-3' },
                { name: 'Protocols', items: ['TCP/IP', 'HTTP', 'FTP', 'SMTP'], color: 'group-4' }
            ]
        }
    };

    const topicSelect = document.getElementById('topic-select');
    let currentTopic = topicSelect ? topicSelect.value : 'topic1';

    function createWall() {
        connectionGrid.innerHTML = '';
        const data = connectionData[currentTopic] || connectionData['topic1'];

        // Collect all items and shuffle
        let allItems = [];
        data.groups.forEach(group => {
            group.items.forEach(item => {
                allItems.push({ text: item, group: group.name, color: group.color });
            });
        });
        allItems = shuffleArray(allItems);

        // Create item elements
        allItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'connection-item';
            itemEl.textContent = item.text;
            itemEl.dataset.group = item.group;
            itemEl.dataset.color = item.color;
            itemEl.addEventListener('click', () => selectItem(itemEl));
            connectionGrid.appendChild(itemEl);
        });

        solvedGroups = [];
        attempts = 0;
        updateAttempts();
    }

    function selectItem(item) {
        if (item.classList.contains('solved')) return;

        if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            selectedItems = selectedItems.filter(i => i !== item);
        } else {
            if (selectedItems.length < 4) {
                item.classList.add('selected');
                selectedItems.push(item);
            }
        }

        if (selectedItems.length === 4) {
            checkGroup();
        }
    }

    function checkGroup() {
        const groupName = selectedItems[0].dataset.group;
        const allSameGroup = selectedItems.every(item => item.dataset.group === groupName);

        attempts++;
        updateAttempts();

        if (allSameGroup) {
            const color = selectedItems[0].dataset.color;
            selectedItems.forEach(item => {
                item.classList.remove('selected');
                item.classList.add('solved', color);
            });

            solvedGroups.push(groupName);
            showSolvedGroup(groupName, selectedItems.map(i => i.textContent), color);
            selectedItems = [];

            if (solvedGroups.length === 4) {
                setTimeout(() => {
                    alert(`Well done! You solved all groups in ${attempts} attempts!`);
                }, 500);
            }
        } else {
            // Wrong guess - shake and deselect
            selectedItems.forEach(item => {
                item.classList.add('shake');
                setTimeout(() => {
                    item.classList.remove('shake', 'selected');
                }, 500);
            });
            selectedItems = [];
        }
    }

    function showSolvedGroup(name, items, color) {
        const solvedContainer = document.querySelector('.solved-groups');
        if (!solvedContainer) return;

        const groupEl = document.createElement('div');
        groupEl.className = `solved-group ${color}`;
        groupEl.innerHTML = `
            <h4>${name}</h4>
            <p>${items.join(' • ')}</p>
        `;
        solvedContainer.appendChild(groupEl);
    }

    function updateAttempts() {
        const attemptsEl = document.getElementById('attempts');
        if (attemptsEl) attemptsEl.textContent = attempts;
    }

    // Topic change handler
    if (topicSelect) {
        topicSelect.addEventListener('change', (e) => {
            currentTopic = e.target.value;
            const solvedContainer = document.querySelector('.solved-groups');
            if (solvedContainer) solvedContainer.innerHTML = '';
            selectedItems = [];
            createWall();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const solvedContainer = document.querySelector('.solved-groups');
            if (solvedContainer) solvedContainer.innerHTML = '';
            selectedItems = [];
            createWall();
        });
    }

    createWall();
}

// ============================================
// SEQUENCE BUILDER
// ============================================

function initSequenceBuilder() {
    const sequenceContainer = document.querySelector('.sequence-container');
    if (!sequenceContainer) return;

    const sequenceData = {
        'fetch-execute': {
            title: 'Fetch-Decode-Execute Cycle',
            steps: [
                'PC sends address to MAR',
                'Address sent along address bus to memory',
                'Data from memory sent to MDR via data bus',
                'MDR sends instruction to CIR',
                'CIR sends instruction to Control Unit to decode',
                'Control Unit executes the instruction',
                'PC increments to next instruction'
            ]
        },
        'bubble-sort': {
            title: 'Bubble Sort Algorithm',
            steps: [
                'Start at the beginning of the list',
                'Compare first two adjacent elements',
                'If first > second, swap them',
                'Move to next pair of adjacent elements',
                'Repeat until end of list (one pass)',
                'If any swaps were made, repeat from start',
                'Stop when a pass has no swaps'
            ]
        },
        'binary-search': {
            title: 'Binary Search Algorithm',
            steps: [
                'Ensure the list is sorted',
                'Set low to 0 and high to list length - 1',
                'Calculate mid point: (low + high) / 2',
                'Compare middle element with target',
                'If equal, return the position',
                'If target < middle, set high = mid - 1',
                'If target > middle, set low = mid + 1',
                'Repeat until found or low > high'
            ]
        },
        'tcp-handshake': {
            title: 'TCP Three-Way Handshake',
            steps: [
                'Client sends SYN packet to server',
                'Server receives SYN request',
                'Server sends SYN-ACK packet back',
                'Client receives SYN-ACK',
                'Client sends ACK packet to server',
                'Server receives ACK',
                'Connection established - data transfer begins'
            ]
        }
    };

    const challengeSelect = document.getElementById('challenge-select');
    let currentChallenge = challengeSelect ? challengeSelect.value : 'fetch-execute';
    let draggedItem = null;

    function createSequence() {
        sequenceContainer.innerHTML = '';
        const data = sequenceData[currentChallenge];

        // Shuffle steps
        const shuffledSteps = shuffleArray([...data.steps]);

        shuffledSteps.forEach((step, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'sequence-item';
            itemEl.draggable = true;
            itemEl.dataset.correctPosition = data.steps.indexOf(step);
            itemEl.innerHTML = `
                <span class="step-number">${index + 1}</span>
                <span class="step-text">${step}</span>
                <i class="fas fa-grip-vertical"></i>
            `;

            // Drag events
            itemEl.addEventListener('dragstart', handleDragStart);
            itemEl.addEventListener('dragend', handleDragEnd);
            itemEl.addEventListener('dragover', handleDragOver);
            itemEl.addEventListener('drop', handleDrop);

            sequenceContainer.appendChild(itemEl);
        });
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedItem = null;
        updateStepNumbers();
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (this !== draggedItem) {
            const items = [...sequenceContainer.querySelectorAll('.sequence-item')];
            const draggedIndex = items.indexOf(draggedItem);
            const targetIndex = items.indexOf(this);

            if (draggedIndex < targetIndex) {
                this.after(draggedItem);
            } else {
                this.before(draggedItem);
            }
        }
    }

    function handleDrop(e) {
        e.preventDefault();
    }

    function updateStepNumbers() {
        const items = sequenceContainer.querySelectorAll('.sequence-item');
        items.forEach((item, index) => {
            item.querySelector('.step-number').textContent = index + 1;
        });
    }

    function checkSequence() {
        const items = sequenceContainer.querySelectorAll('.sequence-item');
        let correct = 0;

        items.forEach((item, index) => {
            item.classList.remove('correct', 'incorrect');
            if (parseInt(item.dataset.correctPosition) === index) {
                item.classList.add('correct');
                correct++;
            } else {
                item.classList.add('incorrect');
            }
        });

        const resultEl = document.getElementById('sequence-result');
        if (resultEl) {
            resultEl.textContent = `${correct}/${items.length} correct`;
            resultEl.className = correct === items.length ? 'success' : 'partial';
        }

        if (correct === items.length) {
            setTimeout(() => alert('Perfect! All steps are in the correct order!'), 300);
        }
    }

    // Challenge change handler
    if (challengeSelect) {
        challengeSelect.addEventListener('change', (e) => {
            currentChallenge = e.target.value;
            createSequence();
        });
    }

    // Check button
    const checkBtn = document.getElementById('check-sequence');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkSequence);
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', createSequence);
    }

    createSequence();
}

// ============================================
// CODE BREAKER
// ============================================

function initCodeBreaker() {
    const codeEditor = document.querySelector('.code-editor textarea');
    if (!codeEditor) return;

    const challenges = {
        'variables': {
            title: 'Fix the Variables',
            buggyCode: `# Calculate the area of a rectangle
length = 10
width = 5
area = length + width  # Bug here!
print("The area is:", area)`,
            correctCode: `length = 10
width = 5
area = length * width
print("The area is:", area)`,
            expectedOutput: 'The area is: 50',
            hint: 'Check the operation used to calculate area'
        },
        'loops': {
            title: 'Fix the Loop',
            buggyCode: `# Print numbers 1 to 5
for i in range(5):  # Bug here!
    print(i)`,
            correctCode: `for i in range(1, 6):
    print(i)`,
            expectedOutput: '1\n2\n3\n4\n5',
            hint: 'Think about what range(5) actually produces'
        },
        'conditions': {
            title: 'Fix the Condition',
            buggyCode: `# Check if number is positive, negative, or zero
number = -5
if number > 0:
    print("Positive")
if number < 0:  # Bug: should use elif
    print("Negative")
if number = 0:  # Bug here!
    print("Zero")`,
            correctCode: `number = -5
if number > 0:
    print("Positive")
elif number < 0:
    print("Negative")
else:
    print("Zero")`,
            expectedOutput: 'Negative',
            hint: 'Check assignment vs comparison operators'
        },
        'lists': {
            title: 'Fix the List',
            buggyCode: `# Find the average of numbers
numbers = [10, 20, 30, 40, 50]
total = 0
for num in numbers:
    total = num  # Bug here!
average = total / len(numbers)
print("Average:", average)`,
            correctCode: `numbers = [10, 20, 30, 40, 50]
total = 0
for num in numbers:
    total = total + num
average = total / len(numbers)
print("Average:", average)`,
            expectedOutput: 'Average: 30.0',
            hint: 'Are you accumulating the total correctly?'
        },
        'functions': {
            title: 'Fix the Function',
            buggyCode: `# Function to check if number is even
def is_even(number):
    if number % 2 == 0:
        print("Even")  # Bug: should return
    else:
        print("Odd")

result = is_even(4)
print("Result:", result)`,
            correctCode: `def is_even(number):
    if number % 2 == 0:
        return True
    else:
        return False

result = is_even(4)
print("Result:", result)`,
            expectedOutput: 'Result: True',
            hint: 'Functions should return values, not print them'
        }
    };

    const challengeSelect = document.getElementById('challenge-select');
    let currentChallenge = challengeSelect ? challengeSelect.value : 'variables';

    function loadChallenge() {
        const challenge = challenges[currentChallenge];
        codeEditor.value = challenge.buggyCode;

        const titleEl = document.getElementById('challenge-title');
        if (titleEl) titleEl.textContent = challenge.title;

        const outputEl = document.querySelector('.code-output pre');
        if (outputEl) outputEl.textContent = 'Click "Run Code" to test';

        const hintEl = document.getElementById('hint-text');
        if (hintEl) hintEl.textContent = challenge.hint;
    }

    function runCode() {
        const code = codeEditor.value;
        const outputEl = document.querySelector('.code-output pre');
        const outputContainer = document.querySelector('.code-output');

        // Simple code checking (not actual execution for security)
        const challenge = challenges[currentChallenge];

        // Normalize code for comparison
        const normalizedInput = code.replace(/\s+/g, ' ').trim();
        const normalizedCorrect = challenge.correctCode.replace(/\s+/g, ' ').trim();

        // Check for common fixes
        let output = '';
        let isCorrect = false;

        // Simplified validation based on challenge type
        if (currentChallenge === 'variables' && code.includes('length * width')) {
            output = challenge.expectedOutput;
            isCorrect = true;
        } else if (currentChallenge === 'loops' && code.includes('range(1, 6)')) {
            output = challenge.expectedOutput;
            isCorrect = true;
        } else if (currentChallenge === 'conditions' && code.includes('== 0') && code.includes('elif')) {
            output = challenge.expectedOutput;
            isCorrect = true;
        } else if (currentChallenge === 'lists' && (code.includes('total = total + num') || code.includes('total += num'))) {
            output = challenge.expectedOutput;
            isCorrect = true;
        } else if (currentChallenge === 'functions' && code.includes('return True') && code.includes('return False')) {
            output = challenge.expectedOutput;
            isCorrect = true;
        } else {
            output = 'Error: The code still has bugs. Try again!';
        }

        outputEl.textContent = output;
        outputContainer.classList.toggle('error', !isCorrect);

        if (isCorrect) {
            setTimeout(() => alert('Well done! You fixed the bug!'), 300);
        }
    }

    // Challenge change handler
    if (challengeSelect) {
        challengeSelect.addEventListener('change', (e) => {
            currentChallenge = e.target.value;
            loadChallenge();
        });
    }

    // Run button
    const runBtn = document.getElementById('run-code');
    if (runBtn) {
        runBtn.addEventListener('click', runCode);
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', loadChallenge);
    }

    // Show hint button
    const hintBtn = document.getElementById('show-hint');
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            const hintEl = document.getElementById('hint-text');
            if (hintEl) {
                hintEl.style.display = hintEl.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    loadChallenge();
}

// ============================================
// LOGIC GATES SIMULATOR
// ============================================

function initLogicGates() {
    const truthTableContainer = document.querySelector('.truth-table');
    if (!truthTableContainer) return;

    const gateData = {
        'AND': {
            inputs: 2,
            truthTable: [[0,0,0], [0,1,0], [1,0,0], [1,1,1]]
        },
        'OR': {
            inputs: 2,
            truthTable: [[0,0,0], [0,1,1], [1,0,1], [1,1,1]]
        },
        'NOT': {
            inputs: 1,
            truthTable: [[0,1], [1,0]]
        },
        'XOR': {
            inputs: 2,
            truthTable: [[0,0,0], [0,1,1], [1,0,1], [1,1,0]]
        },
        'NAND': {
            inputs: 2,
            truthTable: [[0,0,1], [0,1,1], [1,0,1], [1,1,0]]
        },
        'NOR': {
            inputs: 2,
            truthTable: [[0,0,1], [0,1,0], [1,0,0], [1,1,0]]
        }
    };

    const gateSelect = document.getElementById('gate-select');
    let currentGate = gateSelect ? gateSelect.value : 'AND';

    function createTruthTable() {
        const gate = gateData[currentGate];
        const table = truthTableContainer.querySelector('table') || document.createElement('table');
        table.innerHTML = '';

        // Create header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        if (gate.inputs === 1) {
            headerRow.innerHTML = '<th>Input A</th><th>Output Q</th><th>Your Answer</th>';
        } else {
            headerRow.innerHTML = '<th>Input A</th><th>Input B</th><th>Output Q</th><th>Your Answer</th>';
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        gate.truthTable.forEach((row, index) => {
            const tr = document.createElement('tr');

            if (gate.inputs === 1) {
                tr.innerHTML = `
                    <td>${row[0]}</td>
                    <td class="answer" data-answer="${row[1]}">?</td>
                    <td><input type="text" maxlength="1" data-row="${index}"></td>
                `;
            } else {
                tr.innerHTML = `
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                    <td class="answer" data-answer="${row[2]}">?</td>
                    <td><input type="text" maxlength="1" data-row="${index}"></td>
                `;
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        if (!truthTableContainer.contains(table)) {
            truthTableContainer.appendChild(table);
        }

        // Add input handlers
        table.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', checkAnswer);
        });
    }

    function checkAnswer(e) {
        const input = e.target;
        const row = input.closest('tr');
        const answerCell = row.querySelector('.answer');
        const correctAnswer = answerCell.dataset.answer;
        const userAnswer = input.value.trim();

        input.classList.remove('correct', 'incorrect');

        if (userAnswer === '') return;

        if (userAnswer === correctAnswer) {
            input.classList.add('correct');
            answerCell.textContent = correctAnswer;
        } else {
            input.classList.add('incorrect');
        }

        // Check if all correct
        checkAllAnswers();
    }

    function checkAllAnswers() {
        const inputs = truthTableContainer.querySelectorAll('input');
        const allCorrect = Array.from(inputs).every(input => input.classList.contains('correct'));

        if (allCorrect && inputs.length > 0) {
            setTimeout(() => alert(`Excellent! You completed the ${currentGate} gate truth table!`), 300);
        }
    }

    // Gate change handler
    if (gateSelect) {
        gateSelect.addEventListener('change', (e) => {
            currentGate = e.target.value;
            createTruthTable();
        });
    }

    // Reveal answers
    const revealBtn = document.getElementById('reveal-answers');
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            truthTableContainer.querySelectorAll('.answer').forEach(cell => {
                cell.textContent = cell.dataset.answer;
            });
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', createTruthTable);
    }

    createTruthTable();
}

// ============================================
// COOKIE QUIZZER
// ============================================

function initCookieQuizzer() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;

    const quizData = {
        'topic1': [
            {
                question: 'What is the main purpose of decomposition in computational thinking?',
                options: ['Making code run faster', 'Breaking complex problems into smaller parts', 'Removing errors from code', 'Compressing data'],
                correct: 1
            },
            {
                question: 'Which search algorithm requires a sorted list?',
                options: ['Linear search', 'Binary search', 'Bubble sort', 'Merge sort'],
                correct: 1
            },
            {
                question: 'What is the output of an AND gate when both inputs are 1?',
                options: ['0', '1', 'True', 'False'],
                correct: 1
            },
            {
                question: 'In pseudocode, what does "←" typically represent?',
                options: ['Less than', 'Assignment', 'Comparison', 'Loop'],
                correct: 1
            },
            {
                question: 'What is abstraction in computational thinking?',
                options: ['Adding more detail', 'Focusing on important details and ignoring irrelevant ones', 'Breaking down problems', 'Finding patterns'],
                correct: 1
            }
        ],
        'topic2': [
            {
                question: 'What is the denary value of binary 1010?',
                options: ['8', '10', '12', '15'],
                correct: 1
            },
            {
                question: 'How many bits are in a byte?',
                options: ['4', '8', '16', '32'],
                correct: 1
            },
            {
                question: 'Which character encoding uses 7 bits?',
                options: ['Unicode', 'ASCII', 'UTF-8', 'Extended ASCII'],
                correct: 1
            },
            {
                question: 'What happens in lossy compression?',
                options: ['Data is lost permanently', 'Data can be fully recovered', 'File size increases', 'Quality improves'],
                correct: 0
            },
            {
                question: 'What does colour depth determine in an image?',
                options: ['Image size', 'Number of colours available', 'Resolution', 'File format'],
                correct: 1
            }
        ],
        'topic3': [
            {
                question: 'What does CPU stand for?',
                options: ['Central Processing Unit', 'Computer Processing Unit', 'Central Program Unit', 'Core Processing Unit'],
                correct: 0
            },
            {
                question: 'Which type of memory is volatile?',
                options: ['ROM', 'RAM', 'SSD', 'HDD'],
                correct: 1
            },
            {
                question: 'What is the function of the ALU?',
                options: ['Store data', 'Perform calculations', 'Manage memory', 'Control peripherals'],
                correct: 1
            },
            {
                question: 'What type of software is an operating system?',
                options: ['Application software', 'System software', 'Utility software', 'Firmware'],
                correct: 1
            },
            {
                question: 'Which component temporarily stores data being transferred between CPU and memory?',
                options: ['Cache', 'Register', 'Hard drive', 'ROM'],
                correct: 0
            }
        ],
        'topic4': [
            {
                question: 'What type of network covers a small geographical area?',
                options: ['WAN', 'LAN', 'MAN', 'PAN'],
                correct: 1
            },
            {
                question: 'Which protocol is used for sending emails?',
                options: ['HTTP', 'FTP', 'SMTP', 'DNS'],
                correct: 2
            },
            {
                question: 'What is the purpose of a firewall?',
                options: ['Speed up network', 'Monitor and filter traffic', 'Store data', 'Assign IP addresses'],
                correct: 1
            },
            {
                question: 'Which network topology has all devices connected to a central hub?',
                options: ['Bus', 'Ring', 'Star', 'Mesh'],
                correct: 2
            },
            {
                question: 'What does encryption do to data?',
                options: ['Compresses it', 'Deletes it', 'Scrambles it to prevent unauthorized access', 'Speeds up transmission'],
                correct: 2
            }
        ]
    };

    const topicSelect = document.getElementById('topic-select');
    let currentTopic = topicSelect ? topicSelect.value : 'topic1';
    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    function loadQuiz() {
        currentQuestion = 0;
        score = 0;
        answered = false;
        displayQuestion();
        updateProgress();
    }

    function displayQuestion() {
        const questions = quizData[currentTopic];
        if (currentQuestion >= questions.length) {
            showResults();
            return;
        }

        const q = questions[currentQuestion];
        const questionEl = quizContainer.querySelector('.quiz-question');

        if (questionEl) {
            questionEl.innerHTML = `
                <h3>Question ${currentQuestion + 1}: ${q.question}</h3>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <div class="quiz-option" data-index="${i}">
                            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="option-text">${opt}</span>
                        </div>
                    `).join('')}
                </div>
            `;

            questionEl.querySelectorAll('.quiz-option').forEach(opt => {
                opt.addEventListener('click', () => selectAnswer(opt));
            });
        }

        answered = false;
        updateProgress();
    }

    function selectAnswer(option) {
        if (answered) return;
        answered = true;

        const selectedIndex = parseInt(option.dataset.index);
        const correctIndex = quizData[currentTopic][currentQuestion].correct;

        const options = quizContainer.querySelectorAll('.quiz-option');
        options.forEach((opt, i) => {
            opt.classList.remove('selected');
            if (i === correctIndex) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && selectedIndex !== correctIndex) {
                opt.classList.add('incorrect');
            }
        });

        option.classList.add('selected');

        if (selectedIndex === correctIndex) {
            score++;
        }

        // Auto-advance after delay
        setTimeout(() => {
            currentQuestion++;
            displayQuestion();
        }, 1500);
    }

    function updateProgress() {
        const questions = quizData[currentTopic];
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const scoreEl = document.getElementById('score');

        if (progressFill) {
            progressFill.style.width = `${(currentQuestion / questions.length) * 100}%`;
        }
        if (progressText) {
            progressText.textContent = `${currentQuestion}/${questions.length}`;
        }
        if (scoreEl) {
            scoreEl.textContent = score;
        }
    }

    function showResults() {
        const questions = quizData[currentTopic];
        const questionEl = quizContainer.querySelector('.quiz-question');
        const percentage = Math.round((score / questions.length) * 100);

        let message = '';
        if (percentage >= 80) {
            message = 'Excellent work!';
        } else if (percentage >= 60) {
            message = 'Good effort!';
        } else {
            message = 'Keep practicing!';
        }

        if (questionEl) {
            questionEl.innerHTML = `
                <div class="quiz-results">
                    <h3>Quiz Complete!</h3>
                    <div class="score-display">
                        <span class="score-number">${score}/${questions.length}</span>
                        <span class="score-percent">${percentage}%</span>
                    </div>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    // Topic change handler
    if (topicSelect) {
        topicSelect.addEventListener('change', (e) => {
            currentTopic = e.target.value;
            loadQuiz();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', loadQuiz);
    }

    loadQuiz();
}

// ============================================
// CATEGORY SORT
// ============================================

function initCategorySort() {
    const itemsPool = document.querySelector('.items-pool');
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!itemsPool || !categoriesGrid) return;

    const sortData = {
        'hardware-software': {
            categories: [
                { name: 'Hardware', items: ['CPU', 'RAM', 'Keyboard', 'Monitor', 'SSD', 'GPU'] },
                { name: 'Software', items: ['Operating System', 'Web Browser', 'Word Processor', 'Antivirus', 'Device Driver', 'Compiler'] }
            ]
        },
        'input-output': {
            categories: [
                { name: 'Input Devices', items: ['Keyboard', 'Mouse', 'Microphone', 'Scanner', 'Webcam', 'Touchscreen'] },
                { name: 'Output Devices', items: ['Monitor', 'Printer', 'Speakers', 'Projector', 'Headphones', 'Plotter'] }
            ]
        },
        'volatile-non-volatile': {
            categories: [
                { name: 'Volatile Memory', items: ['RAM', 'Cache', 'SRAM', 'DRAM', 'Registers', 'Virtual Memory'] },
                { name: 'Non-Volatile Storage', items: ['HDD', 'SSD', 'ROM', 'USB Flash Drive', 'DVD', 'SD Card'] }
            ]
        },
        'network-security': {
            categories: [
                { name: 'Security Threats', items: ['Malware', 'Phishing', 'SQL Injection', 'Brute Force', 'Social Engineering', 'Man-in-the-Middle'] },
                { name: 'Security Measures', items: ['Firewall', 'Encryption', 'Two-Factor Auth', 'Antivirus', 'Password Policy', 'Backup'] }
            ]
        }
    };

    const challengeSelect = document.getElementById('challenge-select');
    let currentChallenge = challengeSelect ? challengeSelect.value : 'hardware-software';
    let draggedItem = null;

    function createGame() {
        const data = sortData[currentChallenge];

        // Clear existing content
        itemsPool.innerHTML = '';
        categoriesGrid.innerHTML = '';

        // Collect and shuffle all items
        let allItems = [];
        data.categories.forEach(cat => {
            cat.items.forEach(item => {
                allItems.push({ text: item, category: cat.name });
            });
        });
        allItems = shuffleArray(allItems);

        // Create item elements in pool
        allItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'sort-item';
            itemEl.textContent = item.text;
            itemEl.draggable = true;
            itemEl.dataset.category = item.category;

            itemEl.addEventListener('dragstart', handleItemDragStart);
            itemEl.addEventListener('dragend', handleItemDragEnd);

            itemsPool.appendChild(itemEl);
        });

        // Create category boxes
        data.categories.forEach(cat => {
            const boxEl = document.createElement('div');
            boxEl.className = 'category-box';
            boxEl.dataset.category = cat.name;
            boxEl.innerHTML = `
                <h4>${cat.name}</h4>
                <div class="category-items"></div>
            `;

            boxEl.addEventListener('dragover', handleCategoryDragOver);
            boxEl.addEventListener('dragleave', handleCategoryDragLeave);
            boxEl.addEventListener('drop', handleCategoryDrop);

            categoriesGrid.appendChild(boxEl);
        });
    }

    function handleItemDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
    }

    function handleItemDragEnd(e) {
        this.classList.remove('dragging');
        draggedItem = null;
    }

    function handleCategoryDragOver(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function handleCategoryDragLeave(e) {
        this.classList.remove('drag-over');
    }

    function handleCategoryDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');

        if (!draggedItem) return;

        const categoryItems = this.querySelector('.category-items');
        const isCorrect = draggedItem.dataset.category === this.dataset.category;

        // Clone the item
        const newItem = draggedItem.cloneNode(true);
        newItem.classList.remove('dragging');
        newItem.style.cursor = 'default';
        newItem.draggable = false;

        if (isCorrect) {
            newItem.style.background = 'rgba(16, 185, 129, 0.2)';
            newItem.style.borderColor = '#10b981';
        } else {
            newItem.style.background = 'rgba(239, 68, 68, 0.2)';
            newItem.style.borderColor = '#ef4444';
        }

        categoryItems.appendChild(newItem);
        draggedItem.remove();

        // Check completion
        checkCompletion();
    }

    function checkCompletion() {
        const remainingItems = itemsPool.querySelectorAll('.sort-item');
        if (remainingItems.length === 0) {
            // Count correct answers
            let correct = 0;
            let total = 0;

            categoriesGrid.querySelectorAll('.category-box').forEach(box => {
                const category = box.dataset.category;
                box.querySelectorAll('.sort-item').forEach(item => {
                    total++;
                    if (item.dataset.category === category) {
                        correct++;
                    }
                });
            });

            setTimeout(() => {
                alert(`Complete! You got ${correct}/${total} correct!`);
            }, 300);
        }
    }

    // Challenge change handler
    if (challengeSelect) {
        challengeSelect.addEventListener('change', (e) => {
            currentChallenge = e.target.value;
            createGame();
        });
    }

    // Reset button
    const resetBtn = document.getElementById('reset-game');
    if (resetBtn) {
        resetBtn.addEventListener('click', createGame);
    }

    createGame();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Add shake animation for wrong answers
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .shake {
        animation: shake 0.3s ease-in-out;
    }
    .quiz-results {
        text-align: center;
        padding: 2rem;
    }
    .score-display {
        font-size: 3rem;
        font-weight: bold;
        margin: 1.5rem 0;
        color: var(--primary-color);
    }
    .score-percent {
        display: block;
        font-size: 1.5rem;
        color: var(--text-secondary);
    }
`;
document.head.appendChild(style);
