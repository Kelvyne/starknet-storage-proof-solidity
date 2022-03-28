// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable8x0.sol";
import "./PrecomputedTable8x1.sol";

contract PrecomputedTable8 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable8x1.get(n - 128);
    } else {
      return PrecomputedTable8x0.get(n);
    }
  }
}
