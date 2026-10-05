function initHeader() {
  let header = document.getElementById("header");
  header.innerHTML = getHeaderTemplate();
}

function goToLibrary() {
  window.location.href = "/pages/library.html";
}

function goToLogin() {
  window.location.href = "/pages/login.html";
}
