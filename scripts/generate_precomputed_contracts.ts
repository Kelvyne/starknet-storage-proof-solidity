import * as path from "path";
import * as fs from "fs";
import ContractArtifact from "../artifacts/contracts/ContractCodePrecomputed.sol/ContractCodePrecomputed.json";
import { ethers } from "ethers";
import { precomputes } from "../lib/shifted_tables";

const deployedBytecode = ContractArtifact.deployedBytecode.slice(2);

const INDEX_PLACEHOLDER = "fafbfcfd";
const OFFSET_PLACEHOLDER = "eaebeced";

const toHex = (c: any) => `0x${c}`;
const encodePoints = (points: any[]) =>
  ethers.utils.defaultAbiCoder.encode(
    new Array(points.length * 2).fill("uint256"),
    points
      .map((p) => [toHex(p.getX().toString(16)), toHex(p.getY().toString(16))])
      .flat()
  );

async function main() {
  const dbLen = Buffer.from(deployedBytecode, "hex").length;
  // replace contract constructor by our crafted one
  const ctor =
    "608060405234801561001057600080fd5b5061abcd806100206000396000f300";

  const offset = dbLen.toString(16).padStart(8, "0");

  const finalBytecodes = precomputes.map((points, index) => {
    const code = deployedBytecode
      .replace(INDEX_PLACEHOLDER, index.toString(16).padStart(8, "0"))
      .replace(OFFSET_PLACEHOLDER, offset);
    const encodedPoints = encodePoints(points).slice(2);
    const finalDeployedBytecode = code + encodedPoints;
    const b = Buffer.from(finalDeployedBytecode, "hex");
    const finalLen = Buffer.from(finalDeployedBytecode, "hex").length;
    return ctor.replace("abcd", finalLen.toString(16).padStart(4, "0")) + finalDeployedBytecode;
  });

  console.log(
    "Writing precomputed shifted points bytecodes.",
    "n=", finalBytecodes.length,
    "offset=", parseInt(offset, 16)
  );

  finalBytecodes.forEach((bytecode, index) => {
    const bytecodePath = path.join(
      __dirname,
      "..",
      "generated",
      `${index}.bytecode`
    );

    fs.writeFileSync(bytecodePath, bytecode);
  });
}

main().catch(console.error);
