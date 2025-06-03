document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (!text) return;
    appendMessage("You", text);
    userInput.value = "";

    try {
      // --- Step 1: 情绪识别 ---
      const emotionRes = await fetch("https://your-backend-url/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const emotionData = await emotionRes.json();

      if (emotionData.emotion) {
        appendMessage("HugBot", `I sense you're feeling **${emotionData.emotion}** (${emotionData.score})`);
      } else {
        appendMessage("HugBot", "Sorry, I couldn't understand that emotion.");
        return;
      }

      // --- Step 2: 聊天回复 ---
      const chatRes = await fetch("https://your-backend-url/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const chatData = await chatRes.json();
      appendMessage("HugBot", chatData.response || "I'm here for you ❤️");

      // --- Step 3: 判断是否触发拥抱动画 ---
      if (emotionData.trigger_hug) {
        setTimeout(() => {
          alert("🧸 Sending a virtual hug...");
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
      appendMessage("HugBot", "Oops! Something went wrong.");
    }
  });

  function appendMessage(sender, message) {
    const div = document.createElement("div");
    div.className = sender === "You" ? "user-message" : "bot-message";
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
