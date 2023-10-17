import { ethers } from "ethers";
import BN from "bn.js";
import { starkEc, shiftPoint, p0, p1, p2, p3, LOW_PART_BITS } from './stark';

const MASK = new BN(2).pow(new BN(LOW_PART_BITS)).sub(new BN(1));
const _2e124 = new BN(2).pow(new BN(124));
const _2e62 = new BN(2).pow(new BN(62));
const _1 = new BN(1);

const toHex = (c: any) => `0x${c}`;
const encodePoints = (points: any[]) => {
  return ethers.utils.defaultAbiCoder.encode(
    points.map(() => ['uint256', 'uint256']).flat(),
    points.map((p) => {
      if (p.isInfinity()) {
        return [ethers.constants.HashZero, ethers.constants.HashZero]
      }
      return [toHex(p.getX().toString(16)), toHex(p.getY().toString(16))]
    }).flat()
  );
}

export function createShamirMul2(p0: any, p1: any) {
  const powers = new Array(8);
  powers[0] = p0;
  powers[1] = powers[0].mul(_2e62);
  powers[2] = powers[1].mul(_2e62);
  powers[3] = powers[2].mul(_2e62);
  powers[4] = p1;
  powers[5] = powers[4].mul(_2e62);
  powers[6] = powers[5].mul(_2e62);
  powers[7] = powers[6].mul(_2e62);

  const precomputes = new Array(256).fill(0).map((_, i) => {
    let r = starkEc.curve.point(null, null);
    for (let bit = 0; bit < 8; ++bit) {
      if ((i >> bit) & 1) r = r.add(powers[bit]);
    }
    return r;
  });

  return { precomputes };
}

export function createShamirMul(
  p0: any, 
  p1: any, 
  p2: any, 
  p3: any
) {
  const powers = new Array(8);
  powers[0] = p0;
  powers[1] = p0.mul(_2e124);
  powers[2] = p1;
  powers[3] = p1.mul(_2e124);
  powers[4] = p2;
  powers[5] = p2.mul(_2e124);
  powers[6] = p3;
  powers[7] = p3.mul(_2e124);

  const precomputes = new Array(256).fill(0).map((_, i) => {
    let r = starkEc.curve.point(null, null);
    for (let bit = 0; bit < 8; ++bit) {
      if ((i >> bit) & 1) r = r.add(powers[bit]);
    }
    return r;
  });


  return {
    precomputes,
    f(aS: string, bS: string) {
      const a = new BN(aS, 16);
      const b = new BN(bS, 16);

      const aLow = a.and(MASK);
      const aHigh = a.shrn(LOW_PART_BITS);
      const bHigh = b.shrn(LOW_PART_BITS);
      const bLow = b.and(MASK);

      let r = starkEc.curve.point(null, null);
      for (let i = 247; i >= 124; --i) {
        const offset = i - 124;
        const bits = new BN(0)
          .add(aLow.shrn(offset).and(_1))
          .add(aLow.shrn(offset + 124).and(_1).shln(1))
          .add(aHigh.shrn(offset).and(_1).shln(2))
          .add(aHigh.shrn(offset + 124).and(_1).shln(3))
          .add(bLow.shrn(offset).and(_1).shln(4))
          .add(bLow.shrn(offset + 124).and(_1).shln(5))
          .add(bHigh.shrn(offset).and(_1).shln(6))
          .add(bHigh.shrn(offset + 124).and(_1).shln(7));

        const p = precomputes[bits.toNumber()];

        r = r.dbl();
        r = r.add(p);
      }
      return r.add(shiftPoint).getX().toString(16);
    },
  };
}

export function pedersen(aS: string, bS: string) {
  const { f } = createShamirMul(p0, p1, p2, p3);

  return f(aS, bS);
}
