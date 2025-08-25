import { logger } from '@infrastructure/logging/logger.js';
import type { DBConfig } from '@infrastructure/mongo/db.config.entity.js';
import mongoose from 'mongoose';

export class Database {
  private static instance: Database;

  public static async initializeDatabase(dbConfig: DBConfig): Promise<void> {
    if (!Database.instance) {
      const db = new Database();
      await db.connect(dbConfig.uri);
      Database.instance = db;
    }
  }

  private async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      logger.info('[Database] Successfully connected to MongoDB.');
    } catch (error) {
      logger.error(`MongoDB connection error: ${error}`);
      throw error; // This is a critical error, it should kill the process
    }
  }
}
