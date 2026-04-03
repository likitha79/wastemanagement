const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Bin = require('./models/Bin');
const Report = require('./models/Report');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API working' });
});

// Use bins router for CRUD
const binsRouter = require('./routes/bins');
app.use('/api/bins', binsRouter);

// Auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// User model (needed for report, leaderboard, user routes below)
const User = require('./models/User');


// POST /api/report — Submit an issue report
app.post('/api/report', async (req, res) => {
  try {
    const { location, issueType, description, userId } = req.body;

    if (!location || !issueType || !description) {
      return res.status(400).json({ message: 'location, issueType, and description are required' });
    }

    // 1. Save the report
    const report = new Report({ location, issueType, description });
    await report.save();

    // 2. Update the corresponding bin if it exists
    if (issueType === 'full') {
      await Bin.findOneAndUpdate(
        { location },
        { $set: { fillLevel: 95, status: 'full', lastUpdated: Date.now() } },
        { new: true }
      );
    } else if (issueType === 'not-segregated') {
      await Bin.findOneAndUpdate(
        { location },
        { $set: { segregated: false, lastUpdated: Date.now() } },
        { new: true }
      );
    }

    // 3. Award points to the user (+25 per report)
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { points: 25, reportsCount: 1 },
        $set: { lastActive: Date.now() }
      });
    }

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Failed to submit report', error: error.message });
  }
});

// GET /api/leaderboard — Get all users sorted by points
app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role points reportsCount lastActive')
      .sort({ points: -1 })
      .limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
});

// GET /api/user/:id — Get a single user's data (for refreshing points)
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, 'name email role points reportsCount');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

// 404 catch-all — helps debug missing routes on deployed server
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET  /test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/bins',
      'POST /api/bins',
      'POST /api/report',
      'GET  /api/leaderboard',
      'GET  /api/user/:id'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://0.0.0.0:${PORT}`);
});