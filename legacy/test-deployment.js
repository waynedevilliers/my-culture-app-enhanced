#!/usr/bin/env node

const axios = require('axios');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Test configuration
const LOCAL_BACKEND_PORT = 3000;
const LOCAL_BACKEND_URL = `http://localhost:${LOCAL_BACKEND_PORT}`;

let BACKEND_URL = '';
let FRONTEND_URL = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(url, description) {
  try {
    console.log(`🧪 Testing: ${description}`);
    const response = await axios.get(url, { timeout: 10000 });
    console.log(`✅ ${description}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ ${description}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
    return { success: false, status: error.response?.status, error: error.message };
  }
}

async function testLocalBackend() {
  console.log('\n🔧 TESTING LOCAL BACKEND\n');
  
  // Test basic endpoints
  await testEndpoint(`${LOCAL_BACKEND_URL}/health`, 'Health endpoint');
  await testEndpoint(`${LOCAL_BACKEND_URL}/api/auth/login`, 'Auth endpoint (should not be 404)');
  
  // Test API availability
  const apiTest = await testEndpoint(`${LOCAL_BACKEND_URL}/api/auth/login`, 'API routes loaded');
  if (apiTest.success && apiTest.status !== 404) {
    console.log('✅ API routes are loading (not 404)');
  } else {
    console.log('❌ API routes returning 404 - routes not loaded properly');
    return false;
  }
  
  return true;
}

async function deployBackend() {
  console.log('\n🚀 DEPLOYING BACKEND\n');
  
  return new Promise((resolve) => {
    const deploy = spawn('npx', ['vercel', '--prod'], { 
      cwd: './my-culture-backend',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    deploy.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (text.includes('https://my-culture-backend-')) {
        const match = text.match(/https:\/\/my-culture-backend-[a-z0-9]+-[a-z0-9-]+\.vercel\.app/);
        if (match) {
          BACKEND_URL = match[0];
          console.log(`📡 Backend deployed: ${BACKEND_URL}`);
        }
      }
    });
    
    deploy.on('close', (code) => {
      if (code === 0 && BACKEND_URL) {
        resolve(true);
      } else {
        console.log('❌ Backend deployment failed');
        resolve(false);
      }
    });
  });
}

async function testDeployedBackend() {
  console.log('\n🌐 TESTING DEPLOYED BACKEND\n');
  
  // Wait for deployment to be ready
  console.log('⏳ Waiting for backend to be ready...');
  await sleep(10000);
  
  const health = await testEndpoint(`${BACKEND_URL}/health`, 'Deployed backend health');
  if (!health.success) {
    return false;
  }
  
  const api = await testEndpoint(`${BACKEND_URL}/api/auth/login`, 'Deployed backend API');
  if (api.status === 404) {
    console.log('❌ API routes not working on deployed backend');
    return false;
  }
  
  console.log('✅ Backend deployment successful and API routes working');
  return true;
}

async function updateFrontendEnv() {
  console.log('\n📝 UPDATING FRONTEND ENV\n');
  
  // Update local .env
  fs.writeFileSync('./my-culture-frontend/.env', `VITE_BACKEND=${BACKEND_URL}`);
  console.log(`✅ Updated local .env with: ${BACKEND_URL}`);
  
  // Update Vercel env
  return new Promise((resolve) => {
    exec(`echo "y" | npx vercel env rm VITE_BACKEND production`, { cwd: './my-culture-frontend' }, (error) => {
      exec(`echo "${BACKEND_URL}" | npx vercel env add VITE_BACKEND production`, { cwd: './my-culture-frontend' }, (error) => {
        if (error) {
          console.log('❌ Failed to update Vercel env');
          resolve(false);
        } else {
          console.log('✅ Updated Vercel environment variable');
          resolve(true);
        }
      });
    });
  });
}

async function deployFrontend() {
  console.log('\n🎨 DEPLOYING FRONTEND\n');
  
  return new Promise((resolve) => {
    const deploy = spawn('npx', ['vercel', '--prod'], { 
      cwd: './my-culture-frontend',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    deploy.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (text.includes('https://my-culture-frontend-')) {
        const match = text.match(/https:\/\/my-culture-frontend-[a-z0-9]+-[a-z0-9-]+\.vercel\.app/);
        if (match) {
          FRONTEND_URL = match[0];
          console.log(`🎨 Frontend deployed: ${FRONTEND_URL}`);
        }
      }
    });
    
    deploy.on('close', (code) => {
      if (code === 0 && FRONTEND_URL) {
        resolve(true);
      } else {
        console.log('❌ Frontend deployment failed');
        resolve(false);
      }
    });
  });
}

async function testFullDeployment() {
  console.log('\n🎯 TESTING FULL DEPLOYMENT\n');
  
  // Wait for frontend to be ready
  await sleep(5000);
  
  const frontend = await testEndpoint(FRONTEND_URL, 'Frontend deployed');
  
  console.log('\n📋 DEPLOYMENT SUMMARY\n');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  
  console.log('\n✅ NEXT STEPS:');
  console.log(`1. Test login at: ${FRONTEND_URL}`);
  console.log(`2. Backend API at: ${BACKEND_URL}/api/auth/login`);
  console.log(`3. Health check: ${BACKEND_URL}/health`);
  
  return true;
}

async function main() {
  console.log('🚀 DEPLOYMENT TEST SCRIPT STARTING\n');
  
  try {
    // Step 1: Test local backend
    const localOk = await testLocalBackend();
    if (!localOk) {
      console.log('❌ Local backend tests failed. Fix issues before deploying.');
      process.exit(1);
    }
    
    // Step 2: Deploy backend
    const backendDeployed = await deployBackend();
    if (!backendDeployed) {
      console.log('❌ Backend deployment failed');
      process.exit(1);
    }
    
    // Step 3: Test deployed backend
    const backendOk = await testDeployedBackend();
    if (!backendOk) {
      console.log('❌ Deployed backend tests failed');
      process.exit(1);
    }
    
    // Step 4: Update frontend environment
    const envUpdated = await updateFrontendEnv();
    if (!envUpdated) {
      console.log('❌ Failed to update frontend environment');
      process.exit(1);
    }
    
    // Step 5: Deploy frontend
    const frontendDeployed = await deployFrontend();
    if (!frontendDeployed) {
      console.log('❌ Frontend deployment failed');
      process.exit(1);
    }
    
    // Step 6: Final tests
    await testFullDeployment();
    
    console.log('\n🎉 ALL TESTS PASSED - DEPLOYMENT COMPLETE! 🎉');
    
  } catch (error) {
    console.error('💥 Deployment test failed:', error.message);
    process.exit(1);
  }
}

main();