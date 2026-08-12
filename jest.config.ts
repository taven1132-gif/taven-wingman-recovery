import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: 'tsconfig.json',
      useESM: false,
    }],
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
  transformIgnorePatterns: ['/node_modules/(?!zustand)'],
}
export default config
