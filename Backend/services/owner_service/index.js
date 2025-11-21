const express = require('express')
const ownerRoutes = require('./routes.js')
require('dotenv').config

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/owner' , ownerRoutes)

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`Owner Working at ${PORT} Port`)
})