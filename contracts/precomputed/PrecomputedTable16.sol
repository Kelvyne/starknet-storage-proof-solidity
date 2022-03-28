// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable16x0.sol";
import "./PrecomputedTable16x1.sol";

contract PrecomputedTable16 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable16x1.get(n - 128);
    } else {
      return PrecomputedTable16x0.get(n);
    }
  }
}
