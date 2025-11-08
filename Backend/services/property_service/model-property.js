import mongoose from 'mongoose'

mongoose.connect("mongodb://localhost:27017/properties" , {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log(" Connected to MongoDb Properties"))
.catch((err)=>console.log("Properties MongoDb error : ", err))

const propertySchema  = new mongoose.Schema({
    id : Number , 
    owner_id : Number ,
    title : String ,
    type : String , 
    location : String , 
    description : String , 
    price_per_night : Number , 
    bedrooms : Number , 
    bathrooms : Number , 
    amenities : [{ type : String , lowercase : true }] , 
    number_of_guests : Number,
    image : [{type : String}] 
})

propertySchema.set('timestamps' , true)

export default mongoose.model('property' , propertySchema)