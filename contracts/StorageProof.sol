// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./EllipticCurve.sol";
import "hardhat/console.sol";

contract StorageProof {
  uint256 private constant PRIME = 0x800000000000011000000000000000000000000000000000000000000000001;
  address[64] private table;

  error InvalidProofLength();
  error InvalidHash(uint256 step);
  error InvalidHeaderType(uint8 t);
  error InvalidValue(uint256 expected, uint256 actual);
  error InvalidPath(uint256 expected, uint256 actual);
  error IncompletePath(uint256 bits);

  struct VerifyContext {
    uint256 stateRoot;
    uint256 contractAddress;
    uint256 contractRoot;
    uint256 contractSlot;
    uint256 slotValue;
  }

  constructor(address[64] memory _table) {
    table = _table;
  }

  function verify(
    VerifyContext calldata context,
    bytes memory proof,
    bytes memory headers
  ) external {
    if (proof.length % 64 != 0) revert InvalidProofLength();

    uint256 steps = proof.length / 64;
    uint256[] memory precomputes = new uint256[](2 * proof.length);

    for (uint256 i = 0; i < 64; i++) {
      assembly {
        if iszero(
          staticcall(
            gas(),
            sload(i),
            add(proof, 32),
            mload(proof),
            add(add(precomputes, 32), mul(i, mul(mul(steps, 2), 32))),
            mul(mul(steps, 2), 32)
        )
        ) {
          returndatacopy(0, 0, returndatasize())
          revert(0, returndatasize())
        }
      }
    }

    uint bits = 251;
    uint256 path = context.contractAddress;
    uint256 expected = context.stateRoot;
    for (uint256 k = 0; k < steps; k++) {
      {
        {
          uint256 a; uint256 b;
          assembly {
            a := mload(add(proof, add(mul(k, 64), 32)))
            b := mload(add(proof, add(mul(k, 64), 64)))
          }
          require(a < PRIME && b < PRIME, "size");
        }

        (uint256 aX, uint256 aY) = (precomputes[2 * k], precomputes[2 * k + 1]);
        uint256 aZ = 1;

        for (uint i = 1; i < 64; ++i) {
          (uint256 bX, uint256 bY) = (
            precomputes[i * steps * 2 + (k * 2)],
            precomputes[i * steps * 2 + (k * 2 + 1)]
          );

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
        {
          // Naive: in some cases we need to add length to the hash. Let's just recover the hash
          // and compare like this for the moment
          uint256 invZ = EllipticCurve.invMod(aZ, PRIME);
          uint256 hash = mulmod(aX, invZ, PRIME);

          // For edge nodes, we need to add the edgth path length to the hash before checking
          // I'm sure there is a more efficient way to do this
          if (uint8(headers[2 * k]) == 2) {
            hash = addmod(hash, uint8(headers[2 * k + 1]), PRIME);
          }
          if (expected != hash) revert InvalidHash(k);
        }
      }
      {
        uint8 t = uint8(headers[2 * k]);
        if (t == 1) {
          uint8 bit = uint8(path >> (bits - 1) & 0x1);
          assembly {
            expected := mload(add(add(add(proof, 32), mul(k, 64)), mul(bit, 32)))
          }
          bits--;
        } else if (t == 2) {
          uint256 edgePath;
          assembly {
            edgePath := mload(add(add(proof, 64), mul(k, 64)))
            expected := mload(add(add(proof, 32), mul(k, 64)))
          }
          bits = _checkPath(bits, uint8(headers[2 * k + 1]), edgePath, path);
        } else if (t == 4 || t == 8) {
          // TODO: ensure that state hash version is 0 ?
          // TODO: ensure that contract nonce is the right value ?
          // I do not think this is a security issue, since an attacker would still have
          // to come up with the right hash
          assembly {
            expected := mload(add(add(proof, 32), mul(k, 64)))
          }
        } else if (t == 16) {
          // TODO: ensure that contract class hash and state root are valid ?
          if (bits != 0) revert IncompletePath(bits);
          assembly {
            expected := mload(add(add(proof, 64), mul(k, 64)))
          }
          bits = 251;
          path = context.contractSlot;
        } else {
          revert InvalidHeaderType(t);
        }
      }
    }
    if (bits != 0) revert IncompletePath(bits);
    if (context.slotValue != expected) revert InvalidValue(context.slotValue, expected);
  }

  function _checkPath(uint256 bits, uint256 pathLen, uint256 path, uint256 v) private pure returns (uint256) {
    uint256 mask = (2**pathLen) - 1;
    uint256 x = v >> (bits - pathLen) & mask;
    if (x & path != x) revert InvalidPath(path, x);
    return bits - pathLen;
  }
}
