import admin from 'firebase-admin';

// Initialize Firebase Admin
// Support both FIREBASE_SERVICE_ACCOUNT (full JSON) and individual env vars
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (firebaseInitialized) return true;

  try {
    // Option 1: Full service account JSON
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('Firebase initialized with service account JSON');
      return true;
    }

    // Option 2: Individual environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Private key comes with escaped newlines from env vars
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      console.log('Firebase initialized with individual env vars');
      return true;
    }

    console.error('Firebase credentials not configured! Authentication will NOT work.');
    return false;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

// Initialize on module load
initializeFirebase();

export const verifyToken = async (token) => {
  if (!firebaseInitialized) {
    console.error('Firebase not initialized - cannot verify token');
    throw new Error('Firebase authentication not configured');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!firebaseInitialized) {
      console.log('Push notification skipped (Firebase not initialized):', { title, body, data });
      return;
    }

    // Convertir todos los valores de data a strings (requerido por FCM)
    const stringData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    );

    // Agregar click_url si hay orderId
    if (data.orderId) {
      stringData.click_url = `/order/${data.orderId}`;
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: stringData,
      // Android: Prioridad alta para despertar el Service Worker
      android: {
        priority: 'high',
        notification: {
          channelId: 'orders',
          priority: 'high',
          sound: 'default',
        },
      },
      // iOS: Configuración para notificaciones en background
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
          },
        },
        headers: {
          'apns-priority': '10',
        },
      },
      // Web Push: Configuración completa para PWA
      webpush: {
        notification: {
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
        },
        fcmOptions: {
          link: data.orderId ? `/order/${data.orderId}` : '/',
        },
        headers: {
          Urgency: 'high',
        },
      },
    };

    await admin.messaging().send(message);
    console.log(`[NOTIF] Push sent: "${title}" to token ${token.substring(0, 20)}...`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default admin;
