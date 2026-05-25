const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://MERN:Utkar5hkp2014@cluster0.tiglnj5.mongodb.net/rejected?retryWrites=true&w=majority"
    );
    console.log("Connected to the db");
  } catch (error) {
    console.log("Failed to connect to the db", error);
    process.exit(1);
  }
};

module.exports = connectToDB;