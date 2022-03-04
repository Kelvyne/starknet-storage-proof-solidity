import BN from "bn.js";
import { writeFileSync } from "fs";

import tables from "../tables.json";

import { shiftPoint, starkEc } from "../lib/stark";

function serializePoint(point: any) {
  if (point.inf) {
    return [null, null];
  }
  return [point.getX().toString(16), point.getY().toString(16)];
}

function parsePoint(point: string[]) {
  const x = new BN(point[0] ?? "0", 16);
  const y = new BN(point[1] ?? "0", 16);
  return starkEc.curve.point(x, y);
}

const firstShift = shiftPoint.mul(new BN(2).pow(new BN(63)));
function shiftFirst(point: string[]) {
  return parsePoint(point).add(firstShift);
}

function shiftOthers(k: number) {
  const kShift = shiftPoint.neg().mul(new BN(2).pow(new BN(63 - k)));
  return (point: string[]) => parsePoint(point).add(kShift);
}

async function main() {
  const shiftedTables = [
    (tables[0] as any).map(shiftFirst),
    ...tables
      .slice(1)
      .map((values, i) => (values as any[]).map(shiftOthers(i + 1))),
  ];

  const serialized = shiftedTables.map((points) => points.map(serializePoint));

  writeFileSync(
    "/tmp/shifted_tables.json",
    JSON.stringify(serialized, undefined, "  ")
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
