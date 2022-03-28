// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable43x0.sol";
import "./PrecomputedTable43x1.sol";

contract PrecomputedTable43 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable43x1.get(n - 128);
    } else {
      return PrecomputedTable43x0.get(n);
    }
  }
}
