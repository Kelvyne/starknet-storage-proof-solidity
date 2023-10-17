import { ethers } from "ethers";
import BN from "bn.js";
import { precomputeForPoint as windowedPrecompute } from "./windowed";
import { createShamirMul2 } from "./shamir";
import { starkEc, shiftPoint, p0, p1, p2, p3, LOW_PART_BITS } from "./stark";
import { bundleTable } from "./bundler";

const MASK = new BN(2).pow(new BN(LOW_PART_BITS)).sub(new BN(1));
const _1 = new BN(1);

export function create() {
  const p1Precompute = windowedPrecompute(p1, 4);
  const p3Precompute = windowedPrecompute(p3, 4);

  const p1p3 = new Array(2**8)
    .fill(0)
    .map((_, i) => {
      const p1Part = (i >> 4) & 0xf;
      const p3Part = i & 0xf;

      return shiftPoint.add(p1Precompute[p1Part]).add(p3Precompute[p3Part]);
    });

  const { precomputes: p0p2 } = createShamirMul2(p0, p2);

  return {
    p1p3,
    p0p2,
    f(aS: string, bS: string) {
      const a = new BN(aS, 16);
      const b = new BN(bS, 16);

      const aLow = a.and(MASK);
      const bLow = b.and(MASK);

      let r = starkEc.curve.point(null, null); 
      for (let i = 247; i >= 186; --i) {
        const offset = i - 186;
        const bits = new BN(0)
          .add(aLow.shrn(offset).and(_1))
          .add(aLow.shrn(offset + 62).and(_1).shln(1))
          .add(aLow.shrn(offset + 124).and(_1).shln(2))
          .add(aLow.shrn(offset + 186).and(_1).shln(3))
          .add(bLow.shrn(offset).and(_1).shln(4))
          .add(bLow.shrn(offset + 62).and(_1).shln(5))
          .add(bLow.shrn(offset + 124).and(_1).shln(6))
          .add(bLow.shrn(offset + 186).and(_1).shln(7))

        const p = p0p2[bits.toNumber()];
        r = r.dbl();
        r = r.add(p);
      }

      const aHigh = a.shrn(LOW_PART_BITS);
      const bHigh = b.shrn(LOW_PART_BITS);
      const p = p1p3[aHigh.toNumber() << 4 | bHigh.toNumber()];

      r = r.add(p);
      return r.getX().toString(16);
    },
    bundle(iface: any, originalBytecode: string, p1p3: string) {
      return bundleTable(iface, originalBytecode + ethers.utils.getAddress(p1p3).slice(2), p0p2);
    }
  }
}
