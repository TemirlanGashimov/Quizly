async function init() {
  let header = document.getElementById("header");
  header.innerHTML = getHeaderTemplate();
  await renderLastQuizzes();
}

async function renderLastQuizzes() {
  let QUIZZES = await loadQuizzes();
  if (!QUIZZES) return;
  if (QUIZZES.length <= 0) {
    document.getElementById("wrapping-container").classList.add("d_none");
  } else {
    const quizContainer = document.getElementById("quiz-container-library");
    if (!quizContainer) {
      return;
    }
    quizContainer.innerHTML = "";

    QUIZZES.forEach((quiz, index) => {
      const quizCard = createQuizCard(quiz, quiz.id);
      quizContainer.appendChild(quizCard);
    });
  }
}

function createQuizCard(quiz, i) {
  const container = document.createElement("div");
  container.classList.add(`quiz-card`);
  container.id = `quiz-card-${i}`;
  container.setAttribute(
    "onclick",
    `openQuiz('${container.id.split("-")[2]}')`,
  );
  container.classList.add("d_flex_cc_ac");
  container.classList.add("flex_dir_col");

  const headline = document.createElement("h2");
  headline.textContent = quiz.title;
  headline.classList.add("quiz-title");

  container.appendChild(headline);
  return container;
}

function openQuiz(id) {
  window.location.href = `/pages/quizoverview.html?id=${id}`;
}

document
  .getElementById("start-quiz")
  .addEventListener("click", async function () {
    let urlInput = document.getElementById("url");
    let result = await createQuiz(document.getElementById("url").value);
    urlInput.value = "";
    if (result && result.id) {
      openQuiz(result.id);
    } else {
    }
  });
