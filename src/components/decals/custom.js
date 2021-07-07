import * as THREE from "three";

export const getCustomMat = ({ track, customUrl }) => {
  const textureLoader = new THREE.TextureLoader();
  const imageTex = track(textureLoader.load(customUrl));

  const customMaterial = track(
    new THREE.MeshBasicMaterial({
      map: imageTex,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    })
  );

  return customMaterial;
};
