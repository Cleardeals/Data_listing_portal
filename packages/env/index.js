const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Determine the path to the root .env file
const rootEnvPath = path.resolve(__dirname, '../../.env');

// Check if the file exists
if (!fs.existsSync(rootEnvPath)) {
  throw new Error(`.env file not found at ${rootEnvPath}`);
}

// Load the environment variables from the root .env file
const envConfig = dotenv.parse(fs.readFileSync(rootEnvPath));

// Export the environment variables
module.exports = {
  NEXT_PUBLIC_SUPABASE_URL: envConfig.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
};
