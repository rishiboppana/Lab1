const express = require('express')
const sql = require('./Models/db.js')
const users = require('./Models/users.js')

app = express()

async function startDatabase() {
    try {
        await sql.authenticate()
        await sql.sync()
    } catch (err) {
        console.log("Database Couldnot be Synced")
        console.log(err)
    }
}

startDatabase().then(() => console.log("Database Connected")) ;

app.get("/login" , (req,res)=>{
    const {userName , password} = req.body

})

app.get("/signup" , (req,res)=>{
    console.log("Sign Up Page")
})

app.listen(3000 , () =>{
    console.log("Port Running at 3000")
})