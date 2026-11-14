
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const translationRoutes = require("./routes/translation.routes");
const websiteRoutes = require("./routes/website.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "RajBhasha AI Backend Running",
    status: "success"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/websites", websiteRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
