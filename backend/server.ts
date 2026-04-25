import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

import authRouter from './src/routers/authRouter';
import queryRouter from './src/routers/queryRouter';

const app = express();
const port = process.env.PORT || 3000;
const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get('/', (_req, res) => {
    res.json({ message: 'Query LLM API is running', status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/query', queryRouter);

const server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

function shutdown() {
    console.log('Received shutdown signal. Closing server...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forcefully shutting down...');
        process.exit(1);
    }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
