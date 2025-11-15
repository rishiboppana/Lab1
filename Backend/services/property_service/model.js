const mongoose = require('mongoose')
const inc = require('mongoose-sequence')(mongoose)
const propertySchema = mongoose.Schema({
    id : Number , 
    owner_id : Number , 
    title : String , 
    location : String,
    description : String , 
    price_per_night : Number ,
    bedrooms : Number , 
    amenities : [String],
    images : [String] , 
    number_of_guests : Number
} , {timestamps : true})

propertySchema.plugin(inc,{inc_field : 'id'})

const propertyModel = mongoose.model('Properties' , propertySchema)

module.exports  = propertyModel