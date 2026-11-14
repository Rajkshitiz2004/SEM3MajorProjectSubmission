
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const translationRoutes = require("./routes/translation.routes");
const websiteRoutes = require("./routes/website.routes");
const { translatePublic } = require("./controllers/translation.controller");

const app = express();

// Enable CORS for frontend dev and production origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin Vercel rewrites)
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
  })
);
app.use(express.json({ limit: "32kb" }));

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "RajBhasha AI Backend Running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// Legacy root check (fallback for direct backend calls)
app.get("/", (req, res) => {
  res.json({
    message: "RajBhasha AI Backend Running",
    status: "success"
  });
});

// Direct contract endpoint for Frontend translation service
app.post("/api/v1/translate", translatePublic);

app.use("/api/auth", authRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/websites", websiteRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
