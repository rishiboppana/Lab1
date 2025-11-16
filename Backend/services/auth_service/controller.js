const jwt = require('jsonwebtoken')
const { Traveler, Owner } = require('./model.js')
const bcrypt = require('bcrypt')
require('dotenv').config()

exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body

    const present = await Traveler.findOne({ where: { email }})
    if (present) {
      return res.status(400).json({ message: "Failed", reason: "Email already in use" })
    }

    const password_hash = await bcrypt.hash(password, 10)

    await Traveler.create({
      name,
      email,
      password_hash,
      phone
    })

    const token = jwt.sign(
      { email, role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    )

    return res.status(201).json({ message: "Success", token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server Error" })
  }
}


exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body

    const user = await Traveler.findOne({
      where: { email },
      attributes: ["password_hash"]
    })

    if (!user) {
      return res.status(400).json({ message: "Failed", reason: "Email not found" })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(400).json({ message: "Failed", reason: "Wrong credentials" })
    }

    const token = jwt.sign(
      { email, role },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    )

    return res.status(200).json({ message: "Success", token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server Error" })
  }
}
