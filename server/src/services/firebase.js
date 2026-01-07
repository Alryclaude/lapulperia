import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // For development, use default credentials or skip
  console.warn('Firebase service account not found. Some features may not work.');
}

export const verifyToken = async (token) => {
  try {
    if (!serviceAccount) {
      // Mock verification for development
      return { uid: 'dev-user', email: 'dev@test.com' };
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    if (!serviceAccount) {
      console.log('Push notification (dev):', { title, body, data });
      return;
    }

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data,
      webpush: {
        notification: {
          icon: '/icon-192.png',
          badge: '/badge.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
        },
      },
    };

    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default admin;
