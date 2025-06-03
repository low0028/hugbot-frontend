document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const notification = document.getElementById("notification");

  // 显示通知的函数
  function showNotification(message) {
    if (!notification) {
      console.error("Notification element not found");
      return;
    }
    
    notification.innerHTML = `<span class="notification-icon">🧸</span> ${message}`;
    notification.classList.add("show");
    
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // 触发虚拟拥抱
  function triggerVirtualHug() {
    console.log("Triggering virtual hug");
    showNotification("Sending a virtual hug...");
    
    // 在聊天框中显示消息
    appendMessage("HugBot", "I sense you're feeling down. Sending a virtual hug your way... 🧸");
    
    // 延迟启动AR场景，让用户看到通知
    setTimeout(() => {
      if (window.ARSystem && typeof window.ARSystem.startARHugSession === 'function') {
        console.log("Calling ARSystem.startARHugSession");
        window.ARSystem.startARHugSession();
      } else {
        console.error("ARSystem not found or startARHugSession is not a function");
        appendMessage("HugBot", "I'd give you a hug if I could! 🫂");
      }
    }, 1500);
  }

  // 发送消息
  sendBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (!text) return;
    
    appendMessage("You", text);
    userInput.value = "";

    try {
      console.log("Sending emotion analysis request for text:", text);
      // --- Step 1: 情绪识别 ---
      const emotionRes = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      if (!emotionRes.ok) {
        throw new Error(`Emotion API responded with status ${emotionRes.status}`);
      }
      
      const emotionData = await emotionRes.json();
      console.log("Emotion API response:", emotionData);

      if (emotionData.emotion) {
        appendMessage("HugBot", `I sense you're feeling **${emotionData.emotion}** (${emotionData.score})`);
      } else {
        appendMessage("HugBot", "Sorry, I couldn't understand that emotion.");
        return;
      }

      // --- Step 2: 聊天回复 ---
      console.log("Sending chat request for text:", text);
      const chatRes = await fetch("https://low0028-hugbot-backend.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      if (!chatRes.ok) {
        throw new Error(`Chat API responded with status ${chatRes.status}`);
      }
      
      const chatData = await chatRes.json();
      console.log("Chat API response:", chatData);
      appendMessage("HugBot", chatData.response || "I'm here for you ❤️");

      // --- Step 3: 判断是否触发拥抱动画 ---
      if (emotionData.trigger_hug) {
        console.log("Emotion data indicates a hug should be triggered");
        triggerVirtualHug();
      } else {
        console.log("No hug triggered based on emotion data");
      }
    } catch (error) {
      console.error("Error:", error);
      appendMessage("HugBot", "Oops! Something went wrong. Please try again later.");
      // 记录更详细的错误信息
      appendMessage("HugBot", `Error details: ${error.message}`);
    }
  });

  // 添加消息到聊天框
  function appendMessage(sender, message) {
    if (!chatBox) {
      console.error("Chat box element not found");
      return;
    }
    
    const div = document.createElement('div');
    div.className = `message ${sender === "You" ? 'user-message' : 'bot-message'}`;
    div.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});
