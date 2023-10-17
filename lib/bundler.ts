import { ethers } from "ethers";

const toHex = (c: any) => `0x${c}`;
const encodePoints = (points: any[]) => {
  return ethers.utils.defaultAbiCoder.encode(
    points.map(() => ['uint256', 'uint256']).flat(),
    points.map((p) => {
      if (p.isInfinity()) {
        return [ethers.constants.HashZero, ethers.constants.HashZero]
      }
      return [toHex(p.getX().toString(16)), toHex(p.getY().toString(16))]
    }).flat()
  );
}

export function bundleTable (iface: any, originalBytecode: string, precomputes: any[]) {
  originalBytecode = originalBytecode.slice(2);
  const ctor =
    "608060405234801561001057600080fd5b5061abcd806100206000396000f300";

  const encodedPoints = encodePoints(precomputes).slice(2);

  const finalDeployedBytecode = originalBytecode + encodedPoints;
  const finalLen = Buffer.from(finalDeployedBytecode, "hex").length;

  const bytecode = ctor.replace("abcd", finalLen.toString(16).padStart(4, "0")) + finalDeployedBytecode;

  return new ethers.ContractFactory(iface, bytecode);
}

