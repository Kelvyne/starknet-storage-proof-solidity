import BN from "bn.js";
import assert from "assert";

import { constantPoints, shiftPoint, prime } from "./stark";

const zeroBn = new BN("0");
const oneBn = new BN("1");

export default function pedersen(input: any) {
  let point = shiftPoint;
  for (let i = 0; i < input.length; i++) {
    let x = new BN(input[i], 16);
    assert(x.gte(zeroBn) && x.lt(prime), "Invalid input: " + input[i]);
    for (let j = 0; j < 252; j++) {
      const pt = constantPoints[2 + i * 252 + j];
      assert(!point.getX().eq(pt.getX()));
      if (x.and(oneBn).toNumber() !== 0) {
        point = point.add(pt);
      }
      x = x.shrn(1);
    }
  }
  return point.getX().toString(16);
}
