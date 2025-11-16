const express = require('express')
const jwt = require('jsonwebtoken')
const authRoutes = require('./routes.js')

const app = express() 
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/auth" , authRoutes)


app.listen(9096 , ()=>{
    console.log('Auth Port Running at 9096')
})