const jwt=require('jsonwebtoken')

const optionalAuth=async(req,res,next)=>{
    try {
        const token = req.headers.authorization?.split(" ")[1]
        if(token){
            const decode=jwt.verify(token,process.env.jwtSecret)
            req.user=decode
        }
        next()
    } catch (error) {
        next()
    }
}

module.exports=optionalAuth