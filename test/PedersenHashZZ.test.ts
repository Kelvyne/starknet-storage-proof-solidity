import { ethers } from "hardhat";
import { expect } from "chai";
import { pedersen as shamirPedersen, createShamirMul } from "../lib/shamir";
import { p0, p1, p2, p3 } from "../lib/stark";
import testCases from "./fixtures.json";
import { bundleTable } from "../lib/bundler";

import PedersenHashZZArtifact from "../artifacts/contracts/PedersenHashZZ.sol/PedersenHashZZ.json";

describe("PedersenHashZZ", () => {
  let pedersenHashZZ: any;

  beforeEach(async () => {
    const shamir = createShamirMul(p0, p1, p2, p3);
    const PedersenHashZZ = await ethers.getContractFactory("PedersenHashZZ");

    const BundledPedersenHashZZ = bundleTable(PedersenHashZZ.interface, PedersenHashZZArtifact.deployedBytecode, shamir.precomputes);

    pedersenHashZZ = await BundledPedersenHashZZ.connect(PedersenHashZZ.signer).deploy();
  });

  testCases.forEach((c) => {
    it(`${c.name}: shamir table implementation should match original implementation`, async () => {
        const toHex = (c: any) => `0x${c}`;

        const result = await pedersenHashZZ.hash(toHex(c.a), toHex(c.b));
        await pedersenHashZZ.measure_hash(toHex(c.a), toHex(c.b));
        expect(result).to.equal(ethers.BigNumber.from(`0x${c.expected}`));
    });
  });
});

