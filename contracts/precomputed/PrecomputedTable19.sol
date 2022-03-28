// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable19x0.sol";
import "./PrecomputedTable19x1.sol";

contract PrecomputedTable19 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable19x1.get(n - 128);
    } else {
      return PrecomputedTable19x0.get(n);
    }
  }
}
