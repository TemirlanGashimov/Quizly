function getFormData(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function showFormErrors(array) {
  array.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove("d_none");
    }
  });
}

function hideFormErrors(array) {
  array.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("d_none");
    }
  });
}

function showToastMessage(error = true, msg = []) {
  const toast = document.createElement("div");
  toast.className = "toast_msg d_flex_cc_ac";
  toast.innerHTML = getToastHTML(msg, error);
  toast.setAttribute("error", error);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function showToastHint(msg = []) {
  const toast = document.createElement("div");
  toast.className = "toast_msg d_flex_cc_ac";
  toast.innerHTML = getToastHintHTML(msg);
  document.body.appendChild(toast);
  toast.setAttribute("hint", true);

  setTimeout(() => {
    toast.remove();
  }, 2500);
}

function getToastHintHTML(msg) {
  return `<div class="toast_msg_left d_flex_cc_ac">
            </div>
            <div class="toast_msg_hint">
                <h3>Hinweis</h3>
                <p class="w_full">
                    ${msg}
                </p>
            </div>`;
}

function getToastHTML(msg, error) {
  let msglist = "";

  if (typeof msg === "string") {
    msg = [msg];
  }

  if (msg.length <= 0) {
    msglist = error
      ? "<li>Es ist ein Fehler aufgetreten</li>"
      : "<li>Das hat geklappt!</li>";
  }
  for (let i = 0; i < msg.length; i++) {
    msglist += `<li>${msg[i]}</li>`;
  }

  return `<div class="toast_msg_left d_flex_cc_ac">
            </div>
            <div class="toast_msg_right">
                <h3 error="false">Success</h3>
                <h3 error="true">Error</h3>
                <ul class="w_full">
                    ${msglist}
                </ul>
            </div>`;
}

function getQuizID() {
  let params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id;
}

function goBack() {
  window.history.back();
}
