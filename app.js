// 获取 DOM 元素
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 聊天提交函数
sendButton.addEventListener('click', async () => {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage('You', text);
  userInput.value = '';
  sendButton.disabled = true;
  userInput.disabled = true;

  try {
    const response = await fetch('https://your-space-name.hf.space/emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const result = await response.json();
    const emotion = result.label;
    const score = (result.score * 100).toFixed(1);

    appendMessage('HugBot', `I sense you're feeling **${emotion}** (${score}%)`);

    if (['sadness', 'anger', 'fear'].includes(emotion.toLowerCase())) {
      showNotification('🧸 Sending a virtual hug...');
    }
  } catch (error) {
    appendMessage('HugBot', 'Sorry, something went wrong.');
  } finally {
    sendButton.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
});

// 聊天框追加信息
function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 触发通知（可自定义为动画触发器）
function showNotification(text) {
  alert(text); // 可以改成触发小狐狸动画
}
