// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable23x0.sol";
import "./PrecomputedTable23x1.sol";

contract PrecomputedTable23 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable23x1.get(n - 128);
    } else {
      return PrecomputedTable23x0.get(n);
    }
  }
}
