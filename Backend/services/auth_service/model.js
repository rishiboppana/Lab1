const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

const sql = new Sequelize('airbnb', 'root', "1234", {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})

const Traveler = sql.define("Traveller", {
  id: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  about: { type: DataTypes.JSON },        
  city: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  languages: { type: DataTypes.JSON },    
  gender: { type: DataTypes.STRING },
  avatar_url: { type: DataTypes.JSON }    
})

const Owner = sql.define("Owner", {
  id: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  about: { type: DataTypes.JSON },        
  city: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  languages: { type: DataTypes.JSON },    
  gender: { type: DataTypes.STRING },
  avatar_url: { type: DataTypes.JSON }    
})
sql.sync()
  .then(() => console.log("MySQL Synced ✔"))
  .catch(err => console.error("Sync error ", err))
module.exports = { Traveler, Owner }
