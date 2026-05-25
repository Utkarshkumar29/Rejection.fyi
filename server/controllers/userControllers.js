const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt=require('jsonwebtoken')
const jwtSecret="isha"

const registerUser = async (req, res) => {
    try {
        const { gmail, password, username } = req.body

        if (!gmail || !password || !username) {
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const existingUser = await User.findOne({ gmail })

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            gmail,
            password: hashedPassword,
            username
        })

        const token = jwt.sign({id: newUser._id,gmail: newUser.gmail,},jwtSecret,{expiresIn: '7d'})

        const { password: _, ...safeUser } = newUser.toObject()

        return res.status(201).json({
            message: "User created successfully",
            user: safeUser,
            token:token
        })

    } catch (error) {
        console.log(error)

        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const loginUser=async(req,res)=>{
    try {
        const { gmail, password }=req.body

        if(!gmail || !password){
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const existingUser= await User.findOne({gmail})

        if(!existingUser){
            return res.status(404).json({
                message:"User doesn't exist"
            })
        }

        const comparePassword=await bcrypt.compare(password, existingUser.password)
        if(!comparePassword){
            return res.status(409).send({message:"Invalid credentials"})
        }

        const { password: _, ...safeUser } = existingUser.toObject()
        const token = jwt.sign({id: existingUser._id,gmail: existingUser.gmail,},jwtSecret,{expiresIn: '7d'})

        return res.status(200).send({
            message:"login successfull",
            user:safeUser,
            token
        })

    } catch (error) {
        console.log(error)

        return res.status(500).send({
            message:"Inernal Server Error"
        })
    }
}

const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({
                message: "Not authenticated"
            })
        }

        const user = await User.findById(req.user.id)

        if (!user) {
            return res.status(404).send({
                message: "User not found"
            })
        }

        const { password: _, ...safeUser } = user.toObject()

        return res.status(200).send({
            user: safeUser
        })

    } catch (error) {
        console.log(error)

        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

module.exports = { registerUser, loginUser, getCurrentUser }