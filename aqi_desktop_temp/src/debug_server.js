const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const dbConfig = {
  user: 'postgres',     
  host: 'localhost',    
  database: 'pothole',  
  password: 'admin', 
  port: 5432,          
};

console.log('Attempting to connect with config:', {
  ...dbConfig,
  password: '****'
});

const pool = new Pool(dbConfig);

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    const testQuery = await client.query('SELECT current_database(), current_user, version();');
    console.log('\nDatabase Info:', testQuery.rows[0]);
    
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'markers'
      );
    `);
    console.log('\nMarkers table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      const markerCount = await client.query('SELECT COUNT(*) FROM markers;');
      console.log('Number of markers in table:', markerCount.rows[0].count);
    }

    client.release();
  } catch (err) {
    console.error('\nDatabase connection error:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });
    
    const errorGuide = {
      ECONNREFUSED: 'PostgreSQL server is not running or wrong port',
      '28P01': 'Wrong password',
      '3D000': 'Database does not exist',
      '28000': 'Wrong username',
      '42P01': 'Table does not exist'
    };
    
    if (errorGuide[err.code]) {
      console.log('\nPossible solution:', errorGuide[err.code]);
    }
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Is PostgreSQL running? Try: pg_ctl status');
    console.log('2. Can you connect via psql? Try: psql -U', dbConfig.user, '-d', dbConfig.database);
    console.log('3. Check if database exists: \\l in psql');
    console.log('4. Verify username/password combination');
    process.exit(1);
  }
};

testConnection();

pool.on('connect', () => {
  const app = express();
  app.use(cors());

  app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  app.get('/api/markers', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT 
          name, 
          ST_X(geocode::geometry) as lng, 
          ST_Y(geocode::geometry) as lat, 
          date_added, 
          size, 
          threat 
        FROM markers
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Query error:', err);
      res.status(500).json({ 
        error: err.message,
        hint: 'Check if markers table exists and has correct structure'
      });
    }
  });

  app.listen(5000, () => {
    console.log('\nServer is running on port 5000');
    console.log('Test the server: http://localhost:5000/test');
    console.log('Test the markers API: http://localhost:5000/api/markers');
  });
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});