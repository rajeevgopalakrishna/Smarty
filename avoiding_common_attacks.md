**Avoiding Common Attacks**

The Smarty.sol contract is a simple contract which does not yet handle any Ether, perform any math or make any external calls. The below security best practises were implemented in the contract:

* Lock pragmas to specific compiler version
The contract is locked using *pragma solidity ^0.4.24;* as per guidelines from https://consensys.github.io/smart-contract-best-practices/recommendations/#lock-pragmas-to-specific-compiler-version

* Using *emit* for event generation
The *emit* keyword is used to generate events and allow us to differentiate events from function calls as per guidelines from https://consensys.github.io/smart-contract-best-practices/recommendations/#differentiate-functions-and-events and https://blog.indorse.io/security-best-practises-for-smart-contract-programming-in-solidity-part-2-state-of-the-b558798181ca

* Explicitly mark visibility in functions and state variables
The visibility of functions is explicitly marked as per guidelines from https://consensys.github.io/smart-contract-best-practices/recommendations/#explicitly-mark-visibility-in-functions-and-state-variables and https://blog.indorse.io/security-best-practises-for-smart-contract-programming-in-solidity-part-2-state-of-the-b558798181ca


