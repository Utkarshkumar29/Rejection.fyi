const clients=require("../config/sseClients")

const streamRejections=(req,res)=>{
    try {
        res.setHeader("Content-Type","text/event-stream")
        res.setHeader("Cache-Control","no-cache")
        res.setHeader("Connection","keep-alive")
        clients.push(res)
        req.on("close",()=>{
            const index=clients.indexOf(res)
            clients.splice(index,1)
        })
    } catch (error) {
        
    }
}

module.exports={streamRejections}