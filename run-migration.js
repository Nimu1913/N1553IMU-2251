const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔄 Connecting to Supabase database...');
    await client.connect();
    
    console.log('✅ Connected successfully!');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'my-app/drizzle/0001_add_dealer_network_schema.sql'), 
      'utf8'
    );
    
    console.log('🔄 Running database migrations...');
    await client.query(migrationSQL);
    
    console.log('✅ Database migrations completed successfully!');
    console.log('📊 Tables created:');
    console.log('  - dealer_networks');
    console.log('  - dealers');  
    console.log('  - Updated users table');
    console.log('  - Updated vehicles table');
    console.log('  - Updated leads table');
    console.log('  - Updated appointments table');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);