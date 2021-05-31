import * as THREE from "three";
import { socket } from "../../utils/socketio";
import { UserFigure } from "../room/UserFigure";
import { ParametricGeometries } from "../../utils/three-jsm/geometries/ParametricGeometries";
import { CSS2DObject } from "../../utils/three-jsm/renderers/CSS2DRenderer";
import {
  setSocketOnUserConnected,
  setSocketOnUserDisconnected,
  setSocketOnUserDestination,
  socketEmitJoinedRoom,
  setSocketOnUpdatedName,
} from "../../utils/socketio";
// TODO: this copy is redundant with code in /rooms
// refactor after figuring out how they connect

// https://codepen.io/smtrd/pen/MZVWpN

const createUserObject =
  ({ scene, userFigures, track, type = "sphere" }) =>
  ({ position, id, name }) => {
    let userGeometry;
    const userGroup = new THREE.Group();
    scene.add(userGroup);
    switch (type) {
      case "klein":
        userGeometry = track(
          new THREE.ParametricGeometry(ParametricGeometries.klein, 25, 25)
        );
        break;
      case "sphere":
        userGeometry = track(new THREE.SphereGeometry(50, 4, 4));
        break;
      default:
        userGeometry = track(new THREE.BoxGeometry(1, 1, 1));
        break;
    }
    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

    const userMaterial = track(
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );

    const userObject = track(new THREE.Mesh(userGeometry, userMaterial));
    userObject.position.x = position.x;
    userObject.position.y = position.y;
    userObject.position.z = position.z;
    userGroup.add(userObject);
    // userSphere.callback = function () {
    //   setImageViewerIsOpen(true);
    // };
    const figure = new UserFigure(id, userGroup);

    const text = document.createElement("div");
    text.className = "text-label";
    text.style.color = "white";
    text.style.backgroundColor = "black";
    text.textContent = name;

    const label = track(new CSS2DObject(text));
    label.position.copy(userObject.position);
    label.position.y += 200;
    userGroup.add(label);
    // class has own clean method
    userFigures[id] = figure;

    return userObject;
  };

export const setupLiveUsers = ({ scene, track, roomId, currentUser }) => {
  const userFigures = {};

  const createUserObjectWithScene = createUserObject({
    scene,
    userFigures,
    track,
    currentUser,
  });

  setSocketOnUserConnected(function ({ connectedUser }) {
    if (!userFigures[connectedUser.id]) {
      createUserObjectWithScene(connectedUser);
    }
  });

  setSocketOnUserDisconnected(({ disconnectedUser }) => {
    const figure = userFigures[disconnectedUser.id];
    if (figure) {
      figure.clean(scene);
      delete userFigures[disconnectedUser.id];
    }
  });

  setSocketOnUserDestination(({ id, position }) => {
    const figure = userFigures[id];
    figure.setDestination(position);
  });

  setSocketOnUpdatedName(({ updatedUser }) => {
    const figure = userFigures[updatedUser.id];
    if (figure) {
      userFigures[updatedUser.id].updateLabel(updatedUser.name);
    }
  });

  socketEmitJoinedRoom({ roomId }, ({ usersOnline }) => {
    for (let i = 0; i < usersOnline.length; i++) {
      const user = usersOnline[i];
      createUserObjectWithScene(user);
    }
  });

  const cleanupUserFigures = () => {
    for (const [id, figure] of Object.entries(userFigures)) {
      figure.clean(scene);
      delete userFigures[id];
    }
    socket.emit("left room", { roomId });
    socket.removeAllListeners();
  };

  const updateUserFigures = () => {
    for (const mesh of Object.values(userFigures)) {
      mesh && mesh.updatePosition(5);
    }
  };

  return {
    cleanupUserFigures,
    updateUserFigures,
  };
};
