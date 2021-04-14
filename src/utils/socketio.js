// ES6 import or TypeScript
import { io } from "socket.io-client";

export const socket = io("https://traveling-fresh-turret.glitch.me/");

// export const setupSocket = () => {
//     socket.on("user connected", function ({ usersOnline, connectedUser }) {

//       });

//     socket.on("user disconnected", function ({ disconnectedUser }) {

//       });
// }
