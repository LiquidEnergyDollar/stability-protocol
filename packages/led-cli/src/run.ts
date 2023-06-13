import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { EthersLiquity } from '../../lib-ethers/src/EthersLiquity';
import { _connectToDeployment } from '../../lib-ethers/src/EthersLiquityConnection';
import { DEFAULT_VERSION_FOR_TESTING } from '../../lib-ethers/src/_utils';
import path from 'path';
import fs from "fs";
import fuzzy from 'fuzzy';
import { Wallet, ethers } from 'ethers';
import dotenv from "dotenv";

// TODO: Replace with the actual argument specifications for the EthersLiquity methods
const methodArgs: Record<string, any> = {
    _getActivePool: [],
    _getBlockTimestamp: [],
    _getDefaultPool: [],
    _getFeesFactory: [],
    approveErc20: [],
    bammUnlock: [],
    borrowTHUSD: [ { name: 'amount', type: 'Decimalish' } ],
    checkMintList: [],
    claimCollateralSurplus: [],
    closeTrove: [],
    depositCollateral: [ { name: 'amount', type: 'Decimalish' } ],
    depositTHUSDInBammPool: [ { name: 'amount', type: 'Decimalish' } ],
    depositTHUSDInStabilityPool: [ { name: 'amount', type: 'Decimalish' } ],
    getBammAllowance: [],
    getBammDeposit: [],
    getCollateralAddress: [],
    getCollateralSurplusBalance: [],
    getErc20TokenAllowance: [],
    getErc20TokenBalance: [],
    getFees: [],
    getNumberOfTroves: [],
    getPCVBalance: [],
    getPrice: [],
    getStabilityDeposit: [],
    getSymbol: [],
    getTHUSDBalance: [],
    getTHUSDInStabilityPool: [],
    getTotal: [],
    getTotalRedistributed: [],
    getTrove: [],
    getTroveBeforeRedistribution: [],
    getWithdrawsSpShare: [ { name: 'withdrawAmount', type: 'Decimalish' } ],
    hasStore: [],
    isBorrowerOperations: [],
    isStabilityPools: [],
    isTroveManager: [],
    liquidate: [ { name: 'address', type: 'string' } ],
    liquidateUpTo: [ { name: 'maximumNumberOfTrovesToLiquidate', type: 'number' } ],
    mintErc20: [
      { name: 'toAddress', type: 'string' },
      { name: 'amount', type: 'Decimalish' }
    ],
    redeemTHUSD: [ { name: 'amount', type: 'Decimalish' } ],
    repayTHUSD: [ { name: 'amount', type: 'Decimalish' } ],
    sendTHUSD: [
      { name: 'toAddress', type: 'string' },
      { name: 'amount', type: 'Decimalish' }
    ],
    setPrice: [ { name: 'price', type: 'Decimalish' } ],
    transferBammCollateralGainToTrove: [],
    transferCollateralGainToTrove: [],
    withdrawCollateral: [ { name: 'amount', type: 'Decimalish' } ],
    withdrawGainsFromBammPool: [],
    withdrawGainsFromStabilityPool: [],
    withdrawTHUSDFromBammPool: [ { name: 'amount', type: 'Decimalish' } ],
    withdrawTHUSDFromStabilityPool: [ { name: 'amount', type: 'Decimalish' } ]
  };

dotenv.config({path: __dirname + '/.env'})
inquirer.registerPrompt('autocomplete', inquirerPrompt);

let NETWORK = "sepolia";
let COLLATERAL = "usd";

async function run() {    
    // Get the methods of EthersLiquity
    const methodNames = Object.keys(methodArgs);

    function searchMethods(answers: string, input = '') {
        return new Promise((resolve) => {
            resolve(fuzzy.filter(input, methodNames).map((el: any) => el.original));
        });
      }

    // Continue to prompt user for actions until they force exit
    while(true) {
        // Ask the user which method they want to call
        const {methodName} = await inquirer.prompt([
            {
                type: 'autocomplete',
                name: 'methodName',
                message: 'Which method do you want to call?',
                source: searchMethods
            }
        ]);

        // Prompt for the arguments of the method
        const argsSpecs = methodArgs[(methodName as string)];
        const args = [];
        for (const argSpec of argsSpecs) {
            const {arg} = await inquirer.prompt([
            {
                type: 'input',
                name: 'arg',
                message: `Enter ${argSpec.name} (${argSpec.type}):`,
                // Simple type checking
                // validate: (value: any) => typeof value === argSpec.type || `${argSpec.name} must be a ${argSpec.type}`
            }
            ]);
            args.push(arg);
        }

        // TODO: Take some of these as command line inputs
        const deploymentString = fs.readFileSync(
            path.join("..", "lib-ethers", "deployments", "default", COLLATERAL, "v0", `${NETWORK}.json`), 
            'utf8'
            );
        const deployment = JSON.parse(deploymentString);

        console.log("process.env.DEPLOYER_PRIVATE_KEY" + process.env.DEPLOYER_PRIVATE_KEY);
        const deployerAccount = process.env.DEPLOYER_PRIVATE_KEY || Wallet.createRandom().privateKey;

        const provider = new ethers.providers.InfuraProvider(
            NETWORK == "mainnet" ? "homestead" : NETWORK,
            process.env.INFURA_API_KEY
        );
        const signer = new Wallet(deployerAccount, provider);
        console.log("Calling contract from " + await signer.getAddress());
        const ethersLiquity: Record<string, any> = EthersLiquity._from(
            _connectToDeployment(COLLATERAL, DEFAULT_VERSION_FOR_TESTING, deployment, signer, {
                userAddress: await signer.getAddress()
            })
        );
        // Call the method and log the result    
        const result = await (ethersLiquity as any)[methodName](...args);
        if (result) {
            console.log(result.toString());
        }
    }
}

run()
