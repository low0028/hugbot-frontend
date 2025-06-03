const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;
  appendMessage("You", message);
  userInput.value = "";
  
  try {
    const response = await fetch("https://low0028-hugbot-backend.hf.space/emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    
    const result = await response.json();
    const emotion = result.emotion;
    const score = (result.score * 100).toFixed(1);
    const triggerHug = result.trigger_hug;

    appendMessage("HugBot", `I sense you're feeling **${emotion}** (${score}%)`);

    if (triggerHug) {
      appendMessage("HugBot", "🧸 Sending a virtual hug...");
      alert("🧸 Sending a virtual hug...");
      triggerFoxToHand();  // 启动小狐狸靠近手的动作
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

// ---------- 以下是小狐狸靠近手部动画逻辑 ----------
let foxModel = null;
let mixer = null;
let camera3D, renderer, scene;

import * as THREE from 'https://cdn.skypack.dev/three';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { Hands } from 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
import { Camera } from 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';

initThreeScene();
loadFoxModel();
initHandTracking();

function initThreeScene() {
  scene = new THREE.Scene();
  camera3D = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera3D.position.z = 2;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("three-canvas"), alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  animate();
}

function loadFoxModel() {
  const loader = new GLTFLoader();
  loader.load('model.glb', (gltf) => {
    foxModel = gltf.scene;
    foxModel.scale.set(0.5, 0.5, 0.5);
    foxModel.position.set(0, 0, 0);
    scene.add(foxModel);

    if (gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(foxModel);
      mixer.clipAction(gltf.animations[0]).play();
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (mixer) mixer.update(0.01);
  renderer.render(scene, camera3D);
}

// ---------- MediaPipe 手部识别 ----------
let latestHand = null;

async function initHandTracking() {
  const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
  });

  hands.onResults(results => {
    if (results.multiHandLandmarks.length > 0) {
      latestHand = results.multiHandLandmarks[0];
    }
  });

  const video = document.createElement('video');
  video.style.display = 'none';
  document.body.appendChild(video);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();

  const camera = new Camera(video, {
    onFrame: async () => await hands.send({ image: video }),
    width: 640,
    height: 480
  });
  camera.start();
}

// ---------- 蹭手逻辑 ----------
function triggerFoxToHand() {
  if (!foxModel || !latestHand) return;

  // 食指指关节 (index finger MCP = landmark 5)
  const handX = latestHand[5].x - 0.5;
  const handY = -(latestHand[5].y - 0.5);
  const targetX = handX * 2;
  const targetY = handY * 2;

  // 动画移动狐狸靠近手指
  new TWEEN.Tween(foxModel.position)
    .to({ x: targetX, y: targetY, z: 0 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .start();
}

// 加入 TWEEN 更新动画
import TWEEN from 'https://cdn.skypack.dev/@tweenjs/tween.js';
function animateWithTween() {
  requestAnimationFrame(animateWithTween);
  TWEEN.update();
}
animateWithTween();
