const express=require("express")
const Message=require("../models/messageModel")
const Company=require("../models/companyModel")
const router=express.Router()

// Get messages for a company
router.get("/:companyId", async (req, res) => {
    try {
        const { companyId } = req.params
        const messages = await Message.find({ company: companyId })
            .populate("user", "username")
            .sort({ createdAt: 1 })
            .limit(100)
        res.status(200).send({ messages })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal Server Error" })
    }
})

module.exports=router