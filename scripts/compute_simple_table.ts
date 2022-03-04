import { ethers } from "hardhat";
import BN from "bn.js";

import { constantPoints } from "../lib/stark";

const WINDOW_SIZE = 4;

function precomputeForPoint(basePoint: any, w: number) {
  const tableSize = Math.pow(2, w);
  return new Array(tableSize)
    .fill(0)
    .map((_, i) => new BN(i))
    .map((n) => basePoint.mul(n));
}

async function main() {
  const p0 = constantPoints[2];

  const table = precomputeForPoint(p0, WINDOW_SIZE);

  console.log(table);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
