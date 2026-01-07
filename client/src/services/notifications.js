// Notification Service for Push Notifications and Sounds

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

let messaging = null;

// Initialize Firebase Cloud Messaging
export const initializeMessaging = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Notifications not supported');
    return null;
  }

  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

// Request notification permission
export const requestPermission = async () => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

// Get FCM token for push notifications
export const getFCMToken = async () => {
  if (!messaging) {
    await initializeMessaging();
  }

  if (!messaging) return null;

  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
    callback(payload);
  });
};

// Play notification sound
export const playNotificationSound = (type = 'default') => {
  const sounds = {
    default: '/sounds/notification.mp3',
    order: '/sounds/order.mp3',
    success: '/sounds/success.mp3',
    achievement: '/sounds/achievement.mp3',
  };

  const audio = new Audio(sounds[type] || sounds.default);
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Autoplay blocked, ignore
  });
};

// Vibrate device
export const vibrate = (pattern = [200, 100, 200]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Show local notification
export const showLocalNotification = async (title, options = {}) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notification = new Notification(title, {
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    if (options.onClick) options.onClick();
    notification.close();
  };

  return notification;
};

// Show notification with sound and vibration
export const showNotificationWithEffects = async (title, options = {}) => {
  const { soundType = 'default', vibratePattern = [200, 100, 200], ...notifOptions } = options;

  // Play sound
  playNotificationSound(soundType);

  // Vibrate
  vibrate(vibratePattern);

  // Show notification
  return showLocalNotification(title, notifOptions);
};

// Notification templates for common scenarios
export const notifications = {
  newOrder: (orderNumber, pulperiaName) => ({
    title: 'Nuevo Pedido!',
    body: `Pedido #${orderNumber} recibido`,
    soundType: 'order',
    vibratePattern: [200, 100, 200, 100, 200],
    tag: 'new-order',
  }),

  orderAccepted: (orderNumber) => ({
    title: 'Pedido Aceptado',
    body: `Tu pedido #${orderNumber} ha sido aceptado`,
    soundType: 'success',
    tag: 'order-update',
  }),

  orderReady: (orderNumber, pulperiaName) => ({
    title: 'Pedido Listo!',
    body: `Tu pedido #${orderNumber} esta listo para recoger en ${pulperiaName}`,
    soundType: 'success',
    vibratePattern: [100, 50, 100, 50, 100],
    tag: 'order-ready',
  }),

  productAvailable: (productName, pulperiaName) => ({
    title: 'Producto Disponible!',
    body: `${productName} ya esta disponible en ${pulperiaName}`,
    soundType: 'default',
    tag: 'product-available',
  }),

  achievement: (achievementName) => ({
    title: 'Logro Desbloqueado!',
    body: achievementName,
    soundType: 'achievement',
    vibratePattern: [100, 50, 100, 50, 200],
    tag: 'achievement',
  }),

  favoriteOpen: (pulperiaName) => ({
    title: `${pulperiaName} abrio!`,
    body: 'Tu pulperia favorita esta abierta ahora',
    soundType: 'default',
    tag: 'favorite-open',
  }),
};

export default {
  initializeMessaging,
  requestPermission,
  getFCMToken,
  onForegroundMessage,
  playNotificationSound,
  vibrate,
  showLocalNotification,
  showNotificationWithEffects,
  notifications,
};
