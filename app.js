import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { Hands } from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

const sendButton = document.getElementById("send-button");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

sendButton.onclick = async () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("You", text);
  userInput.value = "Analyzing...";

  const response = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  const result = await response.json();
  const emotion = result.emotion;
  const confidence = result.score.toFixed(2);

  addMessage("HugBot", `I sense you're feeling <strong>${emotion}</strong> (${confidence})`);

  if (["sadness", "anger", "fear"].includes(emotion.toLowerCase())) {
    alert("🧸 Sending a virtual hug...");
  }

  userInput.value = "";
};

function addMessage(sender, message) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// --- THREE.js Setup ---
let fox, mixer;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 3);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("three-canvas"), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const loader = new GLTFLoader();
loader.load("fox_rig_finished_walk_cycle_progressive_stop.glb", gltf => {
  fox = gltf.scene;
  fox.scale.set(0.4, 0.4, 0.4);
  scene.add(fox);
  fox.position.set(0, 0, 0);

  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(fox);
    mixer.clipAction(gltf.animations[0]).play();
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);
  renderer.render(scene, camera);
}
animate();

// --- MediaPipe Hands ---
const video = document.getElementById("camera-feed");

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const indexTip = landmarks[8];
    moveFoxToHand(indexTip.x, indexTip.y);
  }
});

const cam = new Camera(video, {
  onFrame: async () => await hands.send({ image: video }),
  width: 640,
  height: 480
});
cam.start();

function moveFoxToHand(normX, normY) {
  const x = (normX - 0.5) * 4;
  const y = -(normY - 0.5) * 2;
  if (fox) fox.position.set(x, y, 0);
}
