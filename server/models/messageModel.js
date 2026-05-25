const mongoose=require("mongoose")

const messageSchema=new mongoose.Schema({
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"company"
    },
    message:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
}, {timestamps:true}
)

const message=mongoose.model("message",messageSchema)

module.exports=message