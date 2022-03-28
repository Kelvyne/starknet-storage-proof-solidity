// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable53x0.sol";
import "./PrecomputedTable53x1.sol";

contract PrecomputedTable53 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable53x1.get(n - 128);
    } else {
      return PrecomputedTable53x0.get(n);
    }
  }
}
