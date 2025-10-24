const { DataTypes } = require('sequelize');
const sql = require('./db.js');
const Property = require('./properties.js');
const User = require('./users.js');

const booking = sql.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
  traveler_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  guests: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  indexes: [
    { fields: ['property_id'] },
    { fields: ['traveler_id'] },
    { fields: ['start_date'] },
  ],
});

Property.hasMany(booking, { foreignKey: 'property_id' });
booking.belongsTo(Property, { foreignKey: 'property_id' });

User.hasMany(booking, { foreignKey: 'traveler_id' });
booking.belongsTo(User, { foreignKey: 'traveler_id' });

module.exports = booking;
