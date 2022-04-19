import { ethers } from "hardhat";
import { expect } from "chai";
import originalPedersen from "../lib/original_pedersen";
import { pedersen as windowedPedersen } from "../lib/windowed";
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
    name: "basic case",
    a: "3d937c035c878245caf64531a5756109c53068da139362728feb561405371cb",
    b: "208a0a10250e382e1e4bbe2880906c2791bf6275695e02fbbc6aeff9cd8b31a",
    expected: "30e480bed5fe53fa909cc0f8c4d99b8f9f2c016be4c41e13a4848797979c662",
  },
  {
    name: "basic case 2",
    a: "58f580910a6ca59b28927c08fe6c43e2e303ca384badc365795fc645d479d45",
    b: "78734f65a067be9bdb39de18434d71e79f7b6466a4b66bbd979ab9e7515fe0b",
    expected: "68cc0b76cddd1dd4ed2301ada9b7c872b23875d5ff837b3a87993e0d9996b87",
  },
  {
    name: "basic case 3",
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
];

describe("simple table pedersen", () => {
  let contracts: any[];

  before(async () => {
    const PrecomputedTableState = await ethers.getContractFactory(
      "PrecomputedTableState"
    );

    contracts = await Promise.all(
      new Array(64).fill(0).map(async (_, i) => {
        const contract = await PrecomputedTableState.deploy();
        return contract;
      })
    );

    for (let i = 0; i < 64; ++i) {
      const points = shiftedPrecomputes[i];

      const toHex = (p: any) => `0x${p.toString(16)}`;

      const pointsArr = points.reduce((acc: string[], p: any) => {
        acc.push(toHex(p.getX()), toHex(p.getY()));
        return acc;
      }, []);

      const chunks = chunk(pointsArr, 128);
      const contract = contracts[i];
      await Promise.all(
        chunks.map((chunk, j) => contract.populate(chunk as any, j * 128))
      );
    }
  });

  testCases.forEach((c: any) => {
    describe(c.name, () => {
      it("original should work", () => {
        const result = originalPedersen([c.a, c.b]);
        expect(result).to.equal(c.expected);
      });

      it("original and fast should match", () => {
        const result = fastPedersen(c.a, c.b);
        expect(result).to.equal(c.expected);
      });

      it("original and windowed should match", () => {
        const result = windowedPedersen(c.a, c.b);
        expect(result).to.equal(c.expected);
      });

      it("original and full lookup tables should match", () => {
        const result = tablesPedersen(c.a, c.b);
        expect(result).to.equal(c.expected);
      });

      it("original and full shifted lookup tables should match", () => {
        const result = shiftedTablesPedersen(c.a, c.b);
        expect(result).to.equal(c.expected);
      });

      describe.only("on chain", () => {
        it("original & full lookup tables contract should match", async () => {
          const PedersenHash = await ethers.getContractFactory("PedersenHash");

          const pedersenHash = await PedersenHash.deploy(
            contracts.map((c) => c.address)
          );

          const result = await pedersenHash.hash(`0x${c.a}`, `0x${c.b}`);

          expect(result).to.equal(ethers.BigNumber.from(`0x${c.expected}`));
        });
      });
    });
  });
});
