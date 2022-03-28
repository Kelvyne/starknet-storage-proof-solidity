// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable22x0.sol";
import "./PrecomputedTable22x1.sol";

contract PrecomputedTable22 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable22x1.get(n - 128);
    } else {
      return PrecomputedTable22x0.get(n);
    }
  }
}
