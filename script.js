document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const robot = document.getElementById("robot");
    const textInput = document.getElementById("textInput");
    const sendBtn = document.getElementById("sendBtn");

    const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

    // Функция смены ЖЕСТОВ (эмоций)
    function setGesture(type) {
        robot.className = ""; // Сброс всех классов
        if (type) robot.classList.add(type);
    }

    // Функция запроса к ИИ
    async function getAIResponse(message) {
        if (!message) return;
        
        setGesture("thinking");
        card.textContent = "Пуки-Пуки думает... 💭";

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) throw new Error();

            const data = await response.json();
            
            if (data.answer) {
                setGesture("happy"); // ЖЕСТ: Улыбка при ответе
                card.textContent = data.answer;
                // Через 5 секунд возвращаемся в обычное состояние
                setTimeout(() => setGesture(""), 5000);
            }
        } catch (err) {
            setGesture("error"); // ЖЕСТ: Ошибка
            card.textContent = "Упс! Ошибка связи с сервером. 📡";
        }
    }

    // РАБОТА С ГОЛОСОМ
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (Speech) {
        const recognition = new Speech();
        recognition.lang = "ru-RU";

        micBtn.addEventListener("click", () => {
            try {
                recognition.start();
            } catch (e) {
                console.log("Распознавание уже запущено");
            }
        });

        recognition.onstart = () => {
            card.textContent = "Слушаю тебя... 👂";
            micBtn.textContent = "🔴 СЛУШАЮ...";
            setGesture("thinking");
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            card.textContent = "Ты: " + text;
            getAIResponse(text);
        };

        recognition.onend = () => {
            micBtn.textContent = "🎤 ГОВОРИТЬ";
        };

        recognition.onerror = () => {
            setGesture("error");
            card.textContent = "Я не расслышала. Повторишь? ✨";
        };
    } else {
        card.textContent = "Твой браузер не поддерживает голос. Используй Chrome.";
    }

    // РАБОТА С ТЕКСТОМ
    sendBtn.onclick = () => {
        const val = textInput.value.trim();
        if (val) {
            getAIResponse(val);
            textInput.value = "";
        }
    };
});
