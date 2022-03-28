// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable63x0.sol";
import "./PrecomputedTable63x1.sol";

contract PrecomputedTable63 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable63x1.get(n - 128);
    } else {
      return PrecomputedTable63x0.get(n);
    }
  }
}
