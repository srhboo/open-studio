import * as THREE from "three";

export const addEnvironment = ({
  scene,
  toDispose,
  toRemove,
  raycastHelperObjects,
}) => {
  //room shape
  const wallWidth = 10;
  const wallHeight = 8;
  const wallGeo = new THREE.PlaneBufferGeometry(
    wallWidth,
    wallHeight,
    wallWidth,
    wallHeight
  );
  toDispose.push(wallGeo);

  const backWallWidth = 20;
  const backWallHeight = 8;
  const backWallGeo = new THREE.PlaneBufferGeometry(
    backWallWidth,
    backWallHeight,
    backWallWidth,
    backWallHeight
  );
  toDispose.push(backWallGeo);

  const floorGeo = new THREE.PlaneBufferGeometry(
    backWallWidth,
    wallWidth,
    backWallWidth,
    wallWidth
  );
  toDispose.push(backWallGeo);

  const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
  });
  toDispose.push(wallMaterial);

  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x32a852,
    opacity: 0.9,
    side: THREE.DoubleSide,
    wireframe: true,
    transparent: true,
  });
  toDispose.push(floorMaterial);

  let gap = 0.5;

  let leftWall = new THREE.Mesh(wallGeo, wallMaterial);
  leftWall.rotation.y = -Math.PI / 2;
  leftWall.position.x = backWallWidth / 2 + gap;
  leftWall.position.z = wallWidth / 2 + gap;
  scene.add(leftWall);
  toRemove.push(leftWall);

  let rightWall = new THREE.Mesh(wallGeo, wallMaterial);
  rightWall.rotation.y = Math.PI / 2;
  rightWall.position.x = -backWallWidth / 2 - gap;
  rightWall.position.z = wallWidth / 2 + gap;
  scene.add(rightWall);
  toRemove.push(rightWall);

  let backWall = new THREE.Mesh(backWallGeo, wallMaterial);
  scene.add(backWall);
  toRemove.push(backWall);

  let floor = new THREE.Mesh(floorGeo, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  toRemove.push(floor);

  floor.position.y = -wallHeight / 2 - gap;
  floor.position.z = wallWidth / 2 + gap;

  scene.add(floor);

  raycastHelperObjects.push(floor, leftWall, backWall, rightWall);

  return {
    floor,
  };
};
