pragma solidity ^0.8.0;

import "./EllipticCurve.sol";

contract PedersenHashNaive {
  uint256 private constant FIELD_PRIME = 3618502788666131213697322783095070105623107215331596699973092056135872020481;
  uint256 private constant ALPHA = 1;

  uint256 private constant SHIFT_X = 0x049ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804;
  uint256 private constant SHIFT_Y = 0x03ca0cfe4b3bc6ddf346d49d06ea0ed34e621062c0e056c1d0405d266e10268a;

  uint256 private constant P0_X = 0x0234287dcbaffe7f969c748655fca9e58fa8120b6d56eb0c1080d17957ebe47b;
  uint256 private constant P0_Y = 0x03b056f100f96fb21e889527d41f4e39940135dd7a6c94cc6ed0268ee89e5615;

  uint256 private constant P1_X = 0x04fa56f376c83db33f9dab2656558f3399099ec1de5e3018b7a6932dba8aa378;
  uint256 private constant P1_Y = 0x03fa0984c931c9e38113e0c0e47e4401562761f92a7a23b45168f4e80ff5b54d;

  uint256 private constant P2_X = 0x04ba4cc166be8dec764910f75b45f74b40c690c74709e90f3aa372f0bd2d6997;
  uint256 private constant P2_Y = 0x40301cf5c1751f4b971e46c4ede85fcac5c59a5ce5ae7c48151f27b24b219c;

  uint256 private constant P3_X = 0x054302dcb0e6cc1c6e44cca8f61a63bb2ca65048d53fb325d36ff12c49a58202;
  uint256 private constant P3_Y = 0x01b77b3e37d13504b348046268d8ae25ce98ad783c25561a879dcc77e99c2426;

  uint256 private constant LOW_MASK = 2**248-1;

  uint256 private r;

  function hash(uint256 a, uint256 b) external returns (uint256) {
    require(a > 0 && a < FIELD_PRIME, "a");
    require(b > 0 && b < FIELD_PRIME, "b");

    uint256 fx; uint256 fy; uint256 fz;
    {
      (uint256 flowX, uint256 flowY, uint256 flowZ) = EllipticCurve.jacMul(
        a & LOW_MASK,
        P0_X, P0_Y, 1,
        ALPHA,
        FIELD_PRIME
      );
      (uint256 fhighX, uint256 fhighY, uint256 fhighZ) = EllipticCurve.jacMul(
        a >> 248,
        P1_X, P1_Y, 1,
        ALPHA,
        FIELD_PRIME
      );

      (fx, fy, fz) = EllipticCurve.jacAdd(
        flowX, flowY, flowZ,
        fhighX, fhighY, fhighZ,
        FIELD_PRIME
      );
    }
    uint256 sx; uint256 sy; uint256 sz;
    {
      (uint256 slowX, uint256 slowY, uint256 slowZ) = EllipticCurve.jacMul(
        b & LOW_MASK,
        P2_X, P2_Y, 1,
        ALPHA,
        FIELD_PRIME
      );
      (uint256 shighX, uint256 shighY, uint256 shighZ) = EllipticCurve.jacMul(
        b >> 248,
        P3_X, P3_Y, 1,
        ALPHA,
        FIELD_PRIME
      );

      (sx, sy, sz) = EllipticCurve.jacAdd(
        slowX, slowY, slowZ,
        shighX, shighY, shighZ,
        FIELD_PRIME
      );
    }

    uint256 rx; uint256 ry; uint256 rz;
    (rx, ry, rz) = EllipticCurve.jacAdd(
      SHIFT_X, SHIFT_Y, 1,
      fx, fy, fz,
      FIELD_PRIME
    );

    (rx, ry, rz) = EllipticCurve.jacAdd(
      rx, ry, rz,
      sx, sy, sz,
      FIELD_PRIME
    );

    (uint256 rafX,) = EllipticCurve.toAffine(rx, ry, rz, FIELD_PRIME);
    r = rafX;
    return rafX;
  }
}
