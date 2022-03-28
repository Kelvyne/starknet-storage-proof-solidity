// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable18x0.sol";
import "./PrecomputedTable18x1.sol";

contract PrecomputedTable18 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable18x1.get(n - 128);
    } else {
      return PrecomputedTable18x0.get(n);
    }
  }
}
