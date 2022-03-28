// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable27x0.sol";
import "./PrecomputedTable27x1.sol";

contract PrecomputedTable27 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable27x1.get(n - 128);
    } else {
      return PrecomputedTable27x0.get(n);
    }
  }
}
