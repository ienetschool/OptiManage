// Production entry point for OptiStore Pro
// ES Module version for compatibility with package.json "type": "module"
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 OptiStore Pro - Medical Practice Management System');
console.log('📊 Environment:', process.env.NODE_ENV || 'production');
console.log('🌐 Port:', process.env.PORT || '8080');

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Import and start the server
const startServer = async () => {
  try {
    // First try to import the built version
    console.log('🔄 Attempting to start with built version...');
    const serverModule = await import('./dist/index.js');
    console.log('✅ Server started successfully with built version');
  } catch (error) {
    console.error('❌ Built version failed:', error.message);
    
    // Fallback: try to run with tsx directly
    console.log('🔄 Attempting fallback startup with tsx...');
    const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '8080'
      }
    });
    
    serverProcess.on('error', (err) => {
      console.error('❌ Fallback startup failed:', err);
      process.exit(1);
    });
    
    console.log('✅ Server started with tsx fallback');
  }
};

startServer();