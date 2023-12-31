import assert from "assert";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import "colors";

import { JsonFragment } from "@ethersproject/abi";
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { ContractFactory, Overrides } from "@ethersproject/contracts";

import { task, HardhatUserConfig, types, extendEnvironment } from "hardhat/config";
import { HardhatRuntimeEnvironment, NetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-ethers";

import { Decimal } from "@liquity/lib-base";

import { deployAndSetupContracts, deployTellorCaller, setSilent } from "./utils/deploy";
import { _connectToContracts, _LiquityDeploymentJSON, _priceFeedIsTestnet } from "./src/contracts";

import accounts from "./accounts.json";
import { getFolderInfo } from "./utils/fsScripts";
import { mkdir, writeFile } from "fs/promises";
import { ZERO_ADDRESS } from "./utils/constants";

interface IOracles {
  chainlink: string,
  tellor: string,
}

export interface IAssets {
  [eth: string]: IOracles,
  btc: IOracles,
}

export interface INetworkOracles {
  mainnet: IAssets,
  goerli: IAssets,
  sepolia: IAssets,
}

export interface IOracleReqs {
  led: string,
  uniV3Reader: string
}

export interface INetworkOracleReqs {
  sepolia: IOracleReqs
}

dotenv.config();

const numAccounts = 100;

const useLiveVersionEnv = (process.env.USE_LIVE_VERSION ?? "false").toLowerCase();
const useLiveVersion = !["false", "no", "0"].includes(useLiveVersionEnv);

const contractsDir = path.join("..", "contracts");
const artifacts = path.join(contractsDir, "artifacts");
const cache = path.join(contractsDir, "cache");

const contractsVersion = fs
  .readFileSync(path.join(useLiveVersion ? "live" : artifacts, "version"))
  .toString()
  .trim();

if (useLiveVersion) {
  console.log(`Using live version of contracts (${contractsVersion}).`.cyan);
}

const generateRandomAccounts = (numberOfAccounts: number) => {
  const accounts = new Array<string>(numberOfAccounts);

  for (let i = 0; i < numberOfAccounts; ++i) {
    accounts[i] = Wallet.createRandom().privateKey;
  }

  return accounts;
};

const deployerAccount = process.env.DEPLOYER_PRIVATE_KEY || Wallet.createRandom().privateKey;
const devChainRichAccount = "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7";
const infuraApiKey = process.env.INFURA_API_KEY;

// List of supported networks
export const chainIds = {
  arbitrum: 42161,
  "arbitrum-goerli": 421613,
  avalanche: 43114,
  "avalanche-fuji": 43113,
  bsc: 56,
  goerli: 5,
  sepolia: 11155111,
  hardhat: 31337,
  mainnet: 1,
  optimism: 10,
  "optimism-goerli": 420,
  "polygon-mainnet": 137,
  "polygon-mumbai": 80001,
  "zksync-goerli": 280,
  "zksync-mainnet": 324,
  "base-goerli": 84531,
};

const infuraNetwork = (name: string): { [name: string]: NetworkUserConfig } => ({
  [name]: {
    chainId: chainIds[name],
    url: `https://${name}.infura.io/v3/${infuraApiKey}`,
    accounts: [deployerAccount]
  }
});

// https://docs.chain.link/docs/ethereum-addresses
// https://docs.tellor.io/tellor/the-basics/contracts-reference

export const oracleAddresses: INetworkOracles = {
  mainnet: {
    btc: {
      chainlink: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      tellor: "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
    },
    eth: {
      chainlink: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      tellor: "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
    },
    thusd: {
      chainlink: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0", // TODO this is LUSD:USD address, should be replaced with thUSD
      tellor: "0x88dF592F8eb5D7Bd38bFeF7dEb0fBc02cf3778a0"
    }
  },
  goerli: {
    btc: {
      chainlink: "0xA39434A63A52E749F02807ae27335515BA4b07F7",
      tellor: "0x20374E579832859f180536A69093A126Db1c8aE9"
    },
    eth: {
      chainlink: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
      tellor: "0x20374E579832859f180536A69093A126Db1c8aE9" // Playground
    }
  },
  sepolia: {
    btc: {
      chainlink: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      tellor: "0x20374E579832859f180536A69093A126Db1c8aE9" // Wrong address
    },
    eth: {
      chainlink: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
      tellor: "0x20374E579832859f180536A69093A126Db1c8aE9" // Wrong address
    },
    usd: {
      chainlink: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // Just using ETH for now
      tellor: "0x20374E579832859f180536A69093A126Db1c8aE9" // Wrong address
    }
  }
};

export const oracleReqAddresses: INetworkOracleReqs = {
  sepolia: {
    led: "0x637Da92c06a9c1c9Fc0Ae3700aCe13fE8e1d74E7",
    uniV3Reader: "0x1780a629518ECC50ae25B99A02Aed0fcdEa1F56A"
  }
}

const hasOracles = (network: string): network is keyof typeof oracleAddresses =>
  network in oracleAddresses;

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: accounts.slice(0, numAccounts),

      gas: 12e6, // tx gas limit
      blockGasLimit: 12e6,

      // Let Ethers throw instead of Buidler EVM
      // This is closer to what will happen in production
      throwOnCallFailures: false,
      throwOnTransactionFailures: false
    },

    dev: {
      url: "http://localhost:8545",
      accounts: [deployerAccount, devChainRichAccount, ...generateRandomAccounts(numAccounts - 2)]
    },

    ...infuraNetwork("goerli"),
    ...infuraNetwork("sepolia"),
    ...infuraNetwork("mainnet")
  },

  paths: {
    artifacts,
    cache
  }
};

declare module "hardhat/types/runtime" {
  interface HardhatRuntimeEnvironment {
    deployLiquity: (
      deployer: Signer,
      oracleAddresses: INetworkOracles,
      collateralSymbol: (keyof IAssets),
      collateralAddress?: string,
      delay?: number,
      stablecoinAddress?: string,
      useRealPriceFeed?: boolean,
      overrides?: Overrides
    ) => Promise<_LiquityDeploymentJSON>;
  }
}

const getLiveArtifact = (name: string): { abi: JsonFragment[]; bytecode: string } =>
  require(`./live/${name}.json`);

const getContractFactory: (
  env: HardhatRuntimeEnvironment
) => (name: string, signer: Signer) => Promise<ContractFactory> = useLiveVersion
  ? env => (name, signer) => {
      const { abi, bytecode } = getLiveArtifact(name);
      return env.ethers.getContractFactory(abi, bytecode, signer);
    }
  : env => env.ethers.getContractFactory;

extendEnvironment(env => {
  env.deployLiquity = async (
    deployer,
    oracleAddresses,
    collateralSymbol = "tst",
    collateralAddress,
    delay = 90 * 24 * 60 * 60,
    stablecoinAddress = "",
    useRealPriceFeed = false,
    overrides?: Overrides
  ) => {
    const deployment = await deployAndSetupContracts(
      deployer,
      oracleAddresses,
      oracleReqAddresses,
      collateralSymbol,
      collateralAddress,
      getContractFactory(env),
      delay,
      stablecoinAddress,
      !useRealPriceFeed,
      env.network.name === "dev",
      overrides
    );

    return { ...deployment, version: contractsVersion };
  };
});

type DeployParams = {
  channel: string;
  collateralSymbol: string;
  collateralAddress: string;
  contractsVersion: string;
  delay: number;
  stablecoinAddress: string;
  gasPrice?: number;
  useRealPriceFeed?: boolean;
};

const defaultChannel = process.env.DEFAULT_CHANNEL || "default";
const defaultCollateralSymbol = process.env.DEFAULT_COLLATERAL_SYMBOL;
const defaultCollateralAddress = process.env.DEFAULT_COLLATERAL_ADDRESS;
const defaultVersion = process.env.DEFAULT_VERSION || "v1";
const defaultThusdAddress = process.env.DEFAULT_THUSD_ADDRESS || "";
const defaultDelay = process.env.DEFAULT_DELAY || 90 * 24 * 60 * 60;

task("deploy", "Deploys the contracts to the network")
  .addOptionalParam("channel", "Deployment channel to deploy into", defaultChannel, types.string)
  .addOptionalParam("collateralSymbol", "Asset symbol to use as collateral", defaultCollateralSymbol, types.string)
  .addOptionalParam("collateralAddress", "Asset address to use as collateral", defaultCollateralAddress, types.string)
  .addOptionalParam("contractsVersion", "Version of contracts for collateral type", defaultVersion, types.string)
  .addOptionalParam("gasPrice", "Price to pay for 1 gas [Gwei]", undefined, types.float)
  .addOptionalParam(
    "useRealPriceFeed",
    "Deploy the production version of PriceFeed and connect it to Chainlink",
    undefined,
    types.boolean
  )
  .addOptionalParam(
    "delay",
    "Governance time set to thUSD contract",
    defaultDelay,
    types.int
  )
  .addOptionalParam(
    "stablecoinAddress",
    "Address of existing stablecoin to add the new collateral to",
    defaultThusdAddress,
    types.string
  )
  .setAction(
    async ({ channel, collateralSymbol, collateralAddress, contractsVersion, delay, stablecoinAddress, gasPrice, useRealPriceFeed }: DeployParams, env) => {     
      const overrides = { gasPrice: gasPrice && Decimal.from(gasPrice).div(1000000000).hex };
      const [deployer] = await env.ethers.getSigners();
      console.log("DEPLOYER " + JSON.stringify(deployer));
      useRealPriceFeed ??= env.network.name === "mainnet";

      if (useRealPriceFeed && !hasOracles(env.network.name)) {
        throw new Error(`PriceFeed not supported on ${env.network.name}`);
      }

      console.log('network', env.network.name);
      console.log('collateralSymbol', collateralSymbol);
      console.log('collateralAddress', collateralAddress);
      console.log('version', contractsVersion);
      console.log('delay', delay);
      console.log('stablecoin address:', stablecoinAddress);
      console.log('gas price: ', gasPrice);
      setSilent(false);

      const deployment = await env
        .deployLiquity(
          deployer, 
          oracleAddresses, 
          collateralSymbol, 
          collateralAddress, 
          delay, 
          stablecoinAddress, 
          useRealPriceFeed, 
          overrides
        );

      if (useRealPriceFeed) {
        const contracts = _connectToContracts(deployer, deployment);

        assert(!_priceFeedIsTestnet(contracts.priceFeed));

        if (hasOracles(env.network.name)) {
          const tellorCallerAddress = await deployTellorCaller(
            deployer,
            getContractFactory(env),
            oracleAddresses[env.network.name][collateralSymbol as keyof IAssets].tellor,
            overrides
          );

          console.log(`Hooking up PriceFeed with oracles ...`);

          const tx = await contracts.priceFeed.setAddresses(
            oracleAddresses[env.network.name][collateralSymbol as keyof IAssets].chainlink,
            tellorCallerAddress,
            overrides
          );

          await tx.wait();
        }
      }
      const deploymentChannelPath = path.posix.join("deployments", channel);

      try {
        await mkdir(path.join("deployments", channel, collateralSymbol, contractsVersion), { recursive: true });
        await writeFile(
          path.join("deployments", channel, collateralSymbol, contractsVersion, `${env.network.name}.json`),
          JSON.stringify(deployment, undefined, 2),
          { flag: 'w+' } // add the flag option to overwrite the file if it exists
        );
      
        const folderInfo = await getFolderInfo(deploymentChannelPath);
      
        await mkdir(path.join("deployments", "collaterals"), { recursive: true });
        await writeFile(
          path.join("deployments", "collaterals", "collaterals.json"),
          JSON.stringify(folderInfo, null, 2),
          { flag: 'w+' } // add the flag option to overwrite the file if it exists
        );
      } catch (err) {
        console.error(err);
      }

      console.log();
      console.log(deployment);
      console.log();
    }
  );
  
task("pricefeedsetaddress", "Updates price feed with info from LED/markets and calculates new rate")
.addParam("pricefeedaddress", "Address of price feed contract")
.addParam("ledaddress", "Address of price feed contract")
.addParam("pidaddress", "Address of price feed contract")
.addParam("univ3readeraddress", "Address of the UniV3 Pool")
.setAction(async (taskargs, env) => {
  const factory = await env.ethers.getContractFactory(`PriceFeed`);
  const priceFeed = factory.attach(taskargs.pricefeedaddress);
  await priceFeed.setAddresses(
    taskargs.ledaddress, 
    taskargs.pidaddress, 
    taskargs.univ3readeraddress, 
    { gasLimit: 250000 }
  );
})
  
task("pricefeedsetuniv3pooladdress", "Updates price feed with info from LED/markets and calculates new rate")
.addParam("pricefeedaddress", "Address of price feed contract")
.addParam("univ3pooladdress", "Address of the UniV3 Pool")
.setAction(async (taskargs, env) => {
  const factory = await env.ethers.getContractFactory(`PriceFeed`);
  const priceFeed = factory.attach(taskargs.pricefeedaddress);
  await priceFeed.setUniV3PoolAddress(taskargs.univ3pooladdress, { gasLimit: 250000 });
})

task("updatepricefeed", "Updates price feed with info from LED/markets and calculates new rate")
  .addParam("pricefeedaddress", "Address of price feed contract")
  .setAction(async (taskargs, env) => {
    const factory = await env.ethers.getContractFactory(`PriceFeed`);
    const priceFeed = factory.attach(taskargs.pricefeedaddress);
    await priceFeed.updateAll({ gasLimit: 1250000 });
    await priceFeed.fetchPrice({ gasLimit: 250000 });
  })

task("getpricefeedattrs", "Prints out deployed price feed attributes")
  .addParam("pricefeedaddress", "Address of price feed contract")
  .setAction(async (taskargs, env) => {
    const factory = await env.ethers.getContractFactory(`PriceFeed`);
    const priceFeed = factory.attach(taskargs.pricefeedaddress);

    console.log("Deviation factor: ")
    console.log(await priceFeed.deviationFactor());

    console.log("Redemption rate: ")
    console.log(await priceFeed.redemptionRate());

    console.log("LED price: ")
    console.log(await priceFeed.LEDPrice());

    console.log("LED oracle: ")
    console.log(await priceFeed.led());

    console.log("PI Calculator: ")
    console.log(await priceFeed.pidCalculator());

    console.log("uniV3PoolAddress: ")
    console.log(await priceFeed.uniV3PoolAddress());

    console.log("uniV3Reader: ")
    console.log(await priceFeed.uniV3Reader());

    console.log("lastGoodPrice: ")
    console.log(await priceFeed.lastGoodPrice());
  })
export default config;
