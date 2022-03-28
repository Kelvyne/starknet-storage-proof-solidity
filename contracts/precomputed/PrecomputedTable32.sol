// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable32x0.sol";
import "./PrecomputedTable32x1.sol";

contract PrecomputedTable32 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable32x1.get(n - 128);
    } else {
      return PrecomputedTable32x0.get(n);
    }
  }
}
