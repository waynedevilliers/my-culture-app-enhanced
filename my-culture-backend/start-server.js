#!/usr/bin/env node
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const killPort = require('kill-port');

const defaultPort = 3000;
const fallbackPort = 3001;

async function startServer() {
  console.log('🔍 Checking for existing processes...');
  
  try {
    // Try to kill any existing process on default port
    await killPort(defaultPort);
    console.log(`✅ Cleared port ${defaultPort}`);
  } catch (error) {
    // Port was likely not in use, which is fine
  }

  try {
    // Try to kill any existing process on fallback port  
    await killPort(fallbackPort);
    console.log(`✅ Cleared port ${fallbackPort}`);
  } catch (error) {
    // Port was likely not in use, which is fine
  }

  // Start the server with the default port first
  console.log(`🚀 Starting server on port ${defaultPort}...`);
  
  const serverProcess = spawn('node', ['--watch', '--env-file=.env', 'index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: defaultPort }
  });

  // Handle server process events
  serverProcess.on('error', async (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`❌ Port ${defaultPort} is still in use, trying port ${fallbackPort}...`);
      
      // Try the fallback port
      const fallbackProcess = spawn('node', ['--watch', '--env-file=.env', 'index.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: fallbackPort }
      });
      
      fallbackProcess.on('error', (fallbackError) => {
        console.error('❌ Failed to start server on both ports:', fallbackError);
        process.exit(1);
      });
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
}

startServer().catch(console.error);