const express = require('express')

app = express()

app.get("/login" , (req,res)=>{
    const {userName , password} = req.body

})

app.listen(3000 , () =>{
    console.log("Port Running at 3000")
})