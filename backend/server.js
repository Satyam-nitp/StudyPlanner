const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const subjectRoutes = require('./api/subjectRoutes');
const authRoutes = require('./api/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
