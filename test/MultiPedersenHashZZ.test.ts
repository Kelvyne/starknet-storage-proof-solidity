import { ethers } from "hardhat";
import { expect } from "chai";
import { pedersen as shamirPedersen, createShamirMul } from "../lib/shamir";
import { p0, p1, p2, p3 } from "../lib/stark";
import fixtures from "./fixtures.json";

const testCases = fixtures;

import MultiPedersenHashZZArtifact from "../artifacts/contracts/MultiPedersenHashZZ.sol/MultiPedersenHashZZ.json";

describe.only("MultiPedersenHashZZ", () => {
  let pedersenHashZZ: any;

  beforeEach(async () => {
    const shamir = createShamirMul(p0, p1, p2, p3);
    const MultiPedersenHashZZ = await ethers.getContractFactory("MultiPedersenHashZZ");

    const BundledPedersenHashZZ = shamir.bundleTable(MultiPedersenHashZZ.interface, MultiPedersenHashZZArtifact.deployedBytecode);

    pedersenHashZZ = await BundledPedersenHashZZ.connect(MultiPedersenHashZZ.signer).deploy();
  });

  it('should compute all the pedersen hashes', async () => {
    const toHex = (c: any) => `0x${c}`;
    const input = ethers.utils.defaultAbiCoder.encode(
      new Array(testCases.length * 2).fill("uint256"),
      testCases.map((c) => [toHex(c.a), toHex(c.b)]).flat()
    );

    const result = await pedersenHashZZ.hash(input);
    expect(result.length).to.equal(testCases.length);
    result.forEach((v: any, i: any) => {
      expect(v).to.equal(ethers.BigNumber.from(`0x${testCases[i].expected}`));
    });

    await pedersenHashZZ.measure_hash(input);

  });
});

