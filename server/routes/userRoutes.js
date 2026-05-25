const express=require('express')
const { loginUser, registerUser, getCurrentUser } = require('../controllers/userControllers')
const protect = require('../middleware/protect')
const router=express.Router()

router.post('/login',loginUser)
router.post('/signUp',registerUser)
router.get('/me', protect, getCurrentUser)

module.exports=router