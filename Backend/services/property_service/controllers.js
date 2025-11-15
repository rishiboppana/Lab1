const property = require('./model.js')

exports.getProperties = async () => {
    try{
        const properties = await property.find({})
        return properties
    } catch (err){
        throw err
    }
}

exports.getProperty = async (prop_id) => {
    try {
        const prop = await property.find({id : prop_id})
        if (!prop) throw new Error("Property Not Found")
        return prop
    } catch (err){
        throw err
    }
}

exports.postProperty = async(details) => {
    try {
        await property.create(details)
        return {"Message" : "Property Added"}
    } catch(err){
        throw err
    }
}

exports.putProperty = async(id , details) => {
    const prop =await  property.findOne({'id' : id})
    if (prop) {
        property.overwrite(details)
        await property.save()
        return {"message" : "Property Updated"}
    }
    else{
        return {'message' : "Property Not Found"}
    }
}

exports.deleteProperty = async (id) =>{
    try{
        await property.deleteOne({'id' : id})
        return {"message" : "Property Deleted"}
    } catch(err){
        throw err
    }
}
