// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable9x0.sol";
import "./PrecomputedTable9x1.sol";

contract PrecomputedTable9 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable9x1.get(n - 128);
    } else {
      return PrecomputedTable9x0.get(n);
    }
  }
}
