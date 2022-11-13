require('dotenv/config')

const ARCHIVE_NODE_ENDPOINT = process.env.ARCHIVE_NODE_ENDPOINT
const FORK_BLOCK_NUMBER = process.env.FORK_BLOCK_NUMBER

if (!ARCHIVE_NODE_ENDPOINT) {
  throw new Error('ARCHIVE_NODE_ENDPOINT env variable required')
}

if (!FORK_BLOCK_NUMBER) {
  throw new Error('FORK_BLOCK_NUMBER env variable required')
}

const config = {
  networks: {
    hardhat: {
      forking: {
        url: ARCHIVE_NODE_ENDPOINT,
        blockNumber: parseInt(FORK_BLOCK_NUMBER),
      },
      chainId: 100,
      loggingEnabled: false,
    },
  },
};

module.exports = config