import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

const app = express();
// Enable CORS for your frontend origin
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // should be a string, not array
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // Map <email,socketId>

io.on("connection", (socket) => {
  console.log("user connected ", socket.id);

  // socket.on("sendMessage", (message) => {
  //   console.log("Message received from client:", message);
  //   socket.broadcast.emit("recieveMessage", message);
  // });

  // socket.on("disconnect", () => {
  //   console.log("user is disconnected ", socket.id);
  // });

  socket.on("register", (email) => {
    users.set(email, socket.id);
    console.log(`User registered: ${email} with socket ${socket.id}`);
  });

  socket.on("sendMessageToUser", ({ toEmail, fromEmail, message }) => {
    const recipientSocketId = users.get(toEmail);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("recieveMessage", {
        fromEmail,
        message,
      });
      console.log(`Sent message from ${fromEmail} to ${toEmail}: ${message}`);
    } else {
      console.log("Recipient not connected ", toEmail);
    }
  });

  socket.on("disconnect", () => {
    // remove disconnected socket from users map
    for (const [email, id] of users.entries()) {
      if (id === socket.id) {
        users.delete(email);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("server is listening on port", 5000); // fixed port in log
});
