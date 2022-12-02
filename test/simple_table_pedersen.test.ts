import { ethers } from "hardhat";
import * as path from "path"
import * as fs from "fs";
import { expect } from "chai";
import originalPedersen from "../lib/original_pedersen";
import { pedersen as fastPedersen } from "../lib/fast";
import { pedersen as tablesPedersen } from "../lib/tables";
import {
  pedersen as shiftedTablesPedersen,
  precomputes as shiftedPrecomputes,
} from "../lib/shifted_tables";

function chunk<T>(arr: T[], len: number): T[][] {
  const chunks: T[][] = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, (i += len)));
  }

  return chunks;
}

const testCases = [
  {
    name: "zero",
    a: "0",
    b: "0",
    expected: "49ee3eba8c1600700ee1b87eb599f16716b0b1022947733551fde4050ca6804",
  },
  {
    name: "easy",
    a: "1",
    b: "2",
    expected: "5bb9440e27889a364bcb678b1f679ecd1347acdedcbf36e83494f857cc58026",
  },
  {
    name: "basic",
    a: "3d937c035c878245caf64531a5756109c53068da139362728feb561405371cb",
    b: "208a0a10250e382e1e4bbe2880906c2791bf6275695e02fbbc6aeff9cd8b31a",
    expected: "30e480bed5fe53fa909cc0f8c4d99b8f9f2c016be4c41e13a4848797979c662",
  },
  {
    name: "basic 2",
    a: "58f580910a6ca59b28927c08fe6c43e2e303ca384badc365795fc645d479d45",
    b: "78734f65a067be9bdb39de18434d71e79f7b6466a4b66bbd979ab9e7515fe0b",
    expected: "68cc0b76cddd1dd4ed2301ada9b7c872b23875d5ff837b3a87993e0d9996b87",
  },
  {
    name: "basic 3",
    a: "3d937c035c878245caf64531a5756109c53068da139362728feb561405371cb",
    b: "78734f65a067be9bdb39de18434d71e79f7b6466a4b66bbd979ab9e7515fe0b",
    expected: "598a25dfef7494a7b2b10d13b0e616208a459f53694ddd60159a07c3c774435",
  },
  {
    name: "a=b",
    a: "30e480bed5fe53fa909cc0f8c4d99b8f9f2c016be4c41e13a4848797979c662",
    b: "30e480bed5fe53fa909cc0f8c4d99b8f9f2c016be4c41e13a4848797979c662",
    expected: "51afb96740fc20f2f17329df62d57054689dc72fe7a8ee62e2516867401aa11",
  },
  {
    name: "zero bytes",
    a: "69bf297540461000000000092f76a626f4c27200000000006c56c53b3ac099d",
    b: "ab6cf5be06700ed59caf092ffc85c30000000000000005e316b20303752a0f",
    expected: "4107f82ee4daf8b179070748622f0ef79b1c9cb4369e1a8b2364c74060c7184",
  },
  {
    name: "different size",
    a: "69bf297540461a556e95b9e92f76a626f4c2720bb5c0afdd6c56c53b3ac099d",
    b: "ab6cf5be06700ed59caf092ffc85c34cd196c1a0f70905e316b20303752a0f",
    expected: "42db23bc6f534d07441cf1497a74824f43af29ec2f635b3f3caa1b814b1448b",
  },
];

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

  describe("PedersenHash", () => {
    describe("off chain", () => {
      testCases.forEach((c) => {
        it(`${c.name}: shifted table implementation should match original implementation`, async () => {
          const o = originalPedersen([c.a, c.b]);
          const f = fastPedersen(c.a, c.b);

          const t = tablesPedersen(c.a, c.b);
          const s = shiftedTablesPedersen(c.a, c.b);

          /*
          console.log(`o=${o}`);
          console.log(`f=${f}`);
          console.log(`t=${t}`);
          console.log(`s=${s}`);
          */

          expect(o).to.equal(c.expected, "original");
          expect(f).to.equal(o, "fast");
          expect(t).to.equal(o, "tables");
          expect(s).to.equal(o, "shifted tables");
        });
      });
    });

    describe("on chain", () => {
      testCases.forEach((c) => {
        it(`${c.name}: should match off-chain hash`, async () => {
          const PedersenHash = await ethers.getContractFactory("PedersenHash");

          const pedersenHash = await PedersenHash.deploy(
            precomputedContracts.map((c: any) => c.address as string)
          );

          const toHex = (c: any) => `0x${c}`;
          const input = ethers.utils.defaultAbiCoder.encode(
            ["uint256", "uint256"],
            [toHex(c.a), toHex(c.b)]
          );

          const result = await pedersenHash.hash(input);
          expect(result.length).to.equal(1);
          expect(result[0]).to.equal(ethers.BigNumber.from(`0x${c.expected}`));
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
        result.forEach((v, i) => {
          expect(v).to.equal(ethers.BigNumber.from(`0x${testCases[i].expected}`));
        });
      });
    });
  });
});
