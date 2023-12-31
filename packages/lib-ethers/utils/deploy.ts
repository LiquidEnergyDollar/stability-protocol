import { Signer } from "@ethersproject/abstract-signer";
import { ContractTransaction, ContractFactory, Overrides } from "@ethersproject/contracts";
import { IAssets, INetworkOracleReqs, INetworkOracles } from "../hardhat.config";
import {
  _LiquityContractAddresses,
  _LiquityContracts,
  _LiquityDeploymentJSON,
  _connectToContracts
} from "../src/contracts";

let silent = true;

export const log = (...args: unknown[]): void => {
  if (!silent) {
    console.log(...args);
  }
};

export const setSilent = (s: boolean): void => {
  silent = s;
};

const deployContractAndGetBlockNumber = async (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  contractName: string,
  ...args: unknown[]
): Promise<[address: string, blockNumber: number]> => {
  log(`Deploying ${contractName} ...`);
  const contract = await (await getContractFactory(contractName, deployer)).deploy(...args);

  log(`Waiting for transaction ${contract.deployTransaction.hash} ...`);
  const receipt = await contract.deployTransaction.wait();

  log({
    contractAddress: contract.address,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toNumber()
  });

  log();

  return [contract.address, receipt.blockNumber];
};

const deployContract: (
  ...p: Parameters<typeof deployContractAndGetBlockNumber>
) => Promise<string> = (...p) => deployContractAndGetBlockNumber(...p).then(([a]) => a);

const deployContracts = async (
  deployer: Signer,
  oracleAddresses: INetworkOracles,
  collateralSymbol: keyof IAssets,
  collateralAddress: string | undefined,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  delay: number,
  stablecoinAddress: string,
  priceFeedIsTestnet = false,
  overrides?: Overrides
): Promise<[addresses: _LiquityContractAddresses, startBlock: number]> => {
  const [activePoolAddress, startBlock] = await deployContractAndGetBlockNumber(
    deployer,
    getContractFactory,
    "ActivePool",
    { ...overrides }
  );

  const piCalculator = await deployContract(
    deployer,
    getContractFactory,
    "PIScaledPerSecondCalculator",
    // These are taken from the production RAI deployment
    // Strings are used for BigNum conversion
    "2664026470344",                                  // Kp * 12
    "197304",                                         // Ki * 12
    "999999711200000000000000000",                    // perSecondCumulativeLeak
    "3600",                                           // integralPeriodSize
    "1000000000000000000",                            // noiseBarrier
    "1000000000000000000000000000000000000000000000", // feedbackOutputUpperBound
    "-999999999999999999999999999",                   // feedbackOutputLowerBound
    [0,0,0,0,0]                                       // importedState (start empty)
  );

  const addresses = {
    activePool: activePoolAddress,
    borrowerOperations: await deployContract(deployer, getContractFactory, "BorrowerOperations", {
      ...overrides
    }),
    troveManager: await deployContract(deployer, getContractFactory, "TroveManager", {
      ...overrides
    }),
    collSurplusPool: await deployContract(deployer, getContractFactory, "CollSurplusPool", {
      ...overrides
    }),
    defaultPool: await deployContract(deployer, getContractFactory, "DefaultPool", { ...overrides }),
    hintHelpers: await deployContract(deployer, getContractFactory, "HintHelpers", { ...overrides }),
    pcv: `0x0000000000000000000000000000000000000000`,
    priceFeed: await deployContract(
      deployer,
      getContractFactory,
      priceFeedIsTestnet ? "PriceFeedTestnet" : "PriceFeed",
      { ...overrides }
    ),
    sortedTroves: await deployContract(deployer, getContractFactory, "SortedTroves", {
      ...overrides
    }),
    stabilityPool: await deployContract(deployer, getContractFactory, "StabilityPool", {
      ...overrides
    }),
    bLens: await deployContract(deployer, getContractFactory, "BLens", {
      ...overrides
    }),
    gasPool: await deployContract(deployer, getContractFactory, "GasPool", {
      ...overrides
    }),
    erc20: (collateralAddress !== undefined) 
    ? collateralAddress
    : await deployContract(deployer, getContractFactory, "ERC20Test", {
      ...overrides
    })
  };

  const chainlink = `0x0000000000000000000000000000000000000000`
  // const chainlink = (priceFeedIsTestnet === false)
  //   ? oracleAddresses["mainnet"][collateralSymbol as keyof IAssets]
  //   : await deployContract(
  //       deployer,
  //       getContractFactory,
  //       "ChainlinkTestnet",
  //       addresses.priceFeed,
  //       { ...overrides }
  //     )

  const thusdToken = (stablecoinAddress != "") ? stablecoinAddress : await deployContract(
    deployer,
    getContractFactory,
    "THUSDToken",
    addresses.troveManager,
    addresses.stabilityPool,
    addresses.borrowerOperations,
    delay,
    { ...overrides }
  );

  const bamm = `0x0000000000000000000000000000000000000000`;
  // const bamm = await deployContract(
  //   deployer, 
  //   getContractFactory, 
  //   "BAMM",
  //   chainlink,
  //   addresses.stabilityPool,
  //   thusdToken,
  //   addresses.erc20,
  //   { ...overrides }
  // );


  return [
    {
      ...addresses,
      bamm: bamm,
      thusdToken: thusdToken,
      chainlink: chainlink as string,
      piCalculator: piCalculator,
      multiTroveGetter: await deployContract(
        deployer,
        getContractFactory,
        "MultiTroveGetter",
        addresses.troveManager,
        addresses.sortedTroves,
        { ...overrides }
      )
    },
    startBlock
  ];
};

export const deployTellorCaller = (
  deployer: Signer,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  tellorAddress: string,
  overrides?: Overrides
): Promise<string> =>
  deployContract(deployer, getContractFactory, "TellorCaller", tellorAddress, { ...overrides });

const connectContracts = async (
  {
    activePool,
    borrowerOperations,
    troveManager,
    thusdToken,
    collSurplusPool,
    defaultPool,
    hintHelpers,
    pcv,
    priceFeed,
    sortedTroves,
    stabilityPool,
    bamm,
    bLens,
    chainlink,
    gasPool,
    erc20,
    piCalculator
  }: _LiquityContracts,
  oracleReqAddresses: INetworkOracleReqs,
  deployer: Signer,
  overrides?: Overrides
) => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }

  overrides!.gasLimit = 600000;

  const txCount = await deployer.provider.getTransactionCount(deployer.getAddress());

  const connections: ((nonce: number) => Promise<ContractTransaction>)[] = [
    nonce =>
      sortedTroves.setParams(1e6, troveManager.address, borrowerOperations.address, {
        ...overrides,
        nonce
      }),

    nonce =>
      piCalculator.setSeedProposer(
        priceFeed.address,
        { ...overrides, nonce }
        ),

    nonce =>
      troveManager.setAddresses(
        borrowerOperations.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        priceFeed.address,
        thusdToken.address,
        sortedTroves.address,
        pcv.address,
        { ...overrides, nonce }
      ),

    nonce =>
      borrowerOperations.setAddresses(
        troveManager.address,
        activePool.address,
        defaultPool.address,
        stabilityPool.address,
        gasPool.address,
        collSurplusPool.address,
        priceFeed.address,
        sortedTroves.address,
        thusdToken.address,
        pcv.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      stabilityPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        thusdToken.address,
        sortedTroves.address,
        priceFeed.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      activePool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        stabilityPool.address,
        defaultPool.address,
        collSurplusPool.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      defaultPool.setAddresses(troveManager.address, activePool.address, erc20.address, {
        ...overrides,
        nonce
      }),

    nonce =>
      collSurplusPool.setAddresses(
        borrowerOperations.address,
        troveManager.address,
        activePool.address,
        erc20.address,
        { ...overrides, nonce }
      ),

    nonce =>
      hintHelpers.setAddresses(sortedTroves.address, troveManager.address, {
        ...overrides,
        nonce
      }),

    // nonce =>
    //   pcv.setAddresses(
    //     thusdToken.address,
    //     borrowerOperations.address,
    //     bamm.address,
    //     erc20.address,
    //     { ...overrides, nonce }
    //   )

    nonce =>
      priceFeed.setAddresses(
        oracleReqAddresses.sepolia.led,
        piCalculator.address,
        oracleReqAddresses.sepolia.uniV3Reader,
        {...overrides, nonce}
      )
  ];

  const txs = await Promise.all(connections.map((connect, i) => connect(txCount + i)));

  let i = 0;
  await Promise.all(txs.map(tx => tx.wait().then(() => log(`Connected ${++i}`))));
};

export const deployAndSetupContracts = async (
  deployer: Signer,
  oracleAddresses: INetworkOracles,
  oracleReqAddresses: INetworkOracleReqs,
  collateralSymbol: keyof IAssets,
  collateralAddress: string | undefined,
  getContractFactory: (name: string, signer: Signer) => Promise<ContractFactory>,
  delay: number,
  stablecoinAddress: string,
  _priceFeedIsTestnet = false,
  _isDev = true,
  overrides?: Overrides
): Promise<_LiquityDeploymentJSON> => {
  if (!deployer.provider) {
    throw new Error("Signer must have a provider.");
  }

  log("Deploying contracts...");
  log();

  _priceFeedIsTestnet = false;

  const deployment: _LiquityDeploymentJSON = {
    chainId: await deployer.getChainId(),
    version: "unknown",
    deploymentDate: new Date().getTime(),
    _priceFeedIsTestnet,
    _isDev,

    ...(await deployContracts(deployer, oracleAddresses, collateralSymbol, collateralAddress, getContractFactory, delay, stablecoinAddress, _priceFeedIsTestnet, overrides).then(
      async ([addresses, startBlock]) => ({
        startBlock,

        addresses: {
          ...addresses
        }
      })
    ))
  };

  const contracts = _connectToContracts(deployer, deployment);

  log("Connecting contracts...");
  await connectContracts(contracts, oracleReqAddresses, deployer, overrides);

  return {
    ...deployment
  };
};
