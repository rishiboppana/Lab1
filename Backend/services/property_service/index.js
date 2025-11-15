const express = require('express')
const propertyRoutes = require('./routes.js')

const app = express()

app.use(express.json())

app.use("/properties",propertyRoutes)