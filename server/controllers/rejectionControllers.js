const Rejection = require("../models/rejectionModel")
const Company = require("../models/companyModel")
const redisClient = require("../config/redis")
const clients = require("../config/sseClients")

const addRejection = async (req, res) => {
    try {

        const {
            companyName,
            anonymousId,
            stage,
            role,
            yoe,
            suspectedReason,
            rejectionMessage,
            skills,
            location
        } = req.body

        const user = req.user || null

        let existingCompany = await Company.findOne({
            name: companyName
        })

        if (!existingCompany) {

            existingCompany = await Company.create({
                name: companyName,
                slug: `company-${companyName
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")}`
            })
        }

        const newRejection = await Rejection.create({
            company: existingCompany._id,
            companyName,
            user: user ? user.id : null,
            anonymousId,
            stage,
            role,
            yoe,
            suspectedReason,
            rejectionMessage,
            skills,
            location
        })

        const updatedCompany = await Company.findByIdAndUpdate(
            existingCompany._id,
            {
                $inc: {
                    [`byStage.${stage}`]: 1,
                    totalRejections: 1,
                    totalYoe: yoe
                }
            },
            {
                new: true
            }
        )

        updatedCompany.avgYoe =
            updatedCompany.totalYoe /
            updatedCompany.totalRejections

        await updatedCompany.save()

        // Clear cache asynchronously without blocking
        redisClient.keys("rejections?*").then(keys => {
            if(keys.length > 0) {
                redisClient.del(...keys).catch(err => {
                    console.warn('Cache clear failed:', err.message)
                })
            }
        }).catch(err => {
            console.warn('Cache keys query failed:', err.message)
        })

        clients.forEach((client)=>{
            client.write(`data: ${JSON.stringify(newRejection)}\n\n`)
        })

        return res.status(201).send({
            message: "Rejection created successfully",
            newRejection
        })

    } catch (error) {

        console.log(error)

        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const getRejections=async(req,res)=>{
    try {
        const page= parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip=(page-1)*limit
        const cache=`rejections?page=${page}&limit=${limit}`
        
        try {
            const getCache=await redisClient.get(cache)
            if(getCache){
                return res.status(200).send(JSON.parse(getCache))
            }
        } catch (cacheErr) {
            console.warn('Cache read failed:', cacheErr.message)
        }
        
        const rejections=await Rejection.find().skip(skip).limit(limit).sort({ createdAt: -1 })
        const totalCount=await Rejection.countDocuments()
        const totalPages=Math.ceil(totalCount / limit)
        const hasMore=page<totalPages
        const data={
            currentPage:page,
            limit:limit,
            rejections:rejections,
            link:{
                next:hasMore ? `rejections?page=${page+1}&limit=${limit}`:null,
                prev:page  >1 ? `rejections?page=${page-1}&limit=${limit}`:null,
            },
            totalPages:totalPages,
            hasMore:hasMore,
        }
        
        // Cache asynchronously without blocking
        redisClient.set(cache,JSON.stringify(data),'EX',60).catch(err => {
            console.warn('Cache write failed:', err.message)
        })
        return res.status(200).send({
            data
        })

    } catch (error) {
        
        console.log(error)

        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const getCompanyRejections=async(req,res)=>{
    try {
        const {slug}=req.params
        const company=await Company.findOne({slug})
        if(!company){
            return res.status(404).send({
                message:"Company not found"
            })
        }
        const page=parseInt(req.query.page) || 1
        const limit=parseInt(req.query.limit) || 20
        const skip=(page-1)*limit
        const cache=`company:${slug}?page=${page}&limit=${limit}`
        
        try {
            const getCache=await redisClient.get(cache)
            if(getCache){
                return res.status(200).send(JSON.parse(getCache))
            }
        } catch (cacheErr) {
            console.warn('Cache read failed:', cacheErr.message)
        }
        
        const rejections=await Rejection.find({company:company._id}).skip(skip).limit(limit).sort({createdAt:-1})
        const totalCount=await Rejection.countDocuments({company:company._id})
        const totalPages=Math.ceil(totalCount / limit) 
        const hasMore=page<totalPages
        const data={
            rejections:rejections,
            currentPage:page,
            hasMore:hasMore,
            links:{
                next:page<totalPages ? `rejections?page=${page+1}&limit=${limit}`:null,
                prev:page>1 ? `rejections?page=${page-1}&limit=${limit}`:null,
            },
            totalPages:totalPages,
            company:company
        }
        
        // Cache asynchronously without blocking
        redisClient.set(cache,JSON.stringify(data),"EX",60).catch(err => {
            console.warn('Cache write failed:', err.message)
        })
        return res.status(200).send({
            data
        })
    } catch (error) {
        
        console.log(error)

        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

const getUserRejections = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send({
                message: "Not authenticated"
            })
        }

        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const skip = (page - 1) * limit

        const rejections = await Rejection.find({ user: req.user.id }).populate('company').skip(skip).limit(limit).sort({ createdAt: -1 })
        const totalCount = await Rejection.countDocuments({ user: req.user.id })
        const totalPages = Math.ceil(totalCount / limit)
        const hasMore = page < totalPages

        return res.status(200).send({
            rejections: rejections,
            currentPage: page,
            limit: limit,
            totalCount: totalCount,
            totalPages: totalPages,
            hasMore: hasMore
        })

    } catch (error) {
        console.log(error)

        return res.status(500).send({
            message: "Internal Server Error"
        })
    }
}

module.exports = {
    addRejection,
    getRejections,
    getCompanyRejections,
    getUserRejections
}