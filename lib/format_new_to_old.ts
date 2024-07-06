import { BigNumber, ethers } from "ethers";

type Edge = {
  kind: "Edge";
  path: {
    // head: number;
    bits: number;
    data: number[];
  };
  child_hash: string;
};

const _2 = BigNumber.from(2);

function shr(n: ethers.BigNumber, bits: number): ethers.BigNumber {
  return n.div(_2.pow(bits));
}

function shl(n: ethers.BigNumber, bits: number): ethers.BigNumber {
  return n.mul(_2.pow(bits));
}

export function buildBitsFromPath(path: Edge["path"]): ethers.BigNumber {
  const result = path.data.reduce(
    ({ n, bits }, b) => {
      if (bits <= 0) {
        return { n, bits };
      }

      const bBits = Math.min(bits, 8);
      const bBN = shr(BigNumber.from(b), 8 - bBits);

      const newN = shl(n, bBits).add(bBN);
      return { n: newN, bits: bits - bBits };
    },
    { n: BigNumber.from(0), bits: path.bits }
  );

  if (result.bits !== 0) {
    throw new Error("not enough data to recover bits from path");
  }
  return result.n;
}

export function reverseBitsToPath(
  bits: BigNumber,
  totalBits: number
): Edge["path"] {
  const data = [];
  let n = bits;
  let bitsLeft = totalBits;
  while (bitsLeft > 0) {
    const bBits = Math.min(bitsLeft, 8);
    let b = shr(n, bitsLeft - bBits).toNumber();

    // If this is the last byte and it's not full, left-align the bits
    if (bBits < 8) {
      b = b << (8 - bBits);
    }

    n = n.sub(shl(BigNumber.from(b >> (8 - bBits)), bitsLeft - bBits));
    data.push(b);
    bitsLeft -= bBits;
  }

  return {
    bits: totalBits,
    data,
  };
}
