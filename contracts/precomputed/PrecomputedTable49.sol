// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable49x0.sol";
import "./PrecomputedTable49x1.sol";

contract PrecomputedTable49 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable49x1.get(n - 128);
    } else {
      return PrecomputedTable49x0.get(n);
    }
  }
}
