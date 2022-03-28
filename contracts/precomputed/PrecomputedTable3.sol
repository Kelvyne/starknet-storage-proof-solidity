// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable3x0.sol";
import "./PrecomputedTable3x1.sol";

contract PrecomputedTable3 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable3x1.get(n - 128);
    } else {
      return PrecomputedTable3x0.get(n);
    }
  }
}
