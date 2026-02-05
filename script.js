const UI = {
  card: document.getElementById("card"),
  micBtn: document.getElementById("micBtn"),
  eyes: document.querySelectorAll(".eye"),
  face: document.getElementById("face"),
  leftArm: document.querySelector(".arm.left"),
  rightArm: document.querySelector(".arm.right")
};

// --- Анимация моргания ---
setInterval(() => {
  UI.eyes.forEach(e => e.style.height = "2px");
  setTimeout(() => {
    UI.eyes.forEach(e => e.style.height = "44px");
  }, 150);
}, 3500);

// --- Функция жестов ---
function playGesture(isHappy = true) {
  UI.face.style.transform = isHappy ? "rotate(8deg) translateY(-5px)" : "rotate(-8deg)";
  UI.rightArm.style.transform = "rotate(30deg)";
  UI.leftArm.style.transform = "rotate(-30deg)";
  
  setTimeout(() => {
    UI.face.style.transform = "rotate(0deg) translateY(0)";
    UI.rightArm.style.transform = "rotate(0deg)";
    UI.leftArm.style.transform = "rotate(0deg)";
  }, 700);
}

// --- Запрос к ИИ ---
async function askAI(text) {
  try {
    const response = await fetch("https://pukipuki.damp-glade-283e.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    if (!response.ok) throw new Error("Ошибка сервера");

    const data = await response.json();
    return data.answer || "Я задумался... Повтори еще раз? 💭";
  } catch (err) {
    console.error("Ошибка API:", err);
    return "Не могу связаться с мозговым центром 💥";
  }
}

// --- Логика ответа ---
async function respond(text) {
  UI.card.textContent = "🤖 Думаю...";
  const answer = await askAI(text);
  UI.card.textContent = answer;

  const low = answer.toLowerCase();
  const isHappy = ["да", "хорошо", "привет", "рад", "отлично"].some(word => low.includes(word));
  playGesture(isHappy);
}

// --- Голосовой ввод ---
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

  recognition.onerror = () => {
    UI.card.textContent = "Я вас не расслышал... 🎤";
  };

  recognition.onend = () => {
    UI.micBtn.classList.remove("recording");
  };

  recognition.start();
};
