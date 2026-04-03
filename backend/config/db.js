const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('Error: MONGO_URI is not defined in .env');
    process.exit(1);
  }

  if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
    console.error('Error: MONGO_URI must start with "mongodb+srv://" or "mongodb://"');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('DB connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
