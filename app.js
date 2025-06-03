const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You", message);
  userInput.value = "";

  try {
    const response = await fetch("https://your-backend-url/emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });

    const data = await response.json();
    const emotion = data.emotion;
    const score = data.score;
    const triggerHug = data.trigger_hug;

    appendMessage("HugBot", `I sense you're feeling **${emotion}** (${(score * 100).toFixed(1)}%)`);

    if (triggerHug) {
      appendMessage("HugBot", "🤗 Sending a virtual hug...");
    }

  } catch (err) {
    console.error(err);
    appendMessage("HugBot", "Sorry, something went wrong.");
  }
});

function appendMessage(sender, message) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
