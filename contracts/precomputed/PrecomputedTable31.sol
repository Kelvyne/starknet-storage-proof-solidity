// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable31x0.sol";
import "./PrecomputedTable31x1.sol";

contract PrecomputedTable31 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable31x1.get(n - 128);
    } else {
      return PrecomputedTable31x0.get(n);
    }
  }
}
