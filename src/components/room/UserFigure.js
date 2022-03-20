import * as THREE from "three";
import { calculateNewPosition } from "../../utils/vector";
import { CSS2DObject } from "../../utils/three-jsm/renderers/CSS2DRenderer";

export class UserFigure {
  constructor(id, mesh, player) {
    this.id = id;
    this.mesh = mesh;
    this.destination = this.mesh.position;
    this.moving = false;
    this.player = player;
  }
  setDestination({ x, y, z }) {
    const destinationVector = new THREE.Vector3(x, y, z);
    this.destination = destinationVector;
    this.moving = true;
    this.player.play();
  }
  // Method
  updatePosition(speed = 0.05) {
    if (this.moving === true) {
      const currentPosition = this.mesh.position;
      const { x, y, z, resting } = calculateNewPosition(
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
      if (resting) {
        this.moving = false;
        this.player.pause();
      }
    }
    return { moving: this.moving };
  }
  updateLabel(label) {
    this.mesh.children.forEach((child) => {
      if (child instanceof CSS2DObject) {
        child.element.innerText = label;
      }
    });
  }
  updateMesh(mesh) {
    this.mesh.children.forEach((child) => {
      if (child instanceof THREE.Object3D) {
        this.mesh.remove(child);
        this.mesh.add(mesh);
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
    this.mesh.children.forEach((child) => {
      if (child instanceof THREE.Object3D) {
        scene.remove(child);
      }
    });
    scene.remove(this.mesh);
    this.mesh = null;
    this.destination = null;
  }
}
