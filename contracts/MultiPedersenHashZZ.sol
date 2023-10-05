// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract MultiPedersenHashZZ {
  // source: https://github.com/starkware-libs/cairo-lang/blob/master/src/starkware/crypto/signature/pedersen_params.json
  uint256 private constant p = 3618502788666131213697322783095070105623107215331596699973092056135872020481;
  uint256 private constant a = 1;
  uint256 private constant b = 3141592653589793238462643383279502884197169399375105820974944592307816406665;
  uint256 private constant n = 3618502788666131213697322783095070105526743751716087489154079457884512865583;

  uint256 private constant minus_2 = 3618502788666131213697322783095070105623107215331596699973092056135872020479;

  uint256 constant minus_1 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

  uint256 private constant SHIFT_X = 0x049ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804;
  uint256 private constant SHIFT_Y = 0x03ca0cfe4b3bc6ddf346d49d06ea0ed34e621062c0e056c1d0405d266e10268a;

  uint256 private constant LOW_MASK = 2**248-1;

  constructor() {}

  function computeBits(
    uint256 aLow, uint256 aHigh,
    uint256 bLow, uint256 bHigh,
    uint256 i
  ) private pure returns (uint256) {
      uint256 offset = i - 124;
      return ((aLow >> offset) & 1) |
        ((aLow >> i) & 1) << 1 |
        ((aHigh >> offset) & 1) << 2 |
        ((aHigh >> i) & 1) << 3 |
        ((bLow >> offset) & 1) << 4|
        ((bLow >> i) & 1) << 5 |
        ((bHigh >> offset) & 1) << 6 |
        ((bHigh >> i) & 1) << 7;
  }

  // h(a, b) = [shift_point + low(a) * P0 + high(a) * P1 + low(b) * P2 + high(b) * P3].x
  function hash(bytes calldata input) public view returns (uint256[] memory output) {
    uint256 inputLen = input.length;
    uint256 n = inputLen / 64;
    output = new uint256[](n);

    uint256 x; uint256 y; uint256 z; uint256 zz;
    uint256[2] memory ab;
    for (uint256 j = 0; j < n; ++j) {
      assembly {
        calldatacopy(ab, add(input.offset, mul(64, j)), 64)
      }
      require(ab[0] < p, "a");
      require(ab[1] < p, "b");

      (x, y, z, zz) = (0, 0, 1, 1);
      for (uint256 i = 247; i >= 124; --i) {
        assembly {
          calldatacopy(ab, add(input.offset, mul(64, j)), 64)
        }
        uint256 bits = computeBits(
          ab[0] & LOW_MASK,
          ab[0] >> 248,
          ab[1] & LOW_MASK,
          ab[1] >> 248,
          i
        );

        (x, y, z, zz) = ecZZ_Dbl(x, y, z, zz);
        assembly {
          let pOffset := add(
            sub(codesize(), 16384),
            mul(bits, 64)
          )

          codecopy(ab, pOffset, 64)
          copy := pOffset
        }

        (x, y, z, zz) = ecZZ_AddN(x, y, z, zz, ab[0], ab[1]);
      }

      (x, y, z, zz) = ecZZ_AddN(x, y, z, zz, SHIFT_X, SHIFT_Y);
      (output[j],) = ecZZ_SetAff(x, y, z, zz);
    }
    return output;
  }

  event MeasureHash(uint256 indexed hash);

  function measure_hash(bytes calldata input) public {
    uint256[] memory hash = hash(input);
    emit MeasureHash(hash[0]);
  }

  function ecZZ_Dbl(
    uint x,
    uint y,
    uint zz,
    uint zzz
  ) internal pure returns (uint P0, uint P1,uint P2,uint P3)
  {
    if (y == 0) {
      return (x, y, zz, zzz);
    }
    assembly {
      // U = 2*Y1
      let U := mulmod(2, y, p)
      // V = U2
      let V := mulmod(U, U, p)
      // W = U*V
      let W := mulmod(U, V, p)
      // S = X1*V
      let S := mulmod(x, V, p)
      // M = 3*X1^2+a*ZZ1^2
      let M := addmod(mulmod(3, mulmod(x, x, p), p), mulmod(a, mulmod(zz, zz, p), p), p)
      // X3 = M2-2*S
      P0 := addmod(mulmod(M, M, p), mulmod(minus_2, S, p), p)
      // Y3 = M*(S-X3)-W*Y1
      let t := mulmod(M, addmod(S, sub(p, P0), p), p)
      P1 := addmod(t, sub(p, mulmod(W, y, p)), p)
      // ZZ3 = V*ZZ1
      P2 := mulmod(V, zz, p)
      // ZZZ3 = W*ZZZ1
      P3 := mulmod(W, zzz, p)
    }

    return (P0, P1, P2, P3);
  }

  function ecZZ_AddN(uint256 x1, uint256 y1, uint256 zz1, uint256 zzz1, uint256 x2, uint256 y2) internal pure 
  returns (uint256 P0, uint256 P1, uint256 P2, uint256 P3)
  {
    unchecked {
      if (y1 == 0) {
        return (x2, y2, 1, 1);
      }
      if (y2 == 0) {
        return (x1, y1, zz1, zzz1);
      }

      assembly {
        y1 := sub(p, y1)
        y2 := addmod(mulmod(y2, zzz1, p), y1, p)
        x2 := addmod(mulmod(x2, zz1, p), sub(p, x1), p)
        P0 := mulmod(x2, x2, p) //PP = P^2
        P1 := mulmod(P0, x2, p) //PPP = P*PP
        P2 := mulmod(zz1, P0, p) ////ZZ3 = ZZ1*PP
        P3 := mulmod(zzz1, P1, p) ////ZZZ3 = ZZZ1*PPP
        zz1 := mulmod(x1, P0, p) //Q = X1*PP
        P0 := addmod(addmod(mulmod(y2, y2, p), sub(p, P1), p), mulmod(minus_2, zz1, p), p) //R^2-PPP-2*Q
        P1 := addmod(mulmod(addmod(zz1, sub(p, P0), p), y2, p), mulmod(y1, P1, p), p) //R*(Q-X3)
      }
      //end assembly
    } //end unchecked
    return (P0, P1, P2, P3);
  }

  function FCL_pModInv(uint256 u) internal view returns (uint256 result) {
    uint256[6] memory pointer;
    assembly {
      // Define length of base, exponent and modulus. 0x20 == 32 bytes
      mstore(pointer, 0x20)
      mstore(add(pointer, 0x20), 0x20)
      mstore(add(pointer, 0x40), 0x20)
      // Define variables base, exponent and modulus
      mstore(add(pointer, 0x60), u)
      mstore(add(pointer, 0x80), minus_2)
      mstore(add(pointer, 0xa0), p)

      // Call the precompiled contract 0x05 = ModExp
      if iszero(staticcall(not(0), 0x05, pointer, 0xc0, pointer, 0x20)) { revert(0, 0) }
      result := mload(pointer)
    }
  }

  function ecZZ_SetAff(uint256 x, uint256 y, uint256 zz, uint256 zzz) view internal returns (uint256 x1, uint256 y1) {
    uint256 zzzInv = FCL_pModInv(zzz); //1/zzz
    y1 = mulmod(y, zzzInv, p); //Y/zzz
    uint256 _b = mulmod(zz, zzzInv, p); //1/z
    zzzInv = mulmod(_b, _b, p); //1/zz
    x1 = mulmod(x, zzzInv, p); //X/zz
  }

}