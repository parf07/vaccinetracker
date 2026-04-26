// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title ShipmentTracker
 * @dev Implements a Transparent Proxy pattern for tracking vaccine shipments.
 * Requirement: System must revert and notify if temperature exceeds threshold.
 */
contract ShipmentTracker is Initializable, OwnableUpgradeable {
    uint256 public temperatureThreshold;
    
    // Mapping: Shipment ID => Current Temperature
    mapping(uint256 => uint256) public shipmentTemperatures;

    // Requirement: Notify if temperature exceeds threshold [cite: 53, 59]
    event TemperatureAlert(uint256 indexed shipmentId, uint256 temperature);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        // Requirement: Proxy pattern must use initialize instead of constructor 
        _disableInitializers();
    }

    /**
     * @dev Replaces constructor for Transparent Proxies.
     * @param _threshold The maximum safe temperature for the vaccines.
     */
    function initialize(uint256 _threshold) public initializer {
        __Ownable_init();
        temperatureThreshold = _threshold;
    }

    /**
     * @dev Updates shipment status. 
     * Requirement: System must revert if temperature exceeds threshold.
     */
    function updateStatus(uint256 _shipmentId, uint256 _currentTemp) public {
        // Business logic check
        if (_currentTemp > temperatureThreshold) {
            // Requirement: Notification via Event [cite: 53, 59]
            emit TemperatureAlert(_shipmentId, _currentTemp);
            
            // Requirement: Revert transaction for safety 
            // This allows Tenderly Debugger to identify the exact line of breach 
            revert("Temperature breach: Vaccine safety threshold exceeded");
        }
        
        shipmentTemperatures[_shipmentId] = _currentTemp;
    }

    /**
     * @dev Allows owner to update the safety threshold if requirements change.
     */
    function setThreshold(uint256 _newThreshold) public onlyOwner {
        temperatureThreshold = _newThreshold;
    }
}