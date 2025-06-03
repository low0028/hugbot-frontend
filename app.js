document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const notification = document.getElementById("notification");

  // 显示通知的函数
  function showNotification(message) {
    if (!notification) return;
    
    notification.innerHTML = `<span class="notification-icon">🧸</span> ${message}`;
    notification.classList.add("show");
    
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // 触发虚拟拥抱
  function triggerVirtualHug() {
    showNotification("Sending a virtual hug...");
    
    // 在聊天框中显示消息
    appendMessage("HugBot", "I sense you're feeling down. Sending a virtual hug your way... 🧸");
    
    // 延迟启动AR场景，让用户看到通知
    setTimeout(() => {
      if (window.ARSystem && window.ARSystem.startARHugSession) {
        window.ARSystem.startARHugSession();
      } else {
        console.error("AR系统未初始化");
        appendMessage("HugBot", "I'd give you a hug if I could! 🫂");
      }
    }, 1500);
  }

  sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (!text) return;
    
    appendMessage("You", text);
    userInput.value = "";

    try {
      // --- Step 1: 情绪识别 ---
      const emotionRes = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {
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
      const chatRes = await fetch("https://low0028-hugbot-backend.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      const chatData = await chatRes.json();
      appendMessage("HugBot", chatData.response || "I'm here for you ❤️");

      // --- Step 3: 判断是否触发拥抱动画 ---
      if (emotionData.trigger_hug) {
        triggerVirtualHug();
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
