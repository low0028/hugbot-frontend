const sendButton = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

sendButton.onclick = async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("You", text);
  userInput.value = "Analyzing...";

  const response = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {  // ✅ 替换这里
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const result = await response.json();
  const emotion = result.emotion;
  const confidence = result.score.toFixed(2);

  addMessage("HugBot", `I sense you're feeling **${emotion}** (${confidence})`);

  if (["sadness", "anger", "fear"].includes(emotion.toLowerCase())) {
    triggerHug();
  }

  userInput.value = "";
};

function addMessage(sender, message) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function triggerHug() {
  // 模拟触发 3D 拥抱动画
  alert("🧸 Sending a virtual hug...");
  // 你可以在这里加载 glTF 模型并播放动画
}
