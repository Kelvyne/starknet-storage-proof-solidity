// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./EllipticCurve.sol";
import "hardhat/console.sol";

interface PrecomputedTable {
  function get(uint8 n) external pure returns(uint256 x, uint256 y);
}

contract PedersenHash {
  uint256 private constant PRIME = 0x800000000000011000000000000000000000000000000000000000000000001;

  PrecomputedTable[] private tables;

  constructor(PrecomputedTable[] memory _tables) {
    tables = _tables;
  }

  function hash(uint256 a, uint256 b) external view returns (uint256) {
    require(a < PRIME && b < PRIME, "invalid input");
    bytes memory input = new bytes(64);

    assembly { mstore(add(input, 32), a) mstore(add(input, 64), b) }

    (uint256 aX, uint256 aY) = (tables[0].get(uint8(input[0])));
    uint256 aZ = 1;

    for (uint i = 1; i < 64; ++i) {
      (uint256 bX, uint256 bY) = tables[i].get(uint8(input[i]));
      //(aX, aY, aZ) = EllipticCurve.jacAdd(aX, aY, aZ, bX, bY, 1, PRIME);

      assembly {
        // Set (aX, aY, aZ) to be the sum of the EC points (aX, aY, aZ) and (bX, bY, 1).
        let minusAZ := sub(PRIME, aZ)
        // Slope = sN/sD =  {(aY/aZ) - (bY/1)} / {(aX/aZ) - (bX/1)}.
        // sN = aY - bY * aZ.
        let sN := addmod(aY, mulmod(minusAZ, bY, PRIME), PRIME)

        let minusAZBX := mulmod(minusAZ, bX, PRIME)
        // sD = aX - bX * aZ.
        let sD := addmod(aX, minusAZBX, PRIME)

        let sSqrD := mulmod(sD, sD, PRIME)

        // Compute the (affine) x coordinate of the result as xN/xD.

        // (xN/xD) = ((sN)^2/(sD)^2) - (aX/aZ) - (bX/1).
        // xN = (sN)^2 * aZ - aX * (sD)^2 - bX * (sD)^2 * aZ.
        // = (sN)^2 * aZ + (sD^2) (bX * (-aZ) - aX).
        let xN := addmod(
          mulmod(mulmod(sN, sN, PRIME), aZ, PRIME),
          mulmod(sSqrD, add(minusAZBX, sub(PRIME, aX)), PRIME),
          PRIME
        )

        // xD = (sD)^2 * aZ.
        let xD := mulmod(sSqrD, aZ, PRIME)

        // Compute (aX', aY', aZ') for the next iteration and assigning them to (aX, aY, aZ).
        // (y/z) = (sN/sD) * {(bX/1) - (xN/xD)} - (bY/1).
        // aZ' = sD*xD.
        aZ := mulmod(sD, xD, PRIME)
        // aY' = sN*(bX * xD - xN) - bY*z = -bY * z + sN * (-xN + xD*bX).
        aY := addmod(
          sub(PRIME, mulmod(bY, aZ, PRIME)),
          mulmod(sN, add(sub(PRIME, xN), mulmod(xD, bX, PRIME)), PRIME),
          PRIME
        )

        // As the value of the affine x coordinate is xN/xD and z=sD*xD,
        // the projective x coordinate is xN*sD.
        aX := mulmod(xN, sD, PRIME)
      }
    }
    uint256 invZ = EllipticCurve.invMod(aZ, PRIME);
    return mulmod(aX, invZ, PRIME);
  }
}
