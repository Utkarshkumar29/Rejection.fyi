const Company = require("../models/companyModel")
const Rejection = require("../models/rejectionModel")
const Message = require("../models/messageModel")
const {GoogleGenerativeAI}=require("@google/generative-ai")

const getCompany=async(req,res)=>{
    try {
        const {slug}=req.params
        const company=await Company.findOne({slug})
        if(!company){
            return res.status(404).send({
                message:"company doesn't exist"
            })
        }
        res.status(200).send({
            company
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Internal Server Error"
        })
    }
}

const getCompanyInsights=async(req,res)=>{
    try {
        const {slug}=req.params
        const existingCompany=await Company.findOne({slug})
        const insights=await Rejection.aggregate([
            {$match:{company:existingCompany._id}},
            { $unwind: "$skills" },
            {$group: { _id: "$skills", count: { $sum: 1 } }},
            {$sort:{count:-1}},
            {$limit:10}
        ])
        res.status(200).send({
            insights
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Internal Server Error"
        })
    }
}

const getCompanyTrends=async(req,res)=>{
    try {
        const {slug}=req.params
        const company=await Company.findOne({slug})
        const withMessage=await Rejection.find({
            company:company._id,
            rejectionMessage: {$exists:true, $ne:""}
        }).limit(10)
        let withoutMessage=[]
        if(withMessage.length<10){
            const limit=10-withMessage.length
            withoutMessage=await Rejection.find({
                company:company._id,
                suspectedReason: {$exists:true, $ne:""}
            }).limit(limit)
        }
        const messages = withMessage.map(r => r.rejectionMessage)
        const suspected = withoutMessage.map(r => r.suspectedReason)
        const query=`Here are rejection messages and suspected reasons from candidates who applied to ${company.name}. Analyze these and return: 1) The most common rejection pattern, 2) What skills or qualities candidates consistently lack, 3) Any difference between what the company says and what candidates suspect. Keep it concise, max 3-4 bullet points.
            ${messages}
            ${suspected}
        `
        const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model=genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const result=await model.generateContent(query)
        const text = result.response.text()
        res.status(200).send({
            text
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message:"Internal Server Error"
        })
    }
}

const getCompanyMessages = async (req, res) => {
    try {
        const { slug } = req.params
        const company = await Company.findOne({ slug })
        if (!company) {
            return res.status(404).send({
                message: "Company doesn't exist"
            })
        }
        const messages = await Message.find({ company: company._id })
            .populate('user', 'username gmail')
            .sort({ createdAt: 1 })
            .limit(100)
        res.status(200).send({
            messages
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

module.exports={getCompany,getCompanyInsights,getCompanyTrends,getCompanyMessages}