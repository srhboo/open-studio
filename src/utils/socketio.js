// ES6 import or TypeScript
import { io } from "socket.io-client";

export const socket = io("https://traveling-fresh-turret.glitch.me/");

export const setSocketName = (name) => {
  socket.emit("set name", name);
};

export const setSocketOnUserConnected = (handler) => {
  socket.on("user connected", handler);
  const setSocketOffUserConnected = () => {
    socket.off("user connected", handler);
  };
  return setSocketOffUserConnected;
};

export const setSocketOnUserDisconnected = (handler) => {
  socket.on("user disconnected", handler);
  const setSocketOffUserDisconnected = () => {
    socket.off("user disconnected", handler);
  };
  return setSocketOffUserDisconnected;
};

export const setSocketOnUserDestination = (handler) => {
  socket.on("user destination", handler);
  const setSocketOffUserDestination = () => {
    socket.off("user destination", handler);
  };
  return setSocketOffUserDestination;
};

export const setSocketOnUpdatedName = (handler) => {
  socket.on("updated name", handler);
  const setSocketOffUpdatedName = () => {
    socket.off("updated name", handler);
  };
  return setSocketOffUpdatedName;
};

export const socketEmitJoinedRoom = (arg, handler) => {
  socket.emit("joined room", arg, handler);
};

export const socketSubmitChat = ({ message, roomId }) => {
  socket.emit("submit chat", { message, roomId });
};

export const setSocketOnChat = (handler) => {
  socket.on("chat message", handler);
  const setSocketOffChat = () => {
    socket.off("chat message", handler);
  };
  return setSocketOffChat;
};

export const setSocketOnPlayAudio = (handler) => {
  socket.on("play audio", handler);
  const setSocketOffPlayAudio = () => {
    socket.off("play audio", handler);
  };
  return setSocketOffPlayAudio;
};

export const socketActivateAudio = ({ flowerId, roomId }) => {
  socket.emit("activate audio", { flowerId, roomId });
};
