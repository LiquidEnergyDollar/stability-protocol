// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

// Really only used by PriceFeed.sol
interface ILedOracle {
    function getUSDPerLED() external returns (uint256);
}
