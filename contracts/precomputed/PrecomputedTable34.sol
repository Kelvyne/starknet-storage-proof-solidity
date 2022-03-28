// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./PrecomputedTable34x0.sol";
import "./PrecomputedTable34x1.sol";

contract PrecomputedTable34 {
  function get(uint8 n) external pure returns (uint256 x, uint256 y) {
    if (n >= 128) {
      return PrecomputedTable34x1.get(n - 128);
    } else {
      return PrecomputedTable34x0.get(n);
    }
  }
}
