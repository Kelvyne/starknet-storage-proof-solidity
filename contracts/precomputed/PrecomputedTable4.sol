// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable4x0.sol";
import "./PrecomputedTable4x1.sol";

contract PrecomputedTable4 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable4x1.get(n - 128);
    } else {
      return PrecomputedTable4x0.get(n);
    }
  }
}
