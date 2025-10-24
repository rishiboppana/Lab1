const { Sequelize } = require('sequelize')

const sql = new Sequelize('airbnb' , 'root' , '1234',
{   host : 'localhost',
    dialect: "mysql" ,
    logging: false
})

module.exports = sql