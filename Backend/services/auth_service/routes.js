const express = require('express')
const { login , logout , signup } = require('./controller.js')

const r = express.Router()

r.post("/signup" ,signup)

r.post("/login" , login)

module.exports = r
