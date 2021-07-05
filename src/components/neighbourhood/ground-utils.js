import * as THREE from "three";

import { ImprovedNoise } from "../../utils/three-jsm/math/ImprovedNoise.js";

// 4x4 so size is 16
const sampleData = [
  2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
  2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2,
  2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

export const generateHeight = (width, height) => {
  const size = width * height,
    perlin = new ImprovedNoise(),
    z = Math.random() * 100;

  //  const data = new Uint8Array(size);
  const data = [];

  let quality = 1;

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      data[i] = 0;
    }
  }

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width);
      data[i] += Math.round(
        Math.abs(perlin.noise(x / quality, y / quality, z) * quality * 1.75)
      );
    }

    quality *= 5;
  }

  // return sampleData;
  return data;
};

export const generateTexture = (data, width, height) => {
  // bake lighting into texture

  let context, image, imageData, shade;

  const vector3 = new THREE.Vector3(0, 0, 0);

  const sun = new THREE.Vector3(1, 1, 1);
  sun.normalize();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext("2d");
  context.fillStyle = "#000";
  context.fillRect(0, 0, width, height);

  image = context.getImageData(0, 0, canvas.width, canvas.height);
  imageData = image.data;

  for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
    // distance of 4 consecutive vertices away on grid
    vector3.x = data[j - 2] - data[j + 2];
    vector3.y = 2;
    vector3.z = data[j - width * 2] - data[j + width * 2];
    vector3.normalize();

    shade = vector3.dot(sun);

    imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
    imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
    imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
  }

  context.putImageData(image, 0, 0);

  // Scaled 4x

  const canvasScaled = document.createElement("canvas");
  canvasScaled.width = width * 4;
  canvasScaled.height = height * 4;

  context = canvasScaled.getContext("2d");
  context.scale(4, 4);
  context.drawImage(canvas, 0, 0);

  image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
  imageData = image.data;

  // this adds some light noise
  for (let i = 0, l = imageData.length; i < l; i += 4) {
    const v = ~~(Math.random() * 10);

    imageData[i] += v;
    imageData[i + 1] += v;
    imageData[i + 2] += v;
  }
  context.putImageData(image, 0, 0);

  return canvasScaled;
};

// assume square
export const intersectPointToDataIndex = ({ worldSize, planeSize, point }) => {
  const { x, z } = point;
  let calcX = Math.round(((x + 0.5 * planeSize) / planeSize) * (worldSize - 1));
  let calcZ = Math.round(((z + 0.5 * planeSize) / planeSize) * (worldSize - 1));
  const base = calcZ * worldSize;
  const index = base + calcX;
  return index;
};

export const affectPlaneAtPoint = ({ point, mesh, textureData }) => {
  const index = intersectPointToDataIndex({
    worldSize: mesh.geometry.parameters.widthSegments + 1,
    planeSize: mesh.geometry.parameters.width,
    point,
  });
  const vertices = mesh.geometry.attributes.position.array;
  vertices[index * 3 + 1] += 100;
  vertices[(index - 1) * 3 + 1] += 50;
  vertices[(index + 1) * 3 + 1] += 50;
  vertices[(index - 2) * 3 + 1] += 25;
  vertices[(index + 2) * 3 + 1] += 25;
  mesh.geometry.attributes.position.needsUpdate = true;
  // updateShading({
  //   textureData,
  //   data: mesh.geometry.attributes.position.array,
  //   index,
  //   width: mesh.geometry.parameters.widthSegments + 1,
  // });
  // mesh.material.map.needsUpdate = true;
};

// const updateShading = ({ textureData, data, index, width }) => {
//   console.log(data.length);
//   let shade, context, image, imageData;
//   const vector3 = new THREE.Vector3(0, 0, 0);

//   const sun = new THREE.Vector3(1, 1, 1);
//   sun.normalize();
//   // distance of 4 consecutive vertices away on grid
//   vector3.x = data[index * 64 - 2] - data[index * 64 + 2];
//   vector3.y = 2;
//   vector3.z = data[index * 64 - width * 2] - data[index * 64 + width * 2];
//   vector3.normalize();

//   shade = vector3.dot(sun);

//   context = textureData.getContext("2d");

//   image = context.getImageData(0, 0, textureData.width, textureData.height);
//   imageData = image.data;

//   imageData[index * 64] = (96 + shade * 128) * (0.5 + data[index * 64] * 0.007);
//   imageData[index * 64 + 1] =
//     (32 + shade * 96) * (0.5 + data[index * 64] * 0.007);
//   imageData[index * 64 + 2] = shade * 96 * (0.5 + data[index * 64] * 0.007);

//   context.drawImage(textureData, 0, 0);
//   context.putImageData(image, 0, 0);
// };

export const createGround = ({
  track,
  worldWidth,
  worldDepth,
  data,
  scene,
}) => {
  const geometry = track(
    new THREE.PlaneGeometry(7500, 7500, worldWidth - 1, worldDepth - 1)
  );
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position.array;

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    // only update y coordinate
    vertices[j + 1] = data[i] * 10;
  }

  geometry.computeFaceNormals(); // needed for helper

  // for the generated sun shade texture

  // textureData = generateTexture(data, worldWidth, worldDepth);
  // texture = track(new THREE.CanvasTexture(textureData));
  // texture.wrapS = THREE.ClampToEdgeWrapping;
  // texture.wrapT = THREE.ClampToEdgeWrapping;
  // const textureMaterial = track(
  //   new THREE.MeshBasicMaterial({ map: texture })
  // );

  const wallMaterial = track(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.2,
      side: THREE.DoubleSide,
      wireframe: true,
      transparent: true,
    })
  );

  const updatedGroundMesh = track(new THREE.Mesh(geometry, wallMaterial));
  updatedGroundMesh.booObjectId = "ground";
  scene.add(updatedGroundMesh);
  return { updatedGroundMesh };
};
