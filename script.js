/**
 * Настройки робота PukiPuki
 */
const CONFIG = {
  // Твой актуальный URL воркера
  API_URL: "https://pukipuki.damp-glade-283e.workers.dev/",
  LANG: "ru-RU"
};

const UI = {
  card: document.getElementById("card"),
  micBtn: document.getElementById("micBtn"),
  eyes: document.querySelectorAll(".eye"),
  face: document.getElementById("face"),
  leftArm: document.querySelector(".arm.left"),
  rightArm: document.querySelector(".arm.right")
};

// --- 1. Анимация моргания ---
setInterval(() => {
  UI.eyes.forEach(e => e.style.height = "2px");
  setTimeout(() => {
    UI.eyes.forEach(e => e.style.height = "44px");
  }, 150);
}, 3500);

// --- 2. Функция движений ---
function playGesture(isHappy = true) {
  // Наклоняем голову и поднимаем руки
  UI.face.style.transform = isHappy ? "rotate(10deg) translateY(-5px)" : "rotate(-10deg)";
  UI.rightArm.style.transform = "rotate(35deg)";
  UI.leftArm.style.transform = "rotate(-35deg)";
  
  // Возвращаем в исходное состояние через 800мс
  setTimeout(() => {
    UI.face.style.transform = "rotate(0deg) translateY(0)";
    UI.rightArm.style.transform = "rotate(0deg)";
    UI.leftArm.style.transform = "rotate(0deg)";
  }, 800);
}

// --- 3. Запрос к твоему воркеру ---
async function askAI(text) {
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) throw new Error("Server error");

    const data = await response.json();
    return data.answer || "Я задумался... 💭";
  } catch (err) {
    console.error("Fetch error:", err);
    return "Связь прервана. Проверь консоль! 💥";
  }
}

// --- 4. Обработка ответа ---
async function respond(text) {
  UI.card.textContent = "🤖 Думаю...";
  
  const answer = await askAI(text);
  UI.card.textContent = answer;

  // Радуемся, если ответ содержит позитив
  const lowerAnswer = answer.toLowerCase();
  const isPositive = ["привет", "рад", "да", "хорошо"].some(word => lowerAnswer.includes(word));
  playGesture(isPositive);
}

// --- 5. Голосовой ввод ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  UI.card.textContent = "Голос не поддерживается в этом браузере 😢";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = CONFIG.LANG;

  UI.micBtn.onclick = () => {
    try {
      recognition.start();
      UI.card.textContent = "🎧 Слушаю вас...";
      UI.micBtn.style.boxShadow = "0 0 20px #ff5fa2";
    } catch (e) {
      console.log("Распознавание уже запущено");
    }
  };

  recognition.onresult = (event) => {
    UI.micBtn.style.boxShadow = "none";
    const transcript = event.results[0][0].transcript;
    respond(transcript);
  };

  recognition.onerror = () => {
    UI.micBtn.style.boxShadow = "none";
    UI.card.textContent = "Я вас не расслышал... 🎤";
  };
  
  recognition.onend = () => {
    UI.micBtn.style.boxShadow = "none";
  };
}
