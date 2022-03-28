// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable29x0.sol";
import "./PrecomputedTable29x1.sol";

contract PrecomputedTable29 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable29x1.get(n - 128);
    } else {
      return PrecomputedTable29x0.get(n);
    }
  }
}
