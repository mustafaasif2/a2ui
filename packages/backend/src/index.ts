import 'dotenv/config';
import { mastra } from './mastra';
import { createServer, startServer } from './server';

const app = createServer(mastra);
startServer(app);
