// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable62x0.sol";
import "./PrecomputedTable62x1.sol";

contract PrecomputedTable62 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable62x1.get(n - 128);
    } else {
      return PrecomputedTable62x0.get(n);
    }
  }
}
