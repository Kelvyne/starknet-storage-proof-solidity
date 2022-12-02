import BN from "bn.js";
import { shiftPoint, p0, p1, p2, p3, starkEc } from "./stark";
import tables from "../tables.json";

const WINDOW_SIZE = 8;

function parsePoint(point: string[]) {
  const x = new BN(point[0], 16);
  const y = new BN(point[1], 16);
  return starkEc.curve.point(x, y);
}
const precomputes = tables.map((points: any) => points.map(parsePoint));

export function precomputeForPoint(basePoint: any, w: number, idx: number) {
  const tableSize = Math.pow(2, w);

  const factor = new BN(2).pow(new BN(w * idx));

  return new Array(tableSize)
    .fill(0)
    .map((_, i) => new BN(i))
    .map((n) => basePoint.mul(factor.mul(n)));
}

export function precompute() {
  return [
    precomputeForPoint(p1, WINDOW_SIZE, 0),
    ...new Array(31)
      .fill(0)
      .map((_, idx) => precomputeForPoint(p0, WINDOW_SIZE, 30 - idx)),
    precomputeForPoint(p3, WINDOW_SIZE, 0),
    ...new Array(31)
      .fill(0)
      .map((_, idx) => precomputeForPoint(p2, WINDOW_SIZE, 30 - idx)),
  ];
}

export function pedersen(aS: string, bS: string) {
  const a = new BN(aS, 16);
  const b = new BN(bS, 16);

  const buffer = Array.from(
    Buffer.concat([a.toBuffer("be", 32), b.toBuffer("be", 32)])
  );

  let result = shiftPoint;
  for (let i = 0; i < buffer.length; i++) {
    const point = precomputes[i][buffer[i]];
    if (buffer[i] > 0) {
      result = result.add(point);
    }
  }

  return result.getX().toString(16);
}
