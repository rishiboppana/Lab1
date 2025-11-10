import traveler from "./traveler-model.js"

export async function getProfile(id){
    const profile = await traveler.findOne({'id': id})
    if (profile) return {"message": "Success", "profile": profile}
    else return {"message": "Profile Not Found"}
}

export async function updateUser(id, details){
    const profile = await traveler.findOne({"id": id})
    if (profile){
        await traveler.updateOne(
            {'id': id},
            {$set: details}
        )
        return {'message': "Success"}
    }
    else return {"message": "Profile Not Found"}
}

export async function createUser(details){
    const newTraveler = await traveler.create(details)
    console.log(newTraveler)
}