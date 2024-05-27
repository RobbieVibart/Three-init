import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  AssetManager,
  SkeletonJson,
  SkeletonMesh,
  AtlasAttachmentLoader,
  AnimationState,
  AnimationStateData,
} from "@esotericsoftware/spine-threejs";
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

const renderer = new THREE.WebGLRenderer({ alpha: true });
scene.background = new THREE.Color(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

camera.position.z = 100;

// Load Spine Assets
const assetManager = new AssetManager();
assetManager.loadText("Mask.json");
assetManager.loadTextureAtlas("LowSymMask_Anim.atlas");

function onAssetsLoaded() {
  try {
    const atlas = assetManager.get("LowSymMask_Anim.atlas");
    const atlasLoader = new AtlasAttachmentLoader(atlas);

    const skeletonJson = new SkeletonJson(atlasLoader);
    const skeletonData = skeletonJson.readSkeletonData(
      assetManager.get("Mask.json")
    );
    const skeletonMesh = new SkeletonMesh(skeletonData);

    scene.add(skeletonMesh);

    // Set up animation state
    const animationStateData = new AnimationStateData(
      skeletonMesh.skeleton.data
    );
    const animationState = new AnimationState(animationStateData);
    animationState.setAnimation(0, "Action", true); // Replace 'your-animation-name' with the actual animation name

    // Scale the root bone
    const rootBone = skeletonMesh.skeleton.findBone("root"); // Replace 'root' with the actual name of your root bone if different
    if (rootBone) {
      rootBone.scaleX = 0.1; // Scale on the x-axis
      rootBone.scaleY = 0.1; // Scale on the y-axis
      console.log("Root bone scaled:", rootBone);
    } else {
      console.error("Root bone not found");
    }

    // Ensure skeleton transform is updated
    skeletonMesh.skeleton.updateWorldTransform();

    function animate() {
      requestAnimationFrame(animate);
      const delta = 0.016; // Update with a fixed delta time (e.g., 1/60 seconds)
      animationState.update(delta);
      skeletonMesh.update(0); // Update with a fixed delta time (e.g., 1/60 seconds)
      animationState.apply(skeletonMesh.skeleton);
      skeletonMesh.skeleton.updateWorldTransform();

      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    animate();
  } catch (error) {
    console.error("Error during asset loading or animation:", error);
  }
}

// Ensure assets are loaded before starting the animation
assetManager
  .loadAll()
  .then(onAssetsLoaded)
  .catch((error) => {
    console.error("Error loading assets:", error);
  });
x;
