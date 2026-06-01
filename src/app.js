const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const logRequest = require("./middlewares/logRequest");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/uploads", express.static("public/uploads"));

app.use(logRequest);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/public/faqs", require("./routes/publicFaqRoutes"));
app.use("/api/public/blogs", require("./routes/publicBlogRoutes"));
app.use("/api/public", require("./routes/publicRoutes"));

app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/blog-categories", require("./routes/blogCategoryRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));

app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/access", require("./routes/permissionRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));


app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = app;