import { Server as HttpServer, createServer } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';

export interface MyWebSocketServer  {
  server: HttpServer;
  wss: WebSocketServer;
  start: (port: number) => Promise<HttpServer>;
  close: () => Promise<void>;
};

export const createMyWebSocketServer = (): MyWebSocketServer => {
  let server: HttpServer;
  let wss: WebSocketServer;

  server = createServer((_req, res) => res.end());

  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected');

    ws.on('message', (message: string) => {
      console.log('Received message:', message);
      ws.send(`Server received: ${message}`);
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  const start = (port: number): Promise<HttpServer> =>
    new Promise((resolve) => server.listen(port, () => resolve(server)));

  const close = (): Promise<void> =>
    new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        }
        console.log('server closed');
        wss.close((_err) => {
          resolve();
        });
      });
    });

  return { server, wss, start, close };
};

