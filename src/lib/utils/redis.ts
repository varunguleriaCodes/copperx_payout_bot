import { createClient, type RedisClientType } from 'redis';

import { CONFIG } from '../../config';
export class RedisTokenService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private readonly FIVE_DAY_SECONDS = 5 * 24 * 60 * 60;

  constructor() {
    this.client = createClient({
        url: typeof CONFIG.redis_url === 'string'? CONFIG.redis_url : CONFIG.redis_url?.output || 'redis://localhost:6379',
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
   * Gracefully close Redis connection
   */
  async close() {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const tokenService = new RedisTokenService();
