const express=require("express")
const { getCompany, getCompanyInsights, getCompanyTrends } = require("../controllers/companyControllers")
const router=express.Router()

router.get("/:slug/insights", getCompanyInsights)
router.get("/:slug/trends",getCompanyTrends)
router.get("/:slug",getCompany)

module.exports=router