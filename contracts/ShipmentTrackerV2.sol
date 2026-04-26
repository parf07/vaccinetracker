// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract ShipmentTrackerV2 is Initializable, OwnableUpgradeable {
    uint256 public temperatureThreshold;
    mapping(uint256 => uint256) public shipmentTemperatures;

    event TemperatureAlert(uint256 indexed shipmentId, uint256 temperature);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // ADD THIS BLOCK: Even if it's empty, it satisfies the safety check
    function initialize(uint256 _threshold) public initializer {
        __Ownable_init();
        temperatureThreshold = _threshold;
    }

    /**
     * @dev UPDATED Logic: Maximum temperature is now 39°C
     */
    function updateStatus(uint256 _shipmentId, uint256 _currentTemp) public {
        // Business logic check for V2
        if (_currentTemp > 39) { 
            emit TemperatureAlert(_shipmentId, _currentTemp);
            revert("V2: Temperature exceeds NEW threshold (39C)");
        }
        
        shipmentTemperatures[_shipmentId] = _currentTemp;
    }
}