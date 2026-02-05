document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const robot = document.getElementById("robot");

    // Твой адрес воркера
    const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

    function setGesture(type) {
        robot.className = "";
        if (type) robot.classList.add(type);
    }

    async function askPukiPuki(text) {
        if (!text) return;
        
        setGesture("thinking");
        card.textContent = "Пуки-Пуки анализирует... 💭";
        
        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error("Ошибка сервера");

            const data = await response.json();
            
            // ВАЖНО: Выводим ТОЛЬКО то, что прислал ИИ
            if (data && data.answer) {
                setGesture("happy");
                card.textContent = data.answer; 
            } else {
                card.textContent = "Я получил странный ответ от нейросети... 🤔";
            }

            setTimeout(() => setGesture(""), 5000);

        } catch (error) {
            setGesture("error");
            card.textContent = "Ошибка связи! Проверь Cloudflare Worker. 📡";
            console.error(error);
        }
    }

    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Speech) {
        const recognition = new Speech();
        recognition.lang = "ru-RU";

        micBtn.onclick = () => {
            recognition.start();
            card.textContent = "Слушаю... 👂";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            askPukiPuki(transcript);
        };

        recognition.onerror = () => {
            setGesture("error");
            card.textContent = "Я не расслышала. Повторишь? ✨";
        };
    } else {
        card.textContent = "Голосовой ввод не поддерживается в этом браузере.";
    }
});
