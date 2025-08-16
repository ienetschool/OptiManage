module.exports = {
  apps: [{
    name: 'optistore-production',
    script: 'tsx',
    args: 'server/index.ts',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    env: {
      NODE_ENV: 'production',
      PORT: 8080,
      DATABASE_URL: 'mysql://ledbpt_optie:g79h94LAP@5.181.218.15:3306/opticpro'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
