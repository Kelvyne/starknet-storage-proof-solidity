import BN from "bn.js";
import assert from "assert";

import { shiftPoint, prime, p0, p1, p2, p3, LOW_PART_BITS } from "./stark";

const MASK = new BN(2).pow(new BN(248)).sub(new BN(1));

export function pedersen(aS: string, bS: string) {
  const a = new BN(aS, 16);
  const b = new BN(bS, 16);

  assert(a.lt(prime) && b.lt(prime), "invalid input");

  const aHigh = a.shrn(LOW_PART_BITS);
  const aLow = a.and(MASK);

  const bHigh = b.shrn(LOW_PART_BITS);
  const bLow = b.and(MASK);

  const p0mul = p0.mul(aLow);
  const p1mul = p1.mul(aHigh);
  const p2mul = p2.mul(bLow);
  const p3mul = p3.mul(bHigh);

  const aR = p0mul.add(p1mul);
  const bR = p2mul.add(p3mul);

  return shiftPoint.add(aR).add(bR).getX().toString(16);
}
