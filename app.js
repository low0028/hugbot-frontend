import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { renderEmotionFlower } from '../shared/emotion_flower.js';

let scene, camera, renderer, model;

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 3;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(400, 300);
  document.getElementById('hug-scene').appendChild(renderer.domElement);
}

function loadModel(modelName) {
  const loader = new GLTFLoader();
  loader.load(`models/${modelName}.glb`, (gltf) => {
    model = gltf.scene;
    scene.add(model);
    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (model) model.rotation.y += 0.01;
  renderer.render(scene, camera);
}

function triggerHug() {
  alert("💖 小狐狸正在抱你 30 秒...");
  initScene();
  loadModel("fox"); // 默认小狐狸
  renderEmotionFlower("joy"); // 示例调用
}
