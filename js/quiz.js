// ============================================
// QUIZ SYSTEM WITH PDF GENERATION
// ============================================

// Quiz questions by topic
const quizQuestions = {
    topic1: [
        {
            question: "What is decomposition in computational thinking?",
            options: [
                "Making code run faster",
                "Breaking a complex problem into smaller, manageable parts",
                "Removing errors from code",
                "Compressing data files"
            ],
            correct: 1,
            explanation: "Decomposition means breaking down a complex problem into smaller sub-problems that are easier to solve."
        },
        {
            question: "What is abstraction?",
            options: [
                "Adding more detail to a problem",
                "Making code more complex",
                "Focusing on important details and ignoring irrelevant ones",
                "Converting code to binary"
            ],
            correct: 2,
            explanation: "Abstraction removes unnecessary details to focus only on what's important for solving the problem."
        },
        {
            question: "Which search algorithm requires data to be sorted first?",
            options: [
                "Linear search",
                "Binary search",
                "Both algorithms",
                "Neither algorithm"
            ],
            correct: 1,
            explanation: "Binary search only works on sorted data because it relies on comparing the middle value to determine which half to search."
        },
        {
            question: "How many comparisons would a linear search need in the WORST case to find an item in a list of 100 items?",
            options: [
                "1",
                "7",
                "50",
                "100"
            ],
            correct: 3,
            explanation: "In the worst case, linear search checks every item, so 100 items = 100 comparisons."
        },
        {
            question: "How many comparisons would a binary search need in the WORST case for a list of 1000 items?",
            options: [
                "10",
                "100",
                "500",
                "1000"
            ],
            correct: 0,
            explanation: "Binary search halves the data each time. 2^10 = 1024, so maximum 10 comparisons for 1000 items."
        },
        {
            question: "In bubble sort, what happens after each complete pass?",
            options: [
                "The smallest item moves to the start",
                "The largest item 'bubbles' to the end",
                "All items are sorted",
                "The list is reversed"
            ],
            correct: 1,
            explanation: "In bubble sort, the largest unsorted value 'bubbles up' to its correct position at the end after each pass."
        },
        {
            question: "Which sorting algorithm uses 'divide and conquer'?",
            options: [
                "Bubble sort",
                "Linear sort",
                "Merge sort",
                "Binary sort"
            ],
            correct: 2,
            explanation: "Merge sort divides the list into halves repeatedly, then conquers by merging them back in sorted order."
        },
        {
            question: "What is the output of an AND gate when both inputs are 1?",
            options: [
                "0",
                "1",
                "2",
                "Undefined"
            ],
            correct: 1,
            explanation: "AND gate outputs 1 only when BOTH inputs are 1. This is the only case where AND gives 1."
        },
        {
            question: "What is the output of an OR gate when inputs are A=0 and B=1?",
            options: [
                "0",
                "1",
                "2",
                "Undefined"
            ],
            correct: 1,
            explanation: "OR gate outputs 1 when AT LEAST ONE input is 1. Since B=1, the output is 1."
        },
        {
            question: "What does a NOT gate do?",
            options: [
                "Outputs 1 if both inputs are 1",
                "Outputs 1 if any input is 1",
                "Inverts the input (0 becomes 1, 1 becomes 0)",
                "Outputs the same as the input"
            ],
            correct: 2,
            explanation: "A NOT gate (inverter) flips the input: 0 becomes 1, and 1 becomes 0."
        },
        {
            question: "What is the key difference between OR and XOR gates?",
            options: [
                "XOR only has one input",
                "OR outputs 0 when both inputs are 1",
                "XOR outputs 0 when both inputs are 1",
                "There is no difference"
            ],
            correct: 2,
            explanation: "XOR (exclusive OR) outputs 1 only when inputs are DIFFERENT. When both are 1, XOR outputs 0, but OR outputs 1."
        },
        {
            question: "How many rows are needed in a truth table for 3 inputs?",
            options: [
                "3",
                "6",
                "8",
                "9"
            ],
            correct: 2,
            explanation: "For n inputs, you need 2^n rows. For 3 inputs: 2³ = 8 rows to cover all combinations."
        },
        {
            question: "What is a NAND gate?",
            options: [
                "A new type of AND gate",
                "NOT AND - the opposite of an AND gate",
                "A gate with no output",
                "A gate that only works with negative numbers"
            ],
            correct: 1,
            explanation: "NAND stands for NOT AND. It gives the opposite output to an AND gate."
        },
        {
            question: "Which flowchart symbol represents a decision?",
            options: [
                "Rectangle",
                "Oval",
                "Diamond",
                "Parallelogram"
            ],
            correct: 2,
            explanation: "A diamond shape represents a decision (Yes/No question) in a flowchart."
        },
        {
            question: "What is the time complexity of bubble sort?",
            options: [
                "O(1)",
                "O(n)",
                "O(n log n)",
                "O(n²)"
            ],
            correct: 3,
            explanation: "Bubble sort has O(n²) time complexity, making it slow for large datasets because it uses nested loops."
        }
    ]
};

// Initialize quiz
function initQuiz(topicId) {
    const quizForm = document.getElementById('topic1-quiz');
    const questions = quizQuestions[topicId];

    if (!quizForm || !questions) return;

    // Generate quiz HTML
    let html = '';
    questions.forEach((q, index) => {
        html += `
            <div class="quiz-question-card" style="background: var(--bg-primary); border: 2px solid var(--border-color); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius-sm); font-weight: 600; font-size: 0.875rem;">Question ${index + 1}</span>
                </div>
                <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary);">${q.question}</h4>
                <div class="quiz-options" style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${q.options.map((opt, optIndex) => `
                        <label class="quiz-option" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease;">
                            <input type="radio" name="q${index}" value="${optIndex}" style="width: 18px; height: 18px; cursor: pointer;">
                            <span style="flex: 1;">${opt}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="question-feedback" id="feedback-${index}" style="display: none; margin-top: 1rem; padding: 1rem; border-radius: var(--radius-md);"></div>
            </div>
        `;
    });

    quizForm.innerHTML = html;

    // Add hover effects to options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('correct') && !this.classList.contains('incorrect')) {
                this.style.borderColor = 'var(--primary-color)';
            }
        });
        option.addEventListener('mouseleave', function() {
            if (!this.classList.contains('correct') && !this.classList.contains('incorrect')) {
                this.style.borderColor = 'var(--border-color)';
            }
        });
    });

    // Submit button handler
    document.getElementById('submit-quiz').addEventListener('click', () => submitQuiz(topicId));

    // Retry button handler
    document.getElementById('retry-quiz').addEventListener('click', () => {
        document.getElementById('quiz-results').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        initQuiz(topicId);
        document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });

    // PDF download button handler
    document.getElementById('download-pdf').addEventListener('click', () => generatePDF(topicId));
}

// Submit and grade quiz
function submitQuiz(topicId) {
    const questions = quizQuestions[topicId];
    const studentName = document.getElementById('studentName').value.trim() || 'Anonymous Student';

    let score = 0;
    let results = [];

    questions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        const questionCard = document.querySelectorAll('.quiz-question-card')[index];
        const feedback = document.getElementById(`feedback-${index}`);
        const options = questionCard.querySelectorAll('.quiz-option');

        const userAnswer = selected ? parseInt(selected.value) : -1;
        const isCorrect = userAnswer === q.correct;

        if (isCorrect) score++;

        results.push({
            question: q.question,
            userAnswer: userAnswer >= 0 ? q.options[userAnswer] : 'Not answered',
            correctAnswer: q.options[q.correct],
            isCorrect: isCorrect,
            explanation: q.explanation
        });

        // Show feedback
        options.forEach((opt, optIndex) => {
            opt.style.pointerEvents = 'none';
            if (optIndex === q.correct) {
                opt.style.borderColor = '#10b981';
                opt.style.background = 'rgba(16, 185, 129, 0.1)';
            } else if (optIndex === userAnswer && !isCorrect) {
                opt.style.borderColor = '#ef4444';
                opt.style.background = 'rgba(239, 68, 68, 0.1)';
            }
        });

        feedback.style.display = 'block';
        feedback.style.background = isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        feedback.style.borderLeft = `4px solid ${isCorrect ? '#10b981' : '#ef4444'}`;
        feedback.innerHTML = `
            <p style="font-weight: 600; color: ${isCorrect ? '#10b981' : '#ef4444'}; margin-bottom: 0.5rem;">
                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">${q.explanation}</p>
        `;
    });

    // Store results for PDF generation
    window.quizResults = {
        topicId: topicId,
        topicName: 'Topic 1: Computational Thinking',
        studentName: studentName,
        teacherEmail: document.getElementById('teacherEmail').value.trim(),
        score: score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        results: results,
        date: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Show results summary
    const resultsDiv = document.getElementById('quiz-results');
    const percentage = window.quizResults.percentage;

    let grade, message, color;
    if (percentage >= 90) {
        grade = 'Excellent!';
        message = 'Outstanding work! You have mastered this topic.';
        color = '#10b981';
    } else if (percentage >= 70) {
        grade = 'Good Job!';
        message = 'Well done! You have a solid understanding of this topic.';
        color = '#3b82f6';
    } else if (percentage >= 50) {
        grade = 'Keep Practicing';
        message = 'You\'re getting there! Review the topics you missed.';
        color = '#f59e0b';
    } else {
        grade = 'More Study Needed';
        message = 'Don\'t give up! Go through the notes again and try once more.';
        color = '#ef4444';
    }

    document.getElementById('results-title').textContent = grade;
    document.getElementById('results-title').style.color = color;
    document.getElementById('score-display').textContent = `${score}/${questions.length}`;
    document.getElementById('score-display').style.color = color;
    document.getElementById('score-message').textContent = `${percentage}% - ${message}`;

    // Show detailed results
    let detailedHtml = '<h3 style="margin-bottom: 1rem;">Question Review</h3>';
    results.forEach((r, index) => {
        detailedHtml += `
            <div style="background: ${r.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'}; border: 1px solid ${r.isCorrect ? '#10b981' : '#ef4444'}; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
                <p style="font-weight: 600; margin-bottom: 0.5rem;">Q${index + 1}: ${r.question}</p>
                <p style="font-size: 0.9rem; color: ${r.isCorrect ? '#10b981' : '#ef4444'};">
                    Your answer: ${r.userAnswer} ${r.isCorrect ? '✓' : '✗'}
                </p>
                ${!r.isCorrect ? `<p style="font-size: 0.9rem; color: #10b981;">Correct answer: ${r.correctAnswer}</p>` : ''}
            </div>
        `;
    });
    document.getElementById('detailed-results').innerHTML = detailedHtml;

    resultsDiv.style.display = 'block';

    // Disable submit button
    document.getElementById('submit-quiz').disabled = true;
    document.getElementById('submit-quiz').style.opacity = '0.5';

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Generate PDF certificate
function generatePDF(topicId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const results = window.quizResults;

    if (!results) {
        alert('Please complete the quiz first.');
        return;
    }

    // Colors
    const primaryColor = [37, 99, 235];
    const successColor = [16, 185, 129];
    const dangerColor = [239, 68, 68];
    const textColor = [31, 41, 55];
    const lightGray = [156, 163, 175];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GCSE Computer Science', 105, 18, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Quiz Results Certificate', 105, 28, { align: 'center' });

    // Student Info Box
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(15, 50, 180, 35, 3, 3, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Student:', 25, 62);
    doc.text('Topic:', 25, 72);
    doc.text('Date:', 120, 62);

    doc.setFont('helvetica', 'normal');
    doc.text(results.studentName, 55, 62);
    doc.text(results.topicName, 55, 72);
    doc.text(results.date, 140, 62);

    // Score Section
    const scoreColor = results.percentage >= 70 ? successColor : (results.percentage >= 50 ? [245, 158, 11] : dangerColor);

    doc.setFillColor(...scoreColor);
    doc.roundedRect(60, 95, 90, 45, 5, 5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text(`${results.score}/${results.total}`, 105, 118, { align: 'center' });

    doc.setFontSize(18);
    doc.text(`${results.percentage}%`, 105, 132, { align: 'center' });

    // Grade message
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    let gradeText = '';
    if (results.percentage >= 90) gradeText = 'Excellent Performance!';
    else if (results.percentage >= 70) gradeText = 'Good Understanding';
    else if (results.percentage >= 50) gradeText = 'Satisfactory - Keep Practicing';
    else gradeText = 'More Study Required';

    doc.text(gradeText, 105, 155, { align: 'center' });

    // Question Summary Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Question Summary', 15, 175);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    let yPos = 185;
    const correctCount = results.results.filter(r => r.isCorrect).length;
    const incorrectCount = results.results.length - correctCount;

    // Summary stats
    doc.setTextColor(...successColor);
    doc.text(`Correct: ${correctCount}`, 15, yPos);
    doc.setTextColor(...dangerColor);
    doc.text(`Incorrect: ${incorrectCount}`, 60, yPos);

    yPos += 10;

    // List incorrect questions
    const incorrectQuestions = results.results.filter(r => !r.isCorrect);
    if (incorrectQuestions.length > 0) {
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Areas for Improvement:', 15, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        incorrectQuestions.forEach((q, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            const questionText = q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question;
            doc.setTextColor(...dangerColor);
            doc.text(`• ${questionText}`, 20, yPos);
            yPos += 5;
            doc.setTextColor(...lightGray);
            doc.text(`  Correct: ${q.correctAnswer}`, 25, yPos);
            yPos += 7;
        });
    }

    // Footer
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 280, 210, 17, 'F');

    doc.setTextColor(...lightGray);
    doc.setFontSize(8);
    doc.text('Generated by Edexcel GCSE Computer Science Revision Hub', 105, 288, { align: 'center' });
    doc.text('This certificate is for educational purposes only', 105, 293, { align: 'center' });

    // Save the PDF
    const filename = `GCSE_CS_${results.topicName.replace(/[^a-zA-Z0-9]/g, '_')}_${results.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(filename);

    // If teacher email provided, show instruction
    if (results.teacherEmail) {
        alert(`PDF downloaded!\n\nTo send to your teacher:\n1. Open your email\n2. Attach the downloaded PDF\n3. Send to: ${results.teacherEmail}`);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initQuiz, submitQuiz, generatePDF };
}
