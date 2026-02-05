const UI = {
  card: document.getElementById("card"),
  micBtn: document.getElementById("micBtn"),
  eyes: document.querySelectorAll(".eye"),
  face: document.getElementById("face"),
  leftArm: document.querySelector(".arm.left"),
  rightArm: document.querySelector(".arm.right")
};

// --- 1. Живая анимация (Моргание) ---
setInterval(() => {
  UI.eyes.forEach(e => {
    e.style.transition = "height 0.1s ease";
    e.style.height = "2px";
  });
  setTimeout(() => {
    UI.eyes.forEach(e => e.style.height = "42px");
  }, 150);
}, 3000);

// --- 2. Функция жестов ---
function playGesture(isPositive = true) {
  // Добавляем плавность через JS, если она не прописана в CSS
  const elements = [UI.face, UI.leftArm, UI.rightArm];
  elements.forEach(el => el.style.transition = "transform 0.5s ease-out");

  UI.rightArm.style.transform = "rotate(25deg)";
  UI.leftArm.style.transform = "rotate(-25deg)";
  UI.face.style.transform = isPositive ? "rotate(10deg)" : "rotate(-10deg)";

  setTimeout(() => {
    UI.rightArm.style.transform = "rotate(0deg)";
    UI.leftArm.style.transform = "rotate(0deg)";
    UI.face.style.transform = "rotate(0deg)";
  }, 700);
}

// --- 3. Работа с ИИ ---
async function askAI(text) {
  try {
    const response = await fetch("https://still-leaf-6d93.damp-glade-283e.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) throw new Error("Ошибка сервера");

    const data = await response.json();
    return data.answer || "Я получил пустой ответ... 💭";
  } catch (err) {
    console.error("AI Error:", err);
    return "Связь прервана. Проверь настройки CORS воркера 💥";
  }
}

// --- 4. Ответная реакция ---
async function respond(text) {
  UI.card.textContent = "🤖 Думаю...";
  const answer = await askAI(text);
  UI.card.textContent = answer;

  const low = answer.toLowerCase();
  // Робот радуется, если в ответе есть позитивные слова
  const isHappy = ["да", "хорошо", "привет", "могу", "сделаю"].some(word => low.includes(word));
  playGesture(isHappy);
}

// --- 5. Голосовое управление ---
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!Speech) {
  UI.card.textContent = "Ваш браузер не поддерживает распознавание речи 😢";
} else {
  const recognition = new Speech();
  recognition.lang = "ru-RU";

  UI.micBtn.onclick = () => {
    recognition.start();
    UI.card.textContent = "🎧 Слушаю вас...";
    UI.micBtn.style.boxShadow = "0 0 15px #00ff00"; // Подсветка кнопки при записи
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
}
