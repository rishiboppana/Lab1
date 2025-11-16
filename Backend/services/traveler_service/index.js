const express = require('express')
const travelerRoutes = require('./routes.js')
require('dotenv').config

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/traveler' , travelerRoutes)

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`Traveler Working at ${PORT} Port`)
})