const { usePlugin } = require('@nomiclabs/buidler/config')
const hooks = require('./scripts/buidler-hooks')

usePlugin('@aragon/buidler-aragon')
usePlugin('@nomiclabs/buidler-solhint')
usePlugin('buidler-gas-reporter')
usePlugin('solidity-coverage')

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: "explain tackle mirror kit van hammer degree position ginger unfair soup bonus"
      }
    },
    coverage: {
      url: 'http://localhost:8555',
    },
    // Network configured to interact with Frame wallet. Requires
    // to have Frame running on your machine. Download it from:
    // https://frame.sh
    frame: {
      httpHeaders: { origin: 'buidler' },
      url: 'http://localhost:1248',
    },
  },
  solc: {
    version: '0.4.24',
    optimizer: {
      enabled: true,
      runs: 10000,
    },
  },
  gasReporter: {
    enabled: process.env.GAS_REPORTER ? true : false,
  },
  aragon: {
    appServePort: 3001,
    clientServePort: 3000,
    appSrcPath: 'app/',
    appBuildOutputPath: 'dist/',
    hooks,
  },
}
