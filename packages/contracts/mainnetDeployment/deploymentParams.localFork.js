const externalAddrs  = {
  // https://data.chain.link/eth-usd
  CHAINLINK_ETHUSD_PROXY: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  // https://docs.tellor.io/tellor/integration/reference-page
  TELLOR_MASTER:"0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0",
  // https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
  WETH_ERC20: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
}

const liquityAddrs = {
  DEPLOYER: "0x31c57298578f7508B5982062cfEc5ec8BD346247" // hardhat first account
}

const OUTPUT_FILE = './mainnetDeployment/localForkDeploymentOutput.json'

const waitFunction = async () => {
  // Fast forward time 1000s (local mainnet fork only)
  ethers.provider.send("evm_increaseTime", [1000])
  ethers.provider.send("evm_mine")
}

const GAS_PRICE = 1000
const TX_CONFIRMATIONS = 1 // for local fork test

module.exports = {
  externalAddrs,
  liquityAddrs,
  OUTPUT_FILE,
  waitFunction,
  GAS_PRICE,
  TX_CONFIRMATIONS,
};
