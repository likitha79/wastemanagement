const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');

// GET /api/bins — Fetch all bins
router.get('/', async (req, res) => {
  try {
    const bins = await Bin.find().sort({ lastUpdated: -1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/bins — Create a new bin
router.post('/', async (req, res) => {
  try {
    const { location, fillLevel, status } = req.body;

    if (!location || fillLevel === undefined) {
      return res.status(400).json({ message: 'Location and fillLevel are required' });
    }

    // Check for duplicate location
    const existing = await Bin.findOne({ location: { $regex: new RegExp(`^${location}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: `Bin at "${location}" already exists. Use edit to update it.` });
    }

    const bin = new Bin({ location, fillLevel: Number(fillLevel), status });
    const savedBin = await bin.save();
    res.status(201).json(savedBin);
  } catch (error) {
    console.error('Create bin error:', error.message);
    res.status(400).json({ message: 'Invalid data', error: error.message });
  }
});

// PUT /api/bins/:id — Update a bin
router.put('/:id', async (req, res) => {
  try {
    const updated = await Bin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Bin not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE /api/bins/:id — Delete a bin
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bin.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Bin not found' });
    }

    res.json({ message: 'Bin deleted', bin: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

module.exports = router;
