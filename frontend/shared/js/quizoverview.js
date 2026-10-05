const headlineInput = document.getElementById("headline");
const penIconHeadline = document.getElementById("pen");
const descriptionInput = document.getElementById("description");
const iFrame = document.getElementById("iFrame-video");
const hookIconTextarea = document.getElementById("hook");

let CURRENTQUIZ;
let QUIZZES;

async function init() {
  CURRENTQUIZ = await loadQuizzes(getQuizID());
  if (!CURRENTQUIZ) return;
  headlineInput.value = CURRENTQUIZ.title;
  descriptionInput.value = CURRENTQUIZ.description;
  iFrame.src = getEmbededURL(CURRENTQUIZ.video_url);
  QUIZZES = await loadQuizzes();
  await renderPreviousQuizzes();
  setupEventListeners();
}

function renderPreviousQuizzes() {
  if (!QUIZZES.length <= 0 && QUIZZES != null) {
    renderTodayQuizzes();
    renderLast7DaysQuizzes();
  }
}

function renderTodayQuizzes() {
  const todayContainer = document.getElementById("today-quizzes");
  todayContainer.innerHTML = "";

  QUIZZES.forEach((quiz) => {
    if (isToday(quiz.created_at)) {
      let quizIndex = quiz.id;
      let li = document.createElement("li");
      li.setAttribute("onclick", `changeOverviewToQuiz(${quizIndex})`);
      li.innerHTML = quiz.title;
      if (todayContainer.childElementCount <= 5) {
        todayContainer.appendChild(li);
      }
    }
  });
}

function renderLast7DaysQuizzes() {
  const sevenDaysContainer = document.getElementById("last-quizzes-7days");
  sevenDaysContainer.innerHTML = "";

  QUIZZES.forEach((quiz) => {
    if (isOlderThan7Days(quiz.created_at)) {
      let quizIndex = quiz.id;
      let li = document.createElement("li");
      li.setAttribute("onclick", `changeOverviewToQuiz(${quizIndex})`);
      li.innerHTML = quiz.title;

      if (sevenDaysContainer.childElementCount <= 5) {
        sevenDaysContainer.appendChild(li);
      }
    }
  });
}

function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

function isOlderThan7Days(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= sevenDaysAgo && date < today;
}

function getEmbededURL(url) {
  const match = url.match(/v=([^&]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return `https://placehold.co/450x250?text=Video+not+found`;
}

/**
 * Sets up all event listeners for the page
 */
function setupEventListeners() {
  setupInputTracking(headlineInput, penIconHeadline, "title");
  setupInputTracking(descriptionInput, hookIconTextarea, "description");
}

/**
 * Sets up input change tracking with icon feedback
 * @param {HTMLElement} inputElement - The input element to track
 * @param {HTMLElement} iconElement - The icon element to update
 * @param {string} storageKey - The localStorage key to save to
 */
function setupInputTracking(inputElement, iconElement, key) {
  let timeoutId;

  inputElement.addEventListener("keydown", function () {
    iconElement.src = "/assets/icons/input_pen_green.png";
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      iconElement.src = "/assets/icons/green_hook.png";
      CURRENTQUIZ[key] = inputElement.value;
      let id = CURRENTQUIZ.id;
      updateQuiz(id, CURRENTQUIZ);
    }, 1000);
  });
}

/**
 * Navigates to the quiz page
 */
function goToQuiz() {
  let id = CURRENTQUIZ.id;
  window.location.href = `/pages/quiz.html?id=${id}`;
}

function changeOverviewToQuiz(id) {
  window.location.href = `/pages/quizoverview.html?id=${id}`;
}

async function seeAll() {
  let isOverview = true;
  let id = CURRENTQUIZ.id;
  window.location.href =
    "/pages/quiz.html?id=" + id + "&isOverview=" + isOverview;
}
