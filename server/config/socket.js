const Message=require('../models/messageModel')

const setupSocket=(io)=>{
    io.on("connection",(socket)=>{
        socket.on("joinRoom",(payload)=>{
            const {slug,user}=payload
            socket.join(slug)
        })
        socket.on("sendMessage",async(payload)=>{
            const {message,company,user,slug}=payload
            const data={
                message:message,
                company:company._id,
                user: user._id
            }
            try {
                const newMessage = await Message.create(data)
                io.to(slug).emit("newMessage", newMessage)
            } catch (error) {
                socket.emit("error", { message: "Failed to send message" })
            }
        })
        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id)
        })
    })
}

module.exports=setupSocket