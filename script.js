document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");

    async function askPukiPuki(text) {
        // Добавил / в конце ссылки, теперь она идеальна
        const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error("Ошибка сети");

            const data = await response.json();
            return data.answer; 

        } catch (error) {
            console.error("Ошибка:", error);
            return "Ой! Связь прервалась. Проверь настройки воркера 📡";
        }
    }

    if (micBtn) {
        micBtn.addEventListener("click", () => {
            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!Recognition) {
                card.textContent = "Твой браузер не поддерживает голос. Попробуй Chrome!";
                return;
            }

            const recognition = new Recognition();
            recognition.lang = "ru-RU";

            recognition.onstart = () => {
                card.textContent = "Слушаю тебя... 👂";
            };

            recognition.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                card.textContent = "Думаю... 💭";

                const aiResponse = await askPukiPuki(transcript);
                card.textContent = aiResponse;
            };

            recognition.onerror = () => {
                card.textContent = "Я не расслышал, повтори? ✨";
            };

            recognition.start();
        });
    }
});
