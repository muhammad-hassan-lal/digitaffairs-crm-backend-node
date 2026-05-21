const app = require("../src/app");
const { sequelize } = require("../src/models");

let isConnected = false;

module.exports = async (req, res) => {
  try {
    // Allow health route without DB connection
    if (req.url === "/api/health" || req.url === "/health") {
      return app(req, res);
    }

    if (!isConnected) {
      await sequelize.authenticate();
      console.log("Database connected");
      isConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error("API startup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};