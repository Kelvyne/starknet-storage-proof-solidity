// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable33x0.sol";
import "./PrecomputedTable33x1.sol";

contract PrecomputedTable33 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable33x1.get(n - 128);
    } else {
      return PrecomputedTable33x0.get(n);
    }
  }
}
