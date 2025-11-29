document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let currentQuestionIndex = 0;

    const questionText = document.getElementById('question-text');
    const questionImages = document.getElementById('question-images');
    const optionsContainer = document.getElementById('options-container');
    const currentQNum = document.getElementById('current-q-num');
    const totalQNum = document.getElementById('total-q-num');
    const progressFill = document.getElementById('progress-fill');

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const chatGPTBtn = document.getElementById('chatgpt-btn');

    const feedback = document.getElementById('feedback');
    const feedbackMessage = document.getElementById('feedback-message');
    const correctAnswerDisplay = document.getElementById('correct-answer-display');

    // Fetch questions
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            totalQNum.textContent = questions.length;
            loadQuestion(currentQuestionIndex);
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            questionText.textContent = "Error loading questions. Please try refreshing the page.";
        });

    function loadQuestion(index) {
        const question = questions[index];

        // Update Progress
        currentQNum.textContent = index + 1;
        const progress = ((index + 1) / questions.length) * 100;
        progressFill.style.width = `${progress}%`;

        // Render Question Text
        // Convert markdown-style links [text](url) to HTML links if any (simple regex)
        let formattedText = question.question.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        questionText.innerHTML = formattedText;

        // Render Images
        questionImages.innerHTML = '';
        if (question.images && question.images.length > 0) {
            question.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = "Question Image";
                questionImages.appendChild(img);
            });
        }

        // Render Options
        optionsContainer.innerHTML = '';
        const isMultiple = question.type === "Multiple Choice";
        const inputType = isMultiple ? 'checkbox' : 'radio';

        question.options.forEach((option, i) => {
            const label = document.createElement('label');
            label.className = 'option-label';

            const input = document.createElement('input');
            input.type = inputType;
            input.name = 'answer';
            input.value = option;
            input.id = `option-${i}`;

            const span = document.createElement('span');
            span.className = 'option-text';
            span.textContent = option;

            label.appendChild(input);
            label.appendChild(span);
            optionsContainer.appendChild(label);
        });

        // Reset UI State
        feedback.style.display = 'none';
        chatGPTBtn.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.display = 'block'; // Ensure it's visible

        // Navigation Buttons
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === questions.length - 1;
    }

    function checkAnswer() {
        const question = questions[currentQuestionIndex];
        const selectedInputs = document.querySelectorAll('input[name="answer"]:checked');
        const selectedValues = Array.from(selectedInputs).map(input => input.value);

        if (selectedValues.length === 0) {
            alert("Please select an answer.");
            return;
        }

        const correctAnswers = question.answer;

        // Check if correct
        // Sort both arrays to compare content regardless of order
        const sortedSelected = [...selectedValues].sort();
        const sortedCorrect = [...correctAnswers].sort();

        const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

        // Show Feedback
        feedback.style.display = 'block';
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;

        if (isCorrect) {
            feedbackMessage.innerHTML = '<span class="correct-msg">Correct!</span>';
            correctAnswerDisplay.textContent = '';
        } else {
            feedbackMessage.innerHTML = '<span class="incorrect-msg">Incorrect.</span>';
            correctAnswerDisplay.textContent = `Correct Answer: ${correctAnswers.join(', ')}`;
        }

        // Disable inputs
        const allInputs = document.querySelectorAll('input[name="answer"]');
        allInputs.forEach(input => input.disabled = true);

        // Show ChatGPT Button
        chatGPTBtn.style.display = 'flex';
        chatGPTBtn.dataset.questionIndex = currentQuestionIndex; // Bind index

        // Hide Submit button to clean up UI (optional, or keep it disabled)
        submitBtn.style.display = 'none';
    }

    function openChatGPT() {
        const index = parseInt(chatGPTBtn.dataset.questionIndex, 10);
        // Fallback to currentQuestionIndex if not set (shouldn't happen)
        const questionIndex = isNaN(index) ? currentQuestionIndex : index;
        const question = questions[questionIndex];

        // Get user answers from the disabled inputs
        const checkedInputs = document.querySelectorAll('input[name="answer"]:checked');
        const userAnswers = Array.from(checkedInputs).map(input => input.value);

        const prompt = `
I am practicing for the AWS Developer Associate exam.
Here is a question:

${question.question}

Options:
${question.options.map(o => `- ${o}`).join('\n')}

My Answer: ${userAnswers.join(', ')}
Correct Answer: ${question.answer.join(', ')}

Please explain why the correct answer is correct and why the other options are incorrect.
        `.trim();

        const encodedPrompt = encodeURIComponent(prompt);
        window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
    }

    // Event Listeners
    submitBtn.addEventListener('click', checkAnswer);

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        }
    });

    chatGPTBtn.addEventListener('click', openChatGPT);
});
