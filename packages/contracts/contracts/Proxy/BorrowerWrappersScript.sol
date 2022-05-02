// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "../Dependencies/SafeMath.sol";
import "../Dependencies/LiquityMath.sol";
import "../Dependencies/IERC20.sol";
import "../Interfaces/IBorrowerOperations.sol";
import "../Interfaces/ITroveManager.sol";
import "../Interfaces/IStabilityPool.sol";
import "../Interfaces/IPriceFeed.sol";
import "../Interfaces/IPCV.sol";
import "./BorrowerOperationsScript.sol";
import "./ETHTransferScript.sol";
import "./ERC20TransferScript.sol";
import "./PCVScript.sol";
import "../Dependencies/console.sol";

contract BorrowerWrappersScript is BorrowerOperationsScript, ETHTransferScript, ERC20TransferScript, PCVScript {
    using SafeMath for uint;

    string constant public NAME = "BorrowerWrappersScript";

    ITroveManager immutable troveManager;
    IStabilityPool immutable stabilityPool;
    IPriceFeed immutable priceFeed;
    IERC20 immutable lusdToken;
    IPCV immutable pcv;

    constructor(
        address _borrowerOperationsAddress,
        address _troveManagerAddress,
        address _pcvAddress
    )
        BorrowerOperationsScript(IBorrowerOperations(_borrowerOperationsAddress))
        PCVScript(_pcvAddress)
    {
        checkContract(_troveManagerAddress);
        ITroveManager troveManagerCached = ITroveManager(_troveManagerAddress);
        troveManager = troveManagerCached;

        IStabilityPool stabilityPoolCached = troveManagerCached.stabilityPool();
        checkContract(address(stabilityPoolCached));
        stabilityPool = stabilityPoolCached;

        IPriceFeed priceFeedCached = troveManagerCached.priceFeed();
        checkContract(address(priceFeedCached));
        priceFeed = priceFeedCached;

        address lusdTokenCached = address(troveManagerCached.lusdToken());
        checkContract(lusdTokenCached);
        lusdToken = IERC20(lusdTokenCached);

        IPCV pcvCached = troveManagerCached.pcv();
        require(_pcvAddress == address(pcvCached), "BorrowerWrappersScript: Wrong PCV address");
        pcv = pcvCached;
    }

    function claimCollateralAndOpenTrove(uint _maxFee, uint _LUSDAmount, address _upperHint, address _lowerHint) external payable {
        uint balanceBefore = address(this).balance;

        // Claim collateral
        borrowerOperations.claimCollateral();

        uint balanceAfter = address(this).balance;

        // already checked in CollSurplusPool
        assert(balanceAfter > balanceBefore);

        uint totalCollateral = balanceAfter.sub(balanceBefore).add(msg.value);

        // Open trove with obtained collateral, plus collateral sent by user
        // if (borrowerOperations.collateralAddress() == address(0)) {
        //   borrowerOperations.openTrove{ value: totalCollateral }(_maxFee, _LUSDAmount, 0, _upperHint, _lowerHint);
        // } else {
          borrowerOperations.openTrove{ value: 0 }(_maxFee, _LUSDAmount, totalCollateral, _upperHint, _lowerHint);
        // }
    }

    function claimSPRewardsAndRecycle(uint _maxFee, address _upperHint, address _lowerHint) external {
        uint collBalanceBefore = address(this).balance;

        // Claim rewards
        stabilityPool.withdrawFromSP(0);

        uint collBalanceAfter = address(this).balance;
        uint claimedCollateral = collBalanceAfter.sub(collBalanceBefore);

        // Add claimed ETH to trove, get more LUSD and stake it into the Stability Pool
        if (claimedCollateral > 0) {
            _requireUserHasTrove(address(this));
            uint LUSDAmount = _getNetLUSDAmount(claimedCollateral);
            // if (borrowerOperations.collateralAddress() == address(0)) {
            //   borrowerOperations.adjustTrove{ value: claimedCollateral }(_maxFee, 0, LUSDAmount, true, 0, _upperHint, _lowerHint);
            // } else {
              borrowerOperations.adjustTrove{ value: 0 }(_maxFee, 0, LUSDAmount, true, claimedCollateral, _upperHint, _lowerHint);
            // }
            // Provide withdrawn LUSD to Stability Pool
            if (LUSDAmount > 0) {
                stabilityPool.provideToSP(LUSDAmount);
            }
        }
    }

    function claimStakingGainsAndRecycle(uint _maxFee, address _upperHint, address _lowerHint) external {
        uint collBalanceBefore = address(this).balance;
        uint lusdBalanceBefore = lusdToken.balanceOf(address(this));

        uint gainedCollateral = address(this).balance.sub(collBalanceBefore); // stack too deep issues :'(
        uint gainedLUSD = lusdToken.balanceOf(address(this)).sub(lusdBalanceBefore);

        uint netLUSDAmount;
        // Top up trove and get more LUSD, keeping ICR constant
        if (gainedCollateral > 0) {
            _requireUserHasTrove(address(this));
            netLUSDAmount = _getNetLUSDAmount(gainedCollateral);
            // if (borrowerOperations.collateralAddress() == address(0)) {
            //   borrowerOperations.adjustTrove{ value: gainedCollateral }(_maxFee, 0, netLUSDAmount, true, 0, _upperHint, _lowerHint);
            // } else {
              borrowerOperations.adjustTrove{ value: 0 }(_maxFee, 0, netLUSDAmount, true, gainedCollateral, _upperHint, _lowerHint);
            // }
        }

        uint totalLUSD = gainedLUSD.add(netLUSDAmount);
        if (totalLUSD > 0) {
            stabilityPool.provideToSP(totalLUSD);
        }

    }

    function _getNetLUSDAmount(uint _collateral) internal returns (uint) {
        uint price = priceFeed.fetchPrice();
        uint ICR = troveManager.getCurrentICR(address(this), price);

        uint LUSDAmount = _collateral.mul(price).div(ICR);
        uint borrowingRate = troveManager.getBorrowingRateWithDecay();
        uint netDebt = LUSDAmount.mul(LiquityMath.DECIMAL_PRECISION).div(LiquityMath.DECIMAL_PRECISION.add(borrowingRate));

        return netDebt;
    }

    function _requireUserHasTrove(address _depositor) internal view {
        require(troveManager.getTroveStatus(_depositor) == 1, "BorrowerWrappersScript: caller must have an active trove");
    }
}
