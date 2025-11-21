const { Sequelize, DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

const sql = new Sequelize('airbnb', 'root', "1234", {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
})

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

const Owner = sql.define(
  "Owner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
    },

    about: {
      type: DataTypes.TEXT,
    },

    city: {
      type: DataTypes.STRING,
    },

    country: {
      type: DataTypes.STRING,
    },

    languages: {
      type: DataTypes.JSON, // or JSON if multiple languages
    },

    gender: {
      type: DataTypes.STRING,
    },

    avatar_url: {
      type: DataTypes.STRING,
    },

    property_id: {
      type: DataTypes.JSON,      // Stored as ["12", "15", "23"]
      allowNull: true,
      defaultValue: [],
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Owners",
  }
);

module.exports = Owner;


sql.sync()
  .then(() => console.log("MySQL Synced ✔"))
  .catch(err => console.error("Sync error ", err))

  module.exports ={ Owner}