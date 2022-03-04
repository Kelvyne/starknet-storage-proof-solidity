import BN from "bn.js";
import { sha256 } from "hash.js";
import { curves as eCurves, ec as EllipticCurve } from "elliptic";

import constantPointsHex from "./constant_points.json";

export const prime = new BN(
  "800000000000011000000000000000000000000000000000000000000000001",
  16
);

export const starkEc = new EllipticCurve(
  new eCurves.PresetCurve({
    type: "short",
    prime: null,
    p: prime as any,
    a: "00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000001",
    b: "06f21413 efbe40de 150e596d 72f7a8c5 609ad26c 15c915c1 f4cdfcb9 9cee9e89",
    n: "08000000 00000010 ffffffff ffffffff b781126d cae7b232 1e66a241 adc64d2f",
    hash: sha256,
    gRed: false,
    g: constantPointsHex[1],
  })
);

export const constantPoints = constantPointsHex.map((coords) =>
  starkEc.curve.point(new BN(coords[0], 16), new BN(coords[1], 16))
);

export const shiftPoint = constantPoints[0];

export const LOW_PART_BITS = 248;
export const N_ELEMENT_BITS_HASH = 252;

export const p0 = constantPoints[2];
export const p1 = constantPoints[2 + LOW_PART_BITS];
export const p2 = constantPoints[2 + N_ELEMENT_BITS_HASH];
export const p3 = constantPoints[2 + N_ELEMENT_BITS_HASH + LOW_PART_BITS];
