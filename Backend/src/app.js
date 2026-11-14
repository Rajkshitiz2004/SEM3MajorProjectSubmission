
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const translationRoutes = require("./routes/translation.routes");
const websiteRoutes = require("./routes/website.routes");
const { translatePublic } = require("./controllers/translation.controller");

const app = express();

// Enable CORS for frontend dev origins
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
  })
);
app.use(express.json({ limit: "32kb" }));

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
