document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const notification = document.getElementById("notification");
  const exportBtn = document.getElementById("export-button"); // 新增导出按钮
  const userId = generateUserId(); // 生成唯一用户ID

  // 生成用户ID（用于匿名化数据）
  function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

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
    
    // 记录干预事件
    logInteractionEvent('HUG_INTERVENTION_TRIGGERED', {});
    
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
      
      // 记录用户输入
      logInteractionEvent('USER_MESSAGE', {text});
      
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

      // 记录情绪识别结果
      logInteractionEvent('EMOTION_DETECTED', {
        emotion: emotionData.emotion,
        score: emotionData.score,
        trigger_hug: emotionData.trigger_hug
      });

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
      
      // 记录系统回复
      logInteractionEvent('SYSTEM_RESPONSE', {
        response: chatData.response || "I'm here for you ❤️"
      });
      
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
      
      // 记录错误事件
      logInteractionEvent('ERROR', {
        message: error.message,
        stack: error.stack
      });
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

  // +++ 新增: 记录交互事件 +++
  function logInteractionEvent(eventType, eventData) {
    const timestamp = new Date().toISOString();
    const event = {
      userId,
      eventType,
      timestamp,
      ...eventData
    };
    
    // 获取现有日志或初始化空数组
    const interactionLog = JSON.parse(localStorage.getItem('interactionLog') || '[]');
    
    // 添加新事件
    interactionLog.push(event);
    
    // 保存回localStorage
    localStorage.setItem('interactionLog', JSON.stringify(interactionLog));
    
    console.log(`Logged event: ${eventType}`, event);
  }

  // +++ 新增: 导出数据功能 +++
  exportBtn.addEventListener('click', () => {
    const interactionLog = JSON.parse(localStorage.getItem('interactionLog') || '[]');
    
    if (interactionLog.length === 0) {
      alert('No interaction data found!');
      return;
    }
    
    // 创建CSV内容
    let csvContent = 'userId,eventType,timestamp,text,emotion,score,trigger_hug,response,error\n';
    
    interactionLog.forEach(event => {
      const row = [
        event.userId,
        event.eventType,
        event.timestamp,
        `"${(event.text || '').replace(/"/g, '""')}"`,
        event.emotion || '',
        event.score || '',
        event.trigger_hug || '',
        `"${(event.response || '').replace(/"/g, '""')}"`,
        `"${(event.message || '').replace(/"/g, '""')}"`
      ].join(',');
      
      csvContent += row + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `interaction_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Interaction data exported successfully!');
  });

  // +++ 新增: 初始化日志 +++
  if (!localStorage.getItem('interactionLog')) {
    localStorage.setItem('interactionLog', JSON.stringify([]));
    console.log('Initialized interaction log');
  }
});
