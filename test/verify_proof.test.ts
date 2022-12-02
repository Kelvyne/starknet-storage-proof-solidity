import { expect } from "chai";
import proof from "../data/proof.json";
import proof2 from "../data/proof2.json";
import verifyProof from "../lib/verify_proof";
import { pedersen } from "../lib/shifted_tables";

describe("VerifyProof", () => {
  it("should do stuff", async () => {
    // BLOCK: 43695

    const root =
      "0x2674d5749a0514614665708b7a70d280b2ab870e9d14eee66d6db95807d860a";
    const contractAddress =
      "0x7da6091e6d13481f9f1a73d37cb5c8522e6fef204af576ce3a18b7272670cbb";
    const classHash = proof2.result.contract_data.class_hash;
    const storageRoot = proof2.result.contract_data.root;
    const storageProof = proof2.result.contract_data.storage_proofs[0];
    const storageSlot =
      "0x1ccc09c8a19948e048de7add6929589945e25f22059c7345aaf7837188d8d05";
    const storageValue =
      "0x6dd91e3d3dbb267fe05745d84ff9e3193a3cb9cb08c1a820a6d02e4791e9da1";

    const result = verifyProof(storageRoot,
      storageProof,
      storageSlot,
      storageValue
    );
    expect(result).to.equal(true);

    console.log("========================");
    const contractProof = proof2.result.contract_proof;
    const h = pedersen;
    const expected =
      "0x" + h(h(h(classHash.slice(2), storageRoot.slice(2)), "0"), "0");

    const contractResult = verifyProof(
      root,
      contractProof,
      contractAddress,
      expected
    );

    console.log(contractResult);
  });

  it.skip("should do stuff", async () => {
    // BLOCK: 43695
    // "new_root": "0x2674d5749a0514614665708b7a70d280b2ab870e9d14eee66d6db95807d860a",
    // "old_root": "0x3a7631ef5b7b8cb807f1e935f17c193420453b4e6682daac216382e85eae0bb",

    const classHash = proof.result.contract_data.class_hash;
    const storageRoot = proof.result.contract_data.root;
    const storageProof = proof.result.contract_data.storage_proofs[0];
    const storageSlot = "0x05";
    const storageValue = "0x22b";

    const result = verifyProof(storageRoot,
      storageProof,
      storageSlot,
      storageValue
    );
    expect(result).to.equal(true);

    console.log("========================");
    const root =
      "0x2674d5749a0514614665708b7a70d280b2ab870e9d14eee66d6db95807d860a";
    const contractAddress =
      "0x0214455f93ccfe5aa60e7aec869390bc221e26a8ee7c6f609278339b6e7fc80f";
    const contractProof = proof.result.contract_proof;
    const h = pedersen;
    const expected =
      "0x" + h(h(h(classHash.slice(2), storageRoot.slice(2)), "0"), "0");

    const contractResult = verifyProof(
      root,
      contractProof,
      contractAddress,
      expected
    );

    console.log(contractResult);
  });
});
