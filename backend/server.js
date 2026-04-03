const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Bin = require('./models/Bin');
const Report = require('./models/Report');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// POST /api/register — Register a new user
const User = require('./models/User');
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required (name, email, password, role)' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// POST /api/login — Login a user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: `This account is not registered as ${role}` });
    }

    // Award daily login points (+10 if not logged in today)
    const today = new Date().toDateString();
    const lastActiveDay = user.lastActive ? new Date(user.lastActive).toDateString() : null;
    if (lastActiveDay !== today) {
      user.points = (user.points || 0) + 10;
    }
    user.lastActive = Date.now();
    await user.save();

    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points, reportsCount: user.reportsCount }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access: http://0.0.0.0:${PORT}`);
});