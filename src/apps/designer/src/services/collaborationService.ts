/**
 * Collaboration Service
 * WebSocket/CRDT sync for real-time collaboration
 */

import type { Project } from '../state/types';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface CollaborationService {
  connect: (roomId: string, userId: string, userName: string) => Promise<void>;
  disconnect: () => void;
  sendChange: (change: any) => void;
  onUserJoin: (callback: (user: CollaborationUser) => void) => void;
  onUserLeave: (callback: (userId: string) => void) => void;
  onChange: (callback: (change: any) => void) => void;
  getUsers: () => CollaborationUser[];
  isConnected: () => boolean;
}

class CollaborationServiceImpl implements CollaborationService {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private users: CollaborationUser[] = [];
  private onUserJoinCallbacks: Array<(user: CollaborationUser) => void> = [];
  private onUserLeaveCallbacks: Array<(userId: string) => void> = [];
  private onChangeCallbacks: Array<(change: any) => void> = [];

  async connect(roomId: string, userId: string, userName: string): Promise<void> {
    // In a real implementation, this would connect to a WebSocket server
    // For now, this is a placeholder that simulates connection
    this.roomId = roomId;
    this.userId = userId;

    // Simulate connection (in production, use actual WebSocket)
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: userId,
          name: userName,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };
        this.users.push(user);
        this.onUserJoinCallbacks.forEach((cb) => cb(user));
        resolve();
      }, 100);
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.userId) {
      this.onUserLeaveCallbacks.forEach((cb) => cb(this.userId as string));
    }
    this.roomId = null;
    this.userId = null;
    this.users = [];
  }

  sendChange(change: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'change',
        roomId: this.roomId,
        userId: this.userId,
        change,
      }));
    } else {
      this.onChangeCallbacks.forEach((cb) => cb(change));
    }
  }

  onUserJoin(callback: (user: CollaborationUser) => void): void {
    this.onUserJoinCallbacks.push(callback);
  }

  onUserLeave(callback: (userId: string) => void): void {
    this.onUserLeaveCallbacks.push(callback);
  }

  onChange(callback: (change: any) => void): void {
    this.onChangeCallbacks.push(callback);
  }

  getUsers(): CollaborationUser[] {
    return [...this.users];
  }

  isConnected(): boolean {
    return this.roomId !== null && this.userId !== null;
  }
}

// Singleton instance
let collaborationInstance: CollaborationService | null = null;

export const getCollaborationService = (): CollaborationService => {
  if (!collaborationInstance) {
    collaborationInstance = new CollaborationServiceImpl();
  }
  return collaborationInstance;
};
