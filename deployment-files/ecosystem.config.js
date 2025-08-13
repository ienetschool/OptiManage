module.exports = {
  apps: [{
    name: 'optistore-pro',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DATABASE_URL: 'postgresql://optistore_admin:your_secure_password@localhost:5432/optistore_prod'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }],

  deploy: {
    production: {
      user: 'optistore',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo',
      path: '/var/www/optistore-pro',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};