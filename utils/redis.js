import { promisify } from 'util';
import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.connected = true;
    this.client.on('error', (err) => console.log(err.message || err.toString()));
    // console.log(Object.entries(this.client));
    // console.log(Object.getPrototypeOf(this.client));

    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  async isAliveAsync() {
    return new Promise((resolve) => {
      this.client.ping(() => {
        resolve(this.client.connected);
      });
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    this.client.set(key, value, 'EX', duration);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
