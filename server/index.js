const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const mongoose = require("mongoose");
const connectToDB = require("./config/db");
const app = express();
const userRoutes = require('./routes/userRoutes')
const rejectionsRoutes = require('./routes/rejectionRoutes');
const { Server } = require("socket.io");
const setupSocket = require('./config/socket')
const companyRoutes = require("./routes/companyRoutes")
const messageRoutes = require("./routes/messageRoutes")
const cors = require("cors");

require("dotenv").config();
app.use(express.json())

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.CLIENT_URL
  ],
  credentials: true
}))

app.use("/api/user/", userRoutes)
app.use("/api/rejections/", rejectionsRoutes)
app.use("/api/company", companyRoutes)
app.use("/api/messages", messageRoutes)

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  })
});

connectToDB();

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running at port ${process.env.PORT || 5000}`);
});

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      process.env.CLIENT_URL
    ],
    methods: ["GET", "POST"]
  }
})

setupSocket(io)

// Self-ping every 14 minutes to prevent Render cold start
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    try {
      await fetch(`${process.env.RENDER_URL}/health`)
      console.log("Self-ping ok")
    } catch (err) {
      console.log("Self-ping failed:", err.message)
    }
  }, 14 * 60 * 1000)
}