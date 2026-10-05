const inputs = document.querySelectorAll("input");
const checkboxTerms = document.querySelector('input[name="terms"]');
const pwToggle = document.getElementById("input-lock-password");
const repPwToggle = document.getElementById("input-lock-repeated-pw");

inputs.forEach((input) => {
  if (input.type !== "checkbox") {
    input.addEventListener("blur", () => validateFormElements(input));
  }
});

if (checkboxTerms) {
  checkboxTerms.addEventListener("change", function () {
    const errorDiv = document.getElementById("checkbox-error");

    if (this.checked) {
      errorDiv.textContent = "";
      errorDiv.classList.remove("visible");
    } else {
      errorDiv.textContent = "Bitte akzeptiere die Privacy Policy.";
      errorDiv.classList.add("visible");
    }
  });
}

if (pwToggle) {
  pwToggle.onclick = function () {
    const input = document.getElementById("input-password");
    togglePasswordVisibility(input, pwToggle);
  };
}

if (repPwToggle) {
  repPwToggle.onclick = function () {
    const input = document.getElementById("input-rep-password");
    togglePasswordVisibility(input, repPwToggle);
  };
}

function getFormData(form, reference) {
  const formData = new FormData(form);
  const bodyData = {
    username: formData.get("username")?.trim(),
    password: formData.get("password")?.trim(),
  };
  if (reference === "login") {
    return bodyData;
  }
  if (reference === "signup") {
    bodyData.email = formData.get("email")?.trim();
    bodyData.confirmed_password = formData.get("repeated-password")?.trim();
    return bodyData;
  }
}

async function loginUser(event) {
  event.preventDefault();
  const form = event.target;
  const allValid = validateAllFields(form);

  if (!allValid) {
    showToastMessage(true, "Please fill in all fields");
    return;
  }
  const body = getFormData(form, "login");

  try {
    const response = await fetch(`${API_BASE_URL}${LOGIN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let responseData = await response.json();
      showToastMessage(true, `Login failed: ${responseData.detail}`);
      return;
    }

    showToastMessage(false, "Login successful");
    setTimeout(() => {
      window.location.href = "/pages/library.html";
    }, 2000);
  } catch (error) {
    showToastMessage(true, `Network error: ${error.message}`);
  }
}

async function signUpUser(event) {
  event.preventDefault();
  const form = event.target;
  const allValid = validateAllFields(form);

  if (!allValid) {
    showToastMessage(true, "Please fill in all fields");
    return;
  }
  const body = getFormData(form, "signup");

  try {
    const response = await fetch(`${API_BASE_URL}${REGISTER_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      showToastMessage(true, `Register failed: ${data.username} `);
      return;
    }

    showToastMessage(false, "Register successful");
    setTimeout(() => {
      window.location.href = "/pages/login.html";
    }, 2000);
  } catch (error) {
    showToastMessage(true, `Network error: ${error.message}`);
  }
}

async function logOut(notoken) {
  try {
    await fetch(`${API_BASE_URL}${LOGOUT_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",
    });
    if (notoken) {
      window.location.href = "/pages/login.html";
    } else {
      showToastMessage(false, "Logout successfully!");
      setTimeout(() => {
        window.location.href = "/pages/login.html";
      }, 2000);
    }
  } catch (error) {
    showToastMessage(true, ["Logout error"]);
    setTimeout(() => {
      window.location.href = "/pages/login.html";
    }, 2000);
  }
}

function validateAllFields(form) {
  const inputs = form.querySelectorAll(
    'input[name="email"], input[name="username"], input[name="password"], input[name="repeated-password"], input[name="terms"]',
  );

  let isValid = true;

  inputs.forEach((input) => {
    const result = validateFormElements(input);
    if (result === false) {
      isValid = false;
    }
  });

  return isValid;
}

function validateFormElements(input) {
  const name = input.name;
  const value = input.type === "checkbox" ? input.checked : input.value.trim();
  const form = input.form;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  switch (name) {
    case "email":
      if (!emailRegex.test(value)) {
        showError(input, "Bitte eine gültige Mail-Adresse eingeben.");
        return false;
      }
      break;

    case "username":
      if (value.length < 3) {
        showError(input, "Der Name muss mindestens 3 Zeichen haben.");
        return false;
      }
      break;

    case "password":
      if (window.location.href.includes("login.html")) {
        if (value.length === 0) {
          showError(input, "Bitte Passwort eingeben.");
          return false;
        }
        break;
      }
      if (!passwordRegex.test(value)) {
        showError(input, "min. 6 Zeichen, 1 x A-Z, 1 x a-z sowie 1 x 0-9");
        return false;
      }
      break;

    case "repeated-password":
      const passwordValue = form
        .querySelector('input[name="password"]')
        .value.trim();
      if (value !== passwordValue) {
        showError(input, "Die Passwörter stimmen nicht überein.");
        return false;
      }
      break;

    case "terms":
      const errorDiv = document.getElementById("checkbox-error");
      if (!value) {
        errorDiv.textContent = "Bitte akzeptiere die Privacy Policy.";
        errorDiv.classList.add("visible");
        return false;
      } else {
        errorDiv.textContent = "";
        errorDiv.classList.remove("visible");
        return true;
      }
  }

  clearError(input);
  return true;
}

function showError(input, message) {
  const errorDiv = input.parentElement.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add("visible");
  }
}

function clearError(input) {
  const errorDiv = input.parentElement.querySelector(".error-message");
  if (errorDiv) {
    errorDiv.textContent = "";
    errorDiv.classList.remove("visible");
  }
}

function togglePasswordVisibility(input, icon) {
  if (input.type === "password") {
    input.type = "text";
    icon.src = "/assets/icons/visibility.svg";
    icon.alt = "picture of an open eye";
  } else {
    input.type = "password";
    icon.src = "/assets/icons/visibility_off.svg";
    icon.alt = "picture of a closed eye";
  }
}

async function refreshToken() {
  try {
    const response = await fetch(`${API_BASE_URL}${TOKENREFRESH_URL}`, {
      method: "POST",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function apiFetch(endpoint, options = {}) {
  const doRequest = () =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      method: options.method || "GET",
      body: options.body,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

  let response = await doRequest();

  if (response.status === 401 || response.status === 403) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      window.location.href = "/pages/login.html";
      return null;
    }

    response = await doRequest();

    if (response.status === 401 || response.status === 403) {
      window.location.href = "/pages/login.html";
      return null;
    }
  }

  return response;
}
