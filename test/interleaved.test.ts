import { expect } from 'chai';
import { create as createInterleaved } from "../lib/interleaved";
import fixtures from './fixtures.json';
import { p0, p1, p2, p3, shiftPoint } from "../lib/stark";
import BN from "bn.js";

const testCases = fixtures;

describe('Interleaved', () => {
  let hash: any;
  
  before(() => {
    hash = createInterleaved();
  });

  it('should correctly multiply p1 & p3 AND add shift point', () => {
    const n1 = 14;
    const n3 = 9;

    const e13 = shiftPoint.add(p1.mul(n1).add(p3.mul(n3)));
    const r13 = hash.p1p3[n1 << 4 | n3];
    expect(e13.getX().toString(16)).to.equal(r13.getX().toString(16));
  });

  it('should correctly multiply p0 & p2', () => {
    const a = new BN("40000000000000010000000000000000000000000000001", 16);
    const b = new BN("00000000000000010000000000000000000000000000000", 16);

    const n0 = 13; // 0b1101
    const n2 = 4; // 0b0100

    const e02 = p0.mul(a).add(p2.mul(b));
    const r02 = hash.p0p2[n0 | n2 << 4];
    expect(e02.getX().toString(16)).to.equal(r02.getX().toString(16));
  });

  testCases.forEach((c) => {
    it(`${c.name}: it should compute hash`, () => {
      const result = hash.f(c.a, c.b);

      expect(result).to.equal(c.expected);
    });
  });
});
