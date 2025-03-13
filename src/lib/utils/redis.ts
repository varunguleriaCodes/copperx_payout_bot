import { createClient, type RedisClientType } from 'redis';

export class RedisTokenService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private readonly FIVE_DAY_SECONDS = 5 * 24 * 60 * 60;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.setupConnection();
  }

  private async setupConnection() {
    try {
      this.client.on('error', (err) => {
        console.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('Connected to Redis successfully');
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Save a bearer token with 1 week expiration
   */
  async saveToken(userId: number, token: string): Promise<boolean> {
    if (!this.isConnected) {
      await this.setupConnection();
    }

    try {
      // Store token with automatic expiration
      await this.client.set(`token:${userId}`, token, {
        EX: this.FIVE_DAY_SECONDS
      });
      
      return true;
    } catch (error) {
      console.error('Error saving token to Redis:', error);
      return false;
    }
  }

  /**
   * Retrieve a bearer token if it exists
   */
  async getToken(userId: number): Promise<string | null> {
    if (!this.isConnected) {
      await this.setupConnection();
    }

    try {
      const token = await this.client.get(`token:${userId}`);
      return token;
    } catch (error) {
      console.error('Error getting token from Redis:', error);
      return null;
    }
  }

  /**
   * Delete a bearer token
   */
  async deleteToken(userId: number): Promise<boolean> {
    if (!this.isConnected) {
      await this.setupConnection();
    }

    try {
      await this.client.del(`token:${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting token from Redis:', error);
      return false;
    }
  }

  /**
   * Check if token exists and will expire soon (within 24 hours)
   */
  async isTokenExpiringSoon(userId: number): Promise<boolean> {
    if (!this.isConnected) {
      await this.setupConnection();
    }

    try {
      // Get time to live in seconds
      const ttl = await this.client.ttl(`token:${userId}`);
      
      // Check if token exists and will expire in less than 24 hours
      const ONE_DAY_SECONDS = 24 * 60 * 60;
      return ttl > 0 && ttl < ONE_DAY_SECONDS;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }

  /**
   * Refresh token expiration time (extend for another week)
   */
  async refreshTokenExpiration(userId: number): Promise<boolean> {
    if (!this.isConnected) {
      await this.setupConnection();
    }

    try {
      // Get the current token
      const token = await this.getToken(userId);
      
      if (!token) {
        return false;
      }
      
      // Reset expiration to one week
      await this.client.expire(`token:${userId}`, this.FIVE_DAY_SECONDS);
      return true;
    } catch (error) {
      console.error('Error refreshing token expiration:', error);
      return false;
    }
  }

  /**
   * Gracefully close Redis connection
   */
  async close() {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create a singleton instance
export const tokenService = new RedisTokenService();
