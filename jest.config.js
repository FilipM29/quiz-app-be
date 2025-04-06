module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  }
};
