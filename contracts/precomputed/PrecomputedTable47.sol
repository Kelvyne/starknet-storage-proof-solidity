// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable47x0.sol";
import "./PrecomputedTable47x1.sol";

contract PrecomputedTable47 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable47x1.get(n - 128);
    } else {
      return PrecomputedTable47x0.get(n);
    }
  }
}
