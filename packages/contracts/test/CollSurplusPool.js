const deploymentHelper = require("../utils/deploymentHelpers.js")
const testHelpers = require("../utils/testHelpers.js")

const th = testHelpers.TestHelper
const dec = th.dec
const toBN = th.toBN
const mv = testHelpers.MoneyValues

const TroveManagerTester = artifacts.require("TroveManagerTester")

contract('CollSurplusPool', async accounts => {
  const [A, B] = accounts;

  const contextTestPool = (isCollateralERC20) => {

    let borrowerOperations
    let priceFeed
    let collSurplusPool

    let contracts

    const openTrove = async (params) => th.openTrove(contracts, params)

    beforeEach(async () => {
      contracts = await deploymentHelper.deployLiquityCore(accounts)
      contracts.troveManager = await TroveManagerTester.new()
      contracts.thusdToken = (await deploymentHelper.deployTHUSDToken(contracts)).thusdToken
      priceFeed = contracts.priceFeedTestnet
      collSurplusPool = contracts.collSurplusPool
      borrowerOperations = contracts.borrowerOperations
      if (!isCollateralERC20) {
        contracts.erc20.address = th.ZERO_ADDRESS
      }

      await deploymentHelper.connectCoreContracts(contracts)
    })

    it("CollSurplusPool::getCollateralBalance(): Returns the collateral balance of the CollSurplusPool after redemption", async () => {
      const collateral_1 = await collSurplusPool.getCollateralBalance()
      assert.equal(collateral_1, '0')

      const price = toBN(dec(100, 18))
      await priceFeed.setPrice(price)

      const { collateral: B_coll, netDebt: B_netDebt } = await openTrove({ ICR: toBN(dec(200, 16)), extraParams: { from: B } })
      await openTrove({ extraTHUSDAmount: B_netDebt, extraParams: { from: A, value: dec(3000, 'ether') } })

      // At collateral:USD = 100, this redemption should leave 1 ether/token of coll surplus
      await th.redeemCollateralAndGetTxObject(A, contracts, B_netDebt)

      const collateral_2 = await collSurplusPool.getCollateralBalance()
      th.assertIsApproximatelyEqual(collateral_2, B_coll.sub(B_netDebt.mul(mv._1e18BN).div(price)))
    })

    it("CollSurplusPool: claimColl(): Reverts if caller is not Borrower Operations", async () => {
      await th.assertRevert(collSurplusPool.claimColl(A, { from: A }), 'CollSurplusPool: Caller is not Borrower Operations')
    })

    it("CollSurplusPool: claimColl(): Reverts if nothing to claim", async () => {
      await th.assertRevert(borrowerOperations.claimCollateral({ from: A }), 'CollSurplusPool: No collateral available to claim')
    })

    // TODO decide if we need this EIP-165
    // it("CollSurplusPool: claimColl(): Reverts if owner cannot receive ETH surplus", async () => {
    //   const nonPayable = await NonPayable.new()
    //
    //   const price = toBN(dec(100, 18))
    //   await priceFeed.setPrice(price)
    //
    //   // open trove from NonPayable proxy contract
    //   const B_coll = toBN(dec(60, 18))
    //   const B_thusdAmount = toBN(dec(3000, 18))
    //   const B_netDebt = await th.getAmountWithBorrowingFee(contracts, B_thusdAmount)
    //   const openTroveData = th.getTransactionData('openTrove(uint256,uint256,address,address)', ['0xde0b6b3a7640000', web3.utils.toHex(B_thusdAmount), B, B])
    //   await nonPayable.forward(borrowerOperations.address, openTroveData, { value: B_coll })
    //   await openTrove({ extraTHUSDAmount: B_netDebt, extraParams: { from: A, value: dec(3000, 'ether') } })
    //
    //   // At ETH:USD = 100, this redemption should leave 1 ether of coll surplus for B
    //   await th.redeemCollateralAndGetTxObject(A, contracts, B_netDebt)
    //
    //   const collateral_2 = await collSurplusPool.getCollateralBalance()
    //   th.assertIsApproximatelyEqual(collateral_2, B_coll.sub(B_netDebt.mul(mv._1e18BN).div(price)))
    //
    //   const claimCollateralData = th.getTransactionData('claimCollateral()', [])
    //   await th.assertRevert(nonPayable.forward(borrowerOperations.address, claimCollateralData), 'CollSurplusPool: sending ETH failed')
    // })

    it('CollSurplusPool: reverts trying to send ETH to it', async () => {
      await th.assertRevert(web3.eth.sendTransaction({ from: A, to: collSurplusPool.address, value: 1 }), 'CollSurplusPool: Caller is not Active Pool')
    })

    it('CollSurplusPool: accountSurplus: reverts if caller is not Trove Manager', async () => {
      await th.assertRevert(collSurplusPool.accountSurplus(A, 1), 'CollSurplusPool: Caller is not TroveManager')
    })
  }

  context("when collateral is ERC20 token", () => {
    contextTestPool( true )
  })

  context("when collateral is eth", () => {
    contextTestPool( false )
  })
})

contract('Reset chain state', async accounts => { })
