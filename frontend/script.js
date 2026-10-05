const ROBOT = document.getElementById("robot");
const WAVE = document.getElementById("wave");
const QUIZCONTAINER = document.getElementById("quiz-container");
const LOGIN_CONTAINER = document.querySelector(".login-container");
const BUBBLETEXT = document.getElementById("bubble-text");

window.addEventListener("DOMContentLoaded", () => {
  const default_robot = "assets/icons/robot_default.png";
  const winking_robot = "assets/icons/robot_smile.png";
  WAVE.style.visibility = "hidden";
  QUIZCONTAINER.style.visibility = "hidden";
  LOGIN_CONTAINER.style.visibility = "hidden";

  setTimeout(() => {
    let showDefaultRobot = false;
    const winkInterval = setInterval(() => {
      ROBOT.src = showDefaultRobot ? winking_robot : default_robot;
      showDefaultRobot = !showDefaultRobot;
    }, 500);

    setTimeout(() => {
      clearInterval(winkInterval);
      setVisible();
      ROBOT.src = default_robot;
      typewriterForBubble(BUBBLETEXT, getSpeechTemplate());
    }, 3000);
  }, 3000);
});

function typewriterForBubble(element, text, speed = 90) {
  let i = 0;
  element.innerHTML = "";
  typing(element, i, text, speed);
}

function typing(element, i, text, speed) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    i++;
    setTimeout(() => typing(element, i, text, speed), speed);
  }
}

function setVisible() {
  WAVE.style.visibility = "visible";
  WAVE.classList.add("fading-in");
  setTimeout(() => {
    QUIZCONTAINER.style.visibility = "visible";
    QUIZCONTAINER.classList.add("fading-in");
  }, 900);

  LOGIN_CONTAINER.style.visibility = "visible";
  LOGIN_CONTAINER.classList.add("fading-in");
}

ROBOT.addEventListener("mouseover", () => {
  ROBOT.src = "assets/icons/robot_smile.png";
});

ROBOT.addEventListener("mouseleave", () => {
  ROBOT.src = "assets/icons/robot_default.png";
});
