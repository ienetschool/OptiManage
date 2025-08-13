// Production entry point for OptiStore Pro
// This file is required for deployment platforms that expect app.js
const path = require('path');

console.log('🚀 OptiStore Pro - Medical Practice Management System');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Port:', process.env.PORT || '3000');

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Import and start the TypeScript server
const startServer = async () => {
  try {
    // Import the ES module using dynamic import
    const { default: server } = await import('./dist/index.js');
    console.log('✅ Server started successfully');
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    // Fallback: try to run with tsx directly
    console.log('🔄 Attempting fallback startup with tsx...');
    const { spawn } = require('child_process');
    
    const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000'
      }
    });
    
    serverProcess.on('error', (err) => {
      console.error('❌ Fallback startup failed:', err);
      process.exit(1);
    });
  }
};

startServer();