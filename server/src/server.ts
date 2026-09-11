import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { setIo, setupSocketServer } from './socket';
import { startBackgroundJobs } from './jobs';
import prisma from './config/prisma';

async function bootstrap() {
  try {
    const app = createApp();
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          env.CLIENT_URL,
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173',
        ],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Save singleton instance and register event handlers
    setIo(io);
    setupSocketServer(io);

    // Start background scheduled jobs (overdue task checker)
    startBackgroundJobs();

    // Start HTTP & WebSocket Server
    const port = env.PORT || 5000;

    httpServer.listen(port, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Velozity ProjectHub Server running on port ${port}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🔌 WebSocket Server initialized`);
      logger.info(`⏰ Background jobs active`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(
        `${signal} received: closing HTTP and WebSocket server...`
      );

      httpServer.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        logger.info('Prisma disconnected.');
        process.exit(0);
      });

      // Force shutdown after 10s if graceful fails
      setTimeout(() => {
        logger.error(
          'Could not close connections in time, forcefully shutting down'
        );
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', { error });
    process.exit(1);
  }
}

bootstrap();