import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "stats.js";
import dat from "dat.gui";
import {
  AssetManager,
  SkeletonJson,
  SkeletonMesh,
  AtlasAttachmentLoader,
  AnimationState,
  AnimationStateData,
} from "@esotericsoftware/spine-threejs";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: false });
scene.background = new THREE.Color(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const statsDom = stats.dom;
statsDom.style.transform = "scale(2)";
statsDom.style.transformOrigin = "top left";
statsDom.style.left = "0px";
statsDom.style.top = "0px";

// Load GLTF model
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/examples/jsm/libs/draco/");
loader.setDRACOLoader(dracoLoader);

loader.load(
  "/scene.glb",
  function (gltf) {
    scene.add(gltf.scene);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log("An error happened", error);
  }
);

// Load Spine Assets
const assetManager1 = new AssetManager();
assetManager1.loadText("skeleton.json");
assetManager1.loadTextureAtlas("Fire.atlas");

const assetManager2 = new AssetManager();
assetManager2.loadText("skeleton.json");
assetManager2.loadTextureAtlas("Fire.atlas");

const assetManager3 = new AssetManager();
assetManager3.loadText("Glow-skel.json");
assetManager3.loadTextureAtlas("GlowExp.atlas");

function onAssetsLoaded(
  assetManager,
  jsonFile,
  atlasFile,
  x,
  y,
  animationName
) {
  try {
    const atlas = assetManager.get(atlasFile);
    if (!atlas) throw new Error(`Atlas file not found: ${atlasFile}`);

    const atlasLoader = new AtlasAttachmentLoader(atlas);
    const jsonData = assetManager.get(jsonFile);
    if (!jsonData)
      throw new Error(`JSON file not found or invalid: ${jsonFile}`);

    const skeletonJson = new SkeletonJson(atlasLoader);
    const skeletonData = skeletonJson.readSkeletonData(jsonData);
    const skeletonMesh = new SkeletonMesh(skeletonData);

    skeletonMesh.position.set(x, y, 0);
    scene.add(skeletonMesh);

    const animationStateData = new AnimationStateData(
      skeletonMesh.skeleton.data
    );
    const animationState = new AnimationState(animationStateData);
    animationState.setAnimation(0, animationName, true);

    const rootBone = skeletonMesh.skeleton.findBone("root");
    if (rootBone) {
      rootBone.scaleX = 0.004;
      rootBone.scaleY = 0.004;
    } else {
      console.error("Root bone not found");
    }

    skeletonMesh.skeleton.updateWorldTransform();

    // Create a Three.js object to be parented to a bone
    const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    scene.add(box);

    // Find the bone to parent the Three.js object to
    const targetBone = skeletonMesh.skeleton.findBone("root"); // Replace "head" with your target bone's name

    return { skeletonMesh, animationState, box, targetBone };
  } catch (error) {
    console.error("Error during asset loading or animation:", error);
    return null;
  }
}

Promise.all([
  assetManager1.loadAll(),
  assetManager2.loadAll(),
  assetManager3.loadAll(),
])
  .then(() => {
    const skeletons = [];
    const skeleton1 = onAssetsLoaded(
      assetManager1,
      "skeleton.json",
      "Fire.atlas",
      1.8,
      1.5,
      "FireAnim"
    );
    const skeleton2 = onAssetsLoaded(
      assetManager2,
      "skeleton.json",
      "Fire.atlas",
      -1.8,
      1.5,
      "FireAnim"
    );
    const skeleton3 = onAssetsLoaded(
      assetManager3,
      "Glow-skel.json",
      "GlowExp.atlas",
      0,
      1,
      "GlowExp"
    );

    if (skeleton1) skeletons.push(skeleton1);
    if (skeleton2) skeletons.push(skeleton2);
    if (skeleton3) skeletons.push(skeleton3);

    // Create GUI
    const gui = new dat.GUI();
    const animationsFolder = gui.addFolder("Animations");

    skeletons.forEach((skeleton, index) => {
      const folder = animationsFolder.addFolder(`Skeleton ${index + 1}`);
      folder.add(skeleton.animationState, "timeScale", 0, 2).name("Speed");

      const playButton = { play: true };
      folder
        .add(playButton, "play")
        .name("Play/Pause")
        .onChange(() => {
          if (playButton.play) {
            skeleton.animationState.timeScale = 1; // Set time scale to 1 to play
          } else {
            skeleton.animationState.timeScale = 0; // Set time scale to 0 to pause
          }
        });

      folder.open();
    });

    animationsFolder.open();

    function animate() {
      stats.begin();
      requestAnimationFrame(animate);
      const delta = 0.016; // Update with a fixed delta time (e.g., 1/60 seconds)

      skeletons.forEach(({ skeletonMesh, animationState, box, targetBone }) => {
        animationState.update(delta);
        skeletonMesh.update(0);
        animationState.apply(skeletonMesh.skeleton);
        skeletonMesh.skeleton.updateWorldTransform();

        if (targetBone) {
          const boneMatrix = new THREE.Matrix4();
          boneMatrix.makeRotationZ(targetBone.worldRotation * (Math.PI / 180));
          boneMatrix.setPosition(targetBone.worldX, targetBone.worldY, 0);

          box.matrix = boneMatrix;
          box.matrixAutoUpdate = false;
        }
      });

      renderer.render(scene, camera);
      stats.end();
    }

    animate();
  })
  .catch((error) => {
    console.error("Error loading assets:", error);
  });
