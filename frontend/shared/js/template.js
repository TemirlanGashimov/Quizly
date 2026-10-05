function getSpeechTemplate() {
  return `
        Hey welcome to Quizly! Unlock the Ai power and dive in to the quiz!
    `;
}

function getHeaderTemplate() {
  if (window.location.pathname.endsWith("quiz.html")) {
    return `
    <section class="w_full header-library pos_abs header z_5">
        <img src="/assets/icons/logoheader.png" alt="logo of robot" class="p20 ">
        <div class="header-icon"  onclick="logOut()">
            <img src="/assets/icons/logout.png" alt="logout symbol" class="p20 cu_po">
        </div>
        <button
              id="generate-new"
              class="btn cu_po d_flex_cc_ac border_1_solid z_5"
              onclick="generateNewQuiz()"
            >Generate new quiz
            </button>
    </section>
  `;
  }
  if (window.location.pathname.endsWith("quizoverview.html")) {
    return `
      <section class="w_full d_flex_sb_ac pos_abs header z_5">
          <img src="/assets/icons/logoheader.png" onclick="goToLibrary()" alt="logo of robot" class="p20 cu_po">
          <div class="header-icon" onclick="logOut()">
              <img src="/assets/icons/logout.png" alt="logout symbol" class="p20 cu_po">
          </div>
      </section>
    `;
  }
  if (
    window.location.pathname.endsWith("privacy.html") ||
    window.location.pathname.endsWith("legalnotice.html")
  ) {
    return `
      <section class="w_full d_flex_sb_ac pos_abs header z_5">
          <img src="/assets/icons/logoheader.png" onclick="goToLogin()" alt="logo of robot" class="p20 cu_po">
          <div class="back-btn">
            <svg class="p20 cu_po  " onclick="goBack()" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="#3FFF68" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
      </section>
    `;
  }
  if (
    window.location.pathname.endsWith("login.html") ||
    window.location.pathname.endsWith("registration.html")
  ) {
    return `
      <section class="w_full d_flex_sb_ac pos_abs header z_5">
          <img src="/assets/icons/logoheader.png" alt="logo of robot" class="p20 no-cu-po">
          <div class="header-icon no-cu-po">
              <img src="/assets/icons/logout.png" alt="logout symbol" class="p20 no-cu-po">
          </div>
      </section>
    `;
  } else {
    return `
      <section class="w_full d_flex_sb_ac pos_abs header z_5">
          <img src="/assets/icons/logoheader.png" alt="logo of robot" class="p20">
          <div class="header-icon" onclick="logOut()">
              <img src="/assets/icons/logout.png" alt="logout symbol" class="p20 cu_po">
          </div>
      </section>
    `;
  }
}
