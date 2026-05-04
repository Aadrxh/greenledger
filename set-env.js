const fs = require('fs');
const path = require('path');

const envFile = `export const environment = {
  production: true,
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID}"
  },
  encryptionKey: "${process.env.ENC_KEY || 'GreenLedger2025'}"
};
`;

const targetPath = path.join(__dirname, './src/environments/environment.ts');

// Ensure the directory exists
const dir = path.dirname(targetPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(targetPath, envFile);
console.log('-----------------------------------------');
console.log(`Environment file generated at ${targetPath}`);
console.log('Using API Key: ' + (process.env.FIREBASE_API_KEY ? 'FOUND' : 'NOT FOUND'));
console.log('-----------------------------------------');
