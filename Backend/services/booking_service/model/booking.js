const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    property_id: { type: DataTypes.INTEGER, allowNull: false },

    owner_id: { type: DataTypes.INTEGER, allowNull: false },

    user_id: { type: DataTypes.INTEGER, allowNull: false },

    check_in: { type: DataTypes.DATEONLY, allowNull: false },
    check_out: { type: DataTypes.DATEONLY, allowNull: false },

    total_price: { type: DataTypes.FLOAT, allowNull: false },

    status: {
      type: DataTypes.ENUM("Pending", "Accepted", "Cancelled"),
      defaultValue: "Pending"
    },

    guests: { type: DataTypes.INTEGER, allowNull: false },

    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    tableName: "bookings",
    timestamps: false
  }
);

module.exports = Booking;
