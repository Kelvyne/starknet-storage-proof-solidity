// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable39x0.sol";
import "./PrecomputedTable39x1.sol";

contract PrecomputedTable39 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable39x1.get(n - 128);
    } else {
      return PrecomputedTable39x0.get(n);
    }
  }
}
