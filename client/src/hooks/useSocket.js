import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useAuthStore } from '../stores/authStore';

/**
 * Main socket connection hook
 * Automatically connects when user is authenticated
 */
export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(socketService.isConnected);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketService.connect(user.id);
      setIsConnected(true);
    }

    // Update connection status when socket connects/disconnects
    const checkConnection = setInterval(() => {
      setIsConnected(socketService.isConnected);
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      // Don't disconnect on unmount - keep connection alive for the session
    };
  }, [isAuthenticated, user?.id]);

  return {
    isConnected,
    socketService,
    getStatus: () => socketService.getStatus(),
  };
};

/**
 * Hook to subscribe to pulperia status changes
 * @param {function} callback - Called when a pulperia changes status
 */
export const usePulperiaStatusUpdates = (callback) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!memoizedCallback) return;

    const unsubscribe = socketService.subscribe(
      'pulperia-status-changed',
      memoizedCallback
    );

    return unsubscribe;
  }, [memoizedCallback]);
};

/**
 * Hook to subscribe to new order notifications (for pulperia owners)
 * @param {function} callback - Called when a new order is received
 */
export const useNewOrders = (callback) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!memoizedCallback) return;

    const unsubscribe = socketService.subscribe('new-order', memoizedCallback);

    return unsubscribe;
  }, [memoizedCallback]);
};

/**
 * Hook to subscribe to order updates (for customers)
 * @param {function} callback - Called when an order is updated
 */
export const useOrderUpdates = (callback) => {
  const memoizedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!memoizedCallback) return;

    const unsubscribe = socketService.subscribe('order-updated', memoizedCallback);

    return unsubscribe;
  }, [memoizedCallback]);
};

export default useSocket;
