document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const notification = document.getElementById("notification");
  const exportBtn = document.getElementById("export-button");
  const userId = generateUserId();

  // 生成唯一用户ID
  function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  // 显示通知
  function showNotification(message) {
    if (!notification) {
      console.error("Notification element not found");
      return;
    }
    notification.innerHTML = `<span class="notification-icon">🌟</span> ${message}`;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // 触发星空疗愈空间
  function triggerSanctuarySession() {
    console.log("Triggering Sanctuary Session");
    showNotification("Entering the Star Sanctuary...");
    appendMessage("CompanionBot", "I've detected you're feeling down. Let's visit the Star Sanctuary together. 🌌");

    logInteractionEvent('SANCTUARY_TRIGGERED', {});

    setTimeout(() => {
      if (window.StarSanctuarySystem && typeof window.StarSanctuarySystem.startSanctuarySession === 'function') {
        console.log("Calling StarSanctuarySystem.startSanctuarySession");
        window.StarSanctuarySystem.startSanctuarySession();
      } else {
        console.error("StarSanctuarySystem not found or startSanctuarySession is not a function");
        appendMessage("CompanionBot", "I'd love to take you to the stars, but I can't right now. 🌠");
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
      console.log("Sending emotion analysis request:", text);
      logInteractionEvent('USER_MESSAGE', { text });

      // Step 1: 情绪识别
      const emotionRes = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: userId })
      });

      if (!emotionRes.ok) throw new Error(`Emotion API status: ${emotionRes.status}`);
      const emotionData = await emotionRes.json();
      console.log("Emotion API response:", emotionData);

      logInteractionEvent('EMOTION_DETECTED', {
        emotion: emotionData.emotion,
        score: emotionData.score,
        trigger_sanctuary: emotionData.trigger_hug // 这里沿用trigger_hug逻辑触发疗愈空间
      });

      if (emotionData.emotion) {
        appendMessage("CompanionBot", `I sense you're feeling **${emotionData.emotion}** (${emotionData.score}).`);
      } else {
        appendMessage("CompanionBot", "Sorry, I couldn't understand that emotion.");
        return;
      }

      // Step 2: 聊天回复
      const chatRes = await fetch("https://low0028-hugbot-backend.hf.space/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, session_id: userId })
      });

      if (!chatRes.ok) throw new Error(`Chat API status: ${chatRes.status}`);
      const chatData = await chatRes.json();
      console.log("Chat API response:", chatData);

      logInteractionEvent('SYSTEM_RESPONSE', { response: chatData.response || "I'm here for you. ❤️" });
      appendMessage("CompanionBot", chatData.response || "I'm here for you. ❤️");

      // Step 3: 触发星空疗愈
      if (emotionData.trigger_hug) {
        triggerSanctuarySession();
      }

    } catch (error) {
      console.error("Error:", error);
      appendMessage("CompanionBot", "Oops! Something went wrong. Please try again later.");
      logInteractionEvent('ERROR', { message: error.message, stack: error.stack });
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

  // 记录交互事件
  function logInteractionEvent(eventType, eventData) {
    const timestamp = new Date().toISOString();
    const event = { userId, eventType, timestamp, ...eventData };
    const log = JSON.parse(localStorage.getItem('interactionLog') || '[]');
    log.push(event);
    localStorage.setItem('interactionLog', JSON.stringify(log));
    console.log(`Logged event: ${eventType}`, event);
  }

  // 导出数据
  exportBtn.addEventListener('click', () => {
    const log = JSON.parse(localStorage.getItem('interactionLog') || '[]');
    if (log.length === 0) {
      alert('No interaction data found!');
      return;
    }
    let csv = 'userId,eventType,timestamp,text,emotion,score,trigger_sanctuary,response,error\n';
    log.forEach(event => {
      const row = [
        event.userId,
        event.eventType,
        event.timestamp,
        `"${(event.text || '').replace(/"/g, '""')}"`,
        event.emotion || '',
        event.score || '',
        event.trigger_sanctuary || '',
        `"${(event.response || '').replace(/"/g, '""')}"`,
        `"${(event.message || '').replace(/"/g, '""')}"`
      ].join(',');
      csv += row + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `interaction_data_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('Interaction data exported successfully!');
  });

  // 初始化日志
  if (!localStorage.getItem('interactionLog')) {
    localStorage.setItem('interactionLog', JSON.stringify([]));
    console.log('Initialized interaction log');
  }
});
