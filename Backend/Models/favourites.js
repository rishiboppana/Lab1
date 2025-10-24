const { DataTypes } = require('sequelize');
const sql = require('./db.js');
const User = require('./users.js');
const Property = require('./properties.js');

const favorite = sql.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Property,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  indexes: [
    { unique: true, fields: ['user_id', 'property_id'] },
  ],
});

User.belongsToMany(Property, {
  through: favorite,
  foreignKey: 'user_id',
  otherKey: 'property_id',
});
Property.belongsToMany(User, {
  through: favorite,
  foreignKey: 'property_id',
  otherKey: 'user_id',
});

module.exports = favorite;
