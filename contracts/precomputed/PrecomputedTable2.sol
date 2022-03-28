// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable2x0.sol";
import "./PrecomputedTable2x1.sol";

contract PrecomputedTable2 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable2x1.get(n - 128);
    } else {
      return PrecomputedTable2x0.get(n);
    }
  }
}
