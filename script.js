/**
 * Конфигурация робота
 */
const CONFIG = {
  API_URL: "https://still-leaf-6d93.damp-glade-283e.workers.dev",
  LANG: "ru-RU",
  BLINK_INTERVAL: 3000,
  GESTURE_DURATION: 600
};

// Элементы DOM
const UI = {
  card: document.getElementById("card"),
  micBtn: document.getElementById("micBtn"),
  eyes: document.querySelectorAll(".eye"),
  face: document.getElementById("face"),
  arms: {
    left: document.querySelector(".arm.left"),
    right: document.querySelector(".arm.right")
  }
};

/**
 * Живая анимация: Моргание
 */
const startBlinking = () => {
  setInterval(() => {
    UI.eyes.forEach(eye => eye.style.height = "4px");
    setTimeout(() => {
      UI.eyes.forEach(eye => eye.style.height = "40px");
    }, 150);
  }, CONFIG.BLINK_INTERVAL);
};

/**
 * Анимация жестов
 * @param {boolean} isPositive - влияет на наклон головы
 */
function playGesture(isPositive = true) {
  const { left, right } = UI.arms;
  
  right.style.transform = "rotate(25deg)";
  left.style.transform = "rotate(-15deg)";
  UI.face.style.transform = isPositive ? "rotate(8deg)" : "rotate(-8deg)";

  setTimeout(() => {
    right.style.transform = "rotate(0deg)";
    left.style.transform = "rotate(0deg)";
    UI.face.style.transform = "rotate(0deg)";
  }, CONFIG.GESTURE_DURATION);
}

/**
 * Запрос к ИИ (Worker)
 */
async function fetchAIResponse(userText) {
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText })
    });

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();
    return data.answer || "Хм, не нахожу слов... 💭";
  } catch (error) {
    console.error("AI Fetch Error:", error);
    return "Произошел сбой в моей нейронной сети 💥";
  }
}

/**
 * Обработка диалога
 */
async function handleUserCommand(text) {
  UI.card.textContent = "Думаю...";
  
  const answer = await fetchAIResponse(text);
  UI.card.textContent = answer;

  const lowerAnswer = answer.toLowerCase();
  const isPositive = ["да", "конечно", "хорошо", "окей"].some(word => lowerAnswer.includes(word));
  
  playGesture(isPositive);
}

/**
 * Инициализация голосового ввода
 */
const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    UI.card.textContent = "Ваш браузер не поддерживает голос 😢";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = CONFIG.LANG;
  recognition.interimResults = false;

  UI.micBtn.onclick = () => {
    try {
      recognition.start();
      UI.card.textContent = "🎧 Слушаю вас...";
    } catch (e) {
      console.warn("Попытка повторного запуска распознавания");
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleUserCommand(transcript);
  };

  recognition.onerror = (err) => {
    console.error("Speech Error:", err.error);
    UI.card.textContent = "Не расслышал, повторите? 🎤";
  };
};

// Запуск
startBlinking();
initSpeechRecognition();
