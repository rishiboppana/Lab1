import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import {Kafka, Partitioners} from 'kafkajs'
import {getProfile, updateUser} from './traveler-controllers.js'

const app = express()
app.use(cors())
app.use(express.json())

// Create uploads folder
const uploadDir = './uploads/profiles'
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.body.userId}-${Date.now()}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        if (mimetype && extname) {
            cb(null, true)
        } else {
            cb(new Error('Only images allowed!'))
        }
    }
})

// Kafka setup
const kafka = new Kafka({
    clientId: "Traveler-Service",
    brokers: ["localhost:9092"]
})

const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner})
const consumer = kafka.consumer({groupId: "traveler-service"})

await producer.connect()
await consumer.connect()
await consumer.subscribe({topic: "traveler-request", fromBeginning: false})

// Kafka consumer
consumer.run({
    eachMessage: async({topic, partition, message}) => {
        const request = JSON.parse(message.value.toString())
        
        if (request.operation === "Get-Profile"){
            const response = await getProfile(request.id)
            await producer.send({
                topic: 'traveler-response', 
                messages: [{value: JSON.stringify(response)}]
            })
        }
        
        if (request.operation === "Put-Profile"){
            const response = await updateUser(request.id, request.details)
            await producer.send({
                topic: 'traveler-response', 
                messages: [{value: JSON.stringify(response)}]
            })
        }
    }
})

// Image upload endpoint
app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }
        
        const userId = req.body.userId
        const imageUrl = `http://localhost:4000/uploads/profiles/${req.file.filename}`
        
        // Update avatar_url in database
        const response = await updateUser(userId, { avatar_url: imageUrl })
        
        res.json({
            message: 'Avatar uploaded',
            avatar_url: imageUrl,
            response: response
        })
        
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Serve images
app.use('/uploads', express.static('uploads'))

// Start server
const PORT = 4000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})