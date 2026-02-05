document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const robot = document.getElementById("robot");
    const textInput = document.getElementById("textInput");
    const sendBtn = document.getElementById("sendBtn");

    const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

    function setGesture(type) {
        robot.className = ""; // сброс
        if (type) robot.classList.add(type);
    }

    async function getAIResponse(message) {
        setGesture("thinking");
        card.textContent = "Пуки-Пуки думает...";

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            if (data.answer) {
                setGesture("happy");
                card.textContent = data.answer;
                setTimeout(() => setGesture(""), 4000);
            }
        } catch (err) {
            setGesture("error");
            card.textContent = "Ошибка связи! Проверь воркер или интернет.";
        }
    }

    // ГОЛОСОВОЕ УПРАВЛЕНИЕ
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Speech) {
        const rec = new Speech();
        rec.lang = "ru-RU";

        micBtn.onclick = () => {
            try { rec.start(); } catch(e) { console.log("Уже запущено"); }
        };

        rec.onstart = () => {
            card.textContent = "Слушаю... 👂";
            micBtn.style.background = "#ff4d4d";
        };

        rec.onresult = (event) => {
            const text = event.results[0][0].transcript;
            card.textContent = "Ты: " + text;
            getAIResponse(text);
        };

        rec.onend = () => {
            micBtn.style.background = "#007bff";
        };

        rec.onerror = () => {
            setGesture("error");
            card.textContent = "Я не расслышал. Нажми еще раз.";
        };
    } else {
        card.textContent = "Голосовой ввод не поддерживается этим браузером.";
    }

    // ТЕКСТОВЫЙ ВВОД
    sendBtn.onclick = () => {
        if (textInput.value.trim()) {
            getAIResponse(textInput.value);
            textInput.value = "";
        }
    };
});
