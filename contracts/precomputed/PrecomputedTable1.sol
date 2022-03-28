// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable1x0.sol";
import "./PrecomputedTable1x1.sol";

contract PrecomputedTable1 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable1x1.get(n - 128);
    } else {
      return PrecomputedTable1x0.get(n);
    }
  }
}
