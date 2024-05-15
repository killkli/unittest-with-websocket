import { MyWebSocketServer, createMyWebSocketServer } from '../src/server';
import { WebSocketClient, createWebSocketClient } from '../src/client';
import WebSocket from 'ws';

describe('WebSocket Server and Client', () => {
  let server: MyWebSocketServer;
  let client: WebSocketClient;

  beforeAll(async () => {
    server = createMyWebSocketServer();
    await server.start(8080)
  });

  afterAll((done) => {
    const jobs = [server.close()];
    client.close().then(() => Promise.all(jobs).then(() => {
      console.log('all jobs done!')
      done();
    }))
  });

  it('should establish a WebSocket connection', (done) => {
    client = createWebSocketClient('ws://localhost:8080');

    client.socket.on('open', () => {
      expect(client.socket.readyState).toBe(WebSocket.OPEN);
      done();
    });
  });

  it('should send and receive messages', (done) => {
    const message = 'Hello, server!';

    client.socket.addEventListener('message', (event) => {
      expect(event.data).toBe(`Server received: ${message}`);
      done();
    });

    client.sendMessage(message);
  });
});
