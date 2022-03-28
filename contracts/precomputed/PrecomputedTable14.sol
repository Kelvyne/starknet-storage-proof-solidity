// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable14x0.sol";
import "./PrecomputedTable14x1.sol";

contract PrecomputedTable14 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable14x1.get(n - 128);
    } else {
      return PrecomputedTable14x0.get(n);
    }
  }
}
