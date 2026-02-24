const redis = require('redis');
const config = require('../config');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      this.client = redis.createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
          reconnectStrategy: config.redis.retryStrategy
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error.message);
      // Don't throw - allow app to run without Redis
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  }

  async set(key, value, expiryInSeconds = null) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      if (expiryInSeconds) {
        await this.client.setEx(key, expiryInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  }

  async invalidateLeaderboardCache() {
    if (!this.isConnected || !this.client) return false;
    
    try {
      // Use SCAN instead of KEYS for non-blocking iteration
      const keysToDelete = [];
      let cursor = 0;
      
      do {
        const result = await this.client.scan(cursor, {
          MATCH: 'leaderboard:*',
          COUNT: 100
        });
        
        cursor = result.cursor;
        if (result.keys.length > 0) {
          keysToDelete.push(...result.keys);
        }
      } while (cursor !== 0);
      
      if (keysToDelete.length > 0) {
        await this.client.del(keysToDelete);
      }
      return true;
    } catch (error) {
      console.error('Redis cache invalidation error:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = RedisService;
