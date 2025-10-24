const express = require('express')
const sql = require('../Models/db.js')
const users = require('../Models/User.js')
const properties = require("../Models/properties")
const profile = require("../Models/profile.js")
const favourites = require("../Models/favourites.js")
const bookings = require("../Models/bookings")
const propertRoutes = require("../routes/propertyRoutes.js")
const cors = require('cors');


app = express()

app.use(cors())
app.use(express.json)

// Connecting with Database
async function startDatabase() {
    try {
        await sql.authenticate()
        await sql.sync()
    } catch (err) {
        console.log("Database Could not be Synced")
        console.log(err)
    }
}

startDatabase().then(() => console.log("Database Connected")) ;
// Database connection Ended
//Home Page
app.use('/', propertRoutes);

app.get("/login" , (req,res)=>{
    const {userName , password} = req.body

})

app.get("/signup" , (req,res)=>{
    console.log("Sign Up Page")
})


app.listen(3000 , () =>{
    console.log("Port Running at 3000")
})