import * as THREE from "three";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
// import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { data } from "./shaderData.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";

// / Define a function to export Three.js scene to JSON
function exportSceneToJSON(scene) {
  //   // Convert the scene to JSON format
  var sceneJson = scene.toJSON();
  //   // Convert JSON to string
  var jsonString = JSON.stringify(sceneJson);
  //   // Log the JSON string to the console
  console.log(jsonString);

  //   // Create a Blob containing the JSON data
  // var blob = new Blob([jsonString], { type: "application/json" });

  //   // Create a URL for the Blob
  // var url = URL.createObjectURL(blob);

  //   // Create a link element
  // var a = document.createElement("a");
  // a.href = url;
  // a.download = "scene.json"; // Set the file name
  // a.click(); // Simulate a click on the link to download the file
}

// Create a Three.js scene
// function createScene() {
// Create a scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Create geometry and NodeToy material
let geometry = new THREE.PlaneGeometry(5, 5);
let material = new NodeToyMaterial({
  data,
});

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// Create mesh
let mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 10;

// Create mesh
// let planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(planeMesh);
// camera.position.z = 10;

// Create lights
const light = new THREE.AmbientLight(0x404040, 0.5); // soft white light
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(-10, -10, -5);
scene.add(directionalLight);

// Export the scene to JSON after everything is set up
exportSceneToJSON(scene);

// Initialize GLTFExporter
// const exporter = new GLTFExporter();

// Function to export scene to GLB
// function exportToGLB(scene) {

// exporter.parse(scene, function (glb) {
// Save the GLB data as a file
// saveByteArray("scene.glb", glb);
// });
// }

// Function to save GLB data as a file
// function saveByteArray(fileName, byte) {
//   const blob = new Blob([byte], { type: "application/octet-stream" });
//   const link = document.createElement("a");
//   link.href = window.URL.createObjectURL(blob);
//   link.download = fileName;
//   link.click();
// }

// Animate
function animate() {
  requestAnimationFrame(animate);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  renderer.render(scene, camera);

  // Necessary to update dynamic uniforms such as time
  NodeToyMaterial.tick();
}
animate();

// exportToGLB(scene);

// On resize window
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);
// }

// Call the createScene function to initialize the scene
// createScene();
