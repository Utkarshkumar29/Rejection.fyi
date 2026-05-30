const Message=require('../models/messageModel')
const jwt=require('jsonwebtoken')
const jwtSecret=process.env.jwtSecret || "isha"

const setupSocket=(io)=>{
    io.on("connection",(socket)=>{
        socket.on("joinRoom",(payload)=>{
            const {slug,user}=payload
            socket.join(slug)
        })
        socket.on("sendMessage",async(payload)=>{
            const {message,company,user,slug}=payload
            
            // Build message data - user may be null for anonymous users
            const data = {
                message: message,
                company: company._id
            }
            // Verify JWT token and extract user ID if logged in
            if (user && user._id) {
                try {
                    const decoded = jwt.verify(user._id, jwtSecret)
                    data.user = decoded.id
                } catch (err) {
                    // Invalid token - treat as anonymous
                    console.log("Invalid token, sending as anonymous")
                }
            }
            
            try {
                const newMessage = await Message.create(data)
                // Populate user info for the response
                const populatedMessage = await Message.findById(newMessage._id).populate("user", "username")
                io.to(slug).emit("newMessage", populatedMessage)
            } catch (error) {
                console.log("Message send error:", error)
                socket.emit("error", { message: "Failed to send message" })
            }
        })
        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id)
        })
    })
}

module.exports=setupSocket