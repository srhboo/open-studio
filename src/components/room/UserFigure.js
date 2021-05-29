import * as THREE from "three";
import { calculateNewPosition } from "../../utils/vector";
import { CSS2DObject } from "../../utils/three-jsm/renderers/CSS2DRenderer";

export class UserFigure {
  constructor(id, mesh) {
    this.id = id;
    this.mesh = mesh;
    this.destination = this.mesh.position;
  }
  setDestination({ x, y, z }) {
    const destinationVector = new THREE.Vector3(x, y, z);
    this.destination = destinationVector;
  }
  // Method
  updatePosition(speed = 0.05) {
    const currentPosition = this.mesh.position;
    const { x, y, z } = calculateNewPosition(
      currentPosition,
      this.destination,
      speed
    );
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;

    if (this.mesh.textLabel) {
      this.mesh.textLabel.updatePosition();
    }
  }
  updateLabel(label) {
    this.mesh.children.forEach((child) => {
      if (child instanceof CSS2DObject) {
        child.element.innerText = label;
      }
    });
  }
  removeLabel() {
    this.mesh.children.forEach((child) => {
      if (child instanceof CSS2DObject) {
        child.element.remove();
      }
    });
  }
  clean(scene) {
    this.removeLabel();
    scene.remove(this.mesh);
    this.mesh = null;
    this.destination = null;
  }
}
