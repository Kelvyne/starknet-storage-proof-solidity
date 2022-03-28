// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable50x0.sol";
import "./PrecomputedTable50x1.sol";

contract PrecomputedTable50 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable50x1.get(n - 128);
    } else {
      return PrecomputedTable50x0.get(n);
    }
  }
}
