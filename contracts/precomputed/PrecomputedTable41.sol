// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable41x0.sol";
import "./PrecomputedTable41x1.sol";

contract PrecomputedTable41 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable41x1.get(n - 128);
    } else {
      return PrecomputedTable41x0.get(n);
    }
  }
}
