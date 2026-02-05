const card = document.getElementById("card");
const head = document.getElementById("head");
const eyes = document.querySelectorAll(".eye");
const leftArm = document.querySelector(".arm.left");
const rightArm = document.querySelector(".arm.right");
const talkBtn = document.getElementById("talkBtn");

// Моргаем глазами каждые 2.6 сек
setInterval(() => {
  eyes.forEach(e => e.style.height = "6px");
  setTimeout(() => eyes.forEach(e => e.style.height = "42px"), 180);
}, 2600);

// Жесты
function yes() {
  head.style.transform = "rotate(6deg)";
  rightArm.style.transform = "rotate(25deg)";
  leftArm.style.transform = "rotate(-15deg)";
  setTimeout(() => {
    head.style.transform = "rotate(0deg)";
    rightArm.style.transform = "rotate(0deg)";
    leftArm.style.transform = "rotate(0deg)";
  }, 500);
}

function no() {
  head.style.transform = "rotate(-6deg)";
  rightArm.style.transform = "rotate(25deg)";
  leftArm.style.transform = "rotate(-15deg)";
  setTimeout(() => {
    head.style.transform = "rotate(0deg)";
    rightArm.style.transform = "rotate(0deg)";
    leftArm.style.transform = "rotate(0deg)";
  }, 500);
}

// Память робота
let memory = JSON.parse(localStorage.getItem("robotMemory") || "{}");
function saveMemory() {
  localStorage.setItem("robotMemory", JSON.stringify(memory));
}

// Логика ИИ
function think(text) {
  text = text.toLowerCase();

  // Примеры: 2+2
  if(/\d+\s*[\+\-\*\/]\s*\d+/.test(text)) {
    try {
      const answer = eval(text);
      card.textContent = `Ответ: ${answer}`;
      yes();
      return;
    } catch(e) {
      card.textContent = "Ошибка в примере 😅";
      no();
      return;
    }
  }

  // Если есть в памяти
  if(memory[text]) {
    card.textContent = memory[text];
    memory[text].toLowerCase().includes("нет") ? no() : yes();
    return;
  }

  // Если нет — спрашиваем у пользователя
  const answer = prompt(`Я не знаю, что ответить на "${text}". Что мне сказать?`);
  if(answer) {
    memory[text] = answer;
    saveMemory();
    card.textContent = answer;
    answer.toLowerCase().includes("нет") ? no() : yes();
  } else {
    card.textContent = "Я пока не знаю 🤔";
    no();
  }
}

// Кнопка общения
talkBtn.onclick = () => {
  const input = prompt("Напиши или скажи что-нибудь для робота:");
  if(input) think(input);
};
