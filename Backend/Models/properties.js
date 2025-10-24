const { DataTypes } = require('sequelize');
const sql = require('./db.js');
const User = require('./users.js');

const property = sql.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['owner_id'] },
    { fields: ['location'] },
    { fields: ['price'] },
  ],
});

User.hasMany(property, { foreignKey: 'owner_id' });
property.belongsTo(User, { foreignKey: 'owner_id' });

module.exports = property;
