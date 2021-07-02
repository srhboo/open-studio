import * as THREE from "three";
import shader from "../../assets/textures/shader-2.png";
import shaderPink from "../../assets/textures/shader-3.png";
import negx from "../../assets/textures/cubemap1/negx.jpg";
import negy from "../../assets/textures/cubemap1/negy.jpg";
import negz from "../../assets/textures/cubemap1/negz.jpg";
import posx from "../../assets/textures/cubemap1/posx.jpg";
import posy from "../../assets/textures/cubemap1/posy.jpg";
import posz from "../../assets/textures/cubemap1/posz.jpg";

export const getLeafEnvMap = ({ track }) => {
  const cubeLoader = new THREE.CubeTextureLoader();

  const textureCube = track(
    cubeLoader.load([posx, negx, posy, negy, posz, negz])
  );
  textureCube.minFilter = textureCube.magFilter = THREE.LinearFilter;
  return textureCube;
};

export const getLeafGradMat = ({ track }) => {
  const textureLoader = new THREE.TextureLoader();
  const shaderTex = track(textureLoader.load(shader));

  const textureCube = getLeafEnvMap({ track });

  const leafGradMaterial = track(
    new THREE.MeshBasicMaterial({
      map: shaderTex,
      envMap: textureCube,
      specular: 0x444444,
      normalScale: new THREE.Vector2(1, 1),
      shininess: 30,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    })
  );

  return leafGradMaterial;
};

export const getLeafGradPinkMat = ({ track }) => {
  const textureLoader = new THREE.TextureLoader();
  const shaderTex = track(textureLoader.load(shaderPink));

  const textureCube = getLeafEnvMap({ track });

  const leafGradMaterial = track(
    new THREE.MeshBasicMaterial({
      map: shaderTex,
      envMap: textureCube,
      specular: 0x444444,
      normalScale: new THREE.Vector2(1, 1),
      shininess: 30,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    })
  );

  return leafGradMaterial;
};
