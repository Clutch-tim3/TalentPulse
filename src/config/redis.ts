import Redis from 'ioredis';

let _client: Redis | null = null;
let _available = false;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  try {
    _client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 500, 2000);
      },
    });
    _client.on('ready', () => {
      _available = true;
      console.log('[redis] Connected');
    });
    _client.on('error', (err) => {
      _available = false;
      console.warn('[redis] Error:', err.message);
    });
    _client.on('end', () => {
      _available = false;
    });
  } catch (err: any) {
    console.warn('[redis] Failed to create client:', err.message);
  }
} else {
  console.log('[redis] No REDIS_URL — running without cache');
}

// Resilient wrapper — never throws, returns safe defaults when Redis is absent
const redis = {
  async get(key: string): Promise<string | null> {
    if (!_client || !_available) return null;
    try { return await _client.get(key); } catch { return null; }
  },

  async set(key: string, value: string, expiryMode?: 'EX' | 'PX', time?: number): Promise<void> {
    if (!_client || !_available) return;
    try {
      if (expiryMode === 'EX' && time != null) {
        await _client.setex(key, time, value);
      } else if (expiryMode === 'PX' && time != null) {
        await _client.psetex(key, time, value);
      } else {
        await _client.set(key, value);
      }
    } catch { /* ignore */ }
  },

  async del(key: string): Promise<void> {
    if (!_client || !_available) return;
    try { await _client.del(key); } catch { /* ignore */ }
  },

  async ping(): Promise<string> {
    if (!_client || !_available) throw new Error('Redis not available');
    return _client.ping();
  },

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!_client || !_available) return [];
    try { return await _client.lrange(key, start, stop); } catch { return []; }
  },

  async rpush(key: string, ...values: string[]): Promise<void> {
    if (!_client || !_available) return;
    try { await _client.rpush(key, ...values); } catch { /* ignore */ }
  },

  async expire(key: string, seconds: number): Promise<void> {
    if (!_client || !_available) return;
    try { await _client.expire(key, seconds); } catch { /* ignore */ }
  },

  isAvailable: () => _available && _client !== null,
};

export default redis;
