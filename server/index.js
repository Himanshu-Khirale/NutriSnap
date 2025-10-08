require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const mealsRouter = require("./routes/meals");
const statsRouter = require("./routes/stats");
const usersRouter = require("./routes/users");
const gamificationRouter = require("./routes/gamification");
const authRouter = require("./routes/auth");
const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nutrisnap";

async function start() {
  await mongoose.connect(MONGO_URI, { dbName: "nutrisnap" });

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  app.use(cors());
  app.use(bodyParser.json({ limit: "15mb" }));

  // Static files for uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/meals", mealsRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/gamification", gamificationRouter);

  // WebSocket for real-time updates
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    socket.on("join-user", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Make io available to routes
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});


