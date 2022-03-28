// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable58x0.sol";
import "./PrecomputedTable58x1.sol";

contract PrecomputedTable58 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable58x1.get(n - 128);
    } else {
      return PrecomputedTable58x0.get(n);
    }
  }
}
