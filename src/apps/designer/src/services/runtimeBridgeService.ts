import type { Project } from '../state/types';

export interface RuntimeBridgeService {
  connect: (url: string) => Promise<void>;
  disconnect: () => void;
  sendSnapshot: (project: Project) => void;
  onMessage: (callback: (payload: any) => void) => void;
  isConnected: () => boolean;
}

class RuntimeBridgeServiceImpl implements RuntimeBridgeService {
  private ws: WebSocket | null = null;
  private messageCallbacks: Array<(payload: any) => void> = [];

  async connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        this.ws.onopen = () => resolve();
        this.ws.onerror = () => reject(new Error('Failed to connect runtime bridge.'));
        this.ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            this.messageCallbacks.forEach((cb) => cb(payload));
          } catch {
            this.messageCallbacks.forEach((cb) => cb(event.data));
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendSnapshot(project: Project): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'snapshot', payload: project }));
    }
  }

  onMessage(callback: (payload: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

let runtimeBridgeInstance: RuntimeBridgeService | null = null;

export const getRuntimeBridgeService = (): RuntimeBridgeService => {
  if (!runtimeBridgeInstance) {
    runtimeBridgeInstance = new RuntimeBridgeServiceImpl();
  }
  return runtimeBridgeInstance;
};
