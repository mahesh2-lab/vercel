import { createRequestHandler } from 'expo-server/adapter/vercel';
import path from 'path';

export default createRequestHandler({
  build: path.join(__dirname, '../dist/server'),
});