import { expect } from "chai";
import { ethers } from "hardhat";
import constantPointsHex from "./constant_points.json";

const { BigNumber } = ethers;

const constantPoints = constantPointsHex.map((p) => [
  BigNumber.from(`0x${p[0]}`),
  BigNumber.from(`0x${p[1]}`),
]);

const LOW_PART_BITS = 248;
const N_ELEMENT_BITS_HASH = 252;

describe("PedersenHash", () => {
  it.skip("should print base points", () => {
    const shiftPoint = constantPoints[0];
    const p0 = constantPoints[2];
    const p1 = constantPoints[2 + LOW_PART_BITS];
    const p2 = constantPoints[2 + N_ELEMENT_BITS_HASH];
    const p3 = constantPoints[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS];

    console.log("s", shiftPoint[0].toHexString(), shiftPoint[1].toHexString());
    console.log("0", p0[0].toHexString(), p0[1].toHexString());
    console.log("1", p1[0].toHexString(), p1[1].toHexString());
    console.log("2", p2[0].toHexString(), p2[1].toHexString());
    console.log("3", p3[0].toHexString(), p3[1].toHexString());
  });

  it("should hash", async () => {
    const PedersenHash = await ethers.getContractFactory("PedersenHash");
    const pedersenHash = await PedersenHash.deploy();

    const input11 =
      "0x3d937c035c878245caf64531a5756109c53068da139362728feb561405371cb";
    const input12 =
      "0x208a0a10250e382e1e4bbe2880906c2791bf6275695e02fbbc6aeff9cd8b31a";
    const output1 =
      "0x30e480bed5fe53fa909cc0f8c4d99b8f9f2c016be4c41e13a4848797979c662";

    const result1 = await pedersenHash.hash(input11, input12);
    expect(result1).to.equal(output1);

    const input21 =
      "0x58f580910a6ca59b28927c08fe6c43e2e303ca384badc365795fc645d479d45";
    const input22 =
      "0x78734f65a067be9bdb39de18434d71e79f7b6466a4b66bbd979ab9e7515fe0b";
    const output2 =
      "0x68cc0b76cddd1dd4ed2301ada9b7c872b23875d5ff837b3a87993e0d9996b87";

    const result2 = await pedersenHash.hash(input21, input22);
    expect(result2).to.equal(output2);
  });
});
