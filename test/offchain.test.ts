import { expect } from "chai";
import originalPedersen from "../lib/original_pedersen";
import { pedersen as fastPedersen } from "../lib/fast";
import { pedersen as tablesPedersen } from "../lib/tables";
import { pedersen as shamirPedersen, createShamirMul } from "../lib/shamir";
import {
  pedersen as shiftedTablesPedersen,
  precomputes as shiftedPrecomputes,
} from "../lib/shifted_tables";
import testCases from "./fixtures.json";

describe("PedersenHash", () => {
  describe("off chain", () => {
    testCases.forEach((c) => {
      it(`${c.name}: shifted table implementation should match original implementation`, async () => {
        const o = originalPedersen([c.a, c.b]);
        const f = fastPedersen(c.a, c.b);

        const t = tablesPedersen(c.a, c.b);
        const s = shiftedTablesPedersen(c.a, c.b);

        const ss = shamirPedersen(c.a, c.b);

        expect(o).to.equal(c.expected, "original");
        expect(f).to.equal(o, "fast");
        expect(t).to.equal(o, "tables");
        expect(s).to.equal(o, "shifted tables");
        expect(ss).to.equal(o, "shamir tables");
      });
    });
  });
});
