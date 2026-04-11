const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Kelvy CyberTech Hub Services...');

// Function to start a service
function startService(name, command, args = [], cwd = null) {
  console.log(`📦 Starting ${name}...`);

  const options = {
    detached: true,
    stdio: 'ignore',
    shell: true
  };

  if (cwd) {
    options.cwd = cwd;
  }

  const child = spawn(command, args, options);
  child.unref();

  return child;
}

// Start Supabase (if available)
try {
  startService('Supabase Local Database', 'supabase', ['start']);
  console.log('⏳ Waiting for Supabase to initialize...');
  // Wait 10 seconds for Supabase
  setTimeout(() => {
    console.log('✅ Supabase should be ready');
  }, 10000);
} catch (error) {
  console.log('⚠️  Supabase CLI not found - skipping database startup');
}

// Start Ollama
setTimeout(() => {
  startService('Ollama AI Server', 'ollama', ['serve']);
  console.log('⏳ Waiting for Ollama to initialize...');

  // Start backend services after Ollama
  setTimeout(() => {
    const backendDir = path.join(__dirname, '..', 'backend');

    // Start FastAPI Backend
    startService('FastAPI Backend', 'python', ['main.py'], backendDir);

    // Start Signaling Server
    const signalingDir = path.join(backendDir, 'websocket');
    startService('WebRTC Signaling Server', 'python', ['signaling.py'], signalingDir);

    console.log('✅ All backend services started!');
    console.log('🎉 Starting frontend...');
  }, 3000);
}, 2000);