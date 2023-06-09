pragma solidity >0.8.0;
        
interface IUniV3Reader {
    function getTWAP(address _poolAddress) external view returns (uint256);
}