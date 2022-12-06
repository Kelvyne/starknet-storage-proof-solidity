import * as path from "path";
import * as fs from "fs";
import { ethers } from "hardhat";
import { expect } from "chai";
import proof from "../data/proof.json";
import proof2 from "../data/proof2.json";
import verifyProof, { encodeProof } from "../lib/verify_proof";
import { pedersen } from "../lib/shifted_tables";

const testCases = [
  {
    root: "0x58410fa701e603a6e4929c600ac268acc8e0ceae87d3454b91665fb1fd94271",
    contractAddress:
      "0x15ef2fd87ebf197d8cbd9d12cdb0efd77722e619023d01d730b19aeca237cdd",
    storageSlot:
      "0xf920571b9f85bdd92a867cfdc73319d0f8836f0e69e06e4c5566b6203f75cc",
    storageValue:
      "0x90aa7a9203bff78bfb24f0753c180a33d4bad95b1f4f510b36b00993815704",
    ...proof,
  },
  {
    root: "0x2674d5749a0514614665708b7a70d280b2ab870e9d14eee66d6db95807d860a",
    contractAddress:
      "0x7da6091e6d13481f9f1a73d37cb5c8522e6fef204af576ce3a18b7272670cbb",
    storageSlot:
      "0x1ccc09c8a19948e048de7add6929589945e25f22059c7345aaf7837188d8d05",
    storageValue:
      "0x6dd91e3d3dbb267fe05745d84ff9e3193a3cb9cb08c1a820a6d02e4791e9da1",
    ...proof2,
  },
];

describe("VerifyProof", () => {
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

  testCases.forEach((testCase, testIndex) => {
    const p = testCase;
    const classHash = p.result.contract_data.class_hash;
    const storageRoot = p.result.contract_data.root;
    const storageProof = p.result.contract_data.storage_proofs[0];
    const contractProof = p.result.contract_proof;
    const { root, contractAddress, storageSlot, storageValue } = p;

    describe(`Test case ${testIndex}`, () => {
      it("should verify contract proof on-chain", async () => {
        const StorageProof = await ethers.getContractFactory("StorageProof");
        const contract = await StorageProof.deploy(
          precomputedContracts.map((v: any) => v.address)
        );

        const encoded = encodeProof(
          storageRoot,
          classHash,
          contractProof,
          storageProof
        );
        const encodedProof =
          "0x" + encoded.map((v) => v.proof.slice(2)).join("");
        const encodedHeaders =
          "0x" + encoded.map((v) => v.header.slice(2)).join("");

        const context = {
          stateRoot: root,
          contractAddress,
          contractRoot: storageRoot,
          contractSlot: storageSlot,
          slotValue: storageValue,
        };

        await contract.verify(context, encodedProof, encodedHeaders);
      });

      it("should verify proof off-chain", async () => {
        // BLOCK: 43695

        const createH = () => {
          let counter = 0;

          return {
            g: () => counter,
            h: (a: any, b: any) => {
              counter += 1;
              return pedersen(a, b);
            },
          };
        };
        const h = createH();

        const result = verifyProof(
          storageRoot,
          storageProof,
          storageSlot,
          storageValue,
          h.h
        );
        expect(result).to.equal(true);

        const expected =
          "0x" +
          pedersen(
            pedersen(pedersen(classHash.slice(2), storageRoot.slice(2)), "0"),
            "0"
          );

        const contractResult = verifyProof(
          root,
          contractProof,
          contractAddress,
          expected,
          h.h
        );

        expect(contractResult).to.equal(true);
      });
    });
  });
});
