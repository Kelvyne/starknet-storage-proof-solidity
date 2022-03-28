// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable57x0.sol";
import "./PrecomputedTable57x1.sol";

contract PrecomputedTable57 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable57x1.get(n - 128);
    } else {
      return PrecomputedTable57x0.get(n);
    }
  }
}
