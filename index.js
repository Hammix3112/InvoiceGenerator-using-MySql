// // backend/index.js
// require("dotenv").config(); // Load environment variables

// const express = require("express");
// const cors = require("cors");
// const path = require("path");

// const { sequelize } = require("./models"); // ✅ Sequelize instance from models/index.js

// const historyRoutes = require("./routes/history");
// const invoicesRoutes = require("./routes/invoices");
// const authRoutes = require("./routes/auth");

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({
//   origin: "http://localhost:5173", // Or your frontend dev URL
//   credentials: true
// }));
//  // Enable CORS
// app.use(express.json()); // Parse JSON

// app.use(express.static(path.resolve(__dirname, "dist"))); // Serve static files

// // Default route
// app.get("/", (req, res) => {
//   res.send("Hello Hammad Ali!");
// });

// // API routes
// app.use("/api/auth", authRoutes);
// app.use("/api/history", historyRoutes);
// app.use("/api/invoices", invoicesRoutes);

// // Handle React routes (SPA support)
// app.use(express.static(path.resolve(__dirname, "dist")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "dist", "index.html"));
// });


// // Sync database and start server
// sequelize.sync().then(() => {
//   console.log("✅ Database synced successfully.");
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
//   });
// }).catch((err) => {
//   console.error("❌ Failed to sync database:", err);
// });






require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const { sequelize } = require("./models");

const historyRoutes = require("./routes/history");
const invoicesRoutes = require("./routes/invoices");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["https://invoice-generator-using-my-sql.vercel.app",
  "http://invoice-generator-using-my-sql.vercel.app" ],// Add this line
  credentials: true
}));
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/invoices", invoicesRoutes);

// Serve frontend static files from dist
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
 });

// Sync DB and start server
sequelize.sync().then(() => {
  console.log("✅ Database synced.");
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ DB sync failed:", err);
});






