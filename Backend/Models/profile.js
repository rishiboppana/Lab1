const { DataTypes } = require('sequelize');
const sql = require('./db.js');
const User = require('./users.js'); // to link foreign key

const profile = sql.define('Profile', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  about_me: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  languages: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profile_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  indexes: [
    { fields: ['user_id'] },
    { fields: ['city'] },
  ],
});

User.hasOne(profile, { foreignKey: 'user_id' });
profile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = profile;
