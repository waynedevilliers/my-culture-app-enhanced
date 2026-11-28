import logger from './utils/logger.js';
import setupApp from './app.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = await setupApp();
  
  const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`, {
      port: PORT,
      url: process.env.URL,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        const { closeQueues } = await import('./utils/queueService.js');
        await closeQueues();
        logger.info('Message queues closed.');
      } catch (error) {
        logger.warn('Queue service not available during shutdown:', error.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Start the server if this file is run directly
if (import.meta.url.startsWith('file:') && process.argv[1] === import.meta.url.slice(7)) {
    startServer().catch(error => {
        logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

export { setupApp };