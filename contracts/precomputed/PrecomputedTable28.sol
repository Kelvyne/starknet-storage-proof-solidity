// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable28x0.sol";
import "./PrecomputedTable28x1.sol";

contract PrecomputedTable28 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable28x1.get(n - 128);
    } else {
      return PrecomputedTable28x0.get(n);
    }
  }
}
