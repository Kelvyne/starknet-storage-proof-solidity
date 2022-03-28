// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable30x0.sol";
import "./PrecomputedTable30x1.sol";

contract PrecomputedTable30 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable30x1.get(n - 128);
    } else {
      return PrecomputedTable30x0.get(n);
    }
  }
}
