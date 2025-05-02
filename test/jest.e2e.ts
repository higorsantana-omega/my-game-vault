import config from './jest.shared'

export default {
  ...config,
  testMatch: ['<rootDir>/test/e2e/**/*.spec.ts']
}
