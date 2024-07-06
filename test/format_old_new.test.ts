import { expect } from "chai";
import { buildBitsFromPath, reverseBitsToPath } from "../lib/format_new_to_old";

const paths = [
  {
    bits: 251,
    data: [
      57, 152, 19, 145, 67, 50, 145, 192, 145, 188, 245, 186, 210, 82, 177, 50,
      139, 196, 190, 68, 11, 56, 230, 139, 85, 239, 6, 227, 17, 177, 160, 160,
    ],
  },
  {
    bits: 234,
    data: [
      191, 97, 250, 252, 101, 246, 50, 246, 116, 75, 54, 195, 191, 93, 220, 139,
      152, 100, 8, 244, 7, 92, 194, 198, 107, 178, 136, 223, 55, 64,
    ],
  },
];

describe("old format to new format", () => {
  paths.forEach((path, index) => {
    it(`should convert back and forth for path ${index + 1}`, () => {
      const bits = buildBitsFromPath(path);
      const totalBits = path.bits;
      const result = reverseBitsToPath(bits, totalBits);
      expect(result).to.deep.equal(path);
    });
  });
});
