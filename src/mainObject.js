import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SpineManager } from "./spinePack.js";
export * from "@esotericsoftware/spine-core";
export * from "@esotericsoftware/spine-webgl";
export * from "@esotericsoftware/spine-canvas";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Add a simple cube for reference
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00fff0 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const spineManager = new SpineManager(scene, renderer, jsonPath, atlasPath);
spineManager
  .setupSkeleton("/skeleton.json", "/skeletons.atlas", "inital animation")
  .then(() => {
    animate();
  });
console.log("spine_loaded");
// Add light
const light = new THREE.DirectionalLight(0xffffff, 5);
light.position.set(0, 10, 10).normalize();
scene.add(light);

// // Configure DRACOLoader
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

// // Load GLB model with GLTFLoader and DRACOLoader
// const loader = new GLTFLoader();
// loader.setDRACOLoader(dracoLoader);
// loader.load(
//   "/SnookerTable_VFA.glb",
//   (gltf) => {
//     const model = gltf.scene;
//     scene.add(model);
//   },
//   undefined,
//   (error) => {
//     console.error(error);
//   }
// );

// Render loop
function animate() {
  requestAnimationFrame(animate);

  const delta = 0.016;
  spineManager.update(delta);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // required if controls.enableDamping or controls.autoRotate are set to true
  // controls.update();
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
