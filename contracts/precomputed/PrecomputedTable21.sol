// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable21x0.sol";
import "./PrecomputedTable21x1.sol";

contract PrecomputedTable21 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable21x1.get(n - 128);
    } else {
      return PrecomputedTable21x0.get(n);
    }
  }
}
