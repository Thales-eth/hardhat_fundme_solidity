require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("@nomiclabs/hardhat-ethers")
require("@typechain/hardhat")
require('hardhat-deploy');

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/VK5LCEj2dSxYTkCvQF88bVhsVrY8dMOJ"
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      { version: "0.8.7" }, { version: "0.6.6" }
    ]
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    }
  },
  mocha: {
    timeout: 100000000
  },
};

