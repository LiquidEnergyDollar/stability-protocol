// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Interfaces/IPriceFeed.sol";
import "./Interfaces/IUniV3Reader.sol";
import "./Interfaces/IPIScaledPerSecondCalculator.sol";
import "./Interfaces/ILedOracle.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/BaseMath.sol";
import "./Dependencies/IERC20.sol";
import "./rai/GebMath.sol";

/*
* PriceFeed for LED prototype
* All Liquity functions call the "fetchPrice" function
* There are also three maintenance functions that need to be called
* on a regular basis:
* - updateRate
* - updateLEDPrice
* - updateDeviationFactor
*/

contract PriceFeed is GebMath, Ownable, BaseMath {
    string constant public NAME = "PriceFeed";

    ILedOracle public led;
    IPIScaledPerSecondCalculator public pidCalculator;
    address public uniV3PoolAddress = address(0);
    IUniV3Reader public uniV3Reader;

    uint256 public deviationFactor;
    uint256 public deviationFactorUpdateTime;

    uint256 public redemptionRate;
    uint256 public redemptionRateUpdateTime;

    uint256 public LEDPrice;
    uint256 public LEDPriceUpdateTime;

    uint256 public lastGoodPrice;

    // --- Events ---
    event UpdateRedemptionRate(
        uint marketPrice,
        uint redemptionPrice,
        uint redemptionRate
    );

    event UpdateDeviationFactor(
        uint deviationFactor
    );

    event UpdateLEDPrice(
        uint ledPrice
    );

    event LastGoodPrice(
        uint newPrice
    );

    function fetchPrice() public returns (uint) {
        // Need to convert LEDPrice from WAD to RAY
        uint newPrice = rmultiply(ray(LEDPrice), deviationFactor);
        // Convert back to WAD
        newPrice = newPrice / (10 ** 9);

        // Invert price - Liquity expects price in terms of
        // debtToken per unit of collateral
        // TODO Check if newPrice is zero
        newPrice = (10 ** 36) / newPrice;

        lastGoodPrice = newPrice;

        emit LastGoodPrice(newPrice);

        return newPrice;
    }

    function setAddresses(
        address _ledAddress,
        address _pidCalculatorAddress,
        address _uniV3ReaderAddress
    )
        external
        onlyOwner
    {
        led = ILedOracle(_ledAddress);
        pidCalculator = IPIScaledPerSecondCalculator(_pidCalculatorAddress);
        uniV3Reader = IUniV3Reader(_uniV3ReaderAddress);

        // update everything after setting addresses
        updateAll();
    }

    function setUniV3PoolAddress(address _uniV3PoolAddress)
        external
        onlyOwner
    {
        uniV3PoolAddress = _uniV3PoolAddress;

        _renounceOwnership();
    }

    function getMarketPrice() public view returns(uint)
    {
        return uniV3Reader.getTWAP(uniV3PoolAddress);
    }

    function updateRate() public {
        // If uniV3PoolAddress isn't set yet, we use a redemption rate of 1
        // This means we track the LED oracle price
        uint256 marketPrice;
        uint256 redemptionPrice;
        if (address(uniV3PoolAddress) == address(0) || redemptionRate == 0) {
            // 1 = 10 ** 27
            redemptionRate = RAY;
        } else {
            // Get price feed updates
            marketPrice = getMarketPrice();
            // If the price is non-zero
            require(marketPrice > 0, "PriceFeed/null-uniswap-price");

            redemptionPrice = fetchPrice();
            // Calculate the rate
            redemptionRate = pidCalculator.computeRate(
                marketPrice,
                ray(redemptionPrice),
                RAY
            );
        }

        // Store the timestamp of the update
        redemptionRateUpdateTime = block.timestamp;
        // Emit success event
        emit UpdateRedemptionRate(
            marketPrice,
            redemptionPrice,
            redemptionRate
        );
    }

    function updateLEDPrice() public {
        // Initialize LED update time if needed
        if (LEDPriceUpdateTime == 0) {
            LEDPriceUpdateTime = block.timestamp - 1;
        }

        // Get price feed updates
        uint256 _LEDPrice = led.getUSDPerLED();
        // If the price is non-zero
        require(_LEDPrice > 0, "PriceFeed/null-led-price");
        LEDPrice = _LEDPrice;

        LEDPriceUpdateTime = block.timestamp;

        emit UpdateLEDPrice(LEDPriceUpdateTime);
    }

    function updateDeviationFactor() public {
        // Initialize deviation factor if needed
        if (deviationFactor == 0) {
            deviationFactor = RAY;
        }

        // Initialize update time if needed
        if (deviationFactorUpdateTime == 0) {
            deviationFactorUpdateTime = block.timestamp - 1;
        }

        // Update deviation factor
        deviationFactor = rmultiply(
          rpower(redemptionRate, subtract(block.timestamp, deviationFactorUpdateTime), RAY),
          deviationFactor
        );
        deviationFactorUpdateTime = block.timestamp;
        emit UpdateDeviationFactor(deviationFactor);
    }

    // update all parameters
    function updateAll() public {
        updateRate();
        updateLEDPrice();
        updateDeviationFactor();
    }
}
