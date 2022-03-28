// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable6x0.sol";
import "./PrecomputedTable6x1.sol";

contract PrecomputedTable6 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable6x1.get(n - 128);
    } else {
      return PrecomputedTable6x0.get(n);
    }
  }
}
