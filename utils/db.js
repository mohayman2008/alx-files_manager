import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 27017;
    const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';

    const URL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

    this.client = MongoClient(URL, { useUnifiedTopology: true });
    this.client.connect();
    this.db = this.client.db();
    this.users = this.db.collection('users');
    this.files = this.db.collection('files');

    this.client.on('error', (err) => console.log(err.message || err.toString()));

    // console.log(Object.keys(this.db.__proto__));
    // console.log(Object.keys(this.db.collection().__proto__));
  }

  async isAliveAsync() {
    if (this.client.isConnected()) {
      return true;
    }
    await this.db.admin().ping();
    return this.client.isConnected();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async userExists(email) {
    if (await this.users.findOne({ email })) {
      return true;
    }
    return false;
  }
}

const dbClient = new DBClient();
export default dbClient;
