import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@portfolio/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@portfolio/i18n/(.*)$': '<rootDir>/../../packages/i18n/$1',
    '^@portfolio/content/(.*)$': '<rootDir>/../../packages/content/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

export default createJestConfig(config);
