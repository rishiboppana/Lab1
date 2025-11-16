const { Traveler , Favourite} = require('./model.js')
require('dotenv').config()

exports.getProfile = (req , res)=>{
    const email = req.user.email
    const profile = Traveler.findOne({where : {email : email}})
    if (profile) res.status(200).json(profile)
    else res.status(404).json({message : "No Profile Found "})
}

exports.putProfile = async (req, res) => {
  try {

    const userEmail = req.user.email  

    const {
      name,
      phone,
      about,
      city,
      country,
      languages,
      gender,
      avatar_url
    } = req.body

    // Find traveler
    const traveler = await Traveler.findOne({ where: { email: userEmail } })
    if (!traveler) {
      return res.status(404).json({ message: "Traveler not found" })
    }

    // Update only provided fields
    await traveler.update({
      name: name ?? traveler.name,
      phone: phone ?? traveler.phone,
      about: about ?? traveler.about,
      city: city ?? traveler.city,
      country: country ?? traveler.country,
      languages: languages ?? traveler.languages,
      gender: gender ?? traveler.gender,
      avatar_url: avatar_url ?? traveler.avatar_url
    })

    return res.status(200).json({
      message: "Profile updated successfully",
      traveler
    })

  } catch (error) {
    console.error("Update Profile Error:", error)
    return res.status(500).json({ message: "Server Error", error: error.message })
  }
}

// exports.getFavourites = (req , res)=>{
//     const email = req.user.email
//     const favs = Favourite.findOne({where : {email : email}})
//     if (favs) res.status(200).json(favs)
//     else res.status(404).json({message : "No Profile Found "})
// }

// exports.postFavourites = (req , res) =>{
//     const 
// }