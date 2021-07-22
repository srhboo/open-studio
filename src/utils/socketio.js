// ES6 import or TypeScript
import { io } from "socket.io-client";

export const socket = io("https://traveling-fresh-turret.glitch.me/");

export const setSocketName = (name) => {
  socket.emit("set name", name);
};

export const setSocketOnUserConnected = (handler) => {
  socket.on("user connected", handler);
};

export const setSocketOnUserDisconnected = (handler) => {
  socket.on("user disconnected", handler);
};

export const setSocketOnUserDestination = (handler) => {
  socket.on("user destination", handler);
};

export const setSocketOnUpdatedName = (handler) => {
  socket.on("updated name", handler);
};

export const socketEmitJoinedRoom = (arg, handler) => {
  socket.emit("joined room", arg, handler);
};

export const socketSubmitChat = ({ message, roomId }) => {
  socket.emit("submit chat", { message, roomId });
};

export const setSocketOnChat = (handler) => {
  socket.on("chat message", handler);
};

export const setSocketOnPlayAudio = (handler) => {
  socket.on("play audio", handler);
};

export const socketActivateAudio = ({ flowerId, roomId }) => {
  socket.emit("activate audio", { flowerId, roomId });
};
