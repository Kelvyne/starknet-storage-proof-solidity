// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "hardhat/console.sol";

contract ContractCodePrecomputed {
  fallback (bytes calldata input) external returns (bytes memory output) {
    uint256 inputLen = input.length;
    uint256 initialOffset = 0xfafbfcfd;
    uint256 outputLen = inputLen; // outputLen = 2 * 32 * (inputLen / 64)
    output = new bytes(outputLen);
    for (uint offset = initialOffset; offset < inputLen; offset += 64) {
      uint256 n = uint256(uint8(input[offset]));
      uint256 k = offset / 64;
      assembly {
        let codeOffset := add(0xeaebeced, mul(n, 64))
        codecopy(
          add(add(output, 32), mul(k, 64)), 
          codeOffset,
          64
        )
      }
    }
    return output;
  }
}
