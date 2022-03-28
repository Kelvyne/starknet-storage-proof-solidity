// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable13x0.sol";
import "./PrecomputedTable13x1.sol";

contract PrecomputedTable13 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable13x1.get(n - 128);
    } else {
      return PrecomputedTable13x0.get(n);
    }
  }
}
