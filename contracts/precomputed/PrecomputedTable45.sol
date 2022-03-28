// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable45x0.sol";
import "./PrecomputedTable45x1.sol";

contract PrecomputedTable45 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable45x1.get(n - 128);
    } else {
      return PrecomputedTable45x0.get(n);
    }
  }
}
