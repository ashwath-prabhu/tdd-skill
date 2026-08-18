const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tdd-testing-skills';

mongoose.connect(MONGO_URI).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

module.exports = mongoose;
