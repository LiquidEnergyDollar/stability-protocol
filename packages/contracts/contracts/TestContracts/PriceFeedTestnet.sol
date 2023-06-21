// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "../Interfaces/IPriceFeed.sol";
import "../Dependencies/Ownable.sol";

/*
* PriceFeed placeholder for testnet and development. The price is simply set manually and saved in a state 
* variable. The contract does not connect to a live Chainlink price feed. 
*/
contract PriceFeedTestnet is Ownable, IPriceFeed {
    
    uint256 private _price = 200 * 1e18;
    uint256 public deviationFactor;
    uint256 public redemptionRate;

    // --- Functions ---

    // View price getter for simplicity in tests
    function getPrice() external view returns (uint256) {
        return _price;
    }
    
    // View price getter for simplicity in tests
    function getMarketPrice() external view returns (uint256) {
        return _price;
    }
    
    // View price getter for simplicity in tests
    function getRedemptionPrice() external view returns (uint256) {
        return _price;
    }

    function fetchPrice() external override returns (IPriceFeed.FetchPriceResponse memory) {
        IPriceFeed.FetchPriceResponse memory response;
        // Fire an event just like the mainnet version would.
        // This lets the subgraph rely on events to get the latest price even when developing locally.
        emit LastGoodPriceUpdated(_price);
        response.status = IPriceFeed.Status.active;
        response.price = _price;
        return response;
    }

    // Manual external price setter.
    function setPrice(uint256 price) external onlyOwner returns (bool) {
        _price = price;
        return true;
    }

    function setAddresses(address a1, address a2, address a3) public {
       // do nothing
    }
}
