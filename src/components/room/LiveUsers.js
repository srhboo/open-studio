import * as THREE from "three";
import { socket } from "../../utils/socketio";
import { UserFigure } from "./UserFigure";
import { BLOOM_SCENE } from "./Bloom";

const createUserSphere = ({ scene, userFigures, toDispose }) => ({
  position,
  id,
}) => {
  const userSphereGeometry = new THREE.SphereGeometry(1.5, 4, 4);
  const color = new THREE.Color();
  color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

  const userSphereMaterial = new THREE.MeshBasicMaterial({ color: color });

  const userSphere = new THREE.Mesh(userSphereGeometry, userSphereMaterial);
  userSphere.position.x = position.x;
  userSphere.position.y = position.y;
  userSphere.position.z = position.z;
  userSphere.layers.enable(BLOOM_SCENE);

  // userSphere.callback = function () {
  //   setImageViewerIsOpen(true);
  // };
  const figure = new UserFigure(userSphere);
  scene.add(userSphere);

  // class has own clean method
  userFigures[id] = figure;
  toDispose.push(userSphereGeometry);
  toDispose.push(userSphereMaterial);
  return userSphere;
};

export const setupLiveUsers = ({ scene, toDispose, roomId }) => {
  const userFigures = {};

  const createUserSphereWithScene = createUserSphere({
    scene,
    userFigures,
    toDispose,
  });

  socket.on("user connected", function ({ connectedUser }) {
    if (!userFigures[connectedUser.id]) {
      createUserSphereWithScene(connectedUser);
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
    for (let i = 0; i < usersOnline.length; i++) {
      const user = usersOnline[i];
      createUserSphereWithScene(user);
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
      mesh && mesh.updatePosition();
    }
  };

  return {
    cleanupUserFigures,
    updateUserFigures,
  };
};
