const jwt = require('jsonwebtoken')

const protect = async (req, res, next) => {
    try {

        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).send({
                message: "Token not found"
            })
        }

        const decoded = jwt.verify(
            token,
            process.env.jwtSecret
        )

        req.user = decoded

        next()

    } catch (error) {
        console.log(error)

        return res.status(401).send({
            message: "Invalid token"
        })
    }
}

module.exports = protect