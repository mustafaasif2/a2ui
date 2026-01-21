import cors from 'cors';
import express, { Express } from 'express';

/**
 * Applies common middleware to the Express app
 */
export function applyMiddleware(app: Express): void {
  app.use(cors());
  app.use(express.json());
}
