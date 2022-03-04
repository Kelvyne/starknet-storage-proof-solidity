pragma solidity ^0.8.0;

import "./EllipticCurve.sol";
import "./PrecomputedMul.sol";

contract PedersenHash {
  uint256 private constant FIELD_PRIME = 3618502788666131213697322783095070105623107215331596699973092056135872020481;
  uint256 private constant ALPHA = 1;

  constructor() public { }

  function hash(uint256 a, uint256 b) external returns (uint256) {
    uint256 r = 0x1234;
    return r;
  }
}
