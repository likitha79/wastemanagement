const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Bin = require('../models/Bin');

const seedBins = [
  { location: 'Canteen', fillLevel: 70, status: 'half' },
  { location: 'Library', fillLevel: 90, status: 'full' },
  { location: 'CSE Dept', fillLevel: 85, status: 'full' },
  { location: 'FED Dept', fillLevel: 40, status: 'half' },
  { location: 'CSE S4 Class', fillLevel: 95, status: 'full' },
  { location: 'Hostel Block A', fillLevel: 25, status: 'empty' },
  { location: 'Hostel Block B', fillLevel: 15, status: 'empty' },
  { location: 'Academic Block 1', fillLevel: 60, status: 'half' },
  { location: 'Academic Block 2', fillLevel: 30, status: 'empty' },
  { location: 'Sports Complex', fillLevel: 50, status: 'half' },
  { location: 'Auditorium', fillLevel: 10, status: 'empty' },
  { location: 'Parking Area', fillLevel: 75, status: 'half' },
  { location: 'Main Gate', fillLevel: 82, status: 'full' },
  { location: 'Cafeteria', fillLevel: 55, status: 'half' },
  { location: 'Lab Block', fillLevel: 20, status: 'empty' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Bin.deleteMany({});
    console.log('Cleared existing bins');

    await Bin.insertMany(seedBins);
    console.log(`Seeded ${seedBins.length} bins successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
