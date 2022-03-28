import { readFileSync, writeFileSync } from "fs";
import tables from "../shifted_tables.json";

const file = "./contracts/templates/PrecomputedTable.sol.template";
const partFile = "./contracts/templates/PrecomputedTablePart.sol.template";

const prefix = "__HERE__\n";

const contractCode = readFileSync(file).toString();
const partCode = readFileSync(partFile).toString();

function formatHex(s: string) {
  return `0x${s}`;
}

function generatePrecomputeTableParts(all: string[][], i: number) {
  const SPLITS_COUNT = 2;
  const splitLen = all.length / SPLITS_COUNT;
  const splits = [all.slice(0, splitLen), all.slice(splitLen)];
  const index = partCode.indexOf(prefix) + prefix.length;

  const start = partCode.substring(0, index);
  const end = partCode.substring(index);

  const codes = splits.map((values: any[], j: number) => {
    const lines = values.map(
      (arr, i) =>
        `    table[${i * 2}] = ${formatHex(arr[0])}; table[${
          i * 2 + 1
        }] = ${formatHex(arr[1])};`
    );

    const total = start + lines.join("\n") + end;
    return total
      .replaceAll("__I__", i.toString())
      .replaceAll("__J__", j.toString());
  });

  return codes;
}

function generatePrecomputeTable(values: string[][], i: number) {
  const parts = generatePrecomputeTableParts(values, i);
  const code = contractCode.replaceAll("__I__", i.toString());

  return { idx: i, code, parts };
}

function writeFiles(contract: any) {
  writeFileSync(
    `./contracts/precomputed/PrecomputedTable${contract.idx}.sol`,
    contract.code
  );

  contract.parts.forEach((part: any, j: number) =>
    writeFileSync(
      `./contracts/precomputed/PrecomputedTable${contract.idx}x${j}.sol`,
      part
    )
  );
}

async function main() {
  const contracts = tables.map(generatePrecomputeTable);

  contracts.forEach(writeFiles);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
