const mockAdmin = {
  auth: () => ({
    verifyIdToken: jest.fn().mockImplementation((token: string) => {
      // Handle mock tokens for testing
      if (token.startsWith('mock-token-')) {
        const firebaseId = token.replace('mock-token-', '');
        return Promise.resolve({ uid: firebaseId });
      }

      // Handle invalid tokens
      if (token === 'invalid-token') {
        return Promise.reject(new Error('Invalid token'));
      }

      // Default rejection for any other token
      return Promise.reject(new Error('Token verification failed'));
    })
  }),

  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn()
  },
  apps: [] as unknown[] // Mock empty apps array
};

export default mockAdmin;
export const admin = mockAdmin;
