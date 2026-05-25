const mongoose=require('mongoose')

const companySchema=new mongoose.Schema({
    totalYoe:{
        type:Number,
        default: 0,
    },
    totalRejections:{
        type:Number,
        default: 0,
    },
    name:{
        type:String,
        required:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
     byStage: {
      resume: {
        type: Number,
        default: 0,
      },

      oa: {
        type: Number,
        default: 0,
      },

      technical: {
        type: Number,
        default: 0,
      },

      hr: {
        type: Number,
        default: 0,
      },

      final: {
        type: Number,
        default: 0,
      },
    },
    avgYoe:{
        type:Number,
        default:0
    }
},{timestamps:true}
)

const Company=mongoose.model('company',companySchema)

module.exports=Company