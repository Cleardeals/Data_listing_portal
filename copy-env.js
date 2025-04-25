const fs = require('fs');
const path = require('path');

// Read the root .env file
const rootEnvPath = path.join(__dirname, '.env');
const rootEnvContent = fs.readFileSync(rootEnvPath, 'utf8');

// Applications to copy to
const apps = ['web_app', 'data_operator_panel', 'super_admin_panel'];

// Copy to each application
apps.forEach(app => {
  const appEnvPath = path.join(__dirname, 'apps', app, '.env.local');
  fs.writeFileSync(appEnvPath, rootEnvContent);
  console.log(`Copied .env to ${appEnvPath}`);
});

console.log('Environment variables synchronized across all applications.');
