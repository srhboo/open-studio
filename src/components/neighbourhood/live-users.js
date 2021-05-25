import * as THREE from "three";
import { socket } from "../../utils/socketio";
import { UserFigure } from "../room/UserFigure";
import { ParametricGeometries } from "../../utils/three-jsm/geometries/ParametricGeometries";
import { TextLabel } from "./TextLabel";

// TODO: this copy is redundant with code in /rooms
// refactor after figuring out how they connect

// https://codepen.io/smtrd/pen/MZVWpN

const createUserObject =
  ({ scene, userFigures, track, type = "sphere", containerEl, camera }) =>
  ({ position, id, name }) => {
    let userGeometry;
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

    // userSphere.callback = function () {
    //   setImageViewerIsOpen(true);
    // };
    const figure = new UserFigure(id, userObject);
    scene.add(userObject);

    // var label = createUserLabel({ camera, containerEl });
    const label = new TextLabel(name, userObject, containerEl);
    console.log(name);
    // addLabel(label);
    // text.setHTML("Label ");
    // text.setParent(userObject);
    // containerEl.current.appendChild(text.element);

    // userObject.textLabel = text;

    // class has own clean method
    userFigures[id] = figure;

    return userObject;
  };

export const setupLiveUsers = ({
  scene,
  track,
  roomId,
  containerEl,
  camera,
}) => {
  const userFigures = {};

  const createUserObjectWithScene = createUserObject({
    scene,
    userFigures,
    track,
    containerEl,
    camera,
  });

  socket.on("user connected", function ({ connectedUser }) {
    console.log(connectedUser);
    if (!userFigures[connectedUser.id]) {
      createUserObjectWithScene(connectedUser);
    }
  });

  socket.on("user disconnected", function ({ disconnectedUser }) {
    const figure = userFigures[disconnectedUser.id];
    if (figure) {
      figure.clean(scene);
      delete userFigures[disconnectedUser.id];
    }
  });

  socket.on("user destination", ({ id, position }) => {
    const figure = userFigures[id];
    figure.setDestination(position);
  });

  socket.emit("joined room", { roomId }, ({ usersOnline }) => {
    console.log(usersOnline);
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
