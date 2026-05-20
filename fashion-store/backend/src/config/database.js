const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB Atlas...");
    console.log(
      "Connection String:",
      process.env.MONGODB_URI.split("?")[0] + "?***",
    );

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error("Error Details:", error.code);

    if (error.message.includes("ECONNREFUSED")) {
      console.error("Check if:");
      console.error("   1. MongoDB Atlas IP whitelist includes your IP");
      console.error("   2. Database user credentials are correct");
      console.error("   3. Your internet connection is working");
      console.error("   4. Firewall/VPN is not blocking MongoDB");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
