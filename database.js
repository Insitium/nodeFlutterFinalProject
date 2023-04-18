const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("connecting to db")
    const conn = await mongoose.connect(process.env.DBCONN, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (err) {
    console.log("error connecting to db"+ err)
    console.log(err)
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };