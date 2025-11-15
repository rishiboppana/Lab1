const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config() 
const propertyRoutes = require('./routes.js')

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sessions"
const PORT = process.env.PORT || 9092

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err))

const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Property Service' })
})

app.use("/properties", propertyRoutes)

app.listen(PORT, () => {
    console.log(`Property Service running on port ${PORT}`)
})