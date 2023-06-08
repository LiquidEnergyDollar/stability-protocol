pragma solidity ^0.8.10;

// Really only used by PriceFeed.sol
interface IPIScaledPerSecondCalculator {
    function computeRate(uint256, uint256, uint256) external returns (uint256);
}
