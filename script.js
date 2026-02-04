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

// 1. Анимация моргания (сделана более естественной)
setInterval(() => {
    UI.eyes.forEach(e => e.style.transform = "scaleY(0.1)");
    setTimeout(() => {
        UI.eyes.forEach(e => e.style.transform = "scaleY(1)");
    }, 150);
}, 3500);

// 2. Улучшенная функция жестов
function playGesture(type = 'neutral') {
    const { left, right } = UI.arms;
    
    if (type === 'happy') {
        right.style.transform = "rotate(30deg) translateY(-10px)";
        left.style.transform = "rotate(-30deg) translateY(-10px)";
        UI.face.style.transform = "translateY(-5px) rotate(5deg)";
    } else {
        right.style.transform = "rotate(15deg)";
        left.style.transform = "rotate(-15deg)";
    }

    setTimeout(() => {
        right.style.transform = "rotate(0deg)";
        left.style.transform = "rotate(0deg)";
        UI.face.style.transform = "rotate(0deg) translateY(0)";
    }, 600);
}

// 3. Запрос к ИИ с обработкой ошибок
async function askAI(text) {
    try {
        const response = await fetch("https://still-leaf-6d93.damp-glade-283e.workers.dev", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) throw new Error("Worker Error");

        const data = await response.json();
        return data.answer || "Я задумался и забыл ответ... 💭";
    } catch (err) {
        console.error("Ошибка API:", err);
        return "Не могу связаться с мозговым центром 💥";
    }
}

// 4. Логика ответа
async function respond(text) {
    UI.card.textContent = "🤖 Думаю...";
    const answer = await askAI(text);
    UI.card.textContent = answer;

    const low = answer.toLowerCase();
    const isHappy = ["да", "хорошо", "привет", "рад"].some(word => low.includes(word));
    playGesture(isHappy ? 'happy' : 'neutral');
}

// 5. Голосовой ввод (исправлен запуск)
UI.micBtn.onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        UI.card.textContent = "Ваш браузер не поддерживает голос 😢";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ru-RU";
    
    recognition.onstart = () => {
        UI.card.textContent = "🎧 Слушаю вас...";
        UI.micBtn.classList.add("active"); // Можно добавить стиль пульсации в CSS
    };

    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        respond(text);
    };

    recognition.onerror = () => {
        UI.card.textContent = "Я вас не расслышал...";
    };

    recognition.onend = () => {
        UI.micBtn.classList.remove("active");
    };

    recognition.start();
};
