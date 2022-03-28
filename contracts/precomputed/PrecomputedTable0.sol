// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable0x0.sol";
import "./PrecomputedTable0x1.sol";

contract PrecomputedTable0 {
  // FIXME: change uint8 to bytes1 ???
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable0x1.get(n - 128);
    } else {
      return PrecomputedTable0x0.get(n);
    }
  }
}
