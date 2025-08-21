import { logger } from '@infrastructure/logging/logger.js';
import type { DBConfig } from '@infrastructure/mongo/db.config.entity.js';
import mongoose from 'mongoose';

export class db {
  private static instance: db;

  private constructor(dbConfig: DBConfig) {
    this.connect(dbConfig.uri);
  }

  public static initializeDatabase(dbConfig: DBConfig): void {
    if (!db.instance) {
      db.instance = new db(dbConfig);
    }
  }

  private async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      logger.info(`MongoDB ready at ${uri}`);
    } catch (error) {
      logger.error(`MongoDB connection error: ${error}`);
      throw error; // This is a critical error, it should kill the process
    }
  }
}
