const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  issueType: {
    type: String,
    enum: ['full', 'not-segregated'],
    required: [true, 'Issue type is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
