document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");

    // Функция общения с твоим воркером
    async function askPukiPuki(text) {
        // Убедись, что ссылка ниже совпадает с адресом твоего воркера в Cloudflare
        const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: text }), // Отправляем сообщение именно как { message: "текст" }
            });

            if (!response.ok) {
                throw new Error("Ошибка сети");
            }

            const data = await response.json();
            return data.answer; // Воркер возвращает { answer: "текст" }

        } catch (error) {
            console.error("Ошибка запроса:", error);
            return "Ой! Связь прервалась. Проверь интернет или настройки воркера 📡";
        }
    }

    // Работа с голосом
    if (micBtn) {
        micBtn.addEventListener("click", () => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                card.textContent = "Твой браузер не поддерживает голос. Попробуй Chrome!";
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = "ru-RU";

            recognition.onstart = () => {
                card.textContent = "Слушаю тебя внимательно... 👂";
                micBtn.style.animation = "pulse 1s infinite"; // Если есть анимация в CSS
            };

            recognition.onerror = () => {
                card.textContent = "Я ничего не услышал... Попробуй еще раз! ✨";
                micBtn.style.animation = "none";
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                card.textContent = Ты: "${transcript}" — Думаю... 💭;
                micBtn.style.animation = "none";

                // Отправляем текст в Cloudflare и ждем ответ от Gemini
                const aiResponse = await askPukiPuki(transcript);
                card.textContent = aiResponse;
            };

            recognition.start();
        });
    }
});
