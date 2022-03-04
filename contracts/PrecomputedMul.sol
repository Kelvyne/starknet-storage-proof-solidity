pragma solidity ^0.8.0;

import "./EllipticCurve.sol";

contract PrecomputedMul {
  uint256 private constant SHIFT_X = 0x049ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804;
  uint256 private constant SHIFT_Y = 0x03ca0cfe4b3bc6ddf346d49d06ea0ed34e621062c0e056c1d0405d266e10268a;

  uint256 private constant FIELD_PRIME = 3618502788666131213697322783095070105623107215331596699973092056135872020481;
  uint256 private constant ALPHA = 1;

  uint256 constant private SIZE = 4;
  uint256 constant private SIZE_POWER_TWO = 2**SIZE;

  // 2^size EC points
  uint256[] private table;

  constructor(uint256[] memory _table) public {
    table = _table;
  }

  function mul(uint256 n) external view returns (uint256, uint256, uint256) {
    uint256 x = SHIFT_X;
    uint256 y = SHIFT_Y;
    uint256 z = 1;
    uint256[] memory _table = table;

    for (int shift = 248; shift > 0; shift -= int(SIZE)) {
      uint256 d = (n >> uint256(shift)) & 0xf;

      (x, y, z) = EllipticCurve.jacMul(SIZE_POWER_TWO, x, y, z, ALPHA, FIELD_PRIME);
      if (d != 0) {
        uint256 diX = _table[d];
        uint256 diY = _table[d+1];

        (x, y, z) = EllipticCurve.jacAdd(x, y, z, diX, diY, 1, FIELD_PRIME);
      }
    }
    return (x, y, z);
  }

}
