import admin from 'firebase-admin';

// Validate required Firebase environment variables
const requiredFirebaseVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
};

// Check for missing environment variables (skip in test environment)
const missingVars = Object.entries(requiredFirebaseVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all Firebase variables are set.\n' +
      'See .env.example for the required format.'
  );
}

// Initialize Firebase Admin SDK (skip in test environment with mocks)
if (!admin.apps.length && process.env.NODE_ENV !== 'test') {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: requiredFirebaseVars.FIREBASE_PROJECT_ID,
        clientEmail: requiredFirebaseVars.FIREBASE_CLIENT_EMAIL,
        privateKey: requiredFirebaseVars.FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        )
      }),
      projectId: requiredFirebaseVars.FIREBASE_PROJECT_ID
    });
  } catch (error) {
    throw new Error(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        'Please verify your Firebase service account credentials are correct.\n' +
        'You can get these from Firebase Console → Project Settings → Service Accounts'
    );
  }
}

export { admin };
