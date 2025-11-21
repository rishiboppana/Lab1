const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    await sequelize.sync();
    console.log("Tables synced");

    app.listen(PORT, () =>
      console.log(`🚀 Booking Service running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
