const Property = require('./model.js')

exports.getProperties = async () => {
    try {
        const properties = await Property.find({})
        return properties
    } catch (err) {
        throw err
    }
}

exports.getProperty = async (prop_id) => {
    try {
        const prop = await Property.findOne({ id: prop_id }) // Use findOne with your custom id
        if (!prop) throw new Error("Property Not Found")
        return prop
    } catch (err) {
        throw err
    }
}

exports.postProperty = async (details) => {
    try {
        const newProperty = await Property.create(details)
        return newProperty
    } catch (err) {
        throw err
    }
}

exports.putProperty = async (id, details) => {
    try {
        const prop = await Property.findOneAndUpdate(
            { id: id }, // Find by your custom id field
            details, 
            { new: true }
        )
        if (!prop) throw new Error("Property Not Found")
        return prop
    } catch (err) {
        throw err
    }
}

exports.deleteProperty = async (id) => {
    try {
        const prop = await Property.findOneAndDelete({ id: id }) // Use your custom id
        if (!prop) throw new Error("Property Not Found")
        return { message: "Property Deleted" }
    } catch (err) {
        throw err
    }
}