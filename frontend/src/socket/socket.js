import { io } from "socket.io-client";
import { getToken } from "../storage/AuthStorage";

const SOCKET_URL = "http://192.168.43.111:5000"; // Use your machine's IP address
const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = async (userId) => {
  try {
    const token = await getToken(); // Fetch token asynchronously
    if (!token) {
      console.error("No token available, authentication will fail.");
      return;
    }

    socket.auth = { token }; // Set auth object with the token
    socket.connect();
    socket.emit("join", userId);
  } catch (error) {
    console.error("Error connecting to socket:", error);
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;