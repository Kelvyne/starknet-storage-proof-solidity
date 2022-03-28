// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable56x0.sol";
import "./PrecomputedTable56x1.sol";

contract PrecomputedTable56 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable56x1.get(n - 128);
    } else {
      return PrecomputedTable56x0.get(n);
    }
  }
}
