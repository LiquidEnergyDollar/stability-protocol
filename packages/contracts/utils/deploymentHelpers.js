const SortedTroves = artifacts.require("./SortedTroves.sol")
const TroveManager = artifacts.require("./TroveManager.sol")
const PriceFeedTestnet = artifacts.require("./PriceFeedTestnet.sol")
const LUSDToken = artifacts.require("./LUSDToken.sol")
const ActivePool = artifacts.require("./ActivePool.sol");
const DefaultPool = artifacts.require("./DefaultPool.sol");
const StabilityPool = artifacts.require("./StabilityPool.sol")
const GasPool = artifacts.require("./GasPool.sol")
const CollSurplusPool = artifacts.require("./CollSurplusPool.sol")
const FunctionCaller = artifacts.require("./TestContracts/FunctionCaller.sol")
const BorrowerOperations = artifacts.require("./BorrowerOperations.sol")
const HintHelpers = artifacts.require("./HintHelpers.sol")

const PCV = artifacts.require("./PCV.sol")

const StabilityPoolTester = artifacts.require("./StabilityPoolTester.sol")
const ActivePoolTester = artifacts.require("./ActivePoolTester.sol")
const DefaultPoolTester = artifacts.require("./DefaultPoolTester.sol")
const LiquityMathTester = artifacts.require("./LiquityMathTester.sol")
const BorrowerOperationsTester = artifacts.require("./BorrowerOperationsTester.sol")
const TroveManagerTester = artifacts.require("./TroveManagerTester.sol")
const LUSDTokenTester = artifacts.require("./LUSDTokenTester.sol")
const ERC20Test = artifacts.require("./ERC20Test.sol")

// Proxy scripts
const BorrowerOperationsScript = artifacts.require('BorrowerOperationsScript')
const BorrowerWrappersScript = artifacts.require('BorrowerWrappersScript')
const TroveManagerScript = artifacts.require('TroveManagerScript')
const StabilityPoolScript = artifacts.require('StabilityPoolScript')
const TokenScript = artifacts.require('TokenScript')
const PCVScript = artifacts.require('PCVScript')
const {
  buildUserProxies,
  BorrowerOperationsProxy,
  BorrowerWrappersProxy,
  TroveManagerProxy,
  StabilityPoolProxy,
  SortedTrovesProxy,
  TokenProxy,
  PCVProxy
} = require('../utils/proxyHelpers.js')

/*
 * "Liquity core" consists of all contracts in the core Liquity system.
 */

const ZERO_ADDRESS = '0x' + '0'.repeat(40)
const maxBytes32 = '0x' + 'f'.repeat(64)

class DeploymentHelper {

  static async deployLiquityCore(accounts) {
    const cmdLineArgs = process.argv
    const frameworkPath = cmdLineArgs[1]
    // console.log(`Framework used:  ${frameworkPath}`)

    if (frameworkPath.includes("hardhat")) {
      return this.deployLiquityCoreHardhat(accounts)
    } else if (frameworkPath.includes("truffle")) {
      return this.deployLiquityCoreTruffle(accounts)
    }
  }

  static async deployLQTYContracts() {
    const cmdLineArgs = process.argv
    const frameworkPath = cmdLineArgs[1]
    // console.log(`Framework used:  ${frameworkPath}`)

    if (frameworkPath.includes("hardhat")) {
      return this.deployLQTYContractsHardhat()
    } else if (frameworkPath.includes("truffle")) {
      return this.deployLQTYContractsTruffle()
    }
  }

  static async deployLiquityCoreHardhat(accounts) {
    const priceFeedTestnet = await PriceFeedTestnet.new()
    const sortedTroves = await SortedTroves.new()
    const troveManager = await TroveManager.new()
    const activePool = await ActivePool.new()
    const stabilityPool = await StabilityPool.new()
    const erc20 = await ERC20Test.new()
    const gasPool = await GasPool.new()
    const defaultPool = await DefaultPool.new()
    const collSurplusPool = await CollSurplusPool.new()
    const functionCaller = await FunctionCaller.new()
    const borrowerOperations = await BorrowerOperations.new()
    const hintHelpers = await HintHelpers.new()
    const lusdToken = await LUSDToken.new(
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    )

    LUSDToken.setAsDeployed(lusdToken)
    DefaultPool.setAsDeployed(defaultPool)
    PriceFeedTestnet.setAsDeployed(priceFeedTestnet)
    SortedTroves.setAsDeployed(sortedTroves)
    TroveManager.setAsDeployed(troveManager)
    ActivePool.setAsDeployed(activePool)
    StabilityPool.setAsDeployed(stabilityPool)
    ERC20Test.setAsDeployed(erc20)
    GasPool.setAsDeployed(gasPool)
    CollSurplusPool.setAsDeployed(collSurplusPool)
    FunctionCaller.setAsDeployed(functionCaller)
    BorrowerOperations.setAsDeployed(borrowerOperations)
    HintHelpers.setAsDeployed(hintHelpers)

    let index = 0;
    for (const account of accounts) {
      await erc20.mint(account, await web3.eth.getBalance(account))
      index++;

      if (index >= 50)
        break;
    }

    const coreContracts = {
      priceFeedTestnet,
      lusdToken,
      sortedTroves,
      troveManager,
      activePool,
      stabilityPool,
      erc20,
      gasPool,
      defaultPool,
      collSurplusPool,
      functionCaller,
      borrowerOperations,
      hintHelpers,
    }
    return coreContracts
  }

  static async deployTesterContractsHardhat(accounts) {
    const testerContracts = {}

    // Contract without testers (yet)
    testerContracts.erc20 = await ERC20Test.new()
    testerContracts.priceFeedTestnet = await PriceFeedTestnet.new()
    testerContracts.sortedTroves = await SortedTroves.new()
    // Actual tester contracts
    testerContracts.activePool = await ActivePoolTester.new()
    testerContracts.defaultPool = await DefaultPoolTester.new()
    testerContracts.stabilityPool = await StabilityPoolTester.new()
    testerContracts.gasPool = await GasPool.new()
    testerContracts.collSurplusPool = await CollSurplusPool.new()
    testerContracts.math = await LiquityMathTester.new()
    testerContracts.borrowerOperations = await BorrowerOperationsTester.new()
    testerContracts.troveManager = await TroveManagerTester.new()
    testerContracts.functionCaller = await FunctionCaller.new()
    testerContracts.hintHelpers = await HintHelpers.new()
    testerContracts.lusdToken =  await LUSDTokenTester.new(
      testerContracts.troveManager.address,
      testerContracts.stabilityPool.address,
      testerContracts.borrowerOperations.address
    )
    return testerContracts
  }

  static async deployLQTYContractsHardhat() {
    const pcv = await PCV.new()

    PCV.setAsDeployed(pcv)

    const LQTYContracts = {
      pcv
    }
    return LQTYContracts
  }

  static async deployLQTYTesterContractsHardhat() {
    const pcv = await PCV.new()

    PCV.setAsDeployed(pcv)

    const LQTYContracts = {
      pcv
    }
    return LQTYContracts
  }

  static async deployLiquityCoreTruffle() {
    const priceFeedTestnet = await PriceFeedTestnet.new()
    const sortedTroves = await SortedTroves.new()
    const troveManager = await TroveManager.new()
    const activePool = await ActivePool.new()
    const stabilityPool = await StabilityPool.new()
    const erc20 = ERC20Test.new()
    const gasPool = await GasPool.new()
    const defaultPool = await DefaultPool.new()
    const collSurplusPool = await CollSurplusPool.new()
    const functionCaller = await FunctionCaller.new()
    const borrowerOperations = await BorrowerOperations.new()
    const hintHelpers = await HintHelpers.new()
    const lusdToken = await LUSDToken.new(
      troveManager.address,
      stabilityPool.address,
      borrowerOperations.address
    )

    let index = 0;
    for (const account of accounts) {
      await erc20.mint(account, await contracts.erc20.balanceOf(account))
      index++;

      if (index >= 50)
        break;
    }

    const coreContracts = {
      priceFeedTestnet,
      lusdToken,
      sortedTroves,
      troveManager,
      activePool,
      stabilityPool,
      erc20,
      gasPool,
      defaultPool,
      collSurplusPool,
      functionCaller,
      borrowerOperations,
      hintHelpers
    }
    return coreContracts
  }

  static async deployLQTYContractsTruffle() {
    const pcv = await pcv.new()

    const LQTYContracts = {
      pcv
    }
    return LQTYContracts
  }

  static async deployLUSDToken(contracts) {
    contracts.lusdToken = await LUSDToken.new(
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.borrowerOperations.address
    )
    return contracts
  }

  static async deployLUSDTokenTester(contracts) {
    contracts.lusdToken = await LUSDTokenTester.new(
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.borrowerOperations.address
    )
    return contracts
  }

  static async deployProxyScripts(contracts, LQTYContracts, owner, users) {
    const proxies = await buildUserProxies(users)

    const borrowerWrappersScript = await BorrowerWrappersScript.new(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      LQTYContracts.pcv.address
    )
    contracts.borrowerWrappers = new BorrowerWrappersProxy(owner, proxies, borrowerWrappersScript.address)

    const borrowerOperationsScript = await BorrowerOperationsScript.new(contracts.borrowerOperations.address)
    contracts.borrowerOperations = new BorrowerOperationsProxy(owner, proxies, borrowerOperationsScript.address, contracts.borrowerOperations)

    const troveManagerScript = await TroveManagerScript.new(contracts.troveManager.address)
    contracts.troveManager = new TroveManagerProxy(owner, proxies, troveManagerScript.address, contracts.troveManager)

    const stabilityPoolScript = await StabilityPoolScript.new(contracts.stabilityPool.address)
    contracts.stabilityPool = new StabilityPoolProxy(owner, proxies, stabilityPoolScript.address, contracts.stabilityPool)

    contracts.sortedTroves = new SortedTrovesProxy(owner, proxies, contracts.sortedTroves)

    const lusdTokenScript = await TokenScript.new(contracts.lusdToken.address)
    contracts.lusdToken = new TokenProxy(owner, proxies, lusdTokenScript.address, contracts.lusdToken)

    const pcvScript = await PCVScript.new(LQTYContracts.pcv.address)
    LQTYContracts.pcv = new PCVProxy(owner, proxies, pcvScript.address, LQTYContracts.pcv)

  }

  // Connect contracts to their dependencies
  static async connectCoreContracts(contracts, LQTYContracts) {

    // set TroveManager addr in SortedTroves
    await contracts.sortedTroves.setParams(
      maxBytes32,
      contracts.troveManager.address,
      contracts.borrowerOperations.address
    )

    // set contract addresses in the FunctionCaller
    await contracts.functionCaller.setTroveManagerAddress(contracts.troveManager.address)
    await contracts.functionCaller.setSortedTrovesAddress(contracts.sortedTroves.address)

    // set contracts in the Trove Manager
    await contracts.troveManager.setAddresses(
      contracts.borrowerOperations.address,
      contracts.activePool.address,
      contracts.defaultPool.address,
      contracts.stabilityPool.address,
      contracts.gasPool.address,
      contracts.collSurplusPool.address,
      contracts.priceFeedTestnet.address,
      contracts.lusdToken.address,
      contracts.sortedTroves.address,
      LQTYContracts.pcv.address
    )

    // set contracts in BorrowerOperations
    await contracts.borrowerOperations.setAddresses(
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.defaultPool.address,
      contracts.stabilityPool.address,
      contracts.gasPool.address,
      contracts.collSurplusPool.address,
      contracts.priceFeedTestnet.address,
      contracts.sortedTroves.address,
      contracts.lusdToken.address,
      LQTYContracts.pcv.address,
      contracts.erc20.address
    )

    // set contracts in the Pools
    await contracts.stabilityPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.lusdToken.address,
      contracts.sortedTroves.address,
      contracts.priceFeedTestnet.address,
      contracts.erc20.address
    )

    await contracts.activePool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.stabilityPool.address,
      contracts.defaultPool.address,
      contracts.collSurplusPool.address,
      contracts.erc20.address
    )

    await contracts.defaultPool.setAddresses(
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.erc20.address
    )

    await contracts.collSurplusPool.setAddresses(
      contracts.borrowerOperations.address,
      contracts.troveManager.address,
      contracts.activePool.address,
      contracts.erc20.address
    )

    // set contracts in HintHelpers
    await contracts.hintHelpers.setAddresses(
      contracts.sortedTroves.address,
      contracts.troveManager.address
    )
  }

  static async connectLQTYContractsToCore(LQTYContracts, coreContracts) {
    await LQTYContracts.pcv.setAddresses(
      coreContracts.lusdToken.address,
      coreContracts.troveManager.address,
      coreContracts.borrowerOperations.address,
      coreContracts.activePool.address
    )

  }

}
module.exports = DeploymentHelper
