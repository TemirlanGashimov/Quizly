async function createQuiz(url) {
  document.querySelector(".overlay").classList.remove("d_none");
  url = url.trim();
  try {
    let response = await apiFetch(CREATE_QUIZ_URL, {
      method: "POST",
      body: JSON.stringify({ url: url }),
    });

    if (!response || !response.ok) {
      showToastMessage(true, ["Error generating quiz"]);
      document.querySelector(".overlay").classList.add("d_none");
      return null;
    }

    const data = await response.json();
    document.querySelector(".overlay").classList.add("d_none");
    return data;
  } catch (error) {
    document.querySelector(".overlay").classList.add("d_none");
    showToastMessage(true, ["Error while sending URL"]);
    return null;
  }
}

async function loadQuizzes(id) {
  let endpoint = GET_QUIZ_URL;
  if (id) {
    endpoint = `${GET_QUIZ_URL}${id}/`;
  }

  try {
    let response = await apiFetch(endpoint, { method: "GET" });
    if (!response || !response.ok) return null;
    return await response.json();
  } catch (error) {
    showToastMessage(true, ["Error while sending URL"]);
    return null;
  }
}

async function updateQuiz(id, quiz) {
  let endpoint = GET_QUIZ_URL;
  if (id) {
    endpoint = `${GET_QUIZ_URL}${id}/`;
  }

  try {
    let response = await apiFetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify({
        title: quiz.title,
        description: quiz.description,
      }),
    });

    if (!response || !response.ok) return null;
    return await response.json();
  } catch (error) {
    showToastMessage(true, ["Error while updating Quiz"]);
    return null;
  }
}
