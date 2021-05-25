import * as THREE from "three";
import { calculateNewPosition } from "../../utils/vector";

export class TextLabel {
  constructor(text, parent, containerEl) {
    this.parent = parent;
    this.text = text;
    this.container = containerEl;
    this.createLabelEl();
  }
  createLabelEl() {
    let div = this.containerEl.current.createElement("div");
    div.className = "text-label";
    div.style.position = "absolute";
    div.style.width = 100;
    div.style.height = 100;
    div.innerHTML = "hi there!";
    div.style.top = 500;
    div.style.left = 500;
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
  clean(scene) {
    scene.remove(this.mesh);
    this.mesh = null;
    this.destination = null;
  }
}

// var div = containerEl.current.createElement("div");
// div.className = "text-label";
// div.style.position = "absolute";
// div.style.width = 100;
// div.style.height = 100;
// div.innerHTML = "hi there!";
// div.style.top = -1000;
// div.style.left = -1000;

// var _this = this;

// return {
//   element: div,
//   parent: false,
//   position: new THREE.Vector3(0, 0, 0),
//   setHTML: function (html) {
//     this.element.innerHTML = html;
//   },
//   setParent: function (threejsobj) {
//     this.parent = threejsobj;
//   },
//   updatePosition: function () {
//     if (parent) {
//       this.position.copy(this.parent.position);
//     }

//     var coords2d = this.get2DCoords(this.position, _this.camera);
//     this.element.style.left = coords2d.x + "px";
//     this.element.style.top = coords2d.y + "px";
//   },
//   get2DCoords: function (position, camera) {
//     var vector = position.project(camera);
//     vector.x = ((vector.x + 1) / 2) * window.innerWidth;
//     vector.y = (-(vector.y - 1) / 2) * window.innerHeight;
//     return vector;
//   },
// };
