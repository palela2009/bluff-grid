import { io } from "socket.io-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const socket = io(API_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
});

socket.on("connect", () => {
    console.log("Connected to server");
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    if (reason === "io server disconnect") {
        socket.connect();
    }
});