import { ethers } from "hardhat";
import { expect } from "chai";
import { create as createInterleaved } from "../lib/interleaved";
import { p0, p1, p2, p3 } from "../lib/stark";
import fixtures from "./fixtures.json";
import { bundleTable } from "../lib/bundler";

import InterleavedPedersenHashZZArtifact from "../artifacts/contracts/InterleavedPedersenHashZZ.sol/InterleavedPedersenHashZZ.json";

const testCases = fixtures;

describe("InterleavedPedersenHashZZ", () => {
  let pedersenHashZZ: any;

  beforeEach(async () => {
    const InterleavedPedersenHashZZ = await ethers.getContractFactory("InterleavedPedersenHashZZ");

    const interleaved = createInterleaved();

    const Table = bundleTable([], "0x", interleaved.p1p3);

    const table = await Table.connect(InterleavedPedersenHashZZ.signer).deploy();

    const BundledPedersenHashZZ = interleaved.bundle(
      InterleavedPedersenHashZZ.interface,
      InterleavedPedersenHashZZArtifact.deployedBytecode,
      table.address,
    );

    pedersenHashZZ = await BundledPedersenHashZZ.connect(InterleavedPedersenHashZZ.signer).deploy();
  });

  testCases.forEach((c) => {
    it(`${c.name}: shamir table implementation should match original implementation`, async () => {
      const toHex = (c: any) => `0x${c}`;

      const result = await pedersenHashZZ.hash(toHex(c.a), toHex(c.b));
      expect(result).to.equal(ethers.BigNumber.from(`0x${c.expected}`));
      await pedersenHashZZ.measure_hash(toHex(c.a), toHex(c.b));
    });
  });
});

