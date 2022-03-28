// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable61x0.sol";
import "./PrecomputedTable61x1.sol";

contract PrecomputedTable61 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable61x1.get(n - 128);
    } else {
      return PrecomputedTable61x0.get(n);
    }
  }
}
