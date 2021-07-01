import * as THREE from "three";
import { DecalGeometry } from "../../utils/three-jsm/geometries/DecalGeometry";
import wallImg from "../../assets/wall-fix.png";

export const pasteGroundDecal = ({ track, scene, intersects, helper }) => {
  const position = new THREE.Vector3();
  const orientation = new THREE.Euler();
  const size = new THREE.Vector3(10, 10, 10);
  const textureLoader = new THREE.TextureLoader();
  const wallDiffuse = track(textureLoader.load(wallImg));
  const material2 = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    map: wallDiffuse,
  });
  position.copy(intersects.point);

  orientation.copy(helper.rotation);

  // if ( params.rotate ) orientation.z = Math.random() * 2 * Math.PI;

  // const scale = params.minScale + Math.random() * ( params.maxScale - params.minScale );
  size.set(200, 200, 200);

  //   const material = decalMaterial.clone();
  //   material.color.setHex(Math.random() * 0xffffff);

  const m = track(
    new THREE.Mesh(
      new DecalGeometry(intersects.object, position, orientation, size),
      material2
    )
  );
  scene.add(m);
};
