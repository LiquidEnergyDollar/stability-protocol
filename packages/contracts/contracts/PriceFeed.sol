// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Interfaces/IPriceFeed.sol";
import "./Interfaces/IUniswapV2Pair.sol";
import "./Interfaces/IPIScaledPerSecondCalculator.sol";
import "./Interfaces/ILedOracle.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";
import "./Dependencies/BaseMath.sol";
import "./Dependencies/LiquityMath.sol";
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
    IUniswapV2Pair public uniV2Pair;

    uint256 public deviationFactor;
    uint256 public deviationFactorUpdateTime;

    uint256 public redemptionRate;
    uint256 public redemptionRateUpdateTime;

    uint256 public LEDPrice;
    uint256 public LEDPriceUpdateTime;

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

        emit LastGoodPrice(newPrice);

        return newPrice;
    }

    function setAddresses(
        address _ledAddress,
        address _pidCalculatorAddress,
        address _uniV2Pair
    )
        external
        onlyOwner
    {
        led = ILedOracle(_ledAddress);
        pidCalculator = IPIScaledPerSecondCalculator(_pidCalculatorAddress);
        uniV2Pair = IUniswapV2Pair(_uniV2Pair);

        // update everything after setting addresses
        updateAll();
    }

    // calculate price based on pair reserves
    function getTokenPrice(uint amount) internal view returns(uint)
    {
        IERC20 token1 = IERC20(uniV2Pair.token1());
        (uint Res0, uint Res1,) = uniV2Pair.getReserves();

        // decimals
        uint res0 = Res0*(10**token1.decimals());
        return((amount*res0)/Res1); // return amount of token0 needed to buy token1
    }

    function updateRate() public {
        // If uniV2Pair isn't set yet, we use a redemption rate of 1
        // This means we track the LED oracle price
        uint256 marketPrice;
        uint256 redemptionPrice;
        if (address(uniV2Pair) == address(0)) {
            // 1 = 10 ** 27
            redemptionRate = RAY;
        } else {
            // Get price feed updates
            marketPrice = getTokenPrice(1);
            // If the price is non-zero
            require(marketPrice > 0, "PriceFeed/null-uniswap-price");

            redemptionPrice = fetchPrice();
            // Calculate the rate
            redemptionRate = pidCalculator.computeRate(
                marketPrice,
                redemptionPrice,
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
        // Get price feed updates
        uint256 _LEDPrice = led.getUSDPerLED();
        // If the price is non-zero
        require(_LEDPrice > 0, "PriceFeed/null-led-price");
        LEDPrice = _LEDPrice;

        LEDPriceUpdateTime = block.timestamp;
    }

    function updateDeviationFactor() public {
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
