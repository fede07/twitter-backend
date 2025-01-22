/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: false,           // Configure `ts-jest` directly here
      tsconfig: 'tsconfig.json', // Optional: Specify custom tsconfig file
      isolatedModules: true,    // Optional: Enable isolated transformations for better performance
    }],
  },
  collectCoverage: true,          // Collect test coverage
  coverageDirectory: 'coverage',  // Directory for coverage reports
};
