// server.js - Main entry point
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jobRoutes from './routes/jobRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import analyticRoutes from './routes/analyticRoutes.js';
import { startPrecomputationJobs } from './utils/cronJobs.js';
import { addGeoJSONRoute } from './utils/geoUtils.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('Created data directory');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticRoutes);

// Add GeoJSON route
addGeoJSONRoute(app);

// Static files route (for the future React build)
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start background jobs for precomputing metrics
  startPrecomputationJobs();
});