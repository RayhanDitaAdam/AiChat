/**
 * PM2 Ecosystem Config — AiChat Production
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 install pm2-logrotate
 *   pm2 set pm2-logrotate:max_size 10M
 *   pm2 set pm2-logrotate:retain 5
 */
module.exports = {
    apps: [
        {
            name: 'aichat-backend',
            cwd: './backend',
            script: 'src/main.js',
            instances: 2,              // Cluster mode: 2 workers for load balancing
            exec_mode: 'cluster',
            max_memory_restart: '500M', // Auto-restart if RAM > 500MB (memory leak guard)

            // Environment
            env: {
                NODE_ENV: 'development',
                PORT: 4000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 4000,
            },

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,

            // Restart policy
            restart_delay: 3000,       // Wait 3s before restarting on crash
            max_restarts: 10,          // Give up after 10 consecutive fails
            min_uptime: '10s',         // Must stay up 10s to count as stable

            // Watch (disable in production for performance)
            watch: false,
        },
    ],
};
