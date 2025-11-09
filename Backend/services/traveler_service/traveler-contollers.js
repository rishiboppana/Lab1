import traveler from "./traveler-mdoel.js"
import mongoose from 'mongoose'

// export function 
export async function getProfile(id){
    const profile = await traveler.find({'id ': id})
    if (profile )return {"message" : "Success" , "profile" : profile}
    else return {"message" : "Profile Not Found" }
}

export async function updateUser(id , details){
    const profile = await traveler.find({"id":id})
    if (profile){
        await traveler.updateOne(
            {'id' : id} ,
            {$set : details}
        ).then(()=>{return {'message':"Success"}})
    }
    else return {"message" : "Profiel Not Found"}
}