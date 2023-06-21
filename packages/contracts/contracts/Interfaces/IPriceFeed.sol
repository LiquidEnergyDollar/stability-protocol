// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface IPriceFeed {

    // --- Events ---
    event LastGoodPriceUpdated(uint256 _lastGoodPrice);

    enum Status {
        active,
        stale,
        disabled
    }
    
    struct FetchPriceResponse {
        Status status;
        uint price;
    }
   
    // --- Function ---
    function fetchPrice() external returns (FetchPriceResponse memory);
}
