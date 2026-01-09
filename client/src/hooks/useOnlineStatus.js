import { useState, useEffect } from 'react';

/**
 * Hook for tracking online/offline status
 * @returns {boolean} Whether the device is online
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

/**
 * Hook for tracking connection quality (experimental)
 * Uses the Network Information API where available
 */
export const useConnectionQuality = () => {
  const [connection, setConnection] = useState({
    effectiveType: '4g',
    downlink: null,
    rtt: null,
    saveData: false,
  });

  useEffect(() => {
    const updateConnection = () => {
      if ('connection' in navigator) {
        const conn = navigator.connection;
        setConnection({
          effectiveType: conn.effectiveType || '4g',
          downlink: conn.downlink || null,
          rtt: conn.rtt || null,
          saveData: conn.saveData || false,
        });
      }
    };

    updateConnection();

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateConnection);
      return () => {
        navigator.connection.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  return connection;
};

export default useOnlineStatus;
