import express from 'express'
import cors from 'cors'
import {Kafka, Partitioners} from 'kafkajs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import traveler from './traveler-model.js'

const uploadDir = './uploads/profiles'
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.body.userId || Date.now()}-${Date.now()}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

export const upload = multer({ 
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

const app = express()
app.use(cors())
app.use(express.json())

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

consumer.run({
    eachMessage: async({topic, partition, message}) => {
        try {
            const request = JSON.parse(message.value.toString())
            let response
            
            switch(request.operation) {
                case "Get-Profile":
                    response = await getProfile(request.id)
                    break
                case "Put-Profile":
                    response = await updateUser(request.id, request.details)
                    break
                case "Post-User":
                    response = await createUser(request.details)
                    break
                default:
                    response = {message: "Unknown operation"}
            }
            
            await producer.send({
                topic: 'traveler-response', 
                messages: [{value: JSON.stringify(response)}]
            })
        } catch(err) {
            console.error("Error processing message:", err)
        }
    }
})

app.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (req.file && req.body && req.body.id) {
      // Case 1: update existing user's avatar
      const imagePath = `uploads/profiles/${req.file.filename}`
      console.log('✅ Image uploaded:', imagePath)
      console.log('📁 File saved at:', req.file.path)

      const avatar_doc = await traveler.findOneAndUpdate(
        {'id' : req.body.id},
        { $set: { avatar_url: imagePath } },
        { new: true }
      )

      console.log("Updated user:", avatar_doc)
      return res.json({ message: "Avatar updated", user: avatar_doc })
    }

    else if (req.body && req.file) {
      // Case 2: create new user with avatar
      const imagePath = `uploads/profiles/${req.file.filename}`
      const details = req.body
      details.avatar_url = imagePath

      const newUser = await traveler.create(details)
      console.log("✅ New user created:", newUser)
      return res.json({ message: "User created successfully", user: newUser })
    }

    else if (!req.file) {
      // Case 3: no file uploaded
      return res.status(400).json({ message: "No file uploaded" })
    }

    else {
      // Catch-all
      return res.status(400).json({ message: "Invalid request format" })
    }
  } 
  catch (err) {
    console.error("Error in /upload-avatar:", err)
    return res.status(500).json({ message: "Server error", error: err.message })
  }
})
app.listen(4000,(err)=>{
    if (err) console.log("Error : ", err)
    else console.log("Port running at 4000")
})