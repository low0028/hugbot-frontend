async function analyzeEmotion() {
  const text = document.getElementById("user-input").value;
  const res = await fetch("https://your-ngrok-url.ngrok.io/emotion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const data = await res.json();
  document.getElementById("response").innerText = `情绪：${data.emotion}，信心：${data.score}`;

  if (data.trigger_hug) {
    triggerHug();
  }
}

function triggerHug() {
  // TODO: 加载并展示小狐狸等3D模型
  alert("💖 小狐狸正在抱你 30 秒...");
  // 示例：加载模型 + 展示 + 花朵奖励
}

// 可拓展 Three.js 场景绘制、情绪花朵奖励系统
