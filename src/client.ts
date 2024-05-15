import WebSocket from 'ws';

export interface WebSocketClient {
  url: string;
  socket: WebSocket;
  sendMessage: (message: string) => void;
  close: () => Promise<void>;
}

export const createWebSocketClient = (url: string): WebSocketClient => {
  const socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  socket.onmessage = (event) => {
    console.log('Received message from server:', event.data);
  };

  const sendMessage = (message: string): void => {
    socket.send(message);
  };

  const close = (): Promise<void> => {
    return new Promise((resolve) => {
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        resolve();
      };
      socket.close();
    });
  };

  return { url, socket, sendMessage, close };
};

