const sql = require("./db.js")
const { DataTypes } = require('sequelize')

const User = sql.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      role :{
          type : DataTypes.STRING,
          allowNull : false
      },
      password : {
          type : DataTypes.STRING,
          allowNull : false
      }
    }, {
      timestamps: true,
    });

module.exports = User;