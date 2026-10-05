let answerList = [];
let currentQuestionNumber = 0;
let container = document.getElementById("overview-container");
let resultContainer = document.getElementById("result-container");
let buttonContainer = document.getElementById("button-container");
let sideResultContainer = document.getElementById("side-result-container");
let backButton = document.getElementById("back-button");
let nextButton = document.getElementById("btn-next-quiz");
let CURRENTQUIZ;
let OVERVIEW = false;

document
  .getElementById("quiz-wrapper")
  .addEventListener("click", function (event) {
    const clicked = event.target.closest(".single-answer");
    if (!clicked) return;

    document.querySelectorAll(".single-answer.selected").forEach((el) => {
      el.classList.remove("selected");
    });

    clicked.classList.add("selected");
  });

backButton.addEventListener("click", function () {
  if (currentQuestionNumber <= 0) return;
  currentQuestionNumber--;
  initQuiz();
  restoreSelectedAnswer();
});

nextButton.addEventListener("click", function () {
  let answer = document.querySelector(".selected");
  if (!answer) return;

  let choosenAnswer = answer.querySelector("p:last-child").textContent;
  answerList[currentQuestionNumber] = choosenAnswer;

  if (currentQuestionNumber < CURRENTQUIZ.questions.length - 1) {
    currentQuestionNumber++;
    initQuiz();
    restoreSelectedAnswer();
  } else {
    document.getElementById("quiz-overlay").classList.add("d_none");
    document.getElementById("result-container").classList.remove("d_none");
    evaluateResult();
  }
});

function restoreSelectedAnswer() {
  let selectedLabel = answerList[currentQuestionNumber];
  if (!selectedLabel) return;

  let answers = document.querySelectorAll(".single-answer");
  answers.forEach((answer) => {
    let label = answer.querySelector("p:last-child").textContent;
    if (label === selectedLabel) {
      answer.classList.add("selected");
    } else {
      answer.classList.remove("selected");
    }
  });
}

async function showOverview() {
  const params = new URLSearchParams(window.location.search);
  OVERVIEW = params.get("isOverview") === "true";

  if (OVERVIEW) {
    document.getElementById("overview-overlay").classList.remove("d_none");
    document.getElementById("quiz-overlay").classList.add("d_none");
    document.getElementById("quiz-title").classList.add("d_none");
    await renderQuizList();
  }
}

async function renderQuizList() {
  const quizzes = await loadQuizzes();
  const quizList = document.getElementById("quizList");
  quizList.innerHTML = "";
  quizzes.forEach((quiz) => {
    quizList.appendChild(createQuizLiItem(quiz));
  });
}

function createQuizLiItem(quiz) {
  let li = document.createElement("li");
  let span = document.createElement("span");
  let img = document.createElement("img");
  span.setAttribute(
    "onclick",
    `window.location.href='/pages/quizoverview.html?id=${quiz.id}'`,
  );
  span.innerHTML = quiz.title;
  img.src = "/assets/icons/delete.png";
  img.alt = "delete quiz";
  img.classList.add("delete-icon");
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteQuiz(quiz.id);
  });
  li.appendChild(span);
  li.appendChild(img);
  return li;
}

function generateNewQuiz() {
  window.location.href = "/pages/library.html";
}

async function deleteQuiz(id) {
  const response = await apiFetch(`${GET_QUIZ_URL}${id}/`, {
    method: "DELETE",
  });
  if (response && response.ok) {
    renderQuizList();
  }
}

async function initQuiz() {
  let btn = document.querySelector(".btn-go-back");
  if (btn.classList.contains("d_none")) {
    btn.classList.remove("d_none");
  }
  let targetHeadline = document.getElementById("quiz-title");
  let target = document.getElementById("quiz-wrapper");
  target.innerHTML = "";

  if (CURRENTQUIZ === null || CURRENTQUIZ === undefined || CURRENTQUIZ === "") {
    CURRENTQUIZ = await loadQuizzes(getQuizID());
  }

  targetHeadline.innerHTML = CURRENTQUIZ.title;

  let questionTemplate = createQuestion(CURRENTQUIZ.questions);
  target.appendChild(questionTemplate);

  showOverview();
}

/**
 * Creates a question element with options
 * @param {Array} questionArr - Array of question objects
 * @returns {HTMLElement} - The question box element
 */
function createQuestion(questions) {
  const questionTitle = document.getElementById("quiz-question-title");
  const questionAmount = document.getElementById("question-amount");
  const currentQuestion = questions[currentQuestionNumber];

  const questionBox = document.createElement("div");
  questionBox.classList.add("question-box");

  questionAmount.textContent = `${currentQuestionNumber + 1} / ${questions.length}`;
  questionTitle.textContent = `${currentQuestionNumber + 1}. ${currentQuestion.question_title}`;

  const questionsContainer = document.createElement("div");
  questionsContainer.classList.add("questions-container");

  const answerContainer = getOptions(currentQuestion.question_options);
  questionsContainer.appendChild(answerContainer);

  questionBox.appendChild(questionsContainer);
  return questionBox;
}

/**
 * Creates answer options elements
 * @param {Array} options - Array of answer options
 * @returns {HTMLElement} - The answer container element
 */
function getOptions(questions) {
  const answerContainer = document.createElement("div");
  answerContainer.classList.add("answer-container");

  const labels = ["A", "B", "C", "D"];

  questions.forEach((question, i) => {
    const singleAnswer = document.createElement("div");
    singleAnswer.classList.add("single-answer");

    const labelElement = document.createElement("p");
    labelElement.textContent = labels[i];

    const answerElement = document.createElement("p");
    answerElement.textContent = question;

    singleAnswer.appendChild(labelElement);
    singleAnswer.appendChild(answerElement);

    answerContainer.appendChild(singleAnswer);
  });

  return answerContainer;
}

function evaluateResult() {
  const { correct } = getCorrectAndWrongAnswers();
  renderResults(correct, CURRENTQUIZ.questions.length);
}

function renderResults(answers, total) {
  let percentage = ((answers / total) * 100).toFixed(1);
  let answer = document.getElementById("answer");
  const resultContainer = document.getElementById("result-container");
  let targetHeadline = document.getElementById("quiz-title");

  targetHeadline.innerHTML = "";

  if (resultContainer.classList.contains("d_none")) {
    resultContainer.classList.remove("d_none");
  }

  answer.innerHTML = checkAnswer(percentage);

  document.getElementById("score").innerHTML =
    ` &nbsp&nbsp${answers}/${total}&nbsp&nbsp`;
  document.getElementById("percent").innerHTML = `(${percentage})&nbsp%`;
}

function checkAnswer(percentage) {
  if (percentage >= 50) {
    return "Awesome job - you crushed it";
  } else {
    return "Not your best score. Give it another go.";
  }
}

function redoQuiz() {
  answerList = [];
  currentQuestionNumber = 0;
  initQuiz();
  document.getElementById("quiz-overlay").classList.remove("d_none");
  document.getElementById("result-container").classList.add("d_none");
  container.classList.add("d_none");
  resultContainer.classList.add("d_none");
  buttonContainer.classList.add("d_none");
  sideResultContainer.classList.add("d_none");
}

async function backToOverview() {
  let quizId = null;

  if (window.location.href.includes("isOverview=true")) {
    quizId = getQuizID();
  }

  try {
    const response = await apiFetch(`${GET_QUIZ_URL}${quizId}/`, {
      method: "GET",
    });

    if (response && response.ok) {
      window.location.href = `/pages/quizoverview.html?id=${quizId}`;
    } else {
      window.location.href = "/pages/library.html";
    }
  } catch (error) {
    console.error("Fehler beim Prüfen des Quiz:", error);
    window.location.href = "/pages/library.html";
  }
}

function showAnswers(bool) {
  let btn = document.querySelector(".btn-go-back");
  btn.classList.add("d_none");
  container.classList.remove("d_none");
  resultContainer.classList.add("d_none");
  buttonContainer.classList.remove("d_none");
  sideResultContainer.classList.remove("d_none");

  const { correct, wrong } = getCorrectAndWrongAnswers();

  document.getElementById("correct-answers").innerHTML =
    `<img src="/assets/icons/wright.png" alt="wright answer checkmark"> Correct answers: ${correct}`;
  document.getElementById("wrong-answers").innerHTML =
    `<img src="/assets/icons/wrong.png" alt="wrong answer checkmark"> Wrong answers: ${wrong}`;

  generateAnswerList(bool);
}

/**
 * Generates a list of answers with correct/incorrect indicators
 * @param {boolean} showCorrect - Whether to show correct answers for incorrect responses
 */
/**
 * Generates a list of answers with correct/incorrect indicators
 * @param {boolean} showCorrect - Whether to show correct answers for incorrect responses
 */
function generateAnswerList(showCorrect = false) {
  const container = document.getElementById("answers-list");
  const questions = CURRENTQUIZ.questions;

  container.innerHTML = "";

  questions.forEach((q, i) => {
    const listItem = createAnswerListItem(q, i, showCorrect);
    container.appendChild(listItem);
  });

  container.scrollTop = 0;
}

/**
 * Creates a single answer list item
 * @param {Object} question - The question object
 * @param {number} index - Question index
 * @param {boolean} showCorrect - Whether to show correct answers
 * @returns {HTMLElement} - The list item element
 */
function createAnswerListItem(question, index, showCorrect) {
  const listItem = document.createElement("li");
  const user = answerList[index];
  const correct = question.answer;
  const isCorrect = user === correct;
  const questionText = createQuestionText(question["question_title"], index);
  listItem.appendChild(questionText);

  const answerLine = createAnswerLine(user, isCorrect);
  listItem.appendChild(answerLine);

  if (showCorrect && !isCorrect) {
    const correctLine = createCorrectAnswerLine(correct);
    listItem.appendChild(correctLine);
  }

  return listItem;
}

/**
 * Creates the question text element
 * @param {string} questionText - The question text
 * @param {number} index - Question index
 * @returns {HTMLElement} - The question text element
 */
function createQuestionText(questionText, index) {
  const questionElement = document.createElement("p");
  questionElement.className = "question-text";
  questionElement.textContent = `${index + 1}. ${questionText}`;
  return questionElement;
}

/**
 * Creates an answer line with status indicator
 * @param {string} answer - The answer text
 * @param {boolean} isCorrect - Whether the answer is correct
 * @returns {HTMLElement} - The answer line element
 */
function createAnswerLine(answer, isCorrect) {
  const answerLine = document.createElement("div");
  answerLine.className = "answer-line";

  const statusImg = createStatusImage(isCorrect);
  const answerSpan = createAnswerSpan(answer, isCorrect);

  answerLine.appendChild(statusImg);
  answerLine.appendChild(answerSpan);

  return answerLine;
}

/**
 * Creates the correct answer line
 * @param {string} correctAnswer - The correct answer text
 * @returns {HTMLElement} - The correct answer line element
 */
function createCorrectAnswerLine(correctAnswer) {
  const correctLine = document.createElement("div");
  correctLine.className = "answer-line correct-answer-line";

  const correctImg = createStatusImage(true);
  const correctSpan = document.createElement("span");
  correctSpan.textContent = correctAnswer;

  correctLine.appendChild(correctImg);
  correctLine.appendChild(correctSpan);

  return correctLine;
}

/**
 * Creates a status image element
 * @param {boolean} isCorrect - Whether to show correct or wrong image
 * @returns {HTMLElement} - The image element
 */
function createStatusImage(isCorrect) {
  const img = document.createElement("img");
  img.src = isCorrect ? "/assets/icons/wright.png" : "/assets/icons/wrong.png";
  img.alt = isCorrect ? "correct checkmark" : "wrong checkmark";
  return img;
}

/**
 * Creates an answer span with appropriate styling
 * @param {string} answer - The answer text
 * @param {boolean} isCorrect - Whether the answer is correct
 * @returns {HTMLElement} - The span element
 */
function createAnswerSpan(answer, isCorrect) {
  const span = document.createElement("span");
  span.style.color = isCorrect ? "var(--text-color-whiteblue)" : "red";
  span.textContent = answer;
  return span;
}

/**
 * Calculates the number of correct and wrong answers from the user's responses
 * @returns {Object} - Object containing correct and wrong answer counts
 * @returns {number} returns.correct - Number of correct answers
 * @returns {number} returns.wrong - Number of wrong answers
 */
function getCorrectAndWrongAnswers() {
  let correct = 0;
  let wrong = 0;
  const questions = CURRENTQUIZ.questions;

  answerList.forEach((userAnswer, i) => {
    const correctAnswer = questions[i].answer;
    if (userAnswer === correctAnswer) {
      correct++;
    } else {
      wrong++;
    }
  });

  return { correct, wrong };
}
