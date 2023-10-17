import { ethers } from "hardhat";
import * as path from "path"
import * as fs from "fs";
import { expect } from "chai";
import testCases from "./fixtures.json";
import { precomputes as shiftedPrecomputes } from "../lib/shifted_tables";

describe("PedersenHash", () => {
  let precomputedContracts: any[64];

  before(async () => {
    precomputedContracts = await Promise.all(
      new Array(64).fill(0).map(async (_, k) => {
        const generatedPath = path.join(__dirname, "..", "generated");

        const bytecodePath = path.join(generatedPath, `${k}.bytecode`);
        const bytecode = fs.readFileSync(bytecodePath);
        const ContractCodePrecomputed = await ethers.getContractFactory(
          "ContractCodePrecomputed"
        );
        const factory = new ethers.ContractFactory(
          ContractCodePrecomputed.interface,
          bytecode.toString(),
          ContractCodePrecomputed.signer
        );

        return factory.deploy();
      })
    );
  });

  describe("ContractCodePrecomputed", () => {
    new Array(64).fill(0).forEach((_, k) => {
      it(`${k}: should return correct EC point`, async () => {
        const contract = precomputedContracts[k];
        const multiplier = ethers.BigNumber.from(2).pow(248 - (k % 32) * 8);
        const input = new Array(256)
          .fill(0)
          .map((_, i) => ethers.BigNumber.from(i).mul(multiplier));

        const toBN = (v: any) => ethers.BigNumber.from(`0x${v.toString(16)}`);

        const encodedInput = input.map((v) => {
          const e = ethers.utils.defaultAbiCoder
            .encode(["uint256"], [v])
            .slice(2);
          return k >= 32 ? e.padStart(128, "0") : e.padEnd(128, "0");
        });
        const encodedResult = await ethers.provider.call({
          to: contract.address,
          data: "0x" + encodedInput.join(""),
        });

        const result = ethers.utils.defaultAbiCoder.decode(
          new Array(512).fill("uint256"),
          encodedResult
        );
        // contract.get("0x" + encodedInput.join(""));

        expect(result.length).to.equal(shiftedPrecomputes[k].length * 2);
        shiftedPrecomputes[k].forEach((p: any, i: number) => {
          const [x, y] = [toBN(p.getX()), toBN(p.getY())];

          expect(result[i * 2]).to.equal(x);
          expect(result[i * 2 + 1]).to.equal(y);
        });
      });
    });
  });

  it("original & full lookup tables contract should match", async () => {
    const PedersenHash = await ethers.getContractFactory("PedersenHash");

    const pedersenHash = await PedersenHash.deploy(
      precomputedContracts.map((c: any) => c.address as string)
    );

    const toHex = (c: any) => `0x${c}`;
    const input = ethers.utils.defaultAbiCoder.encode(
      new Array(testCases.length * 2).fill("uint256"),
      testCases.map((c) => [toHex(c.a), toHex(c.b)]).flat()
    );


    const result = await pedersenHash.hash(input);
    expect(result.length).to.equal(testCases.length);
    result.forEach((v: any, i: any) => {
      expect(v).to.equal(ethers.BigNumber.from(`0x${testCases[i].expected}`));
    });

    await pedersenHash.measure_hash(input);
  });
});
