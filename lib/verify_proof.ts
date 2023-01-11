import { ethers } from 'ethers';
import { pedersen } from "../lib/shifted_tables";
import { prime } from "../lib/stark";

const { BigNumber } = ethers;

const P = BigNumber.from(prime.toString(10));

type Binary = {
  kind: "Binary";
  left_hash: string;
  right_hash: string;
}

type Edge = {
  kind: "Edge";
  path: {
    head: number;
    bits: number;
    data: number[];
  };
  child_hash: string;
};

type Node = Binary | Edge;

type _Node = Omit<Node, "kind">;

const _2 = BigNumber.from(2);

function shr(n: ethers.BigNumber, bits: number): ethers.BigNumber {
  return n.div(_2.pow(bits));
}

function shl(n: ethers.BigNumber, bits: number): ethers.BigNumber {
  return n.mul(_2.pow(bits));
}

function buildBitsFromPath(path: Edge["path"]): ethers.BigNumber {
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

function _parseProof(proof: _Node[]): Node[] {
  return proof.map((proof: _Node) => {
    const proofAny = proof as any;
    if (proofAny.Edge) {
      return {
        kind: "Edge",
        ...(proofAny.Edge as Omit<Edge, "kind">)
      };
    } else if (proofAny.Binary) {
      return {
        kind: "Binary",
        ...(proofAny.Binary as Omit<Binary, "kind">)
      };
    } else {
      throw Error("invalid proof format");
    }
  });

}

export enum NodeType {
  Binary = 1,
  Edge = 2,

  StateHash = 4,
  ContractNonceHash = 8,
  ContractHash = 16,
}

export type EncodeOptions = {
  hashVersion?: number;
  contractNonce?: number;
}

export type EncodedNode = {
  proof: string;
  header: string;
}

export function encodeProof(
  contractRoot: string,
  contractClassHash: string,
  contractProof: _Node[],
  storageProof: _Node[],
  options: EncodeOptions = {}
): string[] {
  const cp = _parseProof(contractProof);
  const sp = _parseProof(storageProof);

  const _t = (v: string) => `0x${v}`;

  const stateHashVersion = _t((options.hashVersion ?? 0).toString(16));
  const contractNonce = _t((options.contractNonce ?? 0).toString(16));

  const contractHash = _t(
    pedersen(contractClassHash.slice(2), contractRoot.slice(2))
  );
  const contractNonceHash = _t(
    pedersen(contractHash.slice(2), contractNonce.slice(2))
  );

  const contract = _encodeTree(cp);
  const storage = _encodeTree(sp);

  return [
    ...contract,
    _encodeNode(NodeType.StateHash, 0, [contractNonceHash, stateHashVersion]),
    _encodeNode(NodeType.ContractNonceHash, 0, [contractHash, contractNonce]),
    _encodeNode(NodeType.ContractHash, 0, [contractClassHash, contractRoot]),
    ...storage,
  ].map(encoded => encoded.header + encoded.proof.slice(2));
}

function _encodeTree(nodes: Node[]): EncodedNode[] {
  return nodes.map((node) => {
    const type = node.kind === "Binary" ? NodeType.Binary : NodeType.Edge;
    const additionnal = type === NodeType.Edge ? (node as Edge).path.bits : 0;

    let a;
    let b;
    if (type === NodeType.Binary) {
      const binary = node as Binary;

      a = binary.left_hash;
      b = binary.right_hash;
    } else {
      const edge = node as Edge;
      a = edge.child_hash;
      b = buildBitsFromPath(edge.path).toHexString();
    }

    return _encodeNode(type, additionnal, [a, b]);
  });
}

function _encodeNode(
  type: NodeType,
  additionnal: number,
  proof: [string, string]
): EncodedNode {
  return {
    header: ethers.utils.solidityPack(["uint8", "uint8"], [type, additionnal]),
    proof: ethers.utils.defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [proof[0], proof[1]]
    ),
  };
}

export default function verifyProof(
  root: string,
  proof: _Node[],
  path: string,
  value: string,
  h = pedersen
) {
  const p = _parseProof(proof);

  const rootBN = BigNumber.from(root);
  const valueBN = BigNumber.from(value);
  const pathBN = BigNumber.from(path);

  const result = p.reduce(
    ({ expected, bits, path }, proof: Node) => {
      if (proof.kind === "Binary") {
        const bit = shr(pathBN, bits - 1).mask(1);
        const hash = bit.isZero() ? proof.left_hash : proof.right_hash;
        const computed = BigNumber.from(
          `0x${h(proof.left_hash.slice(2), proof.right_hash.slice(2))}`
        );
        /*
        console.log(
          "binary",
          `bit=${bit.toNumber()}`,
          `path=${path.toHexString()}`,
          `hash= ${hash}`,
          `computed=${computed.toHexString()}`,
          `expected=${expected.toHexString()}`
        );
        */
        if (!computed.eq(expected)) {
          throw new Error("invalid binary node hash");
        }
        return {
          expected: BigNumber.from(hash),
          bits: bits - 1,
          path: shl(path, 1).add(bit),
        };
      }

      const pathBits = buildBitsFromPath(proof.path);

      const intermediateHash = h(
        proof.child_hash.slice(2),
        pathBits.toHexString().slice(2)
      );

      const computed = BigNumber.from(`0x${intermediateHash}`)
        .add(BigNumber.from(proof.path.bits))
        .mod(P);

      /*
      console.log(
        "edge",
        `bits=${bits}`,
        `path=${path.toHexString()}`,
        `pathBits=${pathBits.toHexString()}`,
        `pathBits=${proof.path.bits}`,
        `computed=${computed.toHexString()}`,
        `expected=${expected.toHexString()}`
      );
      */

      if (!computed.eq(expected)) {
        throw new Error("invalid edge node hash");
      }

      return {
        expected: BigNumber.from(proof.child_hash),
        bits: bits - proof.path.bits,
        path: shl(path, proof.path.bits).add(pathBits),
      };
    },
    { expected: rootBN, bits: 251, path: BigNumber.from(0) }
  );

  if (result.bits !== 0) {
    console.log("bits", result.bits);
    return false;
  }
  if (!pathBN.eq(result.path)) {
    console.log("path", pathBN.toHexString(), result.path.toHexString());
    return false;
  }
  if (!result.expected.eq(valueBN)) {
    console.log("value", valueBN.toHexString(), result.expected.toHexString());
    return false;
  }
  return true;
}
