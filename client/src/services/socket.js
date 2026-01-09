import { io } from 'socket.io-client';
import { queryClient } from '../lib/queryClient';

// Strip /api from the URL since Socket.IO connects to root
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, '');

/**
 * Socket.IO service singleton
 * Manages real-time connection and event handling
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to the Socket.IO server
   * @param {string} userId - User ID to join their room for notifications
   */
  connect(userId = null) {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected');
      return;
    }

    console.log('[Socket] Connecting to:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners(userId);
  }

  /**
   * Setup core event listeners
   */
  setupEventListeners(userId) {
    // Connection events
    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('[Socket] Connected:', this.socket.id);

      // Join user-specific room for targeted notifications
      if (userId) {
        this.socket.emit('join', userId);
        console.log('[Socket] Joined room:', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error('[Socket] Connection error:', error.message);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('[Socket] Max reconnection attempts reached');
      }
    });

    // Business events
    this.socket.on('pulperia-status-changed', (data) => {
      console.log('[Socket] Pulperia status changed:', data);

      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['pulperias'] });
      queryClient.invalidateQueries({ queryKey: ['pulperia', data.pulperiaId] });

      // Notify subscribers
      this.notifyListeners('pulperia-status-changed', data);
    });

    this.socket.on('new-order', (data) => {
      console.log('[Socket] New order received:', data);

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      this.notifyListeners('new-order', data);
    });

    this.socket.on('order-updated', (data) => {
      console.log('[Socket] Order updated:', data);

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });

      this.notifyListeners('order-updated', data);
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('[Socket] Manually disconnected');
    }
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[Socket] Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Join a specific room
   * @param {string} roomId - Room ID to join
   */
  joinRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('join', roomId);
      console.log('[Socket] Joined room:', roomId);
    }
  }

  /**
   * Leave a specific room
   * @param {string} roomId - Room ID to leave
   */
  leaveRoom(roomId) {
    if (this.socket?.connected) {
      this.socket.emit('leave', roomId);
      console.log('[Socket] Left room:', roomId);
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
