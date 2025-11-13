const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// Load .env from current folder, and also attempt to load from project root if present
const dotenv = require("dotenv");
const path = require("path");

// Load .env in backend folder first
dotenv.config();

// If essential env vars like DEEPGRAM_API_KEY are not set, try loading root .env
if (!process.env.DEEPGRAM_API_KEY) {
  const rootEnvPath = path.resolve(__dirname, "..", ".env");
  dotenv.config({ path: rootEnvPath });
}

const authRoutes = require("./routes/auth");
const lectureRoutes = require("./routes/lectures");
const quizRoutes = require("./routes/quizzes");
const fileRoutes = require("./routes/files");
const healthRoutes = require("./health");
const { authenticateToken } = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/files", express.static(process.env.PDF_PATH || "./pdfs"));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Lectra AI Backend API",
    status: "running",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      lectures: "/api/lectures",
      quizzes: "/api/quizzes",
      files: "/api/files"
    }
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/lectures", authenticateToken, lectureRoutes);
app.use("/api/quizzes", authenticateToken, quizRoutes);
app.use("/api/files", authenticateToken, fileRoutes);
app.use("/", healthRoutes);

// Socket.IO connection handling
require("./socket/socketHandler")(io);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lectra", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler (must be last)
app.use("*", (req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
