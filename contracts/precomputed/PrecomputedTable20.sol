// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable20x0.sol";
import "./PrecomputedTable20x1.sol";

contract PrecomputedTable20 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable20x1.get(n - 128);
    } else {
      return PrecomputedTable20x0.get(n);
    }
  }
}
