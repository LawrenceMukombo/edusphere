// EduSphere SMIS — Database Client Singleton with Resilient Multi-Port Resolution
import { PrismaClient } from '@prisma/client';
import net from 'net';

/**
 * Resilient Database Connection Resolver:
 * Ensures the system never fails if localhost:5434 (docker default) is offline
 * while native PostgreSQL is active on port 5432.
 */
function getResilientDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) {
    return 'postgresql://nwuchas_app:289qoGgD3YXOZVMdCiayEfNRFSsjKwp1@localhost:5432/nwuchas_cmis?schema=public';
  }

  // If local development targets port 5434, ensure direct connectivity and start proxy fallback
  if (
    process.env.NODE_ENV !== 'production' &&
    envUrl.includes(':5434/') &&
    (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))
  ) {
    // Start background TCP proxy on 5434 -> 5432 so any query hitting 5434 directly also succeeds
    try {
      const server = net.createServer((client) => {
        const upstream = net.connect(5432, '127.0.0.1');
        client.pipe(upstream).pipe(client);
        client.on('error', () => upstream.destroy());
        upstream.on('error', () => client.destroy());
      });
      server.on('error', () => {
        // Port 5434 already bound by Docker or another instance, proceed normally
      });
      server.listen(5434, '127.0.0.1', () => {
        server.unref();
      });
    } catch {}

    // Directly connect to port 5432 for instant response without proxy overhead
    return envUrl.replace(':5434/', ':5432/');
  }

  return envUrl;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getResilientDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

