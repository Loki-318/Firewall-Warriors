const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hackathon',
  password: 'admin',
  port: 5432,
});

app.get('/api/markers', async (req, res) => {
  try {
    console.log("Fetching AQI data...");
    const result = await pool.query(`
      SELECT 
        id, 
        latitude, 
        longitude, 
        aqi, 
        timestamp 
      FROM aqi_data
    `);
    console.log("Data fetched successfully.");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/markers', async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    const { latitude, longitude, aqi, timestamp } = req.body;

    if (latitude == null || longitude == null || aqi == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO aqi_data (latitude, longitude, aqi, timestamp)
       VALUES ($1, $2, $3, $4)
       RETURNING id, latitude, longitude, aqi, timestamp`,
      [latitude, longitude, aqi, timestamp || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
