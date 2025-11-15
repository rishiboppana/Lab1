const express = require('express')
const mongoose = require('mongoose')
const propertyRoutes = require('./routes.js')

mongoose.connect("mongodb://localhost:27017/sessions")

const app = express()

app.use(express.json())

app.use("/properties",propertyRoutes)

app.listen(9092,()=>{
    console.log("Property Service working at port 9092")
})