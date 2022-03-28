// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable40x0.sol";
import "./PrecomputedTable40x1.sol";

contract PrecomputedTable40 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable40x1.get(n - 128);
    } else {
      return PrecomputedTable40x0.get(n);
    }
  }
}
