import BN from "bn.js";
import { starkEc } from "./stark";
import tables from "../shifted_tables.json";

function parsePoint(point: string[]) {
  const x = new BN(point[0], 16);
  const y = new BN(point[1], 16);
  return starkEc.curve.point(x, y);
}
export const precomputes = tables.map((points: any) => points.map(parsePoint));

export function pedersen(aS: string, bS: string) {
  const a = new BN(aS, 16);
  const b = new BN(bS, 16);

  const buffer = Array.from(
    Buffer.concat([a.toBuffer("be", 32), b.toBuffer("be", 32)])
  );

  let result = precomputes[0][buffer[0]];
  for (let i = 1; i < buffer.length; i++) {
    const point = precomputes[i][buffer[i]];
    result = result.add(point);
  }

  return result.getX().toString(16);
}
