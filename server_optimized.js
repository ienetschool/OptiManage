// Memory-optimized production configuration
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Set memory limits
if (process.env.NODE_ENV === 'production') {
  // Limit memory usage
  process.env.NODE_OPTIONS = '--max-old-space-size=512';
}
