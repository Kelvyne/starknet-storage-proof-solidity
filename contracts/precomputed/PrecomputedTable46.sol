// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable46x0.sol";
import "./PrecomputedTable46x1.sol";

contract PrecomputedTable46 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable46x1.get(n - 128);
    } else {
      return PrecomputedTable46x0.get(n);
    }
  }
}
