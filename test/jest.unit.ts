import config from './jest.shared'

export default {
  ...config,
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts']
}
