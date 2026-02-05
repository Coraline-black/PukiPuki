document.addEventListener("DOMContentLoaded", () => {
    // Получаем элементы
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const robot = document.getElementById("robot");
    const textInput = document.getElementById("textInput");
    const sendBtn = document.getElementById("sendBtn");

    // ТВОЙ URL (проверен из переписки)
    const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

    // Управление эмоциями
    function setGesture(type) {
        robot.className = ""; // Сброс классов
        if (type) robot.classList.add(type);
    }

    // ГЛАВНАЯ ФУНКЦИЯ ОБЩЕНИЯ
    async function askPukiPuki(text) {
        if (!text) return;

        // 1. Показываем, что думаем
        setGesture("thinking");
        card.textContent = "Связываюсь с космосом... 💭";

        try {
            // 2. Отправляем запрос на Worker
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error("Ошибка сервера");

            const data = await response.json();

            // 3. Получили ответ!
            if (data && data.answer) {
                setGesture("happy"); // Улыбаемся
                card.textContent = data.answer; // ВЫВОДИМ ОТВЕТ НЕЙРОСЕТИ
            } else {
                throw new Error("Пустой ответ");
            }

            // Через 5 секунд обычное лицо
            setTimeout(() => setGesture(""), 5000);

        } catch (error) {
            console.error(error);
            setGesture("error"); // Красные глаза
            card.textContent = "Ошибка связи! Проверь Worker. 📡";
        }
    }

    // НАСТРОЙКА ГОЛОСА
    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (Speech) {
        const recognition = new Speech();
        recognition.lang = "ru-RU";
        recognition.interimResults = false;

        // Нажатие на кнопку
        micBtn.addEventListener("click", () => {
            try {
                recognition.start();
                micBtn.textContent = "🔴 СЛУШАЮ...";
                card.textContent = "Говори...";
            } catch (e) {
                console.log("Уже запущено");
            }
        });

        // Когда перестал слушать, возвращаем кнопку
        recognition.onend = () => {
            micBtn.textContent = "🎤 ГОВОРИТЬ";
        };

        // Когда распознал речь
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            card.textContent = "Ты: " + transcript;
            // СРАЗУ ОТПРАВЛЯЕМ В НЕЙРОСЕТЬ
            askPukiPuki(transcript);
        };

        recognition.onerror = () => {
            setGesture("error");
            card.textContent = "Не расслышал. Попробуй еще раз.";
            micBtn.textContent = "🎤 ГОВОРИТЬ";
        };
    } else {
        card.textContent = "Браузер не поддерживает голос. Используй Chrome.";
        micBtn.style.display = "none";
    }

    // Ввод текстом (резервный вариант)
    sendBtn.addEventListener("click", () => {
        askPukiPuki(textInput.value.trim());
        textInput.value = "";
    });
});
