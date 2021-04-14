import * as THREE from "three";
import { calculateNewPosition } from "../../utils/vector";

export class UserFigure {
  constructor(mesh) {
    this.mesh = mesh;
    this.destination = this.mesh.position;
  }
  setDestination({ x, y, z }) {
    const destinationVector = new THREE.Vector3(x, y, z);
    this.destination = destinationVector;
  }
  // Method
  updatePosition() {
    const currentPosition = this.mesh.position;
    const { x, y, z } = calculateNewPosition(currentPosition, this.destination);
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
  }
  clean(scene) {
    scene.remove(this.mesh);
    this.mesh = null;
    this.destination = null;
  }
}
