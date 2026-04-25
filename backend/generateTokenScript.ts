import * as dotenv from 'dotenv';
import { generateAuthToken } from './src/helpers/token';

dotenv.config();

// CLI helper — prints a demo JWT to stdout.
// Usage: npx ts-node generateTokenScript.ts
const token = generateAuthToken({ sub: 'husqvarna', role: 'USER' });
console.log(token);