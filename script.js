const card = document.getElementById("card");
const head = document.getElementById("head");
const eyes = document.querySelectorAll(".eye");
const leftArm = document.querySelector(".arm.left");
const rightArm = document.querySelector(".arm.right");
const talkBtn = document.getElementById("talkBtn");

// Моргаем глазами каждые 2.5 секунды
setInterval(() => {
  eyes.forEach(e => e.style.height = "6px");
  setTimeout(() => eyes.forEach(e => e.style.height = "42px"), 180);
}, 2500);

// Жесты: кивает да / мотает нет
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

// Имя пользователя
let userName = localStorage.getItem("robotUserName");
if (!userName) {
  userName = prompt("Привет! Как тебя зовут?");
  localStorage.setItem("robotUserName", userName);
}

// Память робота
let memory = JSON.parse(localStorage.getItem("robotMemory") || "{}");
function saveMemory() {
  localStorage.setItem("robotMemory", JSON.stringify(memory));
}

// Основная логика ИИ
function respondAI(text) {
  text = text.toLowerCase();

  // Примеры
  if (/\d+\s*[\+\-\*\/]\s*\d+/.test(text)) {
    try {
      const answer = eval(text);
      card.textContent = `Ответ: ${answer}`;
      yes();
      return;
    } catch {
      card.textContent = "Ошибка в примере 😅";
      no();
      return;
    }
  }

  const key = text + "||" + userName;

  if (memory[key]) {
    card.textContent = memory[key];
    memory[key].toLowerCase().includes("нет") ? no() : yes();
    return;
  }

  // Если не знаем — спрашиваем, что ответить
  const answer = prompt(`Я не знаю, что ответить на "${text}". Что мне сказать?`);
  if (answer) {
    memory[key] = answer;
    saveMemory();
    card.textContent = answer;
    answer.toLowerCase().includes("нет") ? no() : yes();
  } else {
    card.textContent = "Я пока не знаю 🤔";
    no();
  }
}

// Голосовой ввод
talkBtn.onclick = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    card.textContent = "Твой браузер не поддерживает голос. Используй Safari!";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "ru-RU";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  card.textContent = "🎧 Слушаю тебя…";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    card.textContent = `Ты: "${transcript}" — Думаю... 💭`;
    respondAI(transcript);
  };

  recognition.onerror = (event) => {
    card.textContent = "Не удалось распознать голос. Попробуй еще раз!";
  };

  recognition.start();
};
