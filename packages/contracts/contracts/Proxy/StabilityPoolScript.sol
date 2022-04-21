// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import "../Dependencies/CheckContract.sol";
import "../Interfaces/IStabilityPool.sol";


contract StabilityPoolScript is CheckContract {
    string constant public NAME = "StabilityPoolScript";

    IStabilityPool immutable stabilityPool;

    constructor(IStabilityPool _stabilityPool) {
        checkContract(address(_stabilityPool));
        stabilityPool = _stabilityPool;
    }

    function provideToSP(uint _amount) external {
        stabilityPool.provideToSP(_amount);
    }

    function withdrawFromSP(uint _amount) external {
        stabilityPool.withdrawFromSP(_amount);
    }

    function withdrawETHGainToTrove(address _upperHint, address _lowerHint) external {
        stabilityPool.withdrawETHGainToTrove(_upperHint, _lowerHint);
    }
}
