const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    gmail:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String
    }
})

const User=mongoose.model('user',UserSchema)

module.exports=User