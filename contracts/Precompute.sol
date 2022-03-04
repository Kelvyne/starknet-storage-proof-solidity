pragma solidity ^0.8.0;

import "./EllipticCurve.sol";

contract Precompute {
  uint256 private constant FIELD_PRIME = 3618502788666131213697322783095070105623107215331596699973092056135872020481;
  uint256 private constant ALPHA = 1;


  function precompute(uint256 x, uint256 y, uint256 n) pure external returns (uint256, uint256) {
    (uint256 rx, uint256 ry, uint256 rz) = EllipticCurve.jacMul(n, x, y, 1, ALPHA, FIELD_PRIME);

    (uint256 affX, uint256 affY) = EllipticCurve.toAffine(rx, ry, rz, FIELD_PRIME);

    return (affX, affY);
  }
}
