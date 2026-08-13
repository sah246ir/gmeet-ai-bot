import 'dotenv/config';
import http from 'node:http';
import { createApp } from './http/app.js';
import { attachWebSocketServer } from './ws/server.js';
import './queue/transcribe-chunker/transcribeChunker.worker.js';
import { ENV } from './lib/ENV.js';
import { TranscribeManager as TM } from './services/transcribe-manager/transcribeManager.js';

const app = createApp();
export const TranscribeManager = new TM()

const server = http.createServer(app);
attachWebSocketServer(server);

const port = Number(ENV.port ?? 3000);
server.listen(port, () => console.log(`sgmeet-bot listening on :${port}`));

const shutdown = async () => {
    console.log("Shutting down...");

    await TranscribeManager.stopAll();

    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
