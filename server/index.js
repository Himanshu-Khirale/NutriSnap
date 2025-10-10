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
const MONGO_URI = "mongodb+srv://shouryakharade7_db_user:TmRnUMfN70BSxeYY@aditya.59yvzvw.mongodb.net/?retryWrites=true&w=majority&appName=Aditya"|| "mongodb://127.0.0.1:27017/nutrisnap";

async function start() {
  // MongoDB connection logs
  mongoose.connection.on("connected", () => {
    const { host, name } = mongoose.connection;
    console.log(`MongoDB connected: host=${host} db=${name}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  console.log(`Connecting to MongoDB... uri=${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { dbName: "nutrisnap" });
  console.log("MongoDB connect() promise resolved");

  const app = express();
  const server = http.createServer(app);
  const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
    })
  );
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


