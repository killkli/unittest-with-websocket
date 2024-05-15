import { MyWebSocketServer, createMyWebSocketServer } from '../src/server';
import { WebSocketClient, createWebSocketClient } from '../src/client';
import WebSocket from 'ws';

describe('WebSocket Server and Client', () => {
  let server: MyWebSocketServer;
  let clients: WebSocketClient[];
  const CONCURRENT_SIZE = 100;

  beforeAll(async () => {
    server = createMyWebSocketServer();
    clients = [];
    await server.start(8080)
  });

  afterAll((done) => {
    const jobs = [server.close()];
    Promise.all(clients.map(client => client.close())).then(() => {
      Promise.all(jobs).then(() => {
        done()
      });
    });
  });

  it('should establish a WebSocket connection', (done) => {
    const jobs: Promise<any>[] = [];
    for (let i = 0; i < CONCURRENT_SIZE; i++) {
      const client = createWebSocketClient('ws://localhost:8080');

      jobs.push(new Promise((resolve) => {
        client.socket.on('open', () => {
          expect(client.socket.readyState).toBe(WebSocket.OPEN);
          resolve(true)
        });
        clients.push(client)
      }))
    }
    Promise.all(jobs).then(res => {
      expect(res.length).toBe(CONCURRENT_SIZE);
      expect(res.every(v => v)).toBe(true);
      done()
    })
  }, 15000);

  it('should send and receive messages', (done) => {
    const message = 'Hello, server!';
    const jobs: Promise<any>[] = [];
    clients.forEach((client) => {
      jobs.push(new Promise((resolve) => {
        client.socket.addEventListener('message', (event) => {
          expect(event.data).toBe(`Server received: ${message}`);
          resolve(true)
        });
        client.sendMessage(message);
      }));
    });
    Promise.all(jobs).then(res => {
      expect(res.length).toBe(CONCURRENT_SIZE);
      expect(res.every(v => v)).toBe(true);
      done()
    })
  }, 15000);
});
