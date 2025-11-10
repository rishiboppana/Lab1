import mongoose from 'mongoose'
import property from './model-property.js'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads/properties';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

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

