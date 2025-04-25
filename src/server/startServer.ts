
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Ensure server directory exists
const serverDir = path.join(__dirname);
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

// Path to server.js (will be compiled from server.ts)
const serverPath = path.join(__dirname, 'server.js');

// Check if server file exists
if (!fs.existsSync(serverPath)) {
  console.error(`Server file not found at: ${serverPath}`);
  console.log('Current directory:', __dirname);
  console.log('Make sure the server.ts file is properly compiled');
  process.exit(1);
}

console.log(`Starting server from: ${serverPath}`);

// Start the server as a child process
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '3001' }
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log('Server started in the background');
