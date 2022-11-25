// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//import "hardhat/console.sol";

contract OnePrecomputedTableState {
  uint256[32768] public points;

  function populate(uint256[] calldata parts, uint256 offset) external {
    uint256 len = parts.length;
    for (uint256 i = 0; i < len; ++i) {
      points[offset + i] = parts[i];
    }
  }

  function get(bytes memory input) external view returns (uint256[] memory output) {
    uint256 inputLen = input.length;
    uint256 rowSize = 2 * (inputLen / 64);
    uint256 outputLen = 64 * rowSize;
    output = new uint256[](outputLen);
    for (uint i = 0; i < 64; i++) {
      for (uint offset = i; offset < inputLen; offset += 64) {
        uint256 n = uint256(uint8(input[offset]));
        uint256 k = offset / 64;
        uint256 pOffset = i * 256 * 2 + (n * 2);
        uint256 oOffset = i * rowSize + (2 * k);
        output[oOffset] = points[pOffset];
        output[oOffset + 1] = points[pOffset + 1];
      }
    }
    return output;
  }
}
