const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const EMOTION_API_URL = 'https://low0028-hugbot-backend.hf.space/emotion'; // ← 修改为你的真实后端 API 地址

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
      body: JSON.stringify({ text: text })
    });

    const result = await response.json();
    const emotion = result.label;
    const score = result.score;

    appendMessage(`HugBot: I sense you're feeling **${emotion}** (${score.toFixed(2)})`);

    if (['sadness', 'anger', 'fear', 'disgust'].includes(emotion.toLowerCase()) && score > 0.6) {
      setTimeout(() => {
        alert('🧸 Sending a virtual hug...');
        // 此处已由 index.html 中的 MediaPipe + 3D 动画处理触发视觉部分
      }, 300);
    }
  } catch (error) {
    appendMessage(`HugBot: Sorry, something went wrong.`);
    console.error(error);
  }
});

function appendMessage(text) {
  const message = document.createElement('div');
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
}
