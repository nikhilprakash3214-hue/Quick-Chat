import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Middleware
const app = express();
const server = http.createServer(app)


//initialize  socket.io server
export const io = new Server(server, {
    cors: { origin : "*" },
});

// store online users
export const userSocketMap = {}; // userId: socketId

// Socket.io connection handling
io.on("connection", (socket) => {
const userId = socket.handshake.query.userId;
console.log("User connected", userId);

if (userId) userSocketMap[userId] = socket.id;


// emit online users to all clients
io.emit("getOnlineUsers", Object.keys(userSocketMap));


socket.on ("disconnect", () => {
    console.log("User disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
})
})

//middleware 
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  // Replace this with your actual frontend Vercel URL
  origin: "https://quick-chat-eta-self.vercel.app",
  credentials: true, // Required if you're sending cookies or authorization headers
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Routes setup
app.use("/api/status", (req, res) => res.send("Server is live")); 
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// connect to mongodb
await connectDB();

if (process.env.NODE_ENV !== "production") {
const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log("Server is running on PORT: " 
            + PORT));
        }
        // export server for vervel
export default server;