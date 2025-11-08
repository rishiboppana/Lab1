import mongoose from 'mongoose'
import property from './model-property.js'

export async function getAllProperties(){
    const  properties = await property.find({})
    return properties       
}

export async function getSearchProperties(search){
    const properties = await property.find({'location': search})
    return properties ; 
}

export async function getPropertyById(id){
    return await property.find({'id': id}) 
}

export async function postProperty(details){
    try{
        await property.create(details)
        return "Property Added Succsesfully"
    } catch(err){
        return err
    }
    
}

export async function putProperty(old,details){
    await property.findOneAndReplace(
        {'owner_id': old.owner_id ,'title' : old.old_name},
        details,
        {returnDocument : 'after'}
    ).then(doc => {
        if (doc) console.log("Docuemnt Found and Updated")
        else console.log("Document Not Found")
    }).catch(err =>{
        console.log("Error occured while property updating : " ,err)
        return {'err' : err}
    })
}

export async function deleteProperty(user,id){
    const prop = await property.findOne({'id' : id})
    if (prop.owner_id == user.id){
        await property.deleteOne({'id': id})
        return {message : "Deleted Succsesfully"}
    }
    return {message : "Deleted UnSuccsesfully"}
}

