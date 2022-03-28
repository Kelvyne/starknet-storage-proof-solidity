// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable17x0.sol";
import "./PrecomputedTable17x1.sol";

contract PrecomputedTable17 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable17x1.get(n - 128);
    } else {
      return PrecomputedTable17x0.get(n);
    }
  }
}
