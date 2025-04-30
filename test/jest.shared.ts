export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  }
}
