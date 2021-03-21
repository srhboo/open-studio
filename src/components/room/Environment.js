import * as THREE from "three";

export const addEnvironment = (scene) => {
  //room shape
  const wallWidth = 10;
  const wallHeight = 8;
  const wallGeo = new THREE.PlaneBufferGeometry(
    wallWidth,
    wallHeight,
    wallWidth,
    wallHeight
  );

  const backWallWidth = 20;
  const backWallHeight = 8;
  const backWallGeo = new THREE.PlaneBufferGeometry(
    backWallWidth,
    backWallHeight,
    backWallWidth,
    backWallHeight
  );

  const floorGeo = new THREE.PlaneBufferGeometry(
    backWallWidth,
    wallWidth,
    backWallWidth,
    wallWidth
  );

  var wallMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
  });
  var floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x32a852,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
  });

  let gap = 0.5;

  let leftWall = new THREE.Mesh(wallGeo, wallMaterial);
  leftWall.rotation.y = -Math.PI / 2;
  leftWall.position.x = backWallWidth / 2 + gap;
  leftWall.position.z = wallWidth / 2 + gap;
  scene.add(leftWall);

  let rightWall = new THREE.Mesh(wallGeo, wallMaterial);
  rightWall.rotation.y = Math.PI / 2;
  rightWall.position.x = -backWallWidth / 2 - gap;
  rightWall.position.z = wallWidth / 2 + gap;
  scene.add(rightWall);

  let backWall = new THREE.Mesh(backWallGeo, wallMaterial);
  scene.add(backWall);

  let floor = new THREE.Mesh(floorGeo, floorMaterial);
  floor.rotation.x = -Math.PI / 2;

  floor.position.y = -wallHeight / 2 - gap;
  floor.position.z = wallWidth / 2 + gap;

  scene.add(floor);

  return {
    floor,
    backWall,
    rightWall,
    leftWall,
    wallGeo,
    floorGeo,
    backWallGeo,
    wallMaterial,
    floorMaterial,
  };
};
