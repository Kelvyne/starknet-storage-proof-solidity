// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable15x0.sol";
import "./PrecomputedTable15x1.sol";

contract PrecomputedTable15 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable15x1.get(n - 128);
    } else {
      return PrecomputedTable15x0.get(n);
    }
  }
}
