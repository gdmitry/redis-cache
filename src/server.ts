import { createApp } from './app';
import { prisma } from './prisma';

export function startServer(port = Number(process.env.PORT) || 3000) {
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });

  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  });

  return server;
}
