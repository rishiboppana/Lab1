const jwt = require('jsonwebtoken')
require('dotenv').config()

// Verifies any logged-in user
exports.verifyLogin = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" })
        req.user = decoded  
        next()
    })
}

// Allows only users with role == owner
exports.verifyOwner = (req, res, next) => {
    const authHeader = req.headers.authorization   
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Invalid or expired token" })

        if (decoded.role !== "owner") {
            return res.status(403).json({ message: "Only property owners can perform this action" })
        }

        req.user = decoded
        next()
    })
}
