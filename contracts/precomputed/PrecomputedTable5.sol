// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable5x0.sol";
import "./PrecomputedTable5x1.sol";

contract PrecomputedTable5 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable5x1.get(n - 128);
    } else {
      return PrecomputedTable5x0.get(n);
    }
  }
}
