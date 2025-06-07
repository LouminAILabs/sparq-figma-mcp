/**
 * WebSocket Mock Utilities
 * Provides comprehensive WebSocket mocking for testing
 */

import { mock } from 'bun:test';

export interface MockWebSocket {
  send: ReturnType<typeof mock>;
  close: ReturnType<typeof mock>;
  addEventListener: ReturnType<typeof mock>;
  removeEventListener: ReturnType<typeof mock>;
  readyState: number;
  url?: string;
  protocol?: string;
  onopen?: ((event: Event) => void) | null;
  onclose?: ((event: CloseEvent) => void) | null;
  onmessage?: ((event: MessageEvent) => void) | null;
  onerror?: ((event: Event) => void) | null;
}

export class MockWebSocketServer {
  private clients: MockWebSocket[] = [];
  private channels: Map<string, Set<MockWebSocket>> = new Map();

  createClient(url?: string): MockWebSocket {
    const mockClient: MockWebSocket = {
      send: mock(),
      close: mock(),
      addEventListener: mock(),
      removeEventListener: mock(),
      readyState: 1, // OPEN
      url,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    };

    this.clients.push(mockClient);
    return mockClient;
  }

  simulateMessage(client: MockWebSocket, data: any) {
    if (client.onmessage) {
      const event = {
        data: typeof data === 'string' ? data : JSON.stringify(data),
        type: 'message',
      } as MessageEvent;
      client.onmessage(event);
    }
  }

  simulateConnection(client: MockWebSocket) {
    if (client.onopen) {
      const event = new Event('open');
      client.onopen(event);
    }
  }

  simulateClose(client: MockWebSocket, code = 1000, reason = '') {
    client.readyState = 3; // CLOSED
    if (client.onclose) {
      const event = {
        code,
        reason,
        wasClean: code === 1000,
        type: 'close',
      } as CloseEvent;
      client.onclose(event);
    }
  }

  simulateError(client: MockWebSocket, error?: Error) {
    if (client.onerror) {
      const event = Object.assign(new Event('error'), { error });
      client.onerror(event);
    }
  }

  joinChannel(client: MockWebSocket, channelName: string) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Set());
    }
    this.channels.get(channelName)!.add(client);
  }

  leaveChannel(client: MockWebSocket, channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.delete(client);
      if (channel.size === 0) {
        this.channels.delete(channelName);
      }
    }
  }

  broadcastToChannel(channelName: string, message: any) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.forEach(client => {
        this.simulateMessage(client, message);
      });
    }
  }

  getChannelClients(channelName: string): MockWebSocket[] {
    const channel = this.channels.get(channelName);
    return channel ? Array.from(channel) : [];
  }

  reset() {
    this.clients = [];
    this.channels.clear();
  }

  getClients(): MockWebSocket[] {
    return [...this.clients];
  }
}

// Global mock server instance for tests
export const mockWebSocketServer = new MockWebSocketServer();

// Mock WebSocket constructor
export const MockWebSocketConstructor = mock((url: string, protocols?: string | string[]) => {
  return mockWebSocketServer.createClient(url);
});

// Helper function to create MCP protocol messages
export const createMCPMessage = (type: string, data: any, id?: string) => ({
  jsonrpc: '2.0',
  id: id || Date.now().toString(),
  method: type,
  params: data,
});

// Helper function to create MCP response messages
export const createMCPResponse = (id: string, result: any, error?: any) => ({
  jsonrpc: '2.0',
  id,
  ...(error ? { error } : { result }),
});

export default {
  MockWebSocketServer,
  mockWebSocketServer,
  MockWebSocketConstructor,
  createMCPMessage,
  createMCPResponse,
}; 