const express=require("express")
const { getCompany, getCompanyInsights, getCompanyTrends, getCompanyMessages } = require("../controllers/companyControllers")
const router=express.Router()

router.get("/:slug/insights", getCompanyInsights)
router.get("/:slug/trends",getCompanyTrends)
router.get("/:slug/messages", getCompanyMessages)
router.get("/:slug",getCompany)

module.exports=router