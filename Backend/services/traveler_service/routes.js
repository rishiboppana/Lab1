const express = require('express')
const { verifyLogin } = require("./middleware.js")
const{ getProfile , putProfile } =require("./controller.js")

const r = express.Router()

r.get('/profile' ,verifyLogin,  getProfile)
r.put('/profile' , verifyLogin , putProfile)
// r.post('/favourites' , verifyLogin , postFavourites)
// r.get('/favourites' , verifyLogin , getFavourites)

module.exports = r