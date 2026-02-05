const UI = {
  card: document.getElementById("card"),
  micBtn: document.getElementById("micBtn"),
  eyes: document.querySelectorAll(".eye"),
  face: document.getElementById("face"),
  // Исправленный выбор рук для твоей структуры
  leftArm: document.querySelector(".arm.left"),
  rightArm: document.querySelector(".arm.right")
};

// 1. Анимация моргания
setInterval(() => {
  UI.eyes.forEach(e => e.style.height = "2px");
  setTimeout(() => {
    UI.eyes.forEach(e => e.style.height = "44px");
  }, 150);
}, 3500);

// 2. Функция жестов
function playGesture(isHappy = true) {
  if(UI.face) UI.face.style.transform = isHappy ? "rotate(8deg) translateY(-5px)" : "rotate(-8deg)";
  if(UI.rightArm) UI.rightArm.style.transform = "rotate(30deg)";
  if(UI.leftArm) UI.leftArm.style.transform = "rotate(-30deg)";
  
  setTimeout(() => {
    if(UI.face) UI.face.style.transform = "rotate(0deg) translateY(0)";
    if(UI.rightArm) UI.rightArm.style.transform = "rotate(0deg)";
    if(UI.leftArm) UI.leftArm.style.transform = "rotate(0deg)";
  }, 700);
}

// 3. Запрос к ИИ (Твой воркер)
async function askAI(text) {
  try {
    const response = await fetch("https://pukipuki.damp-glade-283e.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) throw new Error("Worker Offline");

    const data = await response.json();
    return data.answer || "Я задумался... Повтори? 💭";
  } catch (err) {
    console.error("Ошибка:", err);
    return "Связь с PukiPuki прервана 💥 (Проверь CORS в воркере)";
  }
}

// 4. Логика диалога
async function respond(text) {
  UI.card.textContent = "🤖 Думаю...";
  const answer = await askAI(text);
  UI.card.textContent = answer;

  const low = answer.toLowerCase();
  const isHappy = ["привет", "рад", "да", "хорошо"].some(word => low.includes(word));
  playGesture(isHappy);
}

// 5. Голосовой ввод
UI.micBtn.onclick = () => {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!Speech) {
    UI.card.textContent = "Браузер не поддерживает голос 😢";
    return;
  }

  const recognition = new Speech();
  recognition.lang = "ru-RU";
  
  recognition.onstart = () => {
    UI.card.textContent = "🎧 Слушаю...";
    UI.micBtn.classList.add("recording");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    respond(transcript);
  };

  recognition.onend = () => {
    UI.micBtn.classList.remove("recording");
  };

  recognition.start();
};
