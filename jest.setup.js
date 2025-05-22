require('dotenv').config();

jest.mock('firebase-admin');
jest.mock('firebase-admin/app');
jest.setMock('firebase-admin/auth', {
  getAuth: () => {
    return {
      verifyIdToken: jest.fn((data) => Promise.resolve({ uid: data }))
    };
  },
});
