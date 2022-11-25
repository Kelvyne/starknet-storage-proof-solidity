// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract PrecomputedTableState {
  uint256[512] public points;

  function populate(uint256[128] calldata parts, uint256 offset) external {
    for (uint256 i = 0; i < 128; ++i) {
      points[offset + i] = parts[i];
    }
  }

  function get(bytes memory input, uint256 rowSize, uint256 inputLen) external view returns (uint256[] memory output) {
    output = new uint256[](2 * inputLen / 64);
    for (uint offset = 0; offset < inputLen; offset += 64) {
      console.log(offset);
      uint256 n = uint256(uint8(input[offset]));
      uint256 k = offset / rowSize;
      output[2 * k] = points[(n * 2)];
      output[2 * k + 1] = points[(n * 2) + 1];
    }
    return output;
  }
}
