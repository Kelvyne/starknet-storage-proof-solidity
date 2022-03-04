import BN from "bn.js";
import assert from "assert";

import { shiftPoint, prime, p0, p1, p2, p3, LOW_PART_BITS, starkEc } from "./stark";

const WINDOW_SIZE = 8;

const zeroBn = new BN("0");
const twoPowerWindow = new BN(2).pow(new BN(WINDOW_SIZE));

const MASK = new BN(2).pow(new BN(248)).sub(new BN(1));

export function precomputeForPoint(basePoint: any, w: number) {
  const tableSize = Math.pow(2, w);
  return new Array(tableSize)
    .fill(0)
    .map((_, i) => new BN(i))
    .slice(1)
    .map((n) => basePoint.mul(n));
}

export function createWindowedMul(basePoint: any) {
  const table = precomputeForPoint(basePoint, WINDOW_SIZE);
  return (x: BN) => {
    assert(x.lt(prime), "Invalid input: " + x);

    let result = null;
    for (let shift = 248 - WINDOW_SIZE; shift >= 0; shift -= WINDOW_SIZE) {
      if (result) {
        result = result.mul(twoPowerWindow);
      }

      const part = x.shrn(shift).maskn(WINDOW_SIZE).toNumber();


      if (part > 0) {
        const precompute = table[part - 1];
        if (result) {
          result = result.add(precompute);
        } else {
          result = precompute;
        }
      }
    }

    return result ?? starkEc.curve.point();
  };
}

const p1Mul = createWindowedMul(p0);
const p2Mul = createWindowedMul(p1);
const p3Mul = createWindowedMul(p2);
const p4Mul = createWindowedMul(p3);

export function pedersen(aS: string, bS: string) {
  const a = new BN(aS, 16);
  const b = new BN(bS, 16);

  const aLow = a.and(MASK);
  const aHigh = a.shrn(LOW_PART_BITS);
  const bHigh = b.shrn(LOW_PART_BITS);
  const bLow = b.and(MASK);

  const p0mul = p1Mul(aLow);
  const p1mul = p2Mul(aHigh);
  const p2mul = p3Mul(bLow);
  const p3mul = p4Mul(bHigh);

  const aR = p0mul.add(p1mul);
  const bR = p2mul.add(p3mul);

  return shiftPoint.add(aR).add(bR).getX().toString(16);
}
