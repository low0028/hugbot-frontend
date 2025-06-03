// DOM 元素
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// 情绪识别 API 地址（记得换成你自己的 Hugging Face Space 地址）
const EMOTION_API_URL = 'https://your-huggingface-space-url/emotion';

// 发送按钮点击逻辑
sendButton.addEventListener('click', async () => {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(`You: ${text}`);
  appendMessage(`You: Analyzing...`);
  userInput.value = '';

  try {
    const response = await fetch(EMOTION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const result = await response.json();
    const emotion = result.label;
    const score = result.score;

    appendMessage(`HugBot: I sense you're feeling **${emotion}** (${score.toFixed(2)})`);

    if (['sadness', 'anger', 'fear', 'disgust'].includes(emotion.toLowerCase()) && score > 0.6) {
      setTimeout(() => {
        alert('🧸 Sending a virtual hug...');
        // 手部识别 + 小狐狸动作逻辑自动执行，无需这里手动调用
      }, 500);
    }
  } catch (error) {
    appendMessage('HugBot: Sorry, something went wrong.');
    console.error(error);
  }
});

// 添加信息到聊天框
function appendMessage(text) {
  const message = document.createElement('div');
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}
