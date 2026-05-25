const express=require('express')
const { addRejection, getRejections, getCompanyRejections, getUserRejections } = require('../controllers/rejectionControllers')
const protect=require("../middleware/protect")
const optionalAuth = require('../middleware/optionalAuth')
const { streamRejections } = require('../controllers/sseControllers')
const router=express.Router()

router.post('/',optionalAuth, addRejection)
router.get('/stream', streamRejections)
router.get('/mine', protect, getUserRejections)
router.get('/',getRejections)
router.get('/:slug',getCompanyRejections)

module.exports=router