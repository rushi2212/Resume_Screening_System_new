const express = require("express");
const cors = require("cors");
const path = require("path");

const resumeRoutes =
  require("./routes/resumeRoutes");

  const candidateRoutes =
  require("./routes/candidateRoutes");

const jobRoutes =
  require("./routes/jobRoutes");

const matchRoutes =
  require("./routes/matchRoutes");

const jdRoutes =
  require("./routes/jdRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const frontendBuildPath = path.join(__dirname, "../public");

app.use("/api/resume", resumeRoutes);
app.use(
  "/api/candidates",
  candidateRoutes
);
app.use("/api/jobs", jobRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/jd", jdRoutes);

app.use(express.static(frontendBuildPath));

app.get("/api/health", (req, res) => {
  res.json({
    message: "Resume Screening API Running",
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

module.exports = app;
