const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const connectToDB = require("./config/db");
const app = express();
const userRoutes=require('./routes/userRoutes')
const rejectionsRoutes=require('./routes/rejectionRoutes');
const { Server } = require("socket.io");
const setupSocket = require('./config/socket')
const companyRoutes=require("./routes/companyRoutes")
const cors = require("cors");

require("dotenv").config();
app.use(express.json())

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use("/api/user/",userRoutes)
app.use("/api/rejections/",rejectionsRoutes)
app.use("/api/company",companyRoutes)

app.get("/health", (req, res) => {
  res.send("Server running");
});

connectToDB();

const server=app.listen(5000, () => {
  console.log("Server running at port 5000");
});

const io=new Server(server,{
  cors:{
    origin:process.env.CLIENT_URL,
    methods:["GET","POST"]
  }
})

setupSocket(io)