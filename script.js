document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("card");
  const input = document.getElementById("textInput");
  const btn = document.getElementById("sendBtn");

  const WORKER_URL = "https://still-leaf-6d93.damp-glade-283e.workers.dev";

  async function askAI(text) {
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      return data.answer || "Пустой ответ 😶";

    } catch (e) {
      return "Ошибка связи с ИИ 💥";
    }
  }

  btn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;

    card.textContent = "PukiPuki думает… 🤔";
    input.value = "";

    const answer = await askAI(text);
    card.textContent = answer;
  };
});
