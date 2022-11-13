import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  testTimeout: 10000,
  transform: {
    '^.+\\.(ts|js)?$': [
      '@swc-node/jest',
      {
        jsc: {
          minify: false,
        },
      },
    ],
  },
}

module.exports = config
