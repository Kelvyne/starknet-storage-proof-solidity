// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract PrecomputedTableState {
  uint256[512] public points;

  function populate(uint256[128] calldata parts, uint256 offset) external {
    for (uint256 i = 0; i < 128; ++i) {
      points[offset + i] = parts[i];
    }
  }

  function get(uint8 n) external view returns (uint256 x, uint256 y) {
    x = points[(uint256(n) * 2)];
    y = points[(uint256(n) * 2) + 1];
  }
}
