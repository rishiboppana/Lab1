import mongoose from 'mongoose'

mongoose.connect("mongodb://localhost:27017/traveller")
.then(() => console.log("Connected to Traveler Collection"))
.catch((err) => console.log("Error Occured : ", err))

const travelerSchema = new mongoose.Schema({
    id: String,
    role: String,
    name: String,
    email: String,
    password_hash: String,
    phone: Number,
    about: String,
    city: String,
    country: String,
    languages: String,
    gender: String,
    avatar_url: String  // This stores the image URL
}, { timestamps: true })

export default mongoose.model('traveler', travelerSchema)