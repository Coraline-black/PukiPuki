document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const sendBtn = document.getElementById("sendBtn");
    const textInput = document.getElementById("textInput");

    // Функция озвучки ответа
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ru-RU";
        window.speechSynthesis.speak(utterance);
    }

    async function askPukiPuki(text) {
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
            return "Ой! Связь прервалась. Проверь воркер 📡";
        }
    }

    // Логика голоса
    if (micBtn) {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!Recognition) {
            card.textContent = "Браузер не поддерживает голос. Используй Chrome!";
        } else {
            const recognition = new Recognition();
            recognition.lang = "ru-RU";

            micBtn.addEventListener("click", () => {
                recognition.start();
            });

            recognition.onstart = () => {
                card.textContent = "Слушаю тебя... 👂";
                micBtn.style.backgroundColor = "red"; // Визуальный эффект
            };

            recognition.onresult = async (event) => {
                micBtn.style.backgroundColor = "";
                const transcript = event.results[0][0].transcript;
                card.textContent = Ты сказала: "${transcript}"... Думаю... 💭;

                const aiResponse = await askPukiPuki(transcript);
                card.textContent = aiResponse;
                speak(aiResponse); // Робот отвечает голосом!
            };

            recognition.onerror = () => {
                micBtn.style.backgroundColor = "";
                card.textContent = "Я не расслышала. Нажми еще раз? ✨";
            };
        }
    }

    // Логика текста (на всякий случай)
    sendBtn.addEventListener("click", async () => {
        const text = textInput.value;
        if (!text) return;
        card.textContent = "Думаю... 💭";
        const aiResponse = await askPukiPuki(text);
        card.textContent = aiResponse;
        speak(aiResponse);
        textInput.value = "";
    });
});
