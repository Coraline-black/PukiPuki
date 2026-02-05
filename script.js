document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("card");
    const micBtn = document.getElementById("micBtn");
    const robot = document.getElementById("robot");

    const WORKER_URL = "https://pukipuki.damp-glade-283e.workers.dev/";

    function setGesture(type) {
        robot.className = "";
        if (type) robot.classList.add(type);
    }

    async function askPukiPuki(text) {
        setGesture("thinking");
        card.textContent = "Думаю... 💭";
        
        try {
            const response = await fetch(WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();
            
            // ПРОВЕРКА: Если сервер прислал ответ, пишем его. 
            // Если сервер молчит, пишем ошибку.
            if (data && data.answer) {
                setGesture("happy");
                card.textContent = data.answer; // ЗДЕСЬ БУДЕТ НАСТОЯЩИЙ ОТВЕТ
            } else {
                card.textContent = "Я получил пустой ответ от мозга... 🧠";
            }

            setTimeout(() => setGesture(""), 5000);

        } catch (error) {
            setGesture("error");
            card.textContent = "Ошибка связи! Проверь интернет или Worker. 📡";
        }
    }

    const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Speech) {
        const recognition = new Speech();
        recognition.lang = "ru-RU";

        micBtn.onclick = () => recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            askPukiPuki(transcript);
        };
        
        recognition.onstart = () => { card.textContent = "Слушаю... 👂"; };
    }
});
