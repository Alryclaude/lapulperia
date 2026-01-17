// Notification Service for Push Notifications and Sounds

import { getMessaging, getToken } from 'firebase/messaging';
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

// Generate synthetic notification tones using Web Audio API
const generateTone = (type = 'default') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different tones for different notification types
    const toneConfigs = {
      default: { freq: 440, duration: 0.15, pattern: [1] },
      order: { freq: 523, duration: 0.12, pattern: [1, 0.8, 1] }, // C5 - rising attention
      success: { freq: 659, duration: 0.1, pattern: [1, 1.2] }, // E5 - positive
      achievement: { freq: 784, duration: 0.1, pattern: [1, 1.25, 1.5] }, // G5 - celebratory
    };

    const config = toneConfigs[type] || toneConfigs.default;

    oscillator.type = 'sine';
    oscillator.frequency.value = config.freq;
    gainNode.gain.value = 0.3;

    oscillator.start(audioContext.currentTime);

    // Play pattern of notes
    let time = audioContext.currentTime;
    config.pattern.forEach((multiplier, i) => {
      oscillator.frequency.setValueAtTime(config.freq * multiplier, time);
      time += config.duration;
    });

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, time);
    oscillator.stop(time + 0.05);

    // Cleanup
    setTimeout(() => audioContext.close(), (time - audioContext.currentTime + 0.1) * 1000);

    return true;
  } catch (error) {
    console.warn('Web Audio API not available:', error);
    return false;
  }
};

// Play notification sound (with fallback to synthetic tones)
export const playNotificationSound = (type = 'default') => {
  const sounds = {
    default: '/sounds/notification.mp3',
    order: '/sounds/order.mp3',
    success: '/sounds/success.mp3',
    achievement: '/sounds/achievement.mp3',
  };

  const audio = new Audio(sounds[type] || sounds.default);
  audio.volume = 0.5;

  // Try to play the file, fallback to synthetic tone
  audio.play().catch(() => {
    // File doesn't exist or autoplay blocked - use synthetic tone
    generateTone(type);
  });

  // Also handle file not found
  audio.onerror = () => {
    generateTone(type);
  };
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
  playNotificationSound,
  vibrate,
  showLocalNotification,
  showNotificationWithEffects,
  notifications,
};
