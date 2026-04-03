const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  fillLevel: {
    type: Number,
    required: [true, 'Fill level is required'],
    min: [0, 'Fill level cannot be less than 0'],
    max: [100, 'Fill level cannot exceed 100']
  },
  status: {
    type: String,
    enum: ['empty', 'half', 'full'],
    default: 'empty'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  segregated: {
    type: Boolean,
    default: true
  }
});

// Auto-derive status from fillLevel before saving
binSchema.pre('save', function () {
  if (this.fillLevel <= 30) {
    this.status = 'empty';
  } else if (this.fillLevel <= 79) {
    this.status = 'half';
  } else {
    this.status = 'full';
  }
  this.lastUpdated = Date.now();
});

// Also handle updates via findOneAndUpdate
binSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.fillLevel !== undefined) {
    if (update.fillLevel <= 30) {
      update.status = 'empty';
    } else if (update.fillLevel <= 79) {
      update.status = 'half';
    } else {
      update.status = 'full';
    }
  }
  update.lastUpdated = Date.now();
});

module.exports = mongoose.model('Bin', binSchema);
