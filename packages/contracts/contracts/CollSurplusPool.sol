// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./Dependencies/IERC20.sol";
import "./Interfaces/ICollSurplusPool.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/console.sol";


contract CollSurplusPool is Ownable, CheckContract, ICollSurplusPool {

    string constant public NAME = "CollSurplusPool";

    address public activePoolAddress;
    address public borrowerOperationsAddress;
    address public collateralAddress;
    address public troveManagerAddress;

    // deposited collateral tracker
    uint256 internal collateral;
    // Collateral surplus claimable by trove owners
    mapping (address => uint) internal balances;

    // --- Contract setters ---

    function setAddresses(
        address _borrowerOperationsAddress,
        address _troveManagerAddress,
        address _activePoolAddress,
        address _collateralAddress
    )
        external
        override
        onlyOwner
    {
        checkContract(_borrowerOperationsAddress);
        checkContract(_troveManagerAddress);
        checkContract(_activePoolAddress);
        if (_collateralAddress != address(0)) {
            checkContract(_collateralAddress);
        }

        borrowerOperationsAddress = _borrowerOperationsAddress;
        troveManagerAddress = _troveManagerAddress;
        activePoolAddress = _activePoolAddress;
        collateralAddress = _collateralAddress;

        emit BorrowerOperationsAddressChanged(_borrowerOperationsAddress);
        emit TroveManagerAddressChanged(_troveManagerAddress);
        emit ActivePoolAddressChanged(_activePoolAddress);
        emit CollateralAddressChanged(_collateralAddress);

        _renounceOwnership();
    }

    /* Returns the collateral state variable at ActivePool address.
       Not necessarily equal to the raw collateral balance - ether can be forcibly sent to contracts. */
    function getCollateralBalance() external view override returns (uint) {
        return collateral;
    }

    function getCollateral(address _account) external view override returns (uint) {
        return balances[_account];
    }

    // --- Pool functionality ---

    function accountSurplus(address _account, uint256 _amount) external override {
        _requireCallerIsTroveManager();

        uint256 newAmount = balances[_account] + _amount;
        balances[_account] = newAmount;

        emit CollBalanceUpdated(_account, newAmount);
    }

    function claimColl(address _account) external override {
        _requireCallerIsBorrowerOperations();
        uint256 claimableColl = balances[_account];
        require(claimableColl > 0, "CollSurplusPool: No collateral available to claim");

        balances[_account] = 0;
        emit CollBalanceUpdated(_account, 0);

        collateral -= claimableColl;
        emit CollateralSent(_account, claimableColl);

        if (collateralAddress == address(0)) {
            (bool success, ) = _account.call{ value: claimableColl }("");
            require(success, "CollSurplusPool: sending collateral failed");
        } else {
            bool success = IERC20(collateralAddress).transfer(_account, claimableColl);
            require(success, "CollSurplusPool: sending collateral failed");
        }
    }

    // --- 'require' functions ---

    function _requireCallerIsBorrowerOperations() internal view {
        require(
            msg.sender == borrowerOperationsAddress,
            "CollSurplusPool: Caller is not Borrower Operations");
    }

    function _requireCallerIsTroveManager() internal view {
        require(
            msg.sender == troveManagerAddress,
            "CollSurplusPool: Caller is not TroveManager");
    }

    function _requireCallerIsActivePool() internal view {
        require(
            msg.sender == activePoolAddress,
            "CollSurplusPool: Caller is not Active Pool");
    }

    // When ERC20 token collateral is received this function needs to be called
    function updateCollateralBalance(uint256 _amount) external override {
        _requireCallerIsActivePool();
        collateral += _amount;
  	}

    // --- Fallback function ---

    receive() external payable {
        _requireCallerIsActivePool();
        collateral += msg.value;
    }
}
