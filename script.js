document.addEventListener("DOMContentLoaded", () => {
    // 1. Поиск элементов с проверкой
    const UI = {
        card: document.getElementById("card"),
        micBtn: document.getElementById("micBtn"),
        eyes: document.querySelectorAll(".eye"),
        face: document.getElementById("face"),
        leftArm: document.querySelector(".arm.left"),
        rightArm: document.querySelector(".arm.right")
    };

    console.log("PukiPuki инициализирован", UI);

    // 2. Анимация моргания (безопасная)
    setInterval(() => {
        if (UI.eyes.length > 0) {
            UI.eyes.forEach(e => e.style.height = "2px");
            setTimeout(() => {
                UI.eyes.forEach(e => e.style.height = "44px");
            }, 150);
        }
    }, 3500);

    // 3. Функция жестов
    function playGesture(isHappy = true) {
        if (UI.face) UI.face.style.transform = isHappy ? "rotate(8deg) translateY(-5px)" : "rotate(-8deg)";
        if (UI.leftArm) UI.leftArm.style.transform = "rotate(-30deg)";
        if (UI.rightArm) UI.rightArm.style.transform = "rotate(30deg)";

        setTimeout(() => {
            if (UI.face) UI.face.style.transform = "rotate(0deg) translateY(0)";
            if (UI.leftArm) UI.leftArm.style.transform = "rotate(0deg)";
            if (UI.rightArm) UI.rightArm.style.transform = "rotate(0deg)";
        }, 800);
    }

    // 4. Запрос к Cloudflare Worker
    async function askAI(text) {
        const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";
        
        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

            const data = await response.json();
            return data.answer || "Я не смог придумать ответ... 💭";
        } catch (err) {
            console.error("Ошибка API:", err);
            return "Связь прервана. Проверь настройки CORS в Cloudflare! 💥";
        }
    }

    // 5. Обработка диалога
    async function respond(text) {
        if (UI.card) UI.card.textContent = "🤖 Думаю...";
        const answer = await askAI(text);
        if (UI.card) UI.card.textContent = answer;

        const low = answer.toLowerCase();
        const isHappy = ["привет", "да", "хорошо", "рад", "отлично"].some(w => low.includes(w));
        playGesture(isHappy);
    }

    // 6. Голосовой ввод
    if (UI.micBtn) {
        UI.micBtn.addEventListener("click", () => {
            const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!Speech) {
                if (UI.card) UI.card.textContent = "Ваш браузер не поддерживает голос 😢";
                return;
            }

            const recognition = new Speech();
            recognition.lang = "ru-RU";

            recognition.onstart = () => {
                if (UI.card) UI.card.textContent = "🎧 Слушаю вас...";
                UI.micBtn.classList.add("recording");
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                respond(transcript);
            };

            recognition.onerror = (err) => {
                console.error("Speech Rec Error:", err);
                if (UI.card) UI.card.textContent = "Я вас не расслышал... 🎤";
            };

            recognition.onend = () => {
                UI.micBtn.classList.remove("recording");
            };

            recognition.start();
        });
    }
});
