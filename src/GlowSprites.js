import * as THREE from "three";

export function createAnimatedSprite(
  numberOfFrames,
  rows,
  cols,
  frameDuration
) {
  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load("GlowSprites.png", () => {
    // Calculate the aspect ratio once the texture is loaded
    const aspectRatio = map.image.width / cols / (map.image.height / rows);
    sprite.scale.set(10 * aspectRatio, 10, 1);
  });

  // Calculate width and height of each frame
  const frameWidth = 1 / cols;
  const frameHeight = 1 / rows;

  // Create sprite material with initial texture offset and repeat
  map.repeat.set(frameWidth, frameHeight);
  const spriteMaterial = new THREE.SpriteMaterial({ map: map });

  // Create the sprite with initial material and scale
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(5, 5, 1); // Initial scale, will be adjusted once texture is loaded
  sprite.position.set(0, 0, 10);

  let frameIndex = 0; // Current frame index
  let lastFrameChangeTime = 0;

  // Function to update the sprite's animation
  sprite.updateAnimation = function (currentTime) {
    if (currentTime - lastFrameChangeTime > frameDuration) {
      frameIndex = (frameIndex + 1) % numberOfFrames;

      // Calculate the column (xOffset) and row (yOffset) for the current frame
      const column = frameIndex % cols;
      const row = Math.floor(frameIndex / cols);

      const xOffset = column * frameWidth;
      const yOffset = 1 - (row + 1) * frameHeight; // yOffset is calculated from the bottom of the texture

      // Update texture offset to display current frame
      map.offset.set(xOffset, yOffset);

      lastFrameChangeTime = currentTime;
    }
  };

  return sprite;
}
