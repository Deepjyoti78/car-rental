import { PrismaClient } from '@prisma/client';
import net from 'net';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Database Connection Circuit Breaker & Health Probe
let cachedDbStatus: boolean | null = null;
let lastCheckTime = 0;
const DB_CHECK_TTL = 15000; // 15 seconds

export async function isDatabaseOnline(): Promise<boolean> {
  const now = Date.now();
  if (cachedDbStatus !== null && now - lastCheckTime < DB_CHECK_TTL) {
    return cachedDbStatus;
  }

  return new Promise((resolve) => {
    let resolved = false;
    const socket = net.createConnection({ host: 'localhost', port: 5433, timeout: 200 }, () => {
      if (!resolved) {
        resolved = true;
        cachedDbStatus = true;
        lastCheckTime = Date.now();
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        cachedDbStatus = false;
        lastCheckTime = Date.now();
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        cachedDbStatus = false;
        lastCheckTime = Date.now();
        socket.destroy();
        resolve(false);
      }
    });
  });
}
