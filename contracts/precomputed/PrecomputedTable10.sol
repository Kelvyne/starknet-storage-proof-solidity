// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable10x0.sol";
import "./PrecomputedTable10x1.sol";

contract PrecomputedTable10 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable10x1.get(n - 128);
    } else {
      return PrecomputedTable10x0.get(n);
    }
  }
}
