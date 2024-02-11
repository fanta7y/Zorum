
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".auth-container");

const orEmail = document.querySelector("#orEmail");
const icon = document.querySelector("#orEmailIcon");

const nickname = document.querySelector("#nickname");
const surname = document.querySelector("#surname");
const stname = document.querySelector("#name");

const select = document.querySelector("#select");
const item = document.querySelector("#gend");
function fillOver() {
  nickname.value = stname.value + " " + surname.value;
  if (stname.value == "" && surname.value == "") {
    nickname.value = "";
  }
}

function toggleLock(id) {
  let lock = document.getElementById("toggle" + id);
  let password = document.getElementById("password" + id);

  if (lock.className == "fas fa-lock") {
    password.setAttribute("type", "text");
    lock.className = "fas fa-lock-open";
    lock.setAttribute("title", "HIDE PASSWORD");
  } else {
    password.setAttribute("type", "password");
    lock.className = "fas fa-lock";
    lock.setAttribute("title", "SHOW PASSWORD");
  }
}

stname.addEventListener("input", fillOver);
surname.addEventListener("input", fillOver);

orEmail.addEventListener("input", () => {
  if (orEmail.value.indexOf("@") > -1) {
    icon.setAttribute("class", "fas fa-envelope");
  } else {
    icon.setAttribute("class", "fas fa-user");
  }
});

select.addEventListener("input", () => {
  if (select.value == 0) {
    item.setAttribute("class", "fas fa-venus");
    item.style.color = '#ae27ae';
  } else if (select.value == 1) {
    item.setAttribute("class", "fas fa-mars");
    item.style.color = 'var(--blue)';
  } else {
    item.setAttribute("class", "fas fa-ellipsis-h");
    item.style.color = 'var(--font) ';
  }
});

/* REGISTRATION */


