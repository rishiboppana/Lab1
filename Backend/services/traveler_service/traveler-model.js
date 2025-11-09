import mongoose from 'mongoose'

mongoose.connect("mongodb:://localhost:27017/traveller")
.then("Connected to Traveler Collection")
.catch((err) => console.log("Error Occured : ",err))

const travelerSchema = new mongoose.Schema({
    id : Number ,
    role : String , 
    name : String ,
    email : String ,
    password_hash : String , 
    phone : Number ,
    about : String , 
    city : String , 
    country : String , 
    languages : String,
    gender : String ,
    avatar_url : String
})

travelerSchema.set('timestamps' , true)

export default mongoose.model('traveler' , travelerSchema)