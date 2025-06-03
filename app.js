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

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    if (!data || !data.emotion) {
      appendMessage("HugBot", "Sorry, I couldn't understand your emotion.");
      return;
    }

    const emotion = data.emotion;
    const score = data.score;
    const triggerHug = data.trigger_hug;

    appendMessage("HugBot", `I sense you're feeling <strong>${emotion}</strong> (${(score * 100).toFixed(1)}%)`);

    if (triggerHug) {
      appendMessage("HugBot", "🧸 Sending a virtual hug...");
      setTimeout(() => {
        alert("🤗 Here's your hug!");
      }, 1000);
    }

  } catch (error) {
    console.error("Error:", error);
    appendMessage("HugBot", "Sorry, something went wrong.");
  }
});

function appendMessage(sender, message) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
