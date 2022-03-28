// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable42x0.sol";
import "./PrecomputedTable42x1.sol";

contract PrecomputedTable42 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable42x1.get(n - 128);
    } else {
      return PrecomputedTable42x0.get(n);
    }
  }
}
