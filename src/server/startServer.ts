
import { spawn } from 'child_process';
import path from 'path';

// Path to server.js (will be compiled from server.ts)
const serverPath = path.join(__dirname, 'server.js');

// Start the server as a child process
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  shell: true
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
